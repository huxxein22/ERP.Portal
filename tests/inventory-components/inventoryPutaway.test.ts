import { describe, expect, it } from 'vitest';
import { renderInventoryPutaway } from '../../src/components/inventory/inventoryPutaway.mjs';

describe('Putaway component', () => {
  it('renders scoped rule review without post-receipt movement controls', () => {
    const html = renderInventoryPutaway({ companyId: 1, branchId: 7 });
    expect(html).toContain('/api/inventory/putaway/rules');
    expect(html).toContain('Post-receipt stock movement remains outside this screen.');
    expect(html).toContain('Putaway access denied for this company/branch scope.');
  });
});
