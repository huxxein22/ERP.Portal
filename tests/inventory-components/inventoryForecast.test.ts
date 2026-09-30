import { describe, expect, it } from 'vitest';
import { renderInventoryForecast } from '../../src/components/inventory/inventoryForecast.mjs';

describe('Inventory forecast component', () => {
  it('renders the complete scope and authenticated forecast endpoint', () => {
    const html = renderInventoryForecast({ companyId: 1, branchId: 7, warehouseId: 11, productCode: 'SKU-1', variantCode: 'BLUE-M' });
    expect(html).toContain('Forecast &amp; Replenishment');
    expect(html).toContain('/api/inventory/forecast?');
    expect(html).toContain('Sales and Procurement authenticated authorities');
  });
});
