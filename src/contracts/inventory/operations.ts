export type InventoryOperationTypesQuery = { companyId: number; correlationId: string };
export type InventoryStockLedgerQuery = {
  companyId: number;
  warehouseId: number;
  fromDate?: string;
  toDate?: string;
  correlationId: string;
};

export type InventoryOperationType = { code: string; label: string; arabicLabel: string };
export type InventoryStockLedgerLine = {
  movementId: string;
  productCode: string;
  variantCode: string;
  quantity: number;
  movementType: string;
  occurredAt: string;
  sourceType: string;
};

export function assertOperationTypesQuery(query: InventoryOperationTypesQuery): void {
  if (!query.correlationId.trim()) throw new Error("correlationId is required");
  if (query.companyId <= 0) throw new Error("companyId is required");
}

export function assertStockLedgerQuery(query: InventoryStockLedgerQuery): void {
  if (!query.correlationId.trim()) throw new Error("correlationId is required");
  if (query.companyId <= 0 || query.warehouseId <= 0) throw new Error("companyId and warehouseId are required");
}
