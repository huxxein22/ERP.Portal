import { describe, expect, it } from 'vitest';
import { renderInventoryValuation } from '../../src/components/inventory/inventoryValuation.mjs';

describe('Inventory Valuation component', () => {
  it('preserves the backend financial visibility boundary', () => {
    const html = renderInventoryValuation({ companyId: 1, warehouseId: 11 });
    expect(html).toContain('/api/inventory/valuation');
    expect(html).toContain('/api/inventory/valuation-audit');
    expect(html).toContain('Read-only classification; no journal posting or repair is performed.');
    expect(html).toContain('financialsVisible===true');
    expect(html).toContain('Cost and value details are permission-masked.');
    expect(html).toContain('Valuation access denied for this company/warehouse scope.');
    expect(html).toContain('Accounting reconciliation');
    expect(html).toContain('financialInventoryTrustworthy');
    expect(html).toContain('inventoryGlStatus');
  });
});
