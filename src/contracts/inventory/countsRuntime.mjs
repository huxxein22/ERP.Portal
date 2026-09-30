export function assertCountQuery(query) {
  if (!String(query?.correlationId ?? '').trim()) throw new Error('correlationId is required');
  if (query.companyId <= 0 || query.warehouseId <= 0) throw new Error('companyId and warehouseId are required');
  if (!String(query.sessionId ?? '').trim()) throw new Error('sessionId is required');
}
