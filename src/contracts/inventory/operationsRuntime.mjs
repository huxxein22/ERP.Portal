export function assertOperationTypesQuery(query) {
  if (!String(query.correlationId ?? '').trim()) throw new Error('correlationId is required');
  if (query.companyId <= 0) throw new Error('companyId is required');
}

export function assertStockLedgerQuery(query) {
  if (!String(query.correlationId ?? '').trim()) throw new Error('correlationId is required');
  if (query.companyId <= 0 || query.warehouseId <= 0) throw new Error('companyId and warehouseId are required');
}
