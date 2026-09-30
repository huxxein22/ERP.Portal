export function assertPutawayQuery(query) {
  if (!String(query?.correlationId ?? '').trim()) throw new Error('correlationId is required');
  if (query.companyId <= 0 || query.branchId <= 0) throw new Error('companyId and branchId are required');
}
