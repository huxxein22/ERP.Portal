import { describe, expect, it } from 'vitest';
import { renderInventoryLandedCost } from '../../src/components/inventory/inventoryLandedCost.mjs';

describe('Inventory Landed Cost component', () => {
  it('renders read-only preview and masking states', () => {
    const html = renderInventoryLandedCost({ companyId: 1, warehouseId: 7 });
    expect(html).toContain("fetch('/api/inventory/landed-costs/preview'");
    expect(html).toContain('Preview calculated with financial values masked.');
    expect(html).toContain('does not persist a landed-cost record or post Accounting');
  });
});
