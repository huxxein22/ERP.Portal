#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

scan_paths=()
for path in src server client tools; do
  [[ -d "$path" ]] && scan_paths+=("$path")
done

if (( ${#scan_paths[@]} == 0 )); then
  echo "Portal source directories were not found." >&2
  exit 1
fi

if rg -n -i \
  'Npgsql|GrpcChannel|Grpc\.Net\.Client|postgres(ql)?://|DATABASE_URL|connectionstring|connection_string' \
  "${scan_paths[@]}" \
  --glob '*.js' --glob '*.mjs' --glob '*.ts' --glob '*.tsx' --glob '*.json' \
  --glob '!**/node_modules/**'; then
  echo "Portal boundary violation: direct database or private gRPC access was found." >&2
  exit 1
fi

echo "ERP.Portal Inventory boundary check passed: Gateway-only integration."
