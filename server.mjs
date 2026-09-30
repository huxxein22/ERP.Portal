import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 3000);
const html = `<!doctype html><html><head><meta charset="utf-8"><title>ERP Portal</title></head><body><main><h1>ERP Portal</h1><p>Inventory gateway boundary is active.</p></main></body></html>`;

createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ service: 'ERP.Portal', status: 'ok' }));
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(html);
}).listen(port, '0.0.0.0');
