import { describe, expect, it } from 'vitest';
import { renderInventoryCount } from '../../src/components/inventory/inventoryCount.mjs';

describe('Physical Count component', () => {
  it('renders review-only count session and keeps apply separate', () => {
    const html = renderInventoryCount({ companyId: 1, warehouseId: 11, sessionId: 'count-1' });
    expect(html).toContain('/api/inventory/count');
    expect(html).toContain('Applying differences requires a separate authorized action.');
    expect(html).not.toContain('/api/inventory/count/apply');
    expect(html).toContain('Count access denied for this company/warehouse scope.');
  });
});
