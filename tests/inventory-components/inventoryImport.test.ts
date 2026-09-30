import { describe, expect, it } from 'vitest';
import { renderInventoryImport } from '../../src/components/inventory/inventoryImport.mjs';

describe('Inventory Import component', () => {
  it('renders preview plus explicit staging without exposing direct apply', () => {
    const html = renderInventoryImport({ companyId: 1, branchId: 7, warehouseId: 11 });
    expect(html).toContain('/api/inventory/import/preview');
    expect(html).toContain('Preview first, then explicitly stage');
    expect(html).toContain('/api/inventory/import/stage');
    expect(html).toContain('Stage reviewed import');
    expect(html).toContain('Duplicate rows:');
    expect(html).not.toContain('/api/inventory/import/apply');
  });
});
