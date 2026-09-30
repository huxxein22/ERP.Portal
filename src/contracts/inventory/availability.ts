export type InventoryScope = { companyId: number; branchId?: number; warehouseId?: number };
export type InventoryAvailabilityRequest = InventoryScope & { branchId: number; correlationId: string };
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
export { assertScopedRequest } from "./availabilityRuntime.mjs";
