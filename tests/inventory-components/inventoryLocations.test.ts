import { describe, expect, it } from 'vitest';
import { renderInventoryLocations } from '../../src/components/inventory/inventoryLocations.mjs';

describe('Inventory locations component', () => {
  it('renders branch and warehouse scoped reads with distinct failure states', () => {
    const html = renderInventoryLocations({ companyId: 1, branchId: 7, warehouseId: 11 });
    expect(html).toContain('/api/inventory/warehouses?');
    expect(html).toContain('/api/inventory/locations?');
    expect(html).toContain('Access denied for this company/branch/warehouse scope.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
  });
});
