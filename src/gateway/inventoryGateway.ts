import {
  assertScopedRequest,
  type InventoryAvailabilityRequest,
  type InventoryAvailabilityResponse,
  type InventoryGatewayError,
} from "../contracts/inventory/availability";
export async function getAvailability(request: InventoryAvailabilityRequest, fetcher: typeof fetch = fetch): Promise<InventoryAvailabilityResponse> {
  assertScopedRequest(request);
  const response = await fetcher("/api/inventory/availability", {
    method: "POST",
    headers: { "content-type": "application/json", "x-correlation-id": request.correlationId },
    body: JSON.stringify(request),
  });
  if (response.ok) return response.json() as Promise<InventoryAvailabilityResponse>;
  const kind: InventoryGatewayError["kind"] = response.status === 401 ? "unauthenticated" : response.status === 403 ? "permission-denied" : "transport";
  throw { kind, scope: request, message: `Inventory gateway returned ${response.status}` } satisfies InventoryGatewayError;
}
