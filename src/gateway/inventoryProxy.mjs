export async function forwardInventoryAvailability(request, gatewayBaseUrl, fetcher = fetch) {
  if (!gatewayBaseUrl.trim()) throw new Error('Inventory gateway is not configured');

  const headers = {
    'content-type': 'application/json',
    'x-correlation-id': request.correlationId,
  };
  if (request.authorization) headers.authorization = request.authorization;

  return fetcher(`${gatewayBaseUrl.replace(/\/$/, '')}/api/inventory/availability`, {
    method: 'POST',
    headers,
    body: request.body,
  });
}

export async function forwardInventoryWrite(path, request, gatewayBaseUrl, fetcher = fetch) {
  if (!gatewayBaseUrl.trim()) throw new Error('Inventory gateway is not configured');
  const headers = { 'content-type': 'application/json', 'x-correlation-id': request.correlationId };
  if (request.authorization) headers.authorization = request.authorization;
  return fetcher(`${gatewayBaseUrl.replace(/\/$/, '')}${path}`, {
    method: 'POST', headers, body: request.body,
  });
}

export async function forwardInventoryRead(path, search, request, gatewayBaseUrl, fetcher = fetch) {
  if (!gatewayBaseUrl.trim()) throw new Error('Inventory gateway is not configured');
  const headers = { 'x-correlation-id': request.correlationId };
  if (request.authorization) headers.authorization = request.authorization;
  return fetcher(`${gatewayBaseUrl.replace(/\/$/, '')}${path}${search}`, { headers });
}
