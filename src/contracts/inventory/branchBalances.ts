export type InventoryBranchQuery = {
  companyId: number;
  branchId: number;
  productCode?: string;
  variantCode?: string;
  correlationId: string;
};

export type InventoryBranchAvailabilityItem = {
  branchId: number;
  productCode: string;
  variantCode: string;
  onHand: number;
  reserved: number;
  available: number;
  warehouseCount: number;
};

export type InventoryBranchAvailabilityResponse = {
  items: InventoryBranchAvailabilityItem[];
};

export type InventoryBranchValuationItem = {
  branchId: number;
  productCode: string;
  variantCode: string;
  warehouseCount: number;
  initialized: boolean;
  quantity: number;
  value?: number;
  averageUnitCost?: number;
  costingMethod?: string;
};

export type InventoryBranchValuationResponse = {
  items: InventoryBranchValuationItem[];
  financialsVisible: boolean;
};

export { assertBranchQuery } from "./branchBalancesRuntime.mjs";
