export function assertLandedCostApplyRequest(request) {
  if (!Number.isInteger(request.companyId) || request.companyId <= 0) throw new Error('companyId is required');
  if (!Number.isInteger(request.warehouseId) || request.warehouseId <= 0) throw new Error('warehouseId is required');
  if (!String(request.reference ?? '').trim() || !String(request.idempotencyKey ?? '').trim()) throw new Error('reference and idempotencyKey are required');
  if (!Number.isFinite(request.totalAmount) || request.totalAmount <= 0) throw new Error('totalAmount must be positive');
  if (!String(request.currency ?? '').trim()) throw new Error('currency is required');
  if (!Array.isArray(request.lines) || !request.lines.length || request.lines.some(line => !Number.isInteger(line.locationId) || line.locationId <= 0 || !String(line.productCode ?? '').trim() || !Number.isFinite(line.quantity) || line.quantity <= 0 || !Number.isFinite(line.formerUnitCost) || line.formerUnitCost < 0)) throw new Error('landed cost lines are invalid');
  if (!String(request.correlationId ?? '').trim()) throw new Error('correlationId is required');
}
