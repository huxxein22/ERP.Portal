export type InventoryPutawayQuery = { companyId: number; branchId: number; correlationId: string };
export type InventoryPutawayRule = { ruleId: string; code: string; name: string; productCode: string; categoryId: number; branchId: number; locationId: number; sequence: number; active: boolean };
export { assertPutawayQuery } from './putawayRuntime.mjs';
