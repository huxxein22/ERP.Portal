import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const port = Number(process.env.PORT ?? 3000);
const inventoryBaseUrl = process.env.INVENTORY_BASE_URL;
const html = `<!doctype html><html><head><meta charset="utf-8"><title>ERP Portal</title></head><body><main><h1>ERP Portal</h1><p>Inventory gateway boundary is active.</p></main></body></html>`;

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ service: 'ERP.Portal', status: 'ok' }));
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
