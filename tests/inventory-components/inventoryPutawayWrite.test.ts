import { describe, expect, it } from 'vitest';
import { renderInventoryPutawayWrite } from '../../src/components/inventory/inventoryPutawayWrite.mjs';

describe('Inventory Putaway write component', () => {
  it('renders branch-scoped write and denial states', () => {
    const html = renderInventoryPutawayWrite({ companyId: 1, branchId: 7, locationId: 101 });
    expect(html).toContain("fetch('/api/inventory/putaway/rules'");
    expect(html).toContain('Putaway write denied for this caller or branch scope.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
  });
});
