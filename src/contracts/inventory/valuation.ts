export type InventoryValuationQuery = {
  companyId: number;
  warehouseId: number;
  productCode?: string;
  variantCode?: string;
  correlationId: string;
};

export type InventoryValuationItem = {
  productCode: string;
  variantCode: string;
  warehouseId: number;
  initialized: boolean;
  quantity: number;
  value?: number;
  averageUnitCost?: number;
  costingMethod?: string;
  layers?: Array<{
    layerId: string;
    movementId: string;
    originalQuantity: number;
    remainingQuantity: number;
    unitCost?: number;
    remainingValue?: number;
    createdAt: string;
  }>;
};

export type InventoryValuationResponse = {
  items: InventoryValuationItem[];
  financialsVisible: boolean;
};

export type InventoryValuationAuditItem = {
  layerId: string;
  movementId: string;
  productCode: string;
  variantCode: string;
  movementType: string;
  valueDelta?: number;
  classification: string;
  action: string;
  reason: string;
  accountingEligible: boolean;
};

export type InventoryValuationAuditResponse = {
  items: InventoryValuationAuditItem[];
  financialsVisible: boolean;
};

export { assertValuationQuery } from "./valuationRuntime.mjs";
