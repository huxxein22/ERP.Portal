import { describe, expect, it } from 'vitest';
import { renderInventoryOverview } from '../../src/components/inventory/inventoryOverview.mjs';

describe('Inventory Overview component', () => {
  it('renders scope selectors and the gateway-backed availability action', () => {
    const html = renderInventoryOverview({ companyId: 1, branchId: 7, warehouseId: 11 });
    expect(html).toContain('name="companyId"');
    expect(html).toContain('name="branchId"');
    expect(html).toContain('name="warehouseId"');
    expect(html).toContain("fetch('/api/inventory/availability'");
    expect(html).toContain('Access denied for this company/branch/warehouse scope.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
  });

  it('escapes server-provided selector defaults', () => {
    const html = renderInventoryOverview({ companyId: '" onfocus="alert(1)' as unknown as number });
    expect(html).not.toContain('" onfocus="alert(1)');
    expect(html).toContain('&quot; onfocus=&quot;alert(1)');
  });
});
