import { describe, expect, it } from 'vitest';
import { renderInventoryCount } from '../../src/components/inventory/inventoryCount.mjs';

describe('Physical Count component', () => {
  it('renders the explicit scoped count workflow', () => {
    const html = renderInventoryCount({ companyId: 1, warehouseId: 11, sessionId: 'count-1' });
    expect(html).toContain('/api/inventory/count');
    expect(html).toContain('/api/inventory/count/start');
    expect(html).toContain('/api/inventory/count/line');
    expect(html).toContain('/api/inventory/count/finalize');
    expect(html).toContain('/api/inventory/count/apply-difference');
    expect(html).toContain('scoped and idempotent');
    expect(html).toContain('Count access denied for this company/warehouse scope.');
  });
});
