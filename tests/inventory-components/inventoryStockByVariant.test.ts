import { describe, expect, it } from 'vitest';
import { renderInventoryStockByVariant } from '../../src/components/inventory/inventoryStockByVariant.mjs';

describe('Inventory stock by variant component', () => {
  it('renders scoped Product/Variant filters and boundary states', () => {
    const html = renderInventoryStockByVariant({ companyId: 1, branchId: 7, warehouseId: 11 });
    expect(html).toContain('/api/inventory/availability');
    expect(html).toContain('Product code');
    expect(html).toContain('Variant code');
    expect(html).toContain('Access denied for this company/branch/warehouse scope.');
  });
});
