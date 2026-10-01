import { describe, expect, it } from 'vitest';
import { renderInventoryScrapReverse } from '../../src/components/inventory/inventoryScrapReverse.mjs';

describe('Inventory Scrap reversal component', () => {
  it('renders the authenticated reversal route and denial states', () => {
    const html = renderInventoryScrapReverse({ companyId: 1, warehouseId: 7 });
    expect(html).toContain("fetch('/api/inventory/stock/scrap/reverse'");
    expect(html).toContain('Scrap reversal denied for this caller or warehouse scope.');
    expect(html).toContain('Scrap reversed atomically.');
  });
});
