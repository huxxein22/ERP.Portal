import { forwardInventoryAvailability as forwardRuntime } from "./inventoryProxy.mjs";

export type InventoryProxyRequest = {
  body: string;
  authorization?: string;
  correlationId: string;
};

export async function forwardInventoryAvailability(
  request: InventoryProxyRequest,
  gatewayBaseUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  return forwardRuntime(request, gatewayBaseUrl, fetcher);
}
