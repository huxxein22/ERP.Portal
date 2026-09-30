import { describe, expect, it } from "vitest";
import { assertForecastQuery } from "../../src/contracts/inventory/forecast";
import { getForecast } from "../../src/gateway/inventoryGateway";

describe("Inventory forecast contract boundary", () => {
  it("requires warehouse, product, variant, and correlation scope", () => {
    expect(() => assertForecastQuery({ companyId: 1, branchId: 7, warehouseId: 0, productCode: "SKU-1", variantCode: "BLUE-M", correlationId: "corr" })).toThrow("warehouseId");
    expect(() => assertForecastQuery({ companyId: 1, branchId: 7, warehouseId: 11, productCode: "", variantCode: "BLUE-M", correlationId: "corr" })).toThrow("productCode");
  });

  it("forwards the scoped forecast query through the Portal gateway", async () => {
    let requestedUrl = "";
    const result = await getForecast(
      { companyId: 1, branchId: 7, warehouseId: 11, productCode: "SKU-1", variantCode: "BLUE-M", correlationId: "corr-forecast" },
      async (input) => {
        requestedUrl = String(input);
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      },
    );
    expect(result).toEqual({ items: [] });
    expect(requestedUrl).toContain("/api/inventory/forecast?");
    expect(requestedUrl).toContain("productCode=SKU-1");
    expect(requestedUrl).toContain("variantCode=BLUE-M");
  });
});
