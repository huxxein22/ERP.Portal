export type InventoryScopedQuery = {
  companyId: number;
  branchId: number;
  warehouseId?: number;
  correlationId: string;
};

export type InventoryWarehouse = {
  warehouseId: number;
  companyId: number;
  branchId: number;
  code: string;
  name: string;
  active: boolean;
};

export type InventoryLocation = {
  locationId: number;
  companyId: number;
  branchId: number;
  warehouseId: number;
  code: string;
  name: string;
  locationType: string;
  usage: string;
  active: boolean;
};

export function assertScopedQuery(query: InventoryScopedQuery, requireWarehouse = false): void {
  if (!query.correlationId.trim()) throw new Error("correlationId is required");
  if (query.companyId <= 0 || query.branchId <= 0) throw new Error("companyId and branchId are required");
  if (requireWarehouse && (!query.warehouseId || query.warehouseId <= 0)) {
    throw new Error("warehouseId is required");
  }
  if (query.warehouseId !== undefined && query.warehouseId <= 0) throw new Error("warehouseId must be positive");
}
