import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { assertScopedRequest } from './src/contracts/inventory/availabilityRuntime.mjs';
import { assertValuationQuery } from './src/contracts/inventory/valuationRuntime.mjs';
import { assertOperationTypesQuery, assertStockLedgerQuery } from './src/contracts/inventory/operationsRuntime.mjs';
import { assertImportPreviewRequest } from './src/contracts/inventory/importsRuntime.mjs';
import { assertCountQuery } from './src/contracts/inventory/countsRuntime.mjs';
import { assertPutawayQuery } from './src/contracts/inventory/putawayRuntime.mjs';
import { assertCompanyQuery } from './src/contracts/inventory/configurationRuntime.mjs';
import { forwardInventoryAvailability, forwardInventoryRead, forwardInventoryWrite } from './src/gateway/inventoryProxy.mjs';
import { renderInventoryOverview } from './src/components/inventory/inventoryOverview.mjs';
import { renderInventoryOperations } from './src/components/inventory/inventoryOperations.mjs';
import { renderInventoryValuation } from './src/components/inventory/inventoryValuation.mjs';
import { renderInventoryImport } from './src/components/inventory/inventoryImport.mjs';
import { renderInventoryCount } from './src/components/inventory/inventoryCount.mjs';
import { renderInventoryPutaway } from './src/components/inventory/inventoryPutaway.mjs';
import { renderInventoryConfiguration } from './src/components/inventory/inventoryConfiguration.mjs';
import { renderInventoryBranchBalances } from './src/components/inventory/inventoryBranchBalances.mjs';
import { renderInventoryLocations } from './src/components/inventory/inventoryLocations.mjs';
import { renderInventoryStockByVariant } from './src/components/inventory/inventoryStockByVariant.mjs';
import { renderInventoryConfigurationWrite } from './src/components/inventory/inventoryConfigurationWrite.mjs';
import { renderInventoryPutawayWrite } from './src/components/inventory/inventoryPutawayWrite.mjs';
import { renderInventoryRuleWrite } from './src/components/inventory/inventoryRuleWrite.mjs';
import { renderInventoryMoves } from './src/components/inventory/inventoryMoves.mjs';
import { renderInventoryScrap } from './src/components/inventory/inventoryScrap.mjs';
import { renderInventoryScrapReverse } from './src/components/inventory/inventoryScrapReverse.mjs';
import { renderInventoryLandedCost } from './src/components/inventory/inventoryLandedCost.mjs';
import { renderInventoryAlerts } from './src/components/inventory/inventoryAlerts.mjs';
import { renderInventoryForecast } from './src/components/inventory/inventoryForecast.mjs';
import { assertBranchQuery } from './src/contracts/inventory/branchBalancesRuntime.mjs';
import { assertLandedCostApplyRequest } from './src/contracts/inventory/landedCostRuntime.mjs';

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

  if (request.method === 'GET' && request.url === '/inventory/import') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryImport());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/count') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryCount());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/putaway') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryPutaway());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/configuration') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryConfiguration());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/branch-balances') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryBranchBalances());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/locations') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryLocations());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/stock-by-variant') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryStockByVariant());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/alerts') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryAlerts());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/forecast') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryForecast());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/configuration/write') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryConfigurationWrite());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/putaway/write') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryPutawayWrite());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/rules/write') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryRuleWrite());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/moves') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryMoves());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/scrap') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryScrap());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/scrap/reverse') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryScrapReverse());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/landed-costs') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryLandedCost());
    return;
  }

  if (request.method === 'GET' && request.url === '/inventory/landed-costs/apply') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(renderInventoryLandedCost({ mode: 'apply' }));
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

  if (request.method === 'POST' && ['/api/inventory/import/preview', '/api/inventory/import/stage'].includes(request.url)) {
    readBody(request).then(async (body) => {
      let payload;
      try {
        payload = JSON.parse(body);
        const headerCorrelationId = request.headers['x-correlation-id'];
        if (!payload.correlationId && headerCorrelationId) payload.correlationId = headerCorrelationId;
          assertImportPreviewRequest(payload, request.url.endsWith('/stage'));
      } catch (error) {
        response.writeHead(400, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Invalid import preview' }));
        return;
      }
      const correlationId = request.headers['x-correlation-id'] ?? payload.correlationId;
      if (!inventoryBaseUrl) {
        response.writeHead(503, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unconfigured' }));
        return;
      }
      try {
        const upstream = await forwardInventoryWrite(request.url, { body, authorization: request.headers.authorization, correlationId }, inventoryBaseUrl);
        await writeProxyResponse(response, upstream);
      } catch {
        response.writeHead(502, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unavailable' }));
      }
    }).catch(() => {
      response.writeHead(400, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'Invalid request body' }));
    });
    return;
  }

  if (request.method === 'POST' && request.url === '/api/inventory/catalog/product-variant') {
    readBody(request).then(async (body) => {
      if (!body.trim()) {
        response.writeHead(400, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ error: 'A JSON request body is required' }));
        return;
      }
      const correlationId = request.headers['x-correlation-id'] ?? randomUUID();
      if (!inventoryBaseUrl) {
        response.writeHead(503, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unconfigured' }));
        return;
      }
      try {
        const upstream = await forwardInventoryWrite(request.url, { body, authorization: request.headers.authorization, correlationId }, inventoryBaseUrl);
        await writeProxyResponse(response, upstream);
      } catch {
        response.writeHead(502, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unavailable' }));
      }
    }).catch(() => {
      response.writeHead(400, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'Invalid request body' }));
    });
    return;
  }

  if (request.method === 'POST' && ['/api/inventory/putaway/rules', '/api/inventory/routes', '/api/inventory/rules', '/api/inventory/delivery-methods', '/api/inventory/stock/receive', '/api/inventory/stock/reserve', '/api/inventory/stock/release', '/api/inventory/stock/issue', '/api/inventory/stock/adjust', '/api/inventory/stock/scrap', '/api/inventory/stock/scrap/reverse', '/api/inventory/landed-costs/preview', '/api/inventory/landed-costs/apply', '/api/inventory/count/start', '/api/inventory/count/line', '/api/inventory/count/finalize', '/api/inventory/count/apply-difference', '/api/inventory/accounting/plan'].includes(request.url)) {
    readBody(request).then(async (body) => {
      if (!body.trim()) {
        response.writeHead(400, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ error: 'A JSON request body is required' }));
        return;
      }
      if (request.url === '/api/inventory/landed-costs/apply') {
        try {
          const payload = JSON.parse(body);
          const headerCorrelationId = request.headers['x-correlation-id'];
          if (!payload.correlationId && headerCorrelationId) payload.correlationId = headerCorrelationId;
          assertLandedCostApplyRequest(payload);
        } catch (error) {
          response.writeHead(400, { 'content-type': 'application/json' });
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Invalid landed cost apply request' }));
          return;
        }
      }
      const correlationId = request.headers['x-correlation-id'] ?? randomUUID();
      if (!inventoryBaseUrl) {
        response.writeHead(503, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unconfigured' }));
        return;
      }
      try {
        const upstream = await forwardInventoryWrite(request.url, { body, authorization: request.headers.authorization, correlationId }, inventoryBaseUrl);
        await writeProxyResponse(response, upstream);
      } catch {
        response.writeHead(502, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ service: 'ERP.Portal', status: 'inventory-gateway-unavailable' }));
      }
    }).catch(() => {
      response.writeHead(400, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'Invalid request body' }));
    });
    return;
  }

  if (request.method === 'GET' && (request.url?.startsWith('/api/inventory/warehouses') || request.url?.startsWith('/api/inventory/locations') || request.url?.startsWith('/api/inventory/valuation') || request.url?.startsWith('/api/inventory/operation-types') || request.url?.startsWith('/api/inventory/ledger') || request.url?.startsWith('/api/inventory/count') || request.url?.startsWith('/api/inventory/putaway/rules') || request.url?.startsWith('/api/inventory/routes') || request.url?.startsWith('/api/inventory/delivery-methods') || request.url?.startsWith('/api/inventory/branch-availability') || request.url?.startsWith('/api/inventory/branch-valuation') || request.url?.startsWith('/api/inventory/forecast'))) {
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
    const path = url.pathname;
    const companyId = Number(url.searchParams.get('companyId'));
    const branchId = Number(url.searchParams.get('branchId'));
    const warehouseIdValue = url.searchParams.get('warehouseId');
    const correlationId = request.headers['x-correlation-id'] ?? url.searchParams.get('correlationId') ?? '';
    const requiresWarehouse = path.endsWith('/locations');
    const isValuation = path.endsWith('/valuation');
    const isValuationAudit = path.endsWith('/valuation-audit');
    const isOperationTypes = path.endsWith('/operation-types');
    const isLedger = path.endsWith('/ledger');
    const isCount = path.endsWith('/count');
    const isPutaway = path.endsWith('/putaway/rules');
    const isRoutes = path.endsWith('/routes');
    const isDeliveryMethods = path.endsWith('/delivery-methods');
    const isBranchAvailability = path.endsWith('/branch-availability');
    const isBranchValuation = path.endsWith('/branch-valuation');
    const isForecast = path.endsWith('/forecast');
    try {
      if (isBranchAvailability || isBranchValuation) {
        assertBranchQuery({ companyId, branchId, productCode: url.searchParams.get('productCode') ?? undefined, variantCode: url.searchParams.get('variantCode') ?? undefined, correlationId });
      } else if (isValuation || isValuationAudit) {
        assertValuationQuery({ companyId, warehouseId: Number(warehouseIdValue), correlationId });
      } else if (isOperationTypes) {
        assertOperationTypesQuery({ companyId, correlationId });
      } else if (isLedger) {
        assertStockLedgerQuery({ companyId, warehouseId: Number(warehouseIdValue), fromDate: url.searchParams.get('fromDate') ?? undefined, toDate: url.searchParams.get('toDate') ?? undefined, correlationId });
      } else if (isCount) {
        assertCountQuery({ companyId, warehouseId: Number(warehouseIdValue), sessionId: url.searchParams.get('sessionId') ?? '', correlationId });
      } else if (isPutaway) {
        assertPutawayQuery({ companyId, branchId, correlationId });
      } else if (isRoutes || isDeliveryMethods) {
        assertCompanyQuery({ companyId, correlationId });
      } else if (isForecast) {
        assertScopedRequest({ companyId, branchId, warehouseId: Number(warehouseIdValue), correlationId });
        if (!warehouseIdValue || Number(warehouseIdValue) <= 0) throw new Error('warehouseId is required');
        if (!url.searchParams.get('productCode')) throw new Error('productCode is required');
        if (!url.searchParams.get('variantCode')) throw new Error('variantCode is required');
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
