export function assertScopedRequest(request) {
  if (!request || !String(request.correlationId ?? '').trim()) throw new Error('correlationId is required');
  if (request.companyId <= 0 || request.branchId <= 0) throw new Error('companyId and branchId are required');
  if (request.warehouseId !== undefined && request.warehouseId <= 0) throw new Error('warehouseId must be positive');
}
