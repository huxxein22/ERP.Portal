# ERP.Portal
Independent frontend boundary for Empire ERP domain portals.
## Inventory boundary
Inventory UI calls the authenticated gateway only. It does not import a database client, migration, or domain rule from `ERP.Inventory`.
All requests carry correlation IDs and preserve authorization denials as distinct UI states. Production routes remain unchanged until parity and rollback evidence is reviewed.

Set `INVENTORY_BASE_URL` to the authenticated HTTP Gateway endpoint (for
example `ERP.Inventory.Gateway`), never directly to the Inventory gRPC
service. The Gateway forwards the caller token and correlation ID to private
gRPC and is the only backend boundary used by the Portal.
