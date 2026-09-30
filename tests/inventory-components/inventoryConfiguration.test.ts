import { describe, expect, it } from 'vitest';
import { renderInventoryConfiguration } from '../../src/components/inventory/inventoryConfiguration.mjs';

describe('Inventory Configuration component', () => {
  it('renders company-scoped routes and delivery method review', () => {
    const html = renderInventoryConfiguration({ companyId: 1 });
    expect(html).toContain('/api/inventory/routes');
    expect(html).toContain('/api/inventory/delivery-methods');
    expect(html).toContain('Configuration access denied for this company scope.');
  });
});
