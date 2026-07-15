import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ChartCard — DESIGN_SYSTEM.md §14, a Card (§9) sized as a chart container.
 * `children` is the chart itself (e.g. a Recharts `ResponsiveContainer`) —
 * pair its series colors with `src/lib/chart-colors.ts`, not ad-hoc hexes.
 */
export interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  /** Right-aligned header slot — period selector, export button, etc. */
  action?: React.ReactNode;
  /** Legend rendered below the chart, e.g. a row of `<ChartLegendItem>`. */
  legend?: React.ReactNode;
  loading?: boolean;
  /** Fixed chart height; ResponsiveContainer should fill this. */
  height?: number;
}

function ChartCard({
  title,
  description,
  action,
  legend,
  loading = false,
  height = 280,
  className,
  children,
  ...props
}: ChartCardProps) {
  return (
    <Card className={className} {...props}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton style={{ height }} className="w-full" />
        ) : (
          <div style={{ height }}>{children}</div>
        )}
        {legend && <div className="mt-4 flex flex-wrap items-center gap-4">{legend}</div>}
      </CardContent>
    </Card>
  );
}

/** A single legend entry: colored swatch + label, for use in `legend`. */
function ChartLegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-600">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export { ChartCard, ChartLegendItem };
