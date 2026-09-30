import {
  assertScopedRequest,
  type InventoryAvailabilityRequest,
  type InventoryAvailabilityResponse,
  type InventoryGatewayError,
} from "../contracts/inventory/availability";
import { assertScopedQuery, type InventoryLocation, type InventoryScopedQuery, type InventoryWarehouse } from "../contracts/inventory/locations";
import { assertValuationQuery, type InventoryValuationQuery, type InventoryValuationResponse } from "../contracts/inventory/valuation";
import { assertOperationTypesQuery, assertStockLedgerQuery, type InventoryOperationType, type InventoryOperationTypesQuery, type InventoryStockLedgerLine, type InventoryStockLedgerQuery } from "../contracts/inventory/operations";
import { assertImportPreviewRequest, type InventoryImportPreviewRequest, type InventoryImportPreviewResponse } from "../contracts/inventory/imports";
import { assertCountQuery, type InventoryCountQuery, type InventoryCountResponse } from "../contracts/inventory/counts";
import { assertPutawayQuery, type InventoryPutawayQuery, type InventoryPutawayRule } from "../contracts/inventory/putaway";
import { assertCompanyQuery, type InventoryCompanyQuery, type InventoryDeliveryMethod, type InventoryRoute, type InventoryRule } from "../contracts/inventory/configuration";
import { assertBranchQuery, type InventoryBranchAvailabilityResponse, type InventoryBranchQuery, type InventoryBranchValuationResponse } from "../contracts/inventory/branchBalances";
export async function getAvailability(request: InventoryAvailabilityRequest, fetcher: typeof fetch = fetch): Promise<InventoryAvailabilityResponse> {
  assertScopedRequest(request);
  const response = await fetcher("/api/inventory/availability", {
    method: "POST",
    headers: { "content-type": "application/json", "x-correlation-id": request.correlationId },
    body: JSON.stringify(request),
  });
  if (response.ok) return response.json() as Promise<InventoryAvailabilityResponse>;
  const kind: InventoryGatewayError["kind"] = response.status === 401 ? "unauthenticated" : response.status === 403 ? "permission-denied" : "transport";
  throw { kind, scope: request, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
}

async function getScoped<T>(path: string, query: InventoryScopedQuery, fetcher: typeof fetch, requireWarehouse = path.endsWith("/locations")): Promise<T> {
  assertScopedQuery(query, requireWarehouse);
  const params = new URLSearchParams({
    companyId: String(query.companyId),
    branchId: String(query.branchId),
    correlationId: query.correlationId,
  });
  if (query.warehouseId !== undefined) params.set("warehouseId", String(query.warehouseId));

  const response = await fetcher(`${path}?${params.toString()}`, {
    headers: { "x-correlation-id": query.correlationId },
  });
  if (!response.ok) {
    const kind: InventoryGatewayError["kind"] = response.status === 401 ? "unauthenticated" : response.status === 403 ? "permission-denied" : "transport";
    throw { kind, scope: query, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
  }
  return response.json() as Promise<T>;
}

export function listWarehouses(query: InventoryScopedQuery, fetcher: typeof fetch = fetch): Promise<{ items: InventoryWarehouse[] }> {
  return getScoped("/api/inventory/warehouses", query, fetcher);
}

export function listLocations(query: InventoryScopedQuery, fetcher: typeof fetch = fetch): Promise<{ items: InventoryLocation[] }> {
  return getScoped("/api/inventory/locations", query, fetcher);
}

export function getValuation(query: InventoryValuationQuery, fetcher: typeof fetch = fetch): Promise<InventoryValuationResponse> {
  assertValuationQuery(query);
  const params = new URLSearchParams({
    companyId: String(query.companyId),
    warehouseId: String(query.warehouseId),
    correlationId: query.correlationId,
  });
  if (query.productCode) params.set("productCode", query.productCode);
  if (query.variantCode) params.set("variantCode", query.variantCode);
  return fetcher(`/api/inventory/valuation?${params.toString()}`, {
    headers: { "x-correlation-id": query.correlationId },
  }).then(async (response) => {
    if (!response.ok) {
      const kind: InventoryGatewayError["kind"] = response.status === 401 ? "unauthenticated" : response.status === 403 ? "permission-denied" : "transport";
      throw { kind, scope: query, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
    }
    return response.json() as Promise<InventoryValuationResponse>;
  });
}

export function listOperationTypes(query: InventoryOperationTypesQuery, fetcher: typeof fetch = fetch): Promise<{ items: InventoryOperationType[] }> {
  assertOperationTypesQuery(query);
  const params = new URLSearchParams({ companyId: String(query.companyId), correlationId: query.correlationId });
  return fetcher(`/api/inventory/operation-types?${params.toString()}`, { headers: { "x-correlation-id": query.correlationId } }).then(async (response) => {
    if (!response.ok) {
      const kind: InventoryGatewayError["kind"] = response.status === 401 ? "unauthenticated" : response.status === 403 ? "permission-denied" : "transport";
      throw { kind, scope: { companyId: query.companyId }, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
    }
    return response.json() as Promise<{ items: InventoryOperationType[] }>;
  });
}

export function getStockLedger(query: InventoryStockLedgerQuery, fetcher: typeof fetch = fetch): Promise<{ lines: InventoryStockLedgerLine[] }> {
  assertStockLedgerQuery(query);
  const params = new URLSearchParams({ companyId: String(query.companyId), warehouseId: String(query.warehouseId), correlationId: query.correlationId });
  if (query.fromDate) params.set("fromDate", query.fromDate);
  if (query.toDate) params.set("toDate", query.toDate);
  return fetcher(`/api/inventory/ledger?${params.toString()}`, { headers: { "x-correlation-id": query.correlationId } }).then(async (response) => {
    if (!response.ok) {
      const kind: InventoryGatewayError["kind"] = response.status === 401 ? "unauthenticated" : response.status === 403 ? "permission-denied" : "transport";
      throw { kind, scope: query, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
    }
    return response.json() as Promise<{ lines: InventoryStockLedgerLine[] }>;
  });
}

export async function previewStockImport(request: InventoryImportPreviewRequest, fetcher: typeof fetch = fetch): Promise<InventoryImportPreviewResponse> {
  assertImportPreviewRequest(request);
  const response = await fetcher('/api/inventory/import/preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-correlation-id': request.correlationId },
    body: JSON.stringify(request),
  });
  if (response.ok) return response.json() as Promise<InventoryImportPreviewResponse>;
  const kind: InventoryGatewayError['kind'] = response.status === 401 ? 'unauthenticated' : response.status === 403 ? 'permission-denied' : 'transport';
  throw { kind, scope: request, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
}

export function getCount(query: InventoryCountQuery, fetcher: typeof fetch = fetch): Promise<InventoryCountResponse> {
  assertCountQuery(query);
  const params = new URLSearchParams({ companyId: String(query.companyId), warehouseId: String(query.warehouseId), sessionId: query.sessionId, correlationId: query.correlationId });
  return fetcher(`/api/inventory/count?${params.toString()}`, { headers: { 'x-correlation-id': query.correlationId } }).then(async (response) => {
    if (!response.ok) {
      const kind: InventoryGatewayError['kind'] = response.status === 401 ? 'unauthenticated' : response.status === 403 ? 'permission-denied' : 'transport';
      throw { kind, scope: query, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
    }
    return response.json() as Promise<InventoryCountResponse>;
  });
}

export function listPutawayRules(query: InventoryPutawayQuery, fetcher: typeof fetch = fetch): Promise<{ items: InventoryPutawayRule[] }> {
  assertPutawayQuery(query);
  const params = new URLSearchParams({ companyId: String(query.companyId), branchId: String(query.branchId), correlationId: query.correlationId });
  return fetcher(`/api/inventory/putaway/rules?${params.toString()}`, { headers: { 'x-correlation-id': query.correlationId } }).then(async (response) => {
    if (!response.ok) {
      const kind: InventoryGatewayError['kind'] = response.status === 401 ? 'unauthenticated' : response.status === 403 ? 'permission-denied' : 'transport';
      throw { kind, scope: query, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
    }
    return response.json() as Promise<{ items: InventoryPutawayRule[] }>;
  });
}

export function listRoutes(query: InventoryCompanyQuery, fetcher: typeof fetch = fetch): Promise<{ routes: InventoryRoute[]; rules: InventoryRule[] }> {
  assertCompanyQuery(query);
  const params = new URLSearchParams({ companyId: String(query.companyId), correlationId: query.correlationId });
  return fetcher(`/api/inventory/routes?${params.toString()}`, { headers: { 'x-correlation-id': query.correlationId } }).then(async (response) => {
    if (!response.ok) throw { kind: response.status === 401 ? 'unauthenticated' : response.status === 403 ? 'permission-denied' : 'transport', scope: query, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
    return response.json() as Promise<{ routes: InventoryRoute[]; rules: InventoryRule[] }>;
  });
}

export function listDeliveryMethods(query: InventoryCompanyQuery, fetcher: typeof fetch = fetch): Promise<{ items: InventoryDeliveryMethod[] }> {
  assertCompanyQuery(query);
  const params = new URLSearchParams({ companyId: String(query.companyId), activeOnly: 'true', correlationId: query.correlationId });
  return fetcher(`/api/inventory/delivery-methods?${params.toString()}`, { headers: { 'x-correlation-id': query.correlationId } }).then(async (response) => {
    if (!response.ok) throw { kind: response.status === 401 ? 'unauthenticated' : response.status === 403 ? 'permission-denied' : 'transport', scope: query, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
    return response.json() as Promise<{ items: InventoryDeliveryMethod[] }>;
  });
}

function getBranch<T>(path: string, query: InventoryBranchQuery, fetcher: typeof fetch): Promise<T> {
  assertBranchQuery(query);
  const params = new URLSearchParams({
    companyId: String(query.companyId),
    branchId: String(query.branchId),
    correlationId: query.correlationId,
  });
  if (query.productCode) params.set('productCode', query.productCode);
  if (query.variantCode) params.set('variantCode', query.variantCode);
  return fetcher(`${path}?${params.toString()}`, { headers: { 'x-correlation-id': query.correlationId } }).then(async (response) => {
    if (!response.ok) {
      const kind: InventoryGatewayError['kind'] = response.status === 401 ? 'unauthenticated' : response.status === 403 ? 'permission-denied' : 'transport';
      throw { kind, scope: query, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
    }
    return response.json() as Promise<T>;
  });
}

export function getBranchAvailability(query: InventoryBranchQuery, fetcher: typeof fetch = fetch): Promise<InventoryBranchAvailabilityResponse> {
  return getBranch('/api/inventory/branch-availability', query, fetcher);
}

export function getBranchValuation(query: InventoryBranchQuery, fetcher: typeof fetch = fetch): Promise<InventoryBranchValuationResponse> {
  return getBranch('/api/inventory/branch-valuation', query, fetcher);
}
