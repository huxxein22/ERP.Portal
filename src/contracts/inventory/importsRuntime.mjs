export function assertImportPreviewRequest(request, staging = false) {
  if (!String(request?.correlationId ?? '').trim()) throw new Error('correlationId is required');
  if (request.companyId <= 0 || request.branchId <= 0 || request.warehouseId <= 0) {
    throw new Error('companyId, branchId, and warehouseId are required');
  }
  if (!Array.isArray(request.headers) || request.headers.length === 0) throw new Error('headers are required');
  if (!Array.isArray(request.rows)) throw new Error('rows are required');
  if (staging && !String(request.reference ?? '').trim()) throw new Error('reference is required for staging');
  if (staging && !String(request.idempotencyKey ?? '').trim()) throw new Error('idempotencyKey is required for staging');
  for (const row of request.rows) {
    if (!Number.isInteger(row?.rowNumber) || row.rowNumber < 1) throw new Error('rowNumber must be positive');
    if (!String(row?.productCode ?? '').trim()) throw new Error('productCode is required');
    if (typeof row?.rawQuantity !== 'string') throw new Error('rawQuantity must be text');
  }
}
