"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Bell,
  LayoutDashboard,
  Package,
  PackageX,
  Plus,
  Receipt,
  Settings,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

import { formatCurrency, formatDate } from "@/lib/utils";
import { CHART_CATEGORICAL, CHART_CHROME } from "@/lib/chart-colors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardDivider,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Modal, ConfirmModal } from "@/components/ui/modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, StatsCardSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ChartCard, ChartLegendItem } from "@/components/ui/chart-card";
import {
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarNavItem,
  SidebarSection,
  SidebarShell,
} from "@/components/ui/sidebar";
import { TopBar, TopBarActions, TopBarBreadcrumb, TopBarTitle } from "@/components/ui/topbar";
import { Pagination } from "@/components/ui/pagination";
import { SearchBar } from "@/components/ui/search-bar";
import {
  ActiveFilterChip,
  FilterBar,
  FilterBarActions,
  FilterBarClearButton,
} from "@/components/ui/filter-bar";

// ---------------------------------------------------------------------------
// Local gallery scaffolding (page-only — not part of the component library)
// ---------------------------------------------------------------------------

const SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "inputs", label: "Inputs" },
  { id: "badges", label: "Badges" },
  { id: "alerts", label: "Alerts" },
  { id: "cards", label: "Cards" },
  { id: "tables", label: "Tables" },
  { id: "dialogs", label: "Dialogs" },
  { id: "search", label: "Search" },
  { id: "navigation", label: "Navigation" },
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-1 border-b border-ink-200 pb-4">
        <h2 className="text-[24px] font-semibold leading-[32px] text-ink-900">{title}</h2>
        {description && <p className="text-sm text-ink-500">{description}</p>}
      </div>
      <div className="flex flex-col gap-8">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[16px] font-semibold leading-[24px] text-ink-800">{title}</h3>
      {children}
    </div>
  );
}

function ColorSwatch({
  label,
  hex,
  dark = false,
  className,
}: {
  label: string;
  hex: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        className="flex h-16 items-end rounded-ds-md border border-black/5 p-2"
        style={{ backgroundColor: hex }}
      >
        <span className={cnLocal("text-xs font-mono", dark ? "text-white/90" : "text-ink-900/80")}>
          {label}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-ink-500">{hex.toUpperCase()}</p>
    </div>
  );
}

// Tiny local class-join helper so this page doesn't need to pull in `cn` for
// the two spots that branch a class name — avoids implying it's part of the library.
function cnLocal(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Sample data (gallery fixtures only — not connected to the real app/API)
// ---------------------------------------------------------------------------

const INK_SWATCHES = [
  { step: 50, hex: "#F8FAFC", dark: false },
  { step: 100, hex: "#F1F5F9", dark: false },
  { step: 200, hex: "#E2E8F0", dark: false },
  { step: 300, hex: "#CBD5E1", dark: false },
  { step: 400, hex: "#94A3B8", dark: false },
  { step: 500, hex: "#64748B", dark: true },
  { step: 600, hex: "#475569", dark: true },
  { step: 700, hex: "#334155", dark: true },
  { step: 800, hex: "#1E293B", dark: true },
  { step: 900, hex: "#0F172A", dark: true },
  { step: 950, hex: "#020617", dark: true },
];

const NAVY_SWATCHES = [
  { step: 50, hex: "#E8EDF5", dark: false },
  { step: 100, hex: "#C5D1E8", dark: false },
  { step: 200, hex: "#9FB2D8", dark: false },
  { step: 300, hex: "#7893C8", dark: false },
  { step: 400, hex: "#5A7ABD", dark: false },
  { step: 500, hex: "#1E3A5F", dark: true },
  { step: 600, hex: "#1A3356", dark: true },
  { step: 700, hex: "#152B4C", dark: true },
  { step: 800, hex: "#102340", dark: true },
  { step: 900, hex: "#091830", dark: true },
];

const SIGNAL_SWATCHES = [
  { label: "Light", hex: "#2A78D6", dark: true },
  { label: "Dark", hex: "#3987E5", dark: true },
];

const STATUS_SWATCHES = [
  { label: "Success", hex: "#0CA30C", dark: true },
  { label: "Warning", hex: "#B8790E", dark: true },
  { label: "Serious", hex: "#C24F1E", dark: true },
  { label: "Critical", hex: "#D03B3B", dark: true },
];

const SURFACE_SWATCHES = [
  { label: "Surface 0", hex: "#05070C", dark: true },
  { label: "Surface 1", hex: "#0B1424", dark: true },
  { label: "Surface 2", hex: "#121D33", dark: true },
];

const TYPE_SCALE = [
  { token: "text-xs", size: "12px", lh: "16px", weight: "font-normal", spec: "12 / 16 · 400–500" },
  { token: "text-sm", size: "13px", lh: "20px", weight: "font-normal", spec: "13 / 20 · 400–500" },
  { token: "text-base", size: "14px", lh: "20px", weight: "font-normal", spec: "14 / 20 · 400 (default body)" },
  { token: "text-md", size: "16px", lh: "24px", weight: "font-medium", spec: "16 / 24 · 400–500" },
  { token: "text-lg", size: "18px", lh: "26px", weight: "font-semibold", spec: "18 / 26 · 600" },
  { token: "text-xl", size: "20px", lh: "28px", weight: "font-semibold", spec: "20 / 28 · 600" },
  { token: "text-2xl", size: "24px", lh: "32px", weight: "font-semibold", spec: "24 / 32 · 600" },
  { token: "text-3xl", size: "30px", lh: "38px", weight: "font-semibold", spec: "30 / 38 · 600–700" },
  { token: "text-4xl", size: "36px", lh: "44px", weight: "font-bold", spec: "36 / 44 · 700" },
];

interface DemoShipment {
  id: string;
  tracking: string;
  customer: string;
  mode: "Road" | "Train" | "Air";
  amount: number;
  status: "Delivered" | "In Transit" | "Delayed" | "Exception";
  date: string;
}

const SAMPLE_SHIPMENTS: DemoShipment[] = [
  { id: "1", tracking: "CL-2026-04213", customer: "Sharma Textiles", mode: "Road", amount: 18400, status: "Delivered", date: "2026-06-28" },
  { id: "2", tracking: "CL-2026-04214", customer: "Agarwal Traders", mode: "Train", amount: 42200, status: "In Transit", date: "2026-06-29" },
  { id: "3", tracking: "CL-2026-04215", customer: "Kanpur Steel Co.", mode: "Road", amount: 9800, status: "Delayed", date: "2026-06-30" },
  { id: "4", tracking: "CL-2026-04216", customer: "Lucknow Foods Pvt Ltd", mode: "Air", amount: 61200, status: "Exception", date: "2026-07-01" },
  { id: "5", tracking: "CL-2026-04217", customer: "Sharma Textiles", mode: "Train", amount: 27650, status: "Delivered", date: "2026-07-01" },
  { id: "6", tracking: "CL-2026-04218", customer: "Verma Electronics", mode: "Road", amount: 15300, status: "In Transit", date: "2026-07-02" },
  { id: "7", tracking: "CL-2026-04219", customer: "Agarwal Traders", mode: "Air", amount: 38900, status: "Delivered", date: "2026-07-02" },
  { id: "8", tracking: "CL-2026-04220", customer: "Kanpur Steel Co.", mode: "Road", amount: 12100, status: "Delayed", date: "2026-07-03" },
];

function statusVariant(status: DemoShipment["status"]): BadgeProps["variant"] {
  switch (status) {
    case "Delivered":
      return "success";
    case "In Transit":
      return "info";
    case "Delayed":
      return "warning";
    case "Exception":
      return "critical";
  }
}

const REVENUE_BY_MODE = [
  { month: "Feb", road: 210000, train: 140000, air: 60000 },
  { month: "Mar", road: 245000, train: 158000, air: 72000 },
  { month: "Apr", road: 228000, train: 172000, air: 65000 },
  { month: "May", road: 262000, train: 181000, air: 84000 },
  { month: "Jun", road: 251000, train: 196000, air: 91000 },
];

// ---------------------------------------------------------------------------

export function DesignSystemShowcase() {
  const [selectValue, setSelectValue] = useState("road");
  const [dataTablePage, setDataTablePage] = useState(1);
  const [dataTablePageSize, setDataTablePageSize] = useState(5);
  const [sortKey, setSortKey] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [standalonePage, setStandalonePage] = useState(3);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [activeFilters, setActiveFilters] = useState([
    { key: "status", label: "Status: Delayed" },
    { key: "office", label: "Office: Jaipur" },
  ]);

  const sortedShipments = useMemo(() => {
    const arr = [...SAMPLE_SHIPMENTS];
    arr.sort((a, b) => {
      const av = a[sortKey as keyof DemoShipment];
      const bv = b[sortKey as keyof DemoShipment];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [sortKey, sortDir]);

  const pagedShipments = sortedShipments.slice(
    (dataTablePage - 1) * dataTablePageSize,
    dataTablePage * dataTablePageSize
  );

  function handleSortChange(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const shipmentColumns: DataTableColumn<DemoShipment>[] = [
    {
      key: "tracking",
      header: "Tracking #",
      sortable: true,
      cell: (r) => <span className="font-mono text-ink-700">{r.tracking}</span>,
    },
    { key: "customer", header: "Customer", sortable: true, cell: (r) => r.customer },
    { key: "mode", header: "Mode", cell: (r) => r.mode },
    { key: "date", header: "Date", sortable: true, cell: (r) => formatDate(r.date) },
    {
      key: "amount",
      header: "Amount",
      numeric: true,
      sortable: true,
      cell: (r) => formatCurrency(r.amount),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge variant={statusVariant(r.status)}>{r.status}</Badge>,
    },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      <TopBar className="sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" aria-label="Back to dashboard">
            <Link href="/dashboard">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <TopBarTitle>BlueRoute Logistics Design System</TopBarTitle>
            <TopBarBreadcrumb items={[{ label: "Internal" }, { label: "Component Gallery" }]} />
          </div>
        </div>
        <TopBarActions>
          <Badge variant="warning">Dev Only</Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">Exit gallery</Link>
          </Button>
        </TopBarActions>
      </TopBar>

      <div className="mx-auto flex max-w-[1400px] gap-8 px-6 py-8 lg:px-10">
        {/* In-page section nav */}
        <nav className="sticky top-24 hidden h-fit w-44 shrink-0 flex-col gap-0.5 lg:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-ds-md px-3 py-1.5 text-sm text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <main className="flex min-w-0 flex-1 flex-col gap-16">
          <div>
            <p className="text-sm font-medium text-navy-600">Connecting Businesses. Delivering Trust.</p>
            <p className="mt-1 max-w-2xl text-sm text-ink-500">
              Every component in <span className="font-mono text-ink-700">src/components/ui</span> rendered
              with its variants, sizes, and states — implementing{" "}
              <span className="font-mono text-ink-700">DESIGN_SYSTEM.md</span>. Nothing on this page is wired
              to the real application.
            </p>
          </div>

          {/* SECTION 1 — Colors */}
          <Section id="colors" title="Colors" description="Design tokens added in tailwind.config.ts — additive only.">
            <SubSection title="Ink palette (neutral)">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11">
                {INK_SWATCHES.map((s) => (
                  <ColorSwatch key={s.step} label={String(s.step)} hex={s.hex} dark={s.dark} />
                ))}
              </div>
            </SubSection>
            <SubSection title="Navy palette (brand / interactive)">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10">
                {NAVY_SWATCHES.map((s) => (
                  <ColorSwatch key={s.step} label={String(s.step)} hex={s.hex} dark={s.dark} />
                ))}
              </div>
            </SubSection>
            <SubSection title="Signal Blue (chart / informational accent)">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SIGNAL_SWATCHES.map((s) => (
                  <ColorSwatch key={s.label} label={s.label} hex={s.hex} dark={s.dark} />
                ))}
              </div>
            </SubSection>
            <SubSection title="Status colors">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STATUS_SWATCHES.map((s) => (
                  <ColorSwatch key={s.label} label={s.label} hex={s.hex} dark={s.dark} />
                ))}
              </div>
            </SubSection>
            <SubSection title="Surface colors (dark-mode elevation ladder)">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SURFACE_SWATCHES.map((s) => (
                  <ColorSwatch key={s.label} label={s.label} hex={s.hex} dark={s.dark} />
                ))}
              </div>
            </SubSection>
          </Section>

          {/* SECTION 2 — Typography */}
          <Section id="typography" title="Typography" description="Inter (UI) + monospace for identifiers and tabular figures.">
            <SubSection title="Every heading / type scale step">
              <Card>
                <CardContent className="flex flex-col gap-4 pt-6">
                  {TYPE_SCALE.map((t) => (
                    <div key={t.token} className="flex items-baseline gap-4 border-b border-ink-100 pb-3 last:border-0 last:pb-0">
                      <span className="w-24 shrink-0 font-mono text-xs text-ink-400">{t.token}</span>
                      <span
                        className={cnLocal("text-ink-900", t.weight)}
                        style={{ fontSize: t.size, lineHeight: t.lh }}
                      >
                        BlueRoute Logistics
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-xs text-ink-400">{t.spec}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </SubSection>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SubSection title="Body text">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-[14px] leading-[20px] text-ink-800">
                      BlueRoute Logistics coordinates road, train, and air freight across Jaipur, Delhi,
                      Lucknow, and Kanpur. Office managers reconcile shipments and payments against a
                      shared ledger every day — this text style is the default for that work.
                    </p>
                  </CardContent>
                </Card>
              </SubSection>
              <SubSection title="Caption">
                <Card>
                  <CardContent className="flex flex-col gap-1.5 pt-6">
                    <p className="text-[12px] text-ink-500">Last updated 2 minutes ago</p>
                    <p className="text-[12px] text-ink-500">Table meta, badge text, and timestamps use this style</p>
                  </CardContent>
                </Card>
              </SubSection>
            </div>
            <SubSection title="Monospace (identifiers &amp; tabular figures)">
              <Card>
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-500">Tracking number</span>
                    <span className="font-mono text-sm text-ink-800">CL-2026-04213</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                    <span className="text-sm text-ink-500">Invoice #</span>
                    <span className="font-mono text-sm text-ink-800">INV-00931</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                    <span className="text-sm text-ink-500">Amount (tabular-nums, right-aligned)</span>
                    <span className="font-mono text-sm tabular-nums text-ink-800">₹ 42,200.00</span>
                  </div>
                </CardContent>
              </Card>
            </SubSection>
          </Section>

          {/* SECTION 3 — Buttons */}
          <Section id="buttons" title="Buttons">
            <SubSection title="Variants">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </SubSection>
            <SubSection title="Sizes">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Add">
                  <Plus />
                </Button>
              </div>
            </SubSection>
            <SubSection title="Loading state">
              <div className="flex flex-wrap items-center gap-3">
                <Button loading>Saving…</Button>
                <Button variant="outline" loading>
                  Processing
                </Button>
              </div>
            </SubSection>
            <SubSection title="Disabled state">
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>
                  Disabled
                </Button>
              </div>
            </SubSection>
          </Section>

          {/* SECTION 4 — Inputs */}
          <Section id="inputs" title="Inputs">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <SubSection title="Input">
                <label className="text-sm font-medium text-ink-700">Tracking number</label>
                <Input placeholder="CL-2026-04213" />
              </SubSection>
              <SubSection title="Select">
                <label className="text-sm font-medium text-ink-700">Freight mode</label>
                <Select value={selectValue} onValueChange={setSelectValue}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="road">Road</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="air">Air</SelectItem>
                  </SelectContent>
                </Select>
              </SubSection>
              <SubSection title="Textarea">
                <label className="text-sm font-medium text-ink-700">Delivery note</label>
                <Textarea placeholder="Leave at the front office…" rows={3} />
              </SubSection>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <SubSection title="Error state">
                <div className="flex flex-col gap-1.5">
                  <Input error placeholder="Tracking number" />
                  <p className="text-xs text-status-critical">Tracking number is required.</p>
                </div>
              </SubSection>
              <SubSection title="Error state (Select)">
                <div className="flex flex-col gap-1.5">
                  <Select>
                    <SelectTrigger error>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-status-critical">Status is required.</p>
                </div>
              </SubSection>
              <SubSection title="Disabled state">
                <div className="flex flex-col gap-3">
                  <Input disabled placeholder="Not editable" />
                  <Select disabled defaultValue="road">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">Road</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea disabled defaultValue="Locked note text" rows={2} />
                </div>
              </SubSection>
            </div>
          </Section>

          {/* SECTION 5 — Badges */}
          <Section id="badges" title="Badges" description="Status tokens are shared 1:1 with chart colors (chart-colors.ts).">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">Draft</Badge>
              <Badge variant="info">Booked</Badge>
              <Badge variant="success">Delivered</Badge>
              <Badge variant="warning">Delayed</Badge>
              <Badge variant="serious">At Risk</Badge>
              <Badge variant="critical">Overdue</Badge>
              <Badge variant="premium">Enterprise</Badge>
              <Badge variant="outline">Archived</Badge>
            </div>
          </Section>

          {/* SECTION 6 — Alerts */}
          <Section id="alerts" title="Alerts">
            <div className="flex flex-col gap-4">
              <Alert variant="info">
                <AlertTitle>Scheduled maintenance</AlertTitle>
                <AlertDescription>Tracking lookups may be slow between 1–2 AM IST tonight.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <AlertTitle>Payment reconciled</AlertTitle>
                <AlertDescription>Invoice INV-00931 has been matched to the incoming NEFT.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTitle>Payment due soon</AlertTitle>
                <AlertDescription>3 invoices are due within 5 days across 2 offices.</AlertDescription>
              </Alert>
              <Alert variant="critical">
                <AlertTitle>Delivery exception</AlertTitle>
                <AlertDescription>CL-2026-04216 could not be delivered — recipient unreachable.</AlertDescription>
              </Alert>
            </div>
          </Section>

          {/* SECTION 7 — Cards */}
          <Section id="cards" title="Cards">
            <SubSection title="Card">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>Jaipur Office</CardTitle>
                  <CardDescription>Primary hub · Road &amp; Train dispatch</CardDescription>
                </CardHeader>
                <CardDivider />
                <CardContent>
                  <p className="text-sm text-ink-600">
                    12 active shipments · 3 pending payments · Manager: R. Sharma
                  </p>
                </CardContent>
                <CardFooter>Updated 2 minutes ago</CardFooter>
              </Card>
            </SubSection>

            <SubSection title="Stats Card">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  label="Revenue (MTD)"
                  value={formatCurrency(482000)}
                  icon={Wallet}
                  trend={{ direction: "up", label: "12% vs last month" }}
                />
                <StatsCard
                  label="Expenses (MTD)"
                  value={formatCurrency(198500)}
                  icon={Receipt}
                  trend={{ direction: "up", label: "6% vs last month", sentiment: "negative" }}
                />
                <StatsCard
                  label="On-time delivery"
                  value="94.2%"
                  icon={Truck}
                  trend={{ direction: "down", label: "1.1pt vs last month", sentiment: "negative" }}
                />
                <StatsCard label="Loading…" value="" loading />
              </div>
            </SubSection>

            <SubSection title="Chart Card">
              <ChartCard
                title="Revenue by mode"
                description="Last 5 months"
                height={280}
                legend={
                  <>
                    <ChartLegendItem color={CHART_CATEGORICAL[0].light} label="Road" />
                    <ChartLegendItem color={CHART_CATEGORICAL[1].light} label="Train" />
                    <ChartLegendItem color={CHART_CATEGORICAL[2].light} label="Air" />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVENUE_BY_MODE}>
                    <CartesianGrid vertical={false} stroke={CHART_CHROME.gridline.light} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      stroke={CHART_CHROME.label.light}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={12}
                      width={48}
                      stroke={CHART_CHROME.label.light}
                      tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="road" fill={CHART_CATEGORICAL[0].light} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="train" fill={CHART_CATEGORICAL[1].light} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="air" fill={CHART_CATEGORICAL[2].light} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </SubSection>
          </Section>

          {/* SECTION 8 — Tables */}
          <Section id="tables" title="Tables">
            <SubSection title="Normal table (raw primitives)">
              <div className="overflow-hidden rounded-ds-lg border border-ink-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead align="right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{formatDate("2026-07-01")}</TableCell>
                      <TableCell className="font-mono">PMT-88213</TableCell>
                      <TableCell>UPI</TableCell>
                      <TableCell numeric align="right">{formatCurrency(18400)}</TableCell>
                    </TableRow>
                    <TableRow selected>
                      <TableCell>{formatDate("2026-07-02")}</TableCell>
                      <TableCell className="font-mono">PMT-88214</TableCell>
                      <TableCell>NEFT</TableCell>
                      <TableCell numeric align="right">{formatCurrency(42200)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{formatDate("2026-07-02")}</TableCell>
                      <TableCell className="font-mono">PMT-88215</TableCell>
                      <TableCell>Cash</TableCell>
                      <TableCell numeric align="right">{formatCurrency(9800)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-ink-500">Middle row shown in the selected-row state.</p>
            </SubSection>

            <SubSection title="DataTable (sortable, paginated)">
              <DataTable
                columns={shipmentColumns}
                data={pagedShipments}
                getRowId={(r) => r.id}
                sortKey={sortKey}
                sortDir={sortDir}
                onSortChange={handleSortChange}
                footer={
                  <Pagination
                    page={dataTablePage}
                    pageSize={dataTablePageSize}
                    total={sortedShipments.length}
                    onPageChange={setDataTablePage}
                    onPageSizeChange={(size) => {
                      setDataTablePageSize(size);
                      setDataTablePage(1);
                    }}
                    pageSizeOptions={[5, 10, 25]}
                  />
                }
              />
            </SubSection>

            <SubSection title="Pagination (standalone)">
              <Pagination page={standalonePage} pageSize={10} total={237} onPageChange={setStandalonePage} />
            </SubSection>

            <SubSection title="Loading skeleton">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                  </div>
                </div>
                <div className="overflow-hidden rounded-ds-lg border border-ink-200 bg-white">
                  <TableSkeleton rows={4} columns={4} />
                </div>
              </div>
              <DataTable columns={shipmentColumns} data={[]} getRowId={(r) => r.id} loading skeletonRows={3} />
            </SubSection>

            <SubSection title="Empty state">
              <div className="overflow-hidden rounded-ds-lg border border-ink-200 bg-white">
                <EmptyState
                  icon={PackageX}
                  title="No expenses recorded"
                  description="Expenses logged for this office will appear here."
                  action={<Button size="sm">Add expense</Button>}
                />
              </div>
              <DataTable
                columns={shipmentColumns}
                data={[]}
                getRowId={(r) => r.id}
                emptyIcon={Package}
                emptyTitle="No shipments match these filters"
                emptyDescription="Try adjusting the date range or clearing filters."
                emptyAction={
                  <Button variant="outline" size="sm">
                    Clear filters
                  </Button>
                }
              />
            </SubSection>
          </Section>

          {/* SECTION 9 — Dialogs */}
          <Section id="dialogs" title="Dialogs">
            <div className="flex flex-wrap items-center gap-3">
              <SubSection title="Dialog">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add customer note</DialogTitle>
                      <DialogDescription>Visible to office managers on this account.</DialogDescription>
                    </DialogHeader>
                    <Textarea placeholder="Note…" rows={4} />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button>Save note</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SubSection>

              <SubSection title="Modal">
                <Button variant="outline" onClick={() => setModalOpen(true)}>
                  Open Modal
                </Button>
                <Modal
                  open={modalOpen}
                  onOpenChange={setModalOpen}
                  title="Update shipment status"
                  description="Change status for CL-2026-04213."
                  footer={
                    <>
                      <Button variant="outline" onClick={() => setModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setModalOpen(false)}>Update</Button>
                    </>
                  }
                >
                  <Select defaultValue="in_transit">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </Modal>
              </SubSection>

              <SubSection title="Modal (destructive confirm)">
                <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                  Delete shipment
                </Button>
                <ConfirmModal
                  open={confirmOpen}
                  onOpenChange={setConfirmOpen}
                  title="Delete shipment?"
                  description="This will permanently remove CL-2026-04213. This cannot be undone."
                  destructive
                  confirmLabel="Delete"
                  onConfirm={() => setConfirmOpen(false)}
                />
              </SubSection>
            </div>
          </Section>

          {/* SECTION 10 — Search */}
          <Section id="search" title="Search">
            <SubSection title="Search Bar">
              <div className="flex max-w-md flex-col gap-3">
                <SearchBar
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue("")}
                  placeholder="Search shipments, customers…"
                />
                <SearchBar value="Mumbai" onChange={() => {}} loading placeholder="Loading state" />
              </div>
            </SubSection>

            <SubSection title="Filter Bar">
              <div className="flex flex-col gap-3">
                <FilterBar>
                  <SearchBar
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onClear={() => setSearchValue("")}
                    containerClassName="max-w-xs"
                  />
                  <Select value={filterMode} onValueChange={setFilterMode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All modes</SelectItem>
                      <SelectItem value="road">Road</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="air">Air</SelectItem>
                    </SelectContent>
                  </Select>
                  <FilterBarActions>
                    {activeFilters.length > 0 && (
                      <FilterBarClearButton count={activeFilters.length} onClick={() => setActiveFilters([])} />
                    )}
                  </FilterBarActions>
                </FilterBar>
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {activeFilters.map((f) => (
                      <ActiveFilterChip
                        key={f.key}
                        label={f.label}
                        onRemove={() => setActiveFilters((prev) => prev.filter((x) => x.key !== f.key))}
                      />
                    ))}
                  </div>
                )}
              </div>
            </SubSection>
          </Section>

          {/* BONUS — Navigation shell (Sidebar / TopBar), used as page chrome above too */}
          <Section
            id="navigation"
            title="Navigation shell"
            description="Sidebar primitives — presentational only, framed here rather than replacing the real app chrome."
          >
            <div className="overflow-hidden rounded-ds-lg border border-ink-200" style={{ height: 420 }}>
              <SidebarShell className="h-full">
                <SidebarHeader>
                  <span className="text-sm font-semibold tracking-wide text-white">BlueRoute Logistics</span>
                </SidebarHeader>
                <SidebarBody>
                  <SidebarSection label="Operations">
                    <SidebarNavItem icon={LayoutDashboard} active>
                      Dashboard
                    </SidebarNavItem>
                    <SidebarNavItem icon={Truck}>Shipments</SidebarNavItem>
                    <SidebarNavItem icon={Users}>Customers</SidebarNavItem>
                  </SidebarSection>
                  <SidebarSection label="Finance">
                    <SidebarNavItem icon={Wallet}>Payments</SidebarNavItem>
                    <SidebarNavItem icon={Receipt}>Expenses</SidebarNavItem>
                  </SidebarSection>
                  <SidebarSection label="System">
                    <SidebarNavItem icon={Settings}>Settings</SidebarNavItem>
                  </SidebarSection>
                </SidebarBody>
                <SidebarFooter>
                  <span className="text-xs text-navy-300">Signed in as admin@blueroute.in</span>
                </SidebarFooter>
              </SidebarShell>
            </div>
            <p className="text-xs text-ink-500">
              The page header above uses the real <span className="font-mono">TopBar</span> component (with{" "}
              <span className="font-mono">TopBarTitle</span>, <span className="font-mono">TopBarBreadcrumb</span>,{" "}
              <span className="font-mono">TopBarActions</span>) as its actual chrome, plus a <Bell className="inline size-3.5" />{" "}
              icon-button pattern for reference.
            </p>
          </Section>
        </main>
      </div>
    </div>
  );
}
