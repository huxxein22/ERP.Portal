import { describe, expect, it } from 'vitest';
import { renderInventoryOperations } from '../../src/components/inventory/inventoryOperations.mjs';

describe('Inventory Operations component', () => {
  it('renders scoped operation catalog and ledger loading', () => {
    const html = renderInventoryOperations({ companyId: 1, warehouseId: 11 });
    expect(html).toContain('name="companyId"');
    expect(html).toContain('name="warehouseId"');
    expect(html).toContain('/api/inventory/operation-types');
    expect(html).toContain('/api/inventory/ledger');
    expect(html).toContain('Access denied for this company/warehouse scope.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
  });
});
