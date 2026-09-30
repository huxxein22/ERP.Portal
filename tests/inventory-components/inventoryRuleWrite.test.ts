import { describe, expect, it } from 'vitest';
import { renderInventoryRuleWrite } from '../../src/components/inventory/inventoryRuleWrite.mjs';

describe('Inventory route rule write component', () => {
  it('renders route-scoped metadata write and denial states', () => {
    const html = renderInventoryRuleWrite({ companyId: 1, routeId: 'route-1' });
    expect(html).toContain("fetch('/api/inventory/rules'");
    expect(html).toContain('Route rule write denied for this caller.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
  });
});
