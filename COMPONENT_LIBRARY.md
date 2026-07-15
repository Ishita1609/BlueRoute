# BlueRoute Logistics Component Library

Implementation of [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) as a standalone,
importable component library. **Nothing outside `src/components/ui/` and
`src/lib/chart-colors.ts` was touched** — no page, layout, route, or business
logic was modified. `tailwind.config.ts` received additive-only design
tokens (new keys: `ink`, `signal`, `status`, `surface`, `ds-*` radius/shadow) —
every existing key current pages use is untouched, so the running app is
visually identical to before this change.

Stack: shadcn/ui conventions on top of the Radix primitives + `class-variance-authority`
+ `tailwind-merge` already in `package.json` — no new dependencies were added.

**Status:** library only. Pages still use their original inline markup. Migrate
incrementally by importing from `@/components/ui/*`.

---

## Design tokens added

| Token group | Values | Tailwind classes |
|---|---|---|
| `ink` (neutral) | 50–950, cool gray | `bg-ink-50` … `text-ink-900` |
| `signal` (chart/info accent) | `DEFAULT` #2A78D6, `dark` #3987E5 | `bg-signal`, `text-signal` |
| `status` | `success` `warning` `serious` `critical` | `text-status-critical`, `bg-status-warning/10` |
| `surface` (dark-mode elevation) | `0` `1` `2` | `bg-surface-1` |
| radius | `ds-sm` 6px · `ds-md` 8px · `ds-lg` 10px · `ds-xl` 12px | `rounded-ds-lg` |
| shadow | `ds-xs` `ds-sm` `ds-md` `ds-lg` `ds-focus` | `shadow-ds-sm` |

`navy` and `gold` scales already existed in `tailwind.config.ts` and are reused as-is (§1.2/§1.4 of the design system).

Chart-specific tokens (categorical palette, sequential ramp, diverging pair, status colors, all validated against the app's actual light/dark surfaces) live in `src/lib/chart-colors.ts`, not in Tailwind config, since Recharts consumes them as raw hex via props rather than class names.

---

## Components

### Button — `button.tsx`

```tsx
import { Button } from "@/components/ui/button";

<Button>Save shipment</Button>
<Button variant="outline" size="sm">Filter</Button>
<Button variant="destructive" loading={isDeleting}>Delete</Button>
<Button asChild><Link href="/dashboard/shipments/new">New shipment</Link></Button>
```

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `primary \| secondary \| outline \| ghost \| destructive \| link` | `primary` | Only `primary` uses the navy fill — one per view (§6) |
| `size` | `sm \| md \| lg \| icon` | `md` | `md` = 36px, aligns with Input/Select height |
| `loading` | `boolean` | `false` | Shows spinner, disables the button, preserves width |
| `asChild` | `boolean` | `false` | Renders via Radix `Slot` (e.g. wrap a `next/link`) — cannot combine with `loading` content injection |
| ...rest | `ButtonHTMLAttributes` | — | Forwarded to `<button>` |

### Input — `input.tsx`

```tsx
<Input placeholder="Tracking number" error={!!errors.tracking} />
```
`error?: boolean` adds the red border/focus ring (§7). Height fixed at 36px (`h-9`).

### Textarea — `textarea.tsx`

Same API shape as Input (`error?: boolean`), `min-h-[80px]`.

### Select — `select.tsx`

Thin shadcn-style wrapper around `@radix-ui/react-select` (already a dependency).

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value={mode} onValueChange={setMode}>
  <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="ROAD">Road</SelectItem>
    <SelectItem value="TRAIN">Train</SelectItem>
    <SelectItem value="AIR">Air</SelectItem>
  </SelectContent>
</Select>
```

Exports: `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger` (`error?: boolean`), `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`.

### Badge — `badge.tsx`

```tsx
<Badge variant="success">Delivered</Badge>
<Badge variant="critical">Overdue</Badge>
<Badge variant="premium">Enterprise</Badge>
```

| Variant | Meaning |
|---|---|
| `neutral` (default) | No particular state |
| `info` | Informational, navy-tinted |
| `success` / `warning` / `serious` / `critical` | Fixed status tokens (§1.5) — shared with chart colors, domain mapping in DESIGN_SYSTEM.md §1.5 (shipment/payment/invoice status → tone) |
| `premium` | Gold accent — VIP/Enterprise tags only (§1.4), never interactive UI |
| `outline` | Bordered, no fill |

### Card — `card.tsx`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Recent shipments</CardTitle>
    <CardDescription>Last 7 days</CardDescription>
  </CardHeader>
  <CardDivider />
  <CardContent>…</CardContent>
  <CardFooter>Updated 2 min ago</CardFooter>
</Card>
```

Exports: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardDivider` (optional 1px rule when the header has actions), `CardContent`, `CardFooter`. Flat, bordered, no shadow by default (§9).

### Dialog — `dialog.tsx`

Low-level Radix Dialog wrapper (shadcn convention) for fully custom modal content — forms, multi-step flows, anything that doesn't fit the fixed title/description/footer shape.

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New expense</DialogTitle>
      <DialogDescription>Record a new office expense.</DialogDescription>
    </DialogHeader>
    {/* custom form */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

`DialogContent` accepts `hideClose?: boolean` to omit the built-in × button.

### Modal — `modal.tsx`

Higher-level component built **on top of** Dialog for the common case (title + description + body + footer), plus a ready-made `ConfirmModal` for delete/void/cancel-style confirmations.

```tsx
<Modal open={open} onOpenChange={setOpen} title="Edit customer" description="Update rate card.">
  {/* form fields */}
</Modal>

<ConfirmModal
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Delete shipment?"
  description="This cannot be undone."
  destructive
  loading={isDeleting}
  onConfirm={handleDelete}
/>
```

`ConfirmModal` props: `title`, `description?`, `confirmLabel="Confirm"`, `cancelLabel="Cancel"`, `destructive?: boolean`, `loading?: boolean`, `onConfirm: () => void`.

### Alert — `alert.tsx`

Inline banner, not a toast (the app's existing `toaster.tsx`/Radix Toast is untouched and still the right tool for transient notifications).

```tsx
<Alert variant="warning">
  <AlertTitle>Payment due soon</AlertTitle>
  <AlertDescription>3 invoices are due within 5 days.</AlertDescription>
</Alert>
```

`variant`: `info` (default) `success` `warning` `critical`. `icon?: boolean` (default `true`) to hide the leading status icon.

### Empty State — `empty-state.tsx`

```tsx
<EmptyState
  icon={PackageX}
  title="No shipments yet"
  description="Shipments you create will appear here."
  action={<Button asChild><Link href="/dashboard/shipments/new">New shipment</Link></Button>}
/>
```

Used automatically by `DataTable` when `data` is empty — pass `emptyIcon`/`emptyTitle`/`emptyDescription`/`emptyAction` through to it rather than composing `EmptyState` manually inside a table.

### Loading Skeleton — `skeleton.tsx`

```tsx
<Skeleton className="h-4 w-32" />
<TableSkeleton rows={5} columns={4} />
<StatsCardSkeleton />
```

`TableSkeleton`/`StatsCardSkeleton` match the exact shape of `DataTable`/`StatsCard` for standalone loading placeholders; `DataTable` and `StatsCard` also accept a `loading` prop directly and render these internally, so most call sites won't import `skeleton.tsx` at all.

### Stats Card — `stats-card.tsx`

```tsx
<StatsCard
  label="Revenue (MTD)"
  value={formatCurrency(482000)}
  icon={TrendingUp}
  trend={{ direction: "up", label: "12% vs last month" }}
/>
```

`trend.sentiment` defaults to `up = positive / down = negative`; override it for metrics where "up" is bad news (e.g. overdue invoices: `direction: "up", sentiment: "negative"`). Pass `loading` to render `StatsCardSkeleton` instead.

### Data Table — `table.tsx` + `data-table.tsx`

`table.tsx` exports the raw primitives (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`) for fully custom tables (e.g. the print-formatted Manifest/Ledger views, which should keep their bespoke markup).

`data-table.tsx` is the generic composed table for standard list views (Shipments, Customers, Payments, etc.):

```tsx
<DataTable
  columns={[
    { key: "trackingNumber", header: "Tracking #", cell: (r) => <span className="font-mono">{r.trackingNumber}</span> },
    { key: "customer", header: "Customer", cell: (r) => r.customer.name },
    { key: "amount", header: "Amount", numeric: true, cell: (r) => formatCurrency(r.amount) },
    { key: "status", header: "Status", cell: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge> },
  ]}
  data={shipments}
  getRowId={(r) => r.id}
  onRowClick={(r) => router.push(`/dashboard/shipments/${r.id}`)}
  loading={isLoading}
  emptyTitle="No shipments"
  emptyAction={<Button asChild><Link href="/dashboard/shipments/new">New shipment</Link></Button>}
  sortKey={sortKey}
  sortDir={sortDir}
  onSortChange={handleSort}
  footer={<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />}
/>
```

Deliberately **stateless** — sorting, filtering, and pagination state stay owned by the page (existing `*Client.tsx` state/`useState`/query params), so wiring a page to `DataTable` later is a pure presentation swap, not a logic rewrite. Row height is 44px per §8; numeric columns get `tabular-nums` automatically via `numeric: true`.

### Chart Card — `chart-card.tsx`

Wraps a Recharts chart in the standard Card chrome with title/description/legend.

```tsx
import { ChartCard, ChartLegendItem } from "@/components/ui/chart-card";
import { CHART_CATEGORICAL } from "@/lib/chart-colors";

<ChartCard
  title="Revenue by mode"
  description="Last 30 days"
  legend={
    <>
      <ChartLegendItem color={CHART_CATEGORICAL[0].light} label="Road" />
      <ChartLegendItem color={CHART_CATEGORICAL[1].light} label="Train" />
    </>
  }
>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <Bar dataKey="road" fill={CHART_CATEGORICAL[0].light} radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</ChartCard>
```

`src/lib/chart-colors.ts` exports `CHART_CATEGORICAL` (fixed 8-slot order — never cycle/reassign per filter), `CHART_SEQUENTIAL_BLUE`, `CHART_DIVERGING`, `CHART_STATUS` (shared with `Badge`), `CHART_CHROME` (gridline/axis/label colors), and a `chartColor(slot, mode)` helper. All validated with the dataviz-skill validator against this app's real surfaces (`#FFFFFF` light / `#0B1424` dark), not generic defaults.

### Sidebar — `sidebar.tsx`

Presentational primitives only — **not** wired into `src/components/layout/Sidebar.tsx`, which keeps its current nav list, active-route logic, and role-gating (`SUPER_ADMIN`/`OFFICE_MANAGER`) untouched.

```tsx
<SidebarShell collapsed={collapsed}>
  <SidebarHeader>{/* logo */}</SidebarHeader>
  <SidebarBody>
    <SidebarSection label="Operations" collapsed={collapsed}>
      <SidebarNavItem icon={Truck} active={pathname === "/dashboard/shipments"} collapsed={collapsed} asChild>
        <Link href="/dashboard/shipments">Shipments</Link>
      </SidebarNavItem>
    </SidebarSection>
  </SidebarBody>
  <SidebarFooter>{/* user menu */}</SidebarFooter>
</SidebarShell>
```

Active indicator is a `signal`-colored left bar (§10 — intentionally not gold, retiring the old `.sidebar-active` gold styling in `globals.css` for future migration). `SidebarNavItem` supports `asChild` the same way `Button` does, so it can wrap a `next/link` `<Link>`.

### Top Bar — `topbar.tsx`

```tsx
<TopBar>
  <TopBarBreadcrumb items={[{ label: "Dashboard" }, { label: "Shipments" }]} />
  <TopBarActions>
    <SearchBar value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} />
    <Button size="icon" variant="ghost"><Bell /></Button>
  </TopBarActions>
</TopBar>
```

Also exports `TopBarTitle` for a plain page-title header instead of a breadcrumb.

### Pagination — `pagination.tsx`

Fully controlled — see `DataTable` example above. `onPageSizeChange` is optional; omit it to hide the page-size `Select`.

### Search Bar — `search-bar.tsx`

```tsx
<SearchBar value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} loading={isSearching} />
```

Controlled `<input type="search">` with a leading search icon and a trailing clear button (shown when there's a value and `onClear` is provided) or a spinner when `loading`. No built-in debounce — pages keep owning that behavior (e.g. via their existing `useEffect`/`setTimeout` pattern) so this is a pure UI swap.

### Filter Bar — `filter-bar.tsx`

Layout shell for a filter toolbar row — not a filter *system*, since filter state/options are page-specific.

```tsx
<FilterBar>
  <SearchBar value={q} onChange={...} />
  <Select value={mode} onValueChange={setMode}>…</Select>
  <FilterBarActions>
    {activeCount > 0 && <FilterBarClearButton count={activeCount} onClick={clearAll} />}
  </FilterBarActions>
</FilterBar>

{activeFilters.map((f) => (
  <ActiveFilterChip key={f.key} label={f.label} onRemove={() => removeFilter(f.key)} />
))}
```

Exports: `FilterBar`, `FilterBarActions` (auto right-aligns via `ml-auto`), `ActiveFilterChip`, `FilterBarClearButton`.

---

## What's intentionally out of scope (this pass)

- No page (`src/app/**`), layout (`src/components/layout/*`), or `*Client.tsx` file was modified.
- No font wiring (Inter / JetBrains Mono per DESIGN_SYSTEM.md §2) — that requires editing `src/app/layout.tsx`, which is out of scope per the "no layouts" constraint. New components currently inherit whatever font the app shell already provides; `font-mono` (Tailwind's default monospace stack) is used for numeric/ID styling in the meantime as a close approximation.
- No dark mode toggle wiring — `surface-*`/`ink-*` dark values exist as documented tokens but nothing switches `.dark` at runtime yet.
- `globals.css` (`--secondary`/`--accent` still pointing at gold, `.sidebar-active` still gold-styled) is untouched — noted in `DESIGN_SYSTEM.md`'s appendix as a future migration step, not done here.

## Next step

Migrate pages incrementally: swap one page's inline buttons/inputs/tables for these components with zero logic changes, verify visually, repeat. `Shipments` or `Customers` (already using search + table + status badges) are natural first candidates.
