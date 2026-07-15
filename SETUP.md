# BlueRoute Logistics — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)

## 1. Configure Database

Edit the `.env` file in C:\Cargo:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/blueroute"
NEXTAUTH_SECRET="any-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

## 2. Create the PostgreSQL Database

In pgAdmin or psql:
```sql
CREATE DATABASE blueroute;
```

## 3. Push Schema & Seed

```bash
npm run db:push     # Creates all tables
npm run db:seed     # Adds demo data + users
```

## 4. Run the App

```bash
npm run dev         # Development (http://localhost:3000)
npm run build       # Production build
npm run start       # Production server
```

## Login Credentials (after seeding)

| Role          | Email                    | Password     |
|---------------|--------------------------|--------------|
| Super Admin   | admin@blueroute.in       | admin@123    |
| Jaipur Manager| jaipur@blueroute.in      | manager@123  |
| Delhi Manager | delhi@blueroute.in       | manager@123  |

## Add a New Office Manager (in Settings > Users)
1. Log in as Super Admin
2. Go to Settings → Users tab
3. Click "Add User", fill in name/email/password, select Office Manager role + office

## Pages & Features

| Page | URL | Description |
|------|-----|-------------|
| Website | / | Public landing page |
| Track | /tracking | Public shipment tracker |
| Login | /login | Staff login |
| Dashboard | /dashboard | Stats + charts |
| Shipments | /dashboard/shipments | All shipments with search/filter |
| New Shipment | /dashboard/shipments/new | Create shipment (auto-generates tracking #) |
| Train Manifest | /dashboard/manifest | Daily printable manifest |
| Customers | /dashboard/customers | Customer list + rates |
| Ledger | /dashboard/ledger | Customer account ledger |
| Payments | /dashboard/payments | Record & view payments |
| Expenses | /dashboard/expenses | All expense categories |
| Tracking | /dashboard/tracking | Internal tracking lookup |
| Delivery Partners | /dashboard/delivery-partners | Manage delivery staff |
| Reports & P&L | /dashboard/reports | Profit/Loss + charts |
| Audit Logs | /dashboard/audit | Full audit trail |
| Settings | /dashboard/settings | Manage offices & users |

## Database Management

```bash
npm run db:studio   # Open Prisma Studio (visual DB editor)
```

## Common Tasks

### Change customer rates
Go to Customers → click customer → Edit button (or update directly in Prisma Studio)

### Add a new city/office
Settings → Offices tab → Add Office

### Export data
- Ledger: has CSV export button
- Reports: has CSV export button  
- Shipments: use browser print or Ctrl+P for print-friendly view

### Print Train Manifest
Go to Train Manifest → select date → click Print button (uses browser print with proper formatting)
