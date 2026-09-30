import { describe, expect, it } from 'vitest';
import { renderInventoryAlerts } from '../../src/components/inventory/inventoryAlerts.mjs';

describe('Inventory reorder alerts component', () => {
  it('renders a scoped read-only availability boundary', () => {
    const html = renderInventoryAlerts({ companyId: 1, branchId: 7, warehouseId: 11 });
    expect(html).toContain('/api/inventory/availability');
    expect(html).toContain('Below reorder point');
    expect(html).toContain('does not create notifications, purchases, or Transit actions');
    expect(html).toContain('Access denied for this company/branch/warehouse scope.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
  });
});
