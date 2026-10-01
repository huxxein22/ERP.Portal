import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createServer as createHttpServer, type Server } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { once } from 'node:events';

let portal: ChildProcessWithoutNullStreams;
let portalUrl: string;
let gateway: Server;
let gatewayUrl: string;
let forwarded: { method: string; path: string; body: string; authorization?: string; correlation?: string };

async function freePort(): Promise<number> {
  const probe = createNetServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const address = probe.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  await new Promise<void>((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForHealth(url: string): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      if ((await fetch(`${url}/health`)).ok) return;
    } catch {
      // The child process may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error('Portal server did not become healthy');
}

describe('ERP Portal Inventory Gateway forwarding E2E', () => {
  beforeAll(async () => {
    forwarded = { method: '', path: '', body: '' };
    const gatewayPort = await freePort();
    gateway = createHttpServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      request.on('end', () => {
        forwarded = {
          method: request.method ?? '',
          path: request.url ?? '',
          body: Buffer.concat(chunks).toString('utf8'),
          authorization: request.headers.authorization,
          correlation: request.headers['x-correlation-id'],
        };
      if (request.url === '/health') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Inventory.Gateway', status: 'ok' }));
        return;
      }
      if (request.url?.startsWith('/api/inventory/branch-availability')) {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ items: [{ productCode: 'SKU-1', available: 4 }] }));
        return;
      }
      if (request.url?.startsWith('/api/inventory/forecast')) {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ items: [{ productCode: 'SKU-1', variantCode: 'BLUE-M', forecasted: 5 }] }));
        return;
      }
      if (request.method === 'POST' && request.url === '/api/inventory/stock/receive') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ operationId: 'e2e-operation', status: 'committed' }));
        return;
      }
      if (request.method === 'POST' && (request.url === '/api/inventory/stock/scrap' || request.url === '/api/inventory/stock/scrap/reverse')) {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ operationId: 'e2e-scrap-operation', status: 'committed', replayed: false }));
        return;
      }
      if (request.method === 'POST' && request.url === '/api/inventory/landed-costs/preview') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ accepted: true, status: 'previewed_masked', totalAmount: 0, totalQuantity: 2, allocationMethod: 'quantity', financialsVisible: false, maskingReason: 'finance.costs permission is required to view cost amounts.', allocations: [] }));
        return;
      }
      if (request.method === 'POST' && request.url === '/api/inventory/catalog/product-variant') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ status: 'CATALOG_UPSERTED', productId: 'e2e-product', variantId: 'e2e-variant' }));
        return;
      }
      if (request.method === 'POST' && request.url === '/api/inventory/accounting/plan') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ planId: 'e2e-plan', status: 'shadow_planned', lines: [], accountingContractVersion: 'accounting-inventory-v1' }));
        return;
      }
      response.writeHead(404);
      response.end();
      });
    });
    gateway.listen(gatewayPort, '127.0.0.1');
    await once(gateway, 'listening');
    gatewayUrl = `http://127.0.0.1:${gatewayPort}`;

    const portalPort = await freePort();
    portalUrl = `http://127.0.0.1:${portalPort}`;
    portal = spawn(process.execPath, ['server.mjs'], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: String(portalPort), INVENTORY_BASE_URL: gatewayUrl },
      stdio: 'pipe',
    });
    await waitForHealth(portalUrl);
  });

  afterAll(() => {
    portal.kill('SIGTERM');
    gateway.close();
  });

  it('forwards scoped reads with auth and correlation headers to the Gateway', async () => {
    const response = await fetch(
      `${portalUrl}/api/inventory/branch-availability?companyId=1&branchId=7&productCode=SKU-1&correlationId=portal-e2e`,
      { headers: { authorization: 'Bearer e2e-token', 'x-correlation-id': 'portal-header-correlation' } },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: [{ productCode: 'SKU-1', available: 4 }] });
    expect(forwarded.path).toContain('/api/inventory/branch-availability?');
    expect(forwarded.path).toContain('companyId=1');
    expect(forwarded.path).toContain('branchId=7');
    expect(forwarded.authorization).toBe('Bearer e2e-token');
    expect(forwarded.correlation).toBe('portal-header-correlation');
  });

  it('forwards scoped writes with the original JSON body and security headers', async () => {
    const body = JSON.stringify({
      companyId: 1,
      warehouseId: 11,
      productCode: 'SKU-1',
      variantCode: 'BLUE-M',
      quantity: 2,
      idempotencyKey: 'portal-write-e2e',
    });
    const response = await fetch(`${portalUrl}/api/inventory/stock/receive`, {
      method: 'POST',
      headers: { authorization: 'Bearer e2e-token', 'x-correlation-id': 'portal-write-correlation', 'content-type': 'application/json' },
      body,
    });

    expect(response.status).toBe(200);
    expect(forwarded.method).toBe('POST');
    expect(forwarded.path).toBe('/api/inventory/stock/receive');
    expect(JSON.parse(forwarded.body)).toEqual(JSON.parse(body));
    expect(forwarded.authorization).toBe('Bearer e2e-token');
    expect(forwarded.correlation).toBe('portal-write-correlation');
  });

  it('forwards forecast scope and security headers to the Gateway', async () => {
    const response = await fetch(
      `${portalUrl}/api/inventory/forecast?companyId=1&branchId=7&warehouseId=11&productCode=SKU-1&variantCode=BLUE-M&correlationId=portal-forecast`,
      { headers: { authorization: 'Bearer forecast-token', 'x-correlation-id': 'portal-forecast-header' } },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ items: [{ productCode: 'SKU-1', variantCode: 'BLUE-M', forecasted: 5 }] });
    expect(forwarded.path).toContain('/api/inventory/forecast?');
    expect(forwarded.path).toContain('warehouseId=11');
    expect(forwarded.authorization).toBe('Bearer forecast-token');
    expect(forwarded.correlation).toBe('portal-forecast-header');
  });

  it('forwards Scrap reversal through the Gateway without exposing private service access', async () => {
    const body = JSON.stringify({
      companyId: 1,
      warehouseId: 11,
      productCode: 'SKU-1',
      variantCode: 'BLUE-M',
      originalIdempotencyKey: 'scrap-original-e2e',
      reversalIdempotencyKey: 'scrap-reversal-e2e',
      reason: 'portal correction',
      correlationId: 'portal-scrap-reversal-e2e',
    });
    const response = await fetch(`${portalUrl}/api/inventory/stock/scrap/reverse`, {
      method: 'POST',
      headers: { authorization: 'Bearer e2e-token', 'x-correlation-id': 'portal-scrap-reversal-header', 'content-type': 'application/json' },
      body,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ operationId: 'e2e-scrap-operation' });
    expect(forwarded.path).toBe('/api/inventory/stock/scrap/reverse');
    expect(JSON.parse(forwarded.body)).toEqual(JSON.parse(body));
    expect(forwarded.authorization).toBe('Bearer e2e-token');
    expect(forwarded.correlation).toBe('portal-scrap-reversal-header');
  });

  it('forwards explicit Catalog provisioning without exposing a database or private gRPC route', async () => {
    const body = JSON.stringify({
      companyId: 1,
      externalId: 'portal-catalog-e2e',
      productCode: 'SKU-E2E',
      variantCode: 'BLUE-M',
      displayName: 'Blue medium',
      sourceVersion: 'portal-e2e-v1',
      correlationId: 'portal-catalog-e2e',
    });
    const response = await fetch(`${portalUrl}/api/inventory/catalog/product-variant`, {
      method: 'POST',
      headers: { authorization: 'Bearer e2e-token', 'x-correlation-id': 'portal-catalog-header', 'content-type': 'application/json' },
      body,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'CATALOG_UPSERTED', productId: 'e2e-product' });
    expect(forwarded.method).toBe('POST');
    expect(forwarded.path).toBe('/api/inventory/catalog/product-variant');
    expect(JSON.parse(forwarded.body)).toEqual(JSON.parse(body));
    expect(forwarded.authorization).toBe('Bearer e2e-token');
    expect(forwarded.correlation).toBe('portal-catalog-header');
  });

  it('forwards Landed Cost preview as a masked read-only operation', async () => {
    const body = JSON.stringify({
      companyId: 1,
      warehouseId: 11,
      totalAmount: 100,
      currency: 'EGP',
      lines: [{ productCode: 'SKU-1', variantCode: 'BLUE-M', quantity: 2, formerUnitCost: 50 }],
      correlationId: 'portal-landed-cost-e2e',
    });
    const response = await fetch(`${portalUrl}/api/inventory/landed-costs/preview`, {
      method: 'POST',
      headers: { authorization: 'Bearer e2e-token', 'x-correlation-id': 'portal-landed-cost-header', 'content-type': 'application/json' },
      body,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'previewed_masked', financialsVisible: false });
    expect(forwarded.path).toBe('/api/inventory/landed-costs/preview');
    expect(JSON.parse(forwarded.body)).toEqual(JSON.parse(body));
    expect(forwarded.authorization).toBe('Bearer e2e-token');
    expect(forwarded.correlation).toBe('portal-landed-cost-header');
  });

  it('forwards Accounting planning as a shadow-only Gateway operation', async () => {
    const body = JSON.stringify({
      companyId: 1,
      sourceMovementId: 'movement-1',
      sourceReference: 'receipt-1',
      impactType: 'receipt',
      effectiveDate: '2026-10-01',
      correlationId: 'portal-accounting-e2e',
      lines: [
        { accountKey: 'stock_valuation', debitOrCredit: 'debit', amount: 10, currency: 'EGP' },
        { accountKey: 'grni', debitOrCredit: 'credit', amount: 10, currency: 'EGP' },
      ],
    });
    const response = await fetch(`${portalUrl}/api/inventory/accounting/plan`, {
      method: 'POST',
      headers: { authorization: 'Bearer e2e-token', 'x-correlation-id': 'portal-accounting-header', 'content-type': 'application/json' },
      body,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ planId: 'e2e-plan', status: 'shadow_planned' });
    expect(forwarded.path).toBe('/api/inventory/accounting/plan');
    expect(JSON.parse(forwarded.body)).toEqual(JSON.parse(body));
    expect(forwarded.authorization).toBe('Bearer e2e-token');
    expect(forwarded.correlation).toBe('portal-accounting-header');
  });
});
