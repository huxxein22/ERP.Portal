import { describe, expect, it } from "vitest";
import { assertScopedRequest } from "../../src/contracts/inventory/availability";
import { getAvailability } from "../../src/gateway/inventoryGateway";
describe("Inventory Portal contract boundary", () => {
  it("requires correlation and scope inputs", () => {
    expect(() => assertScopedRequest({ companyId: 1, branchId: 7, correlationId: "" })).toThrow("correlationId");
    expect(() => assertScopedRequest({ companyId: 1, branchId: 7, correlationId: "corr-1" })).not.toThrow();
  });
  it("rejects invalid warehouse scope", () => {
    expect(() => assertScopedRequest({ companyId: 1, branchId: 7, warehouseId: 0, correlationId: "corr-2" })).toThrow("warehouseId");
  });

  it("forwards the scoped request and correlation ID through the gateway", async () => {
    let received: RequestInit | undefined;
    const response = await getAvailability(
      { companyId: 1, branchId: 7, warehouseId: 11, correlationId: "corr-3" },
      async (_input, init) => {
        received = init;
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      },
    );

    expect(response).toEqual({ items: [] });
    expect(received?.headers).toEqual({
      "content-type": "application/json",
      "x-correlation-id": "corr-3",
    });
    expect(received?.body).toContain('"warehouseId":11');
  });

  it("keeps permission denial distinct from transport failure", async () => {
    await expect(
      getAvailability(
        { companyId: 1, branchId: 7, correlationId: "corr-4" },
        async () => new Response("denied", { status: 403 }),
      ),
    ).rejects.toMatchObject({ kind: "permission-denied", scope: { branchId: 7 } });

    await expect(
      getAvailability(
        { companyId: 1, branchId: 7, correlationId: "corr-5" },
        async () => new Response("unavailable", { status: 502 }),
      ),
    ).rejects.toMatchObject({ kind: "transport", message: "Inventory gateway returned 502" });
  });
});
