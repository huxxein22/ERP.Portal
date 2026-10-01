import { describe, expect, it } from 'vitest';
import { assertLandedCostPreviewRequest } from '../../src/contracts/inventory/landedCost';

describe('inventory landed cost preview contract', () => {
  it('accepts positive receipt lines and rejects invalid quantities', () => {
    expect(() => assertLandedCostPreviewRequest({
      companyId: 1,
      warehouseId: 7,
      totalAmount: 100,
      currency: 'EGP',
      lines: [{ productCode: 'SKU', variantCode: 'DEFAULT', quantity: 2, formerUnitCost: 50 }],
      correlationId: 'landed-cost-test',
    })).not.toThrow();
    expect(() => assertLandedCostPreviewRequest({
      companyId: 1,
      warehouseId: 7,
      totalAmount: 100,
      currency: 'EGP',
      lines: [{ productCode: 'SKU', quantity: 0, formerUnitCost: 50 }],
      correlationId: 'landed-cost-test',
    })).toThrow();
  });
});
