export type InventoryCountQuery = { companyId: number; warehouseId: number; sessionId: string; correlationId: string };
export type InventoryCountLine = { locationId: number; productCode: string; variantCode: string; expectedOnHand: number; countedOnHand: number; difference: number };
export type InventoryCountResponse = { session: { sessionId: string; companyId: number; branchId: number; warehouseId: number; status: string; reference: string; lines: InventoryCountLine[] } | null };
export { assertCountQuery } from './countsRuntime.mjs';
