import { describe, expect, it } from 'vitest';
import { renderInventoryMoves } from '../../src/components/inventory/inventoryMoves.mjs';

describe('inventory moves screen', () => {
  it('exposes receive, issue, and adjust through the gateway only', () => {
    const html = renderInventoryMoves({ companyId: 7, warehouseId: 12 });
    expect(html).toContain('Receive');
    expect(html).toContain('Issue');
    expect(html).toContain('Adjust');
    expect(html).toContain('/api/inventory/stock/'+"'+operation");
    expect(html).toContain('Transit dispatch/receipt is intentionally not exposed');
    expect(html).toContain('value="7"');
    expect(html).toContain('value="12"');
  });
});
