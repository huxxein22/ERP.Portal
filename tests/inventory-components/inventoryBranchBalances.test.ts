import { describe, expect, it } from 'vitest';
import { renderInventoryBranchBalances } from '../../src/components/inventory/inventoryBranchBalances.mjs';

describe('Inventory branch balances component', () => {
  it('renders the scoped branch queries and distinct denial/transport states', () => {
    const html = renderInventoryBranchBalances({ companyId: 1, branchId: 7 });
    expect(html).toContain('/api/inventory/branch-availability');
    expect(html).toContain('/api/inventory/branch-valuation');
    expect(html).toContain('Access denied for this company/branch scope.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
    expect(html).toContain('name="productCode"');
    expect(html).toContain('name="variantCode"');
  });
});
