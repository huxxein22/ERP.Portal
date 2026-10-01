#!/usr/bin/env bash
set -euo pipefail

portal_url="${PORTAL_URL:-http://127.0.0.1:19090}"
inventory_token="${INVENTORY_SERVICE_TOKEN:-dev-inventory-token}"

health="$(curl --fail --silent --show-error "$portal_url/health")"
grep -q '"service":"ERP.Portal"' <<<"$health"
grep -q '"status":"ok"' <<<"$health"

import_page="$(curl --fail --silent --show-error "$portal_url/inventory/import")"
grep -q 'Apply reviewed import (Dev)' <<<"$import_page"
grep -q 'id="apply-import" type="button" disabled' <<<"$import_page"

http_code="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  "$portal_url/api/inventory/branch-availability?companyId=1&branchId=7&correlationId=portal-gateway-smoke")"
if [[ "$http_code" != "401" ]]; then
  echo "Expected unauthenticated Portal-to-Gateway request to return 401, got $http_code." >&2
  exit 1
fi

authorized_code="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  --header "authorization: Bearer $inventory_token" \
  "$portal_url/api/inventory/branch-availability?companyId=1&branchId=7&correlationId=portal-gateway-auth-smoke")"
if [[ "$authorized_code" != "200" ]]; then
  echo "Expected authenticated Portal-to-Gateway request to return 200, got $authorized_code." >&2
  exit 1
fi

echo "Portal-to-Gateway smoke passed (health, Import UI review gate, unauthenticated rejection, and authenticated forwarding)."
