/**
 * Chart color tokens — DESIGN_SYSTEM.md §14.
 * Validated (scripts/validate_palette.js from the dataviz skill) against this
 * product's actual surfaces: light `#FFFFFF`, dark `#0B1424`. Categorical hue
 * order is fixed — never cycle or reassign slots per filter (§14.1).
 */

export interface ChartPaletteStep {
  light: string;
  dark: string;
}

/** Fixed-order categorical palette. Slot 1 (blue) is intentionally distinct
 * from brand Navy — Navy fails the chart lightness/chroma checks on its own. */
export const CHART_CATEGORICAL: ChartPaletteStep[] = [
  { light: "#2A78D6", dark: "#3987E5" }, // 1 blue
  { light: "#1BAF7A", dark: "#199E70" }, // 2 teal
  { light: "#EDA100", dark: "#C98500" }, // 3 amber
  { light: "#008300", dark: "#008300" }, // 4 green
  { light: "#4A3AA7", dark: "#9085E9" }, // 5 violet
  { light: "#E34948", dark: "#E66767" }, // 6 red
  { light: "#E87BA4", dark: "#D55181" }, // 7 magenta
  { light: "#EB6834", dark: "#D95926" }, // 8 orange
];

/** Slots 2/3/7 fall below 3:1 contrast on the light surface — always pair
 * with a direct label or legend, never color alone (the "relief rule"). */
export const CHART_RELIEF_REQUIRED_SLOTS = [1, 2, 6];

/** Single-hue sequential ramp (blue), 100 → 700, lightest = "near zero". */
export const CHART_SEQUENTIAL_BLUE: Record<number, string> = {
  100: "#CDE2FB",
  150: "#B7D3F6",
  200: "#9EC5F4",
  250: "#86B6EF",
  300: "#6DA7EC",
  350: "#5598E7",
  400: "#3987E5",
  450: "#2A78D6",
  500: "#256ABF",
  550: "#1C5CAB",
  600: "#184F95",
  650: "#104281",
  700: "#0D366B",
};

/** Diverging pair: blue (positive) ↔ red (negative), neutral gray midpoint. */
export const CHART_DIVERGING = {
  positive: { light: "#2A78D6", dark: "#3987E5" },
  negative: { light: "#E34948", dark: "#E66767" },
  midpoint: { light: "#F1F5F9", dark: "#1E293B" },
};

/** Fixed status tokens, shared 1:1 with Badge (§1.5). Never reuse for a
 * generic "series N" — these carry a specific state meaning everywhere. */
export const CHART_STATUS = {
  success: { light: "#0CA30C", dark: "#0CA30C" },
  warning: { light: "#FAB219", dark: "#FAB219" },
  serious: { light: "#EC835A", dark: "#EC835A" },
  critical: { light: "#D03B3B", dark: "#D03B3B" },
};

export const CHART_SURFACE = {
  light: "#FFFFFF",
  dark: "#0B1424",
};

export const CHART_CHROME = {
  gridline: { light: "#E2E8F0", dark: "#2C2C2A" },
  axis: { light: "#CBD5E1", dark: "#383835" },
  label: { light: "#64748B", dark: "#94A3B8" },
};

/** Convenience accessor: `chartColor(0, "dark")` → categorical slot 1 in dark mode. */
export function chartColor(slotIndex: number, mode: "light" | "dark" = "light"): string {
  const step = CHART_CATEGORICAL[slotIndex % CHART_CATEGORICAL.length];
  return mode === "dark" ? step.dark : step.light;
}
