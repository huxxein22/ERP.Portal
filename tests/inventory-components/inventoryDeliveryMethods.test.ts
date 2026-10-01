import { describe, expect, it } from 'vitest';
import { renderInventoryDeliveryMethods } from '../../src/components/inventory/inventoryDeliveryMethods.mjs';

describe('Inventory Delivery Methods component', () => {
  it('renders scoped read/write gateway boundaries and denial states', () => {
    const html = renderInventoryDeliveryMethods({ companyId: 7 });
    expect(html).toContain('value="7"');
    expect(html).toContain('/api/inventory/delivery-methods');
    expect(html).toContain('Delivery-method access denied for this company scope.');
    expect(html).toContain('Delivery-method write denied for this caller.');
    expect(html).toContain('does not execute transfers');
  });
});
