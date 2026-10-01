export type InventoryScrapRequest = {
  companyId: number;
  warehouseId: number;
  productCode: string;
  variantCode?: string;
  quantity: number;
  reason: string;
  idempotencyKey: string;
  correlationId: string;
};

export type InventoryScrapResponse = {
  operationId: string;
  status: string;
  replayed: boolean;
};

export function assertScrapRequest(request: InventoryScrapRequest): void {
  if (!Number.isInteger(request.companyId) || request.companyId <= 0) throw new Error("companyId is required");
  if (!Number.isInteger(request.warehouseId) || request.warehouseId <= 0) throw new Error("warehouseId is required");
  if (!request.productCode?.trim()) throw new Error("productCode is required");
  if (!Number.isFinite(request.quantity) || request.quantity <= 0) throw new Error("quantity must be positive");
  if (request.reason.trim().length < 3) throw new Error("reason is required");
  if (!request.idempotencyKey.trim() || !request.correlationId.trim()) throw new Error("operation identity is required");
}
