import * as React from "react";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatsCardSkeleton } from "@/components/ui/skeleton";

/** StatsCard — DESIGN_SYSTEM.md §9 "Stat/KPI card", used in dashboard KPI rows (§11). */
export interface StatsCardTrend {
  direction: "up" | "down";
  /** e.g. "12% vs last month" */
  label: string;
  /** Whether this direction is good news. Defaults to `up = positive`. */
  sentiment?: "positive" | "negative";
}

export interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  trend?: StatsCardTrend;
  loading?: boolean;
}

function StatsCard({ label, value, icon: Icon, trend, loading = false, className, ...props }: StatsCardProps) {
  if (loading) return <StatsCardSkeleton />;

  const sentiment = trend?.sentiment ?? (trend?.direction === "up" ? "positive" : "negative");
  const TrendIcon = trend?.direction === "up" ? ArrowUp : ArrowDown;

  return (
    <Card className={cn("p-4", className)} {...props}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-ink-500">{label}</p>
        {Icon && <Icon className="size-4 text-ink-400" strokeWidth={1.5} />}
      </div>
      <p className="mt-2 text-3xl font-semibold leading-9 text-ink-900">{value}</p>
      {trend && (
        <p
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-xs font-medium",
            sentiment === "positive" ? "text-[#0A7A0A]" : "text-status-critical"
          )}
        >
          <TrendIcon className="size-3" />
          {trend.label}
        </p>
      )}
    </Card>
  );
}

export { StatsCard };
