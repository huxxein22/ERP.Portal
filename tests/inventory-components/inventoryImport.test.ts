import { describe, expect, it } from 'vitest';
import { renderInventoryImport } from '../../src/components/inventory/inventoryImport.mjs';

describe('Inventory Import component', () => {
  it('renders preview-only review and does not expose an apply action', () => {
    const html = renderInventoryImport({ companyId: 1, branchId: 7, warehouseId: 11 });
    expect(html).toContain('/api/inventory/import/preview');
    expect(html).toContain('Preview only. No inventory mutation');
    expect(html).toContain('Duplicate rows:');
    expect(html).not.toContain('/api/inventory/import/apply');
  });
});
