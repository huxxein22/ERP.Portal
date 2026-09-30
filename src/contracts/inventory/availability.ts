export type InventoryScope = { companyId: number; branchId: number; warehouseId?: number };
export type InventoryAvailabilityRequest = InventoryScope & { correlationId: string };
export type InventoryAvailabilityResponse = {
  items: Array<{
    productCode: string;
    variantCode: string;
    warehouseId: number;
    onHand: number;
    reserved: number;
    available: number;
  }>;
};
export type InventoryGatewayError = { kind: "unauthenticated" } | { kind: "permission-denied"; scope: InventoryScope } | { kind: "transport"; message: string };
export function assertScopedRequest(request: InventoryAvailabilityRequest): void {
  if (!request.correlationId.trim()) throw new Error("correlationId is required");
  if (request.companyId <= 0 || request.branchId <= 0) throw new Error("companyId and branchId are required");
  if (request.warehouseId !== undefined && request.warehouseId <= 0) throw new Error("warehouseId must be positive");
}
