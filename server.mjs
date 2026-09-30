import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { assertScopedRequest } from './src/contracts/inventory/availabilityRuntime.mjs';
import { assertValuationQuery } from './src/contracts/inventory/valuationRuntime.mjs';
import { assertOperationTypesQuery, assertStockLedgerQuery } from './src/contracts/inventory/operationsRuntime.mjs';
import { forwardInventoryAvailability, forwardInventoryRead } from './src/gateway/inventoryProxy.mjs';
import { renderInventoryOverview } from './src/components/inventory/inventoryOverview.mjs';
import { renderInventoryOperations } from './src/components/inventory/inventoryOperations.mjs';
import { renderInventoryValuation } from './src/components/inventory/inventoryValuation.mjs';

const port = Number(process.env.PORT ?? 3000);
const inventoryBaseUrl = process.env.INVENTORY_BASE_URL;
const html = renderInventoryOverview();

const readBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
};

const writeProxyResponse = async (response, upstream) => {
  const body = await upstream.text();
  response.writeHead(upstream.status, {
    'content-type': upstream.headers.get('content-type') ?? 'application/json',
  });
  response.end(body);
};

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ service: 'ERP.Portal', status: 'ok' }));
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryOverview());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/operations') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryOperations());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/valuation') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryValuation());
    return;
  }

  if (request.url === '/inventory-backend/health') {
    if (!inventoryBaseUrl) {
      response.writeHead(503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ service: 'ERP.Portal', status: 'unconfigured' }));
      return;
    }

    const correlationId = request.headers['x-correlation-id'] ?? randomUUID();
    fetch(`${inventoryBaseUrl.replace(/\/$/, '')}/health`, {
      headers: { 'x-correlation-id': correlationId },
    })
      .then(async (upstream) => {
        const body = await upstream.text();
        response.writeHead(upstream.status, {
          'content-type': 'application/json',
          'x-correlation-id': correlationId,
        });
        response.end(body);
      })
      .catch(() => {
        response.writeHead(502, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Portal', status: 'upstream-unavailable' }));
      });
    return;
  }

  if (request.method === 'POST' && request.url === '/api/inventory/availability') {
    readBody(request)
      .then(async (body) => {
        let payload;
        try {
          payload = JSON.parse(body);
          const headerCorrelationId = request.headers['x-correlation-id'];
          if (!payload.correlationId && headerCorrelationId) payload.correlationId = headerCorrelationId;
          assertScopedRequest(payload);
        } catch (error) {
          response.writeHead(400, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Invalid request' }));
          return;
        }

        const correlationId = request.headers['x-correlation-id'] ?? payload.correlationId ?? randomUUID();
        if (!inventoryBaseUrl) {
          response.writeHead(503, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unconfigured' }));
          return;
        }

        try {
          const upstream = await forwardInventoryAvailability(
            {
              body,
              authorization: request.headers.authorization,
              correlationId,
            },
            inventoryBaseUrl,
          );
          await writeProxyResponse(response, upstream);
        } catch {
          response.writeHead(502, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unavailable' }));
        }
      })
      .catch(() => {
        response.writeHead(400, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ error: 'Invalid request body' }));
      });
    return;
  }

  if (request.method === 'GET' && (request.url?.startsWith('/api/inventory/warehouses') || request.url?.startsWith('/api/inventory/locations') || request.url?.startsWith('/api/inventory/valuation') || request.url?.startsWith('/api/inventory/operation-types') || request.url?.startsWith('/api/inventory/ledger'))) {
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
    const path = url.pathname;
    const companyId = Number(url.searchParams.get('companyId'));
    const branchId = Number(url.searchParams.get('branchId'));
    const warehouseIdValue = url.searchParams.get('warehouseId');
    const correlationId = request.headers['x-correlation-id'] ?? url.searchParams.get('correlationId') ?? '';
    const requiresWarehouse = path.endsWith('/locations');
    const isValuation = path.endsWith('/valuation');
    const isOperationTypes = path.endsWith('/operation-types');
    const isLedger = path.endsWith('/ledger');
    try {
      if (isValuation) {
        assertValuationQuery({ companyId, warehouseId: Number(warehouseIdValue), correlationId });
      } else if (isOperationTypes) {
        assertOperationTypesQuery({ companyId, correlationId });
      } else if (isLedger) {
        assertStockLedgerQuery({ companyId, warehouseId: Number(warehouseIdValue), fromDate: url.searchParams.get('fromDate') ?? undefined, toDate: url.searchParams.get('toDate') ?? undefined, correlationId });
      } else {
        assertScopedRequest({ companyId, branchId, warehouseId: warehouseIdValue ? Number(warehouseIdValue) : undefined, correlationId });
        if (requiresWarehouse && (!warehouseIdValue || Number(warehouseIdValue) <= 0)) throw new Error('warehouseId is required');
      }
    } catch (error) {
      response.writeHead(400, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Invalid scope' }));
      return;
    }

    if (!inventoryBaseUrl) {
      response.writeHead(503, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unconfigured' }));
      return;
    }
    forwardInventoryRead(path, url.search, { authorization: request.headers.authorization, correlationId }, inventoryBaseUrl)
      .then((upstream) => writeProxyResponse(response, upstream))
      .catch(() => {
        response.writeHead(502, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unavailable' }));
      });
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(html);
});

server.on('error', (error) => {
  console.error('ERP Portal server error', error);
  process.exitCode = 1;
});

server.listen(port, '0.0.0.0', () => {
  console.log(`ERP Portal listening on ${port}`);
});
