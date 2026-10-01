import { describe, expect, it } from 'vitest';
import { assertScrapRequest } from '../../src/contracts/inventory/scrap';

describe('inventory scrap contract', () => {
  it('requires a scoped positive, reasoned operation', () => {
    expect(() => assertScrapRequest({ companyId: 1, warehouseId: 7, productCode: 'SKU', quantity: 1, reason: 'damage', idempotencyKey: 'i-1', correlationId: 'c-1' })).not.toThrow();
    expect(() => assertScrapRequest({ companyId: 1, warehouseId: 7, productCode: 'SKU', quantity: 0, reason: 'damage', idempotencyKey: 'i-1', correlationId: 'c-1' })).toThrow();
  });
});
