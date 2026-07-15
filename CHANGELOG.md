# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — Initial Release

### Added
- **Authentication** — credential-based login via Auth.js (NextAuth v5) with hashed passwords and JWT sessions.
- **Role-based access control (RBAC)** — `SUPER_ADMIN` and `OFFICE_MANAGER` roles with office-scoped data access.
- **Shipment lifecycle management** — booking, status tracking (Booked → In Transit → Out for Delivery → Delivered/Cancelled/Returned), and per-shipment tracking event history across Road, Train, and Air modes.
- **Train manifest generation** with print-friendly output.
- **Customer management** — customer database with per-mode default rates, credit limits, and search/filter/pagination.
- **Customer ledger** — running-balance ledger reconciling shipments and payments.
- **Payments & expenses** — multi-mode payment recording and categorized expense tracking.
- **Analytics dashboard** — revenue trends, shipment volume trends, revenue by transport mode, office-wise revenue, top-5 customers by revenue, and profit/loss reporting.
- **Audit logs** — full audit trail of create/update/delete actions across critical entities.
- **CSV export** — available on ledger, payments, expenses, and reports views.
- **Responsive dashboard** — mobile-friendly layout with a dedicated mobile sidebar drawer.
- **Multi-office support** — office management with per-office data scoping.
- **Public pages** — marketing landing page and public shipment tracking lookup.

[1.0.0]: https://github.com/Ishita1609/BlueRoute/releases/tag/v1.0.0