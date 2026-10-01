export type InventoryImportRow = {
  rowNumber: number;
  locationId?: number;
  locationCode?: string;
  productCode: string;
  variantCode?: string;
  rawQuantity: string;
  externalId?: string;
  barcode?: string;
};

export type InventoryImportPreviewRequest = {
  companyId: number;
  branchId: number;
  warehouseId: number;
  headers: string[];
  rows: InventoryImportRow[];
  defaultLocationId?: number;
  correlationId: string;
};

export type InventoryImportPreviewResult = {
  rowNumber: number;
  action: string;
  locationId?: number;
  productCode: string;
  variantCode: string;
  countedQuantity?: number;
  reason?: string;
  catalogProductId?: string;
  catalogVariantId?: string;
  catalogSourceVersion?: string;
};

export type InventoryImportPreviewResponse = {
  accepted: boolean;
  headerErrors: string[];
  rows: InventoryImportPreviewResult[];
  duplicateRows: number;
  stagedUnits: number;
};

export type InventoryImportStageRequest = InventoryImportPreviewRequest & {
  reference: string;
  idempotencyKey: string;
};

export type InventoryImportApplyRequest = InventoryImportStageRequest;

export { assertImportPreviewRequest } from './importsRuntime.mjs';
