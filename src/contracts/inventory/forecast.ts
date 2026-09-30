export type InventoryForecastQuery = {
  companyId: number;
  branchId: number;
  warehouseId: number;
  productCode: string;
  variantCode: string;
  correlationId: string;
};

export type InventoryForecastResponse = {
  items: Array<{
    productCode: string;
    variantCode: string;
    warehouseId: number;
    onHand: number;
    reserved: number;
    incoming: number;
    outgoing: number;
    forecasted: number;
    reorderPoint: number;
    suggestedQuantity: number;
    incomingFactCount: number;
    outgoingFactCount: number;
    incomingSourceVersion: string;
    outgoingSourceVersion: string;
  }>;
};

export function assertForecastQuery(query: InventoryForecastQuery): void {
  if (!Number.isInteger(query.companyId) || query.companyId <= 0) throw new Error("companyId is required");
  if (!Number.isInteger(query.branchId) || query.branchId <= 0) throw new Error("branchId is required");
  if (!Number.isInteger(query.warehouseId) || query.warehouseId <= 0) throw new Error("warehouseId is required");
  if (!query.productCode?.trim()) throw new Error("productCode is required");
  if (!query.variantCode?.trim()) throw new Error("variantCode is required");
  if (!query.correlationId?.trim()) throw new Error("correlationId is required");
}
