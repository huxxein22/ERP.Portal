import { describe, expect, it } from 'vitest';
import { renderInventoryImport } from '../../src/components/inventory/inventoryImport.mjs';
import { assertImportPreviewRequest } from '../../src/contracts/inventory/importsRuntime.mjs';

describe('Inventory Import component', () => {
  it('renders preview plus explicit staging and Dev-only apply', () => {
    const html = renderInventoryImport({ companyId: 1, branchId: 7, warehouseId: 11 });
    expect(html).toContain('/api/inventory/import/preview');
    expect(html).toContain('Preview first, then explicitly stage or apply');
    expect(html).toContain('/api/inventory/import/stage');
    expect(html).toContain('Stage reviewed import');
    expect(html).toContain('Duplicate rows:');
    expect(html).toContain('Catalog identity failures are shown per row and block both actions.');
    expect(html).toContain('/api/inventory/import/apply');
    expect(html).toContain('Apply reviewed import (Dev)');
    expect(html).toContain('Explicit Catalog identity provisioning');
    expect(html).toContain('/api/inventory/catalog/product-variant');
    expect(html).toContain('Run Preview import again');
    expect(html).toContain('Catalog product ID');
    expect(html).toContain('Catalog variant ID');
    expect(html).toContain('Catalog version');
    expect(html).toContain('Incoming unit cost');
    expect(html).toContain('Before cost');
    expect(html).toContain('After cost');
    expect(html).toContain('Cost delta');
    expect(html).toContain('Cost status');
  });

  it('accepts Catalog external identity keys in the preview contract', () => {
    expect(() => assertImportPreviewRequest({
      companyId: 1,
      branchId: 7,
      warehouseId: 11,
      headers: ['product_code', 'variant_code', 'external_id', 'barcode', 'quantity'],
      rows: [{
        rowNumber: 1,
        productCode: 'SKU-1',
        variantCode: 'BLUE-M',
        externalId: 'odoo-variant-1',
        barcode: '622000000001',
        rawQuantity: '4',
      }],
      correlationId: 'portal-catalog-identity',
    })).not.toThrow();
  });
});
