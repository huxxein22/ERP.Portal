export type InventoryCatalogProvisioningRequest = {
  companyId: number;
  externalId?: string;
  productCode: string;
  variantCode: string;
  barcode?: string;
  categoryId?: string;
  displayName: string;
  active?: boolean;
  sourceVersion: string;
  correlationId: string;
  costPrice?: number;
  salesPrice?: number;
};

export type InventoryCatalogProvisioningResponse = {
  status: string;
  productId?: string;
  variantId?: string;
  sourceVersion?: string;
  costPrice?: number;
  salesPrice?: number;
};

export function assertCatalogProvisioningRequest(request: InventoryCatalogProvisioningRequest): void {
  if (!Number.isInteger(request.companyId) || request.companyId <= 0) throw new Error("companyId must be a positive integer");
  for (const [name, value] of Object.entries({
    productCode: request.productCode,
    variantCode: request.variantCode,
    displayName: request.displayName,
    sourceVersion: request.sourceVersion,
    correlationId: request.correlationId,
  })) {
    if (!value?.trim()) throw new Error(`${name} is required`);
  }
  for (const [name, value] of Object.entries({ costPrice: request.costPrice, salesPrice: request.salesPrice })) {
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) throw new Error(`${name} must be a non-negative finite number`);
  }
}
