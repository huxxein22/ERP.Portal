import { describe, expect, it } from 'vitest';
import { renderInventoryConfigurationWrite } from '../../src/components/inventory/inventoryConfigurationWrite.mjs';

describe('Inventory configuration write component', () => {
  it('renders authorized route and delivery write boundaries', () => {
    const html = renderInventoryConfigurationWrite({ companyId: 1 });
    expect(html).toContain("'/api/inventory/routes'");
    expect(html).toContain("'/api/inventory/delivery-methods'");
    expect(html).toContain('Configuration write denied for this caller.');
    expect(html).toContain('Inventory gateway is unavailable. Try again later.');
  });
});
