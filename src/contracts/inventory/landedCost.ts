export type InventoryLandedCostPreviewLine = {
  productCode: string;
  variantCode?: string;
  quantity: number;
  formerUnitCost: number;
};

export type InventoryLandedCostPreviewRequest = {
  companyId: number;
  warehouseId: number;
  totalAmount: number;
  currency: string;
  lines: InventoryLandedCostPreviewLine[];
  correlationId: string;
};

export type InventoryLandedCostPreviewResponse = {
  accepted: boolean;
  status: string;
  totalAmount: number;
  totalQuantity: number;
  allocationMethod: string;
  financialsVisible: boolean;
  maskingReason: string;
  allocations: Array<InventoryLandedCostPreviewLine & {
    allocatedAmount: number;
    additionalUnitCost: number;
    newUnitCost: number;
  }>;
};

export function assertLandedCostPreviewRequest(request: InventoryLandedCostPreviewRequest): void {
  if (!Number.isInteger(request.companyId) || request.companyId <= 0) throw new Error('companyId is required');
  if (!Number.isInteger(request.warehouseId) || request.warehouseId <= 0) throw new Error('warehouseId is required');
  if (!Number.isFinite(request.totalAmount) || request.totalAmount <= 0) throw new Error('totalAmount must be positive');
  if (!request.currency.trim()) throw new Error('currency is required');
  if (!request.lines.length || request.lines.some(line => !line.productCode.trim() || !Number.isFinite(line.quantity) || line.quantity <= 0 || !Number.isFinite(line.formerUnitCost) || line.formerUnitCost < 0)) throw new Error('receipt lines are invalid');
  if (!request.correlationId.trim()) throw new Error('correlationId is required');
}
