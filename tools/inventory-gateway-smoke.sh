#!/usr/bin/env bash
set -euo pipefail

portal_port="${PORTAL_PORT:-13000}"
gateway_url="${INVENTORY_GATEWAY_URL:-http://127.0.0.1:18081}"
portal_url="http://127.0.0.1:${portal_port}"

PORT="$portal_port" INVENTORY_BASE_URL="$gateway_url" node server.mjs >/tmp/erp-portal-gateway-smoke.log 2>&1 &
portal_pid=$!
trap 'kill "$portal_pid" 2>/dev/null || true' EXIT

for _ in {1..30}; do
  if curl --silent --fail "$portal_url/health" >/dev/null; then break; fi
  sleep 0.2
done

health="$(curl --fail --silent --show-error "$portal_url/health")"
grep -q '"service":"ERP.Portal"' <<<"$health"
grep -q '"status":"ok"' <<<"$health"

backend_health="$(curl --fail --silent --show-error "$portal_url/inventory-backend/health")"
grep -q '"service":"ERP.Inventory.Gateway"' <<<"$backend_health"
grep -q '"status":"ok"' <<<"$backend_health"

status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  "$portal_url/api/inventory/branch-availability?companyId=1&branchId=7&correlationId=portal-gateway-smoke")"
if [[ "$status" != "401" ]]; then
  echo "Expected unauthenticated Portal-to-Gateway request to return 401, got $status." >&2
  cat /tmp/erp-portal-gateway-smoke.log >&2 || true
  exit 1
fi

warehouse_id="${INVENTORY_WAREHOUSE_ID:-192}"
forecast="$(curl --fail --silent --show-error \
  -H 'authorization: Bearer dev-inventory-token' \
  -H 'x-correlation-id: portal-forecast-real-smoke' \
  "$portal_url/api/inventory/forecast?companyId=1&branchId=7&warehouseId=${warehouse_id}&productCode=SKU-1&variantCode=BLUE-M&correlationId=portal-forecast-real-smoke")"
grep -Eq '"incoming"[[:space:]]*:[[:space:]]*6' <<<"$forecast"
grep -Eq '"outgoing"[[:space:]]*:[[:space:]]*4' <<<"$forecast"
grep -Eq '"forecasted"[[:space:]]*:[[:space:]]*10' <<<"$forecast"

echo "ERP.Portal to ERP.Inventory.Gateway smoke passed (health, authenticated forecast, and unauthenticated boundary)."
