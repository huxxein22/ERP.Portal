export type InventoryCompanyQuery = { companyId: number; correlationId: string };
export type InventoryRoute = { routeId: string; code: string; name: string; active: boolean };
export type InventoryRule = { ruleId: string; routeId: string; code: string; name: string; operationType: string; sourceLocationId: number; destinationLocationId: number; sequence: number; active: boolean };
export type InventoryDeliveryMethod = { methodId: string; code: string; name: string; nameAr: string; provider: string; fixedPrice: number; freeOverAmount: number; estimatedDaysMin: number; estimatedDaysMax: number; active: boolean; sequence: number; notes: string };
export { assertCompanyQuery } from './configurationRuntime.mjs';
