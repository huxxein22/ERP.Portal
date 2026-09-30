import { describe, expect, it } from "vitest";
import { assertScopedRequest } from "../../src/contracts/inventory/availability";
import { getAvailability } from "../../src/gateway/inventoryGateway";
import { forwardInventoryAvailability } from "../../src/gateway/inventoryProxy";
import { getCount, listDeliveryMethods, listPutawayRules, listRoutes, getStockLedger, getValuation, listLocations, listOperationTypes, listWarehouses } from "../../src/gateway/inventoryGateway";
import { previewStockImport } from "../../src/gateway/inventoryGateway";
import { assertBranchQuery } from "../../src/contracts/inventory/branchBalances";
import { getBranchAvailability, getBranchValuation } from "../../src/gateway/inventoryGateway";
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

  it("preserves Product and Variant filters in the availability contract", async () => {
    let received: RequestInit | undefined;
    await getAvailability(
      {
        companyId: 1,
        branchId: 7,
        warehouseId: 11,
        productCode: "SKU-1",
        variantCode: "BLUE-M",
        correlationId: "corr-stock-by-variant",
      },
      async (_input, init) => {
        received = init;
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      },
    );

    expect(received?.body).toContain('"productCode":"SKU-1"');
    expect(received?.body).toContain('"variantCode":"BLUE-M"');
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

  it("forwards authorization and correlation through the server proxy", async () => {
    let received: RequestInit | undefined;
    const upstream = await forwardInventoryAvailability(
      { body: '{"companyId":1}', authorization: "Bearer test-token", correlationId: "corr-6" },
      "http://inventory-gateway/",
      async (_input, init) => {
        received = init;
        return new Response('{"items":[]}', { status: 200 });
      },
    );

    expect(await upstream.json()).toEqual({ items: [] });
    expect(received?.headers).toEqual({
      "content-type": "application/json",
      "x-correlation-id": "corr-6",
      authorization: "Bearer test-token",
    });
    expect(received?.body).toBe('{"companyId":1}');
  });

  it("requires a warehouse scope for locations and preserves selectors for warehouses", async () => {
    await expect(
      listLocations({ companyId: 1, branchId: 7, correlationId: "corr-7" }, async () => new Response("bad", { status: 200 })),
    ).rejects.toThrow("warehouseId is required");

    let requestedUrl = "";
    await listWarehouses(
      { companyId: 1, branchId: 7, correlationId: "corr-8" },
      async (input) => {
        requestedUrl = String(input);
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      },
    );
    expect(requestedUrl).toContain("companyId=1");
    expect(requestedUrl).toContain("branchId=7");
    expect(requestedUrl).toContain("correlationId=corr-8");
  });

  it("preserves valuation filters and backend financial visibility", async () => {
    let requestedUrl = "";
    const response = await getValuation(
      { companyId: 1, warehouseId: 11, productCode: "SKU-1", variantCode: "BLUE-M", correlationId: "corr-9" },
      async (input) => {
        requestedUrl = String(input);
        return new Response(JSON.stringify({ items: [], financialsVisible: false }), { status: 200 });
      },
    );

    expect(response.financialsVisible).toBe(false);
    expect(requestedUrl).toContain("companyId=1");
    expect(requestedUrl).toContain("warehouseId=11");
    expect(requestedUrl).toContain("productCode=SKU-1");
    expect(requestedUrl).toContain("variantCode=BLUE-M");
  });

  it("preserves company scope for operation types and warehouse/date scope for the ledger", async () => {
    let operationUrl = "";
    await listOperationTypes({ companyId: 1, correlationId: "corr-10" }, async (input) => {
      operationUrl = String(input);
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    });
    expect(operationUrl).toContain("companyId=1");
    expect(operationUrl).toContain("correlationId=corr-10");

    let ledgerUrl = "";
    await getStockLedger({ companyId: 1, warehouseId: 11, fromDate: "2026-01-01", toDate: "2026-01-31", correlationId: "corr-11" }, async (input) => {
      ledgerUrl = String(input);
      return new Response(JSON.stringify({ lines: [] }), { status: 200 });
    });
    expect(ledgerUrl).toContain("warehouseId=11");
    expect(ledgerUrl).toContain("fromDate=2026-01-01");
    expect(ledgerUrl).toContain("toDate=2026-01-31");
  });

  it("keeps import preview separate and preserves its scoped payload", async () => {
    let received: RequestInit | undefined;
    const response = await previewStockImport({
      companyId: 1, branchId: 7, warehouseId: 11, headers: ["product_code", "quantity"],
      rows: [{ rowNumber: 1, productCode: "SKU-1", rawQuantity: "2" }], correlationId: "corr-import-preview",
    }, async (_input, init) => {
      received = init;
      return new Response(JSON.stringify({ accepted: true, headerErrors: [], rows: [], duplicateRows: 0, stagedUnits: 2 }), { status: 200 });
    });
    expect(response.accepted).toBe(true);
    expect(received?.method).toBe("POST");
    expect(received?.body).toContain('"warehouseId":11');
  });

  it("preserves the count session scope through the read gateway", async () => {
    let requestedUrl = "";
    const response = await getCount({ companyId: 1, warehouseId: 11, sessionId: "count-1", correlationId: "corr-count" }, async (input) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({ session: null }), { status: 200 });
    });
    expect(response.session).toBeNull();
    expect(requestedUrl).toContain("sessionId=count-1");
    expect(requestedUrl).toContain("warehouseId=11");
  });

  it("preserves branch scope for Putaway rules", async () => {
    let requestedUrl = "";
    await listPutawayRules({ companyId: 1, branchId: 7, correlationId: "corr-putaway" }, async (input) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    });
    expect(requestedUrl).toContain("companyId=1");
    expect(requestedUrl).toContain("branchId=7");
  });

  it("preserves company scope for routes and delivery methods", async () => {
    let routesUrl = "";
    let deliveryUrl = "";
    await listRoutes({ companyId: 1, correlationId: "corr-routes" }, async (input) => {
      routesUrl = String(input);
      return new Response(JSON.stringify({ routes: [], rules: [] }), { status: 200 });
    });
    await listDeliveryMethods({ companyId: 1, correlationId: "corr-delivery" }, async (input) => {
      deliveryUrl = String(input);
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    });
    expect(routesUrl).toContain("companyId=1");
    expect(deliveryUrl).toContain("activeOnly=true");
  });

  it("keeps branch balances scoped and preserves valuation masking", async () => {
    expect(() => assertBranchQuery({ companyId: 1, branchId: 0, correlationId: "corr-branch" })).toThrow("branchId");
    let availabilityUrl = "";
    await getBranchAvailability({ companyId: 1, branchId: 7, correlationId: "corr-branch-availability" }, async (input) => {
      availabilityUrl = String(input);
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    });
    expect(availabilityUrl).toContain("branchId=7");
    let valuationUrl = "";
    const valuation = await getBranchValuation({ companyId: 1, branchId: 7, productCode: "SKU-1", correlationId: "corr-branch-valuation" }, async (input) => {
      valuationUrl = String(input);
      return new Response(JSON.stringify({ items: [], financialsVisible: false }), { status: 200 });
    });
    expect(valuation.financialsVisible).toBe(false);
    expect(valuationUrl).toContain("productCode=SKU-1");
  });
});
