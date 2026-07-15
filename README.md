<div align="center">

# 🚚 BlueRoute Logistics ERP

**A full-stack logistics ERP built with Next.js, Prisma and PostgreSQL for multi-office freight operations.**

BlueRoute is a modern logistics ERP that centralizes shipment management, customer ledgers, financial reporting, and analytics for multi-office freight businesses.

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)

</div>

---

## Overview

**BlueRoute Logistics** is a full-stack enterprise logistics management platform designed to streamline the day-to-day operations of a multi-office freight business — shipment booking and tracking, customer relationship and ledger management, payments and expenses, delivery partner coordination, and financial analytics.

A super admin can see across the entire business, while an office manager works within the scope of their own office — with every entity properly scoped, audited, and reconciled between the two.

---

## 🚀 Live Demo

🌐 [https://blue-route-plum.vercel.app/](https://blue-route-plum.vercel.app/)

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@blueroute.in` | `admin@123` |
| Office Manager (Jaipur) | `jaipur@blueroute.in` | `manager@123` |
| Office Manager (Delhi) | `delhi@blueroute.in` | `manager@123` |

---

## Why BlueRoute?

Many regional logistics businesses still manage shipments and finances using spreadsheets and paper records.

BlueRoute consolidates shipment operations, customer management, financial reporting, and analytics into a single web-based ERP platform.

---

## Project Highlights

- Multi-office RBAC
- Shipment lifecycle tracking
- Audit logging
- Analytics dashboard
- Customer ledger
- Responsive UI
- PostgreSQL + Prisma

---

## Features

### 🔐 Authentication & Security
- Credential-based authentication via **Auth.js (NextAuth v5)** with hashed passwords (`bcryptjs`)
- **Role-based access control** — `SUPER_ADMIN` (cross-office visibility) vs. `OFFICE_MANAGER` (scoped to their own office)
- Server-side protected routes and API handlers — every dashboard route resolves the session before rendering
- Full **audit logging** of create/update/delete actions across critical entities

### 📦 Shipment Management
- End-to-end shipment lifecycle: `Booked → In Transit → Out for Delivery → Delivered / Cancelled / Returned`
- Support for three transport modes — **Road, Train, and Air**
- Auto-generated, unique tracking numbers on booking
- Per-shipment tracking event history with location and status timestamps
- Train manifest generation for daily consolidated freight, with print-friendly output

### 🧑‍💼 Customer Management
- Centralized customer database with per-mode default rates and credit limits
- Search, filter, and pagination across the customer list
- Per-customer running **ledger** with shipment and payment entries reconciled automatically

### 💰 Financial Management
- Payment recording across multiple modes (Cash, Bank Transfer, UPI, Cheque, Credit)
- Categorized expense tracking (fuel, salary, rent, train/air charges, loading/unloading, misc.)
- Running-balance ledger reports per customer
- **CSV export** for ledgers, payments, expenses, and reports

### 📊 Analytics & Reporting
- Revenue dashboard with daily/monthly trend charts
- Shipment volume trends over time
- **Revenue breakdown by transport mode** (Road / Train / Air)
- **Office-wise revenue** comparison for multi-branch visibility
- **Top-5 customers by revenue**
- Profit & loss view (revenue vs. expenses vs. margin)

### 🛠️ Administration
- Full **audit trail** viewer for compliance and accountability
- **Multi-office** support with office-level data scoping for managers
- Delivery partner directory and assignment
- Consistent pagination, search, and advanced filtering across all list views

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Components, Server Actions) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **UI** | [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/) primitives |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (hosted on [Neon](https://neon.tech/)) |
| **Auth** | [Auth.js (NextAuth v5)](https://authjs.dev/) — credentials provider + JWT sessions |
| **Charts** | [Recharts](https://recharts.org/) |
| **Exports** | ExcelJS, jsPDF |
| **Validation** | Zod |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## System Architecture

```mermaid
flowchart TD
    A[Browser] --> B["Next.js App Router"]
    B --> C["Route Handlers"]
    C --> D["Auth.js"]
    D --> E["Prisma ORM"]
    E --> F["PostgreSQL (Neon)"]
```

The frontend renders through the Next.js App Router using a mix of Server Components (for data-heavy dashboard pages) and Client Components (for interactive tables, forms, and charts). Mutations flow through typed Route Handlers, which resolve the Auth.js session and enforce role checks before calling into Prisma. Prisma talks to a single PostgreSQL database (Neon), with the schema, relations, and indexes defined in `prisma/schema.prisma`.

---

## Folder Structure

```
BlueRoute/
├── prisma/
│   ├── schema.prisma          # Data model: Users, Offices, Customers, Shipments,
│   │                          # Payments, Ledger, Expenses, Audit Logs, etc.
│   └── seed.ts                # Demo data + seeded login accounts
│
├── src/
│   ├── app/
│   │   ├── page.tsx           # Public landing page
│   │   ├── login/              # Staff login
│   │   ├── tracking/           # Public shipment tracker
│   │   ├── dashboard/          # Authenticated app (shipments, customers,
│   │   │                       # ledger, payments, expenses, reports, audit,
│   │   │                       # settings — one folder per module)
│   │   └── api/                # Next.js Route Handlers per resource
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable design-system primitives
│   │   │                       # (button, table, dialog, data-table, etc.)
│   │   ├── layout/              # Sidebar, TopBar, mobile navigation
│   │   └── <feature>/           # Feature-scoped client components
│   │                            # (shipments, customers, payments, reports, …)
│   │
│   ├── lib/                     # Prisma client, auth config, ledger logic,
│   │                             # filters, chart-color utilities
│   └── hooks/                   # Shared React hooks
│
└── docs/                        # Design system reference
```

---

## Application Preview

<table>
<tr>
<td width="50%" align="center">

**Landing Page**
<img src="docs/screenshots/landing.png" width="100%"/>
Public landing page with service overview and shipment tracking entry point.

</td>
<td width="50%" align="center">

**Dashboard**
<img src="docs/screenshots/dashboard.png" width="100%"/>
Role-scoped dashboard with revenue, shipment volume, and daily trend charts.

</td>
</tr>
<tr>
<td width="50%" align="center">

**Shipment Management**
<img src="docs/screenshots/shipments.png" width="100%"/>
Searchable, filterable shipment list spanning road, train, and air freight.

</td>
<td width="50%" align="center">

**Customer Management**
<img src="docs/screenshots/customers.png" width="100%"/>
Customer database with per-mode rates, credit limits, and ledger access.

</td>
</tr>
<tr>
<td width="50%" align="center">

**Reports & Analytics**
<img src="docs/screenshots/reports.png" width="100%"/>
Revenue by transport mode, top customers, and office-wise profit & loss.

</td>
<td width="50%" align="center">

**Public Shipment Tracking**
<img src="docs/screenshots/tracking.png" width="100%"/>
Public lookup page for live shipment status by tracking number.

</td>
</tr>
</table>


---

## Local Development

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local instance or a free [Neon](https://neon.tech/) project)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Ishita1609/BlueRoute.git
cd BlueRoute

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then edit .env with your own database URL and secret (see below)

# 4. Push the schema to your database
npm run db:push

# 5. Seed demo data (offices, customers, shipments, login accounts)
npm run db:seed

# 6. Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Other useful scripts

```bash
npm run build       # Production build
npm run start        # Production server
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run lint          # Run ESLint
```

---

## Environment Variables

Create a `.env` file at the project root (see `.env.example`). **Never commit real secrets.**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `DIRECT_URL` | Direct (non-pooled) PostgreSQL connection string — required by Prisma when using a pooled provider like Neon |
| `NEXTAUTH_SECRET` | Random secret used to sign session tokens — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app, e.g. `http://localhost:3000` in development |

---

## Deployment

BlueRoute is designed to deploy on **Vercel** with **Neon** as the managed PostgreSQL provider:

1. Push the repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Create a [Neon](https://neon.tech/) PostgreSQL database and copy its pooled and direct connection strings.
4. Set `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (your production domain) in the Vercel project's environment variables.
5. Deploy — the `build` script runs `prisma generate` automatically before `next build`.
6. Run `npm run db:push` and `npm run db:seed` (locally, pointed at the production `DATABASE_URL`) once to initialize the schema and demo data.

---

## Future Improvements

- [ ] PDF invoice generation for shipments and ledgers
- [ ] File uploads (proof of delivery, signed documents)
- [ ] Email notifications for shipment status changes
- [ ] Redis caching for dashboard aggregates
- [ ] AI-powered shipment volume forecasting and anomaly detection
- [ ] Real-time shipment status updates (WebSockets / Server-Sent Events)

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.
