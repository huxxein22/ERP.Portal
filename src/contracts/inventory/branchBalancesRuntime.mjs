export function assertBranchQuery(query) {
  if (!String(query?.correlationId ?? '').trim()) throw new Error('correlationId is required');
  if (query.companyId <= 0 || query.branchId <= 0) throw new Error('companyId and branchId are required');
  if (query.productCode !== undefined && !String(query.productCode).trim()) throw new Error('productCode must not be empty');
  if (query.variantCode !== undefined && !String(query.variantCode).trim()) throw new Error('variantCode must not be empty');
}
