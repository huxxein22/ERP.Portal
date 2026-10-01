import { describe, expect, it } from 'vitest';
import { renderInventoryScrap } from '../../src/components/inventory/inventoryScrap.mjs';

describe('Inventory Scrap component', () => {
  it('renders the scoped gateway operation and safe failure states', () => {
    const html = renderInventoryScrap({ companyId: 1, warehouseId: 7 });
    expect(html).toContain("fetch('/api/inventory/stock/scrap'");
    expect(html).toContain('Scrap denied for this caller or warehouse scope.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
    expect(html).toContain('Scrap recorded atomically.');
  });
});
