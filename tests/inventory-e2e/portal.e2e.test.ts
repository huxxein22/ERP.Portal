import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';

let child: ChildProcessWithoutNullStreams;
let baseUrl: string;

async function freePort(): Promise<number> {
  const probe = createServer();
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

describe('ERP Portal Inventory E2E boundary', () => {
  beforeAll(async () => {
    const port = await freePort();
    baseUrl = `http://127.0.0.1:${port}`;
    child = spawn(process.execPath, ['server.mjs'], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: String(port) },
      stdio: 'pipe',
    });
    await waitForHealth(baseUrl);
  });

  afterAll(() => {
    child.kill('SIGTERM');
  });

  it('serves every extracted Inventory screen', async () => {
    for (const path of ['/inventory', '/inventory/operations', '/inventory/valuation', '/inventory/import', '/inventory/count', '/inventory/putaway']) {
      const response = await fetch(`${baseUrl}${path}`);
      expect(response.status, path).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    }
  });

  it('keeps invalid scope and unconfigured gateway failures at the Portal boundary', async () => {
    const invalidScope = await fetch(`${baseUrl}/api/inventory/warehouses?companyId=1&branchId=0&correlationId=e2e`);
    expect(invalidScope.status).toBe(400);

    const unconfigured = await fetch(`${baseUrl}/api/inventory/valuation?companyId=1&warehouseId=11&correlationId=e2e`);
    expect(unconfigured.status).toBe(503);

    const invalidImport = await fetch(`${baseUrl}/api/inventory/import/preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"companyId":1}',
    });
    expect(invalidImport.status).toBe(400);

    const invalidCount = await fetch(`${baseUrl}/api/inventory/count?companyId=1&warehouseId=11&sessionId=&correlationId=e2e`);
    expect(invalidCount.status).toBe(400);
  });
});
