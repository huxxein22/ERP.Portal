import { describe, expect, it } from "vitest";
import { assertScopedRequest } from "../../src/contracts/inventory/availability";
describe("Inventory Portal contract boundary", () => {
  it("requires correlation and scope inputs", () => {
    expect(() => assertScopedRequest({ companyId: 1, branchId: 7, correlationId: "" })).toThrow("correlationId");
    expect(() => assertScopedRequest({ companyId: 1, branchId: 7, correlationId: "corr-1" })).not.toThrow();
  });
  it("rejects invalid warehouse scope", () => {
    expect(() => assertScopedRequest({ companyId: 1, branchId: 7, warehouseId: 0, correlationId: "corr-2" })).toThrow("warehouseId");
  });
});
