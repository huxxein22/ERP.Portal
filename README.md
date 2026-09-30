# ERP.Portal
Independent frontend boundary for Empire ERP domain portals.
## Inventory boundary
Inventory UI calls the authenticated gateway only. It does not import a database client, migration, or domain rule from `ERP.Inventory`.
All requests carry correlation IDs and preserve authorization denials as distinct UI states. Production routes remain unchanged until parity and rollback evidence is reviewed.
