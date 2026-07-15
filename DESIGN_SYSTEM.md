# BlueRoute Logistics — Design System

**Connecting Businesses. Delivering Trust.**

Version 1.0 · Owner: Product Design & Frontend Architecture · Status: Foundation (no pages redesigned yet)

---

## 0. Principles

BlueRoute Logistics is enterprise infrastructure for people who move freight and reconcile
money against it — office managers closing a day's manifest, accountants
matching payments to ledgers, owners checking P&L. They are not the audience for
delight; they are the audience for **clarity, density, and trust**.

1. **Neutral-first, color-with-intent.** The UI is built from grayscale. Navy
   and the accent blue appear only where something is interactive or important.
   Nothing competes with the data.
2. **One brand color doing real work, not two decorative ones.** The legacy
   navy+gold pairing reads as a generic freight-company template when both are
   used as UI paint (buttons, headers, badges). Navy stays as the identity color
   and the sole interactive color. Gold is retired from interactive UI and kept
   only as a rare, premium accent (see §1.4).
3. **Borders over shadows.** Flat, bordered surfaces (Linear/Notion) rather than
   floating drop-shadow cards. Shadow is reserved for things that are actually
   above the page: menus, modals, toasts.
4. **Numbers are first-class citizens.** This product is full of amounts,
   weights, waybill numbers, and dates. Tabular figures, right-alignment, and a
   monospace track for identifiers are non-negotiable, not polish.
5. **Dense but breathable.** Enterprise data tools (Stripe Dashboard, Ramp) run
   tighter row heights and smaller type than marketing sites, but never feel
   cramped because spacing is systematic, not squeezed.

---

## 1. Color System

### 1.1 Neutral scale — "Ink"

The base of the entire UI: backgrounds, borders, body text, dividers. A cool,
slightly blue-leaning gray (not warm/beige) so it sits naturally next to Navy.

| Token | Hex | Typical use |
|---|---|---|
| `ink-50` | `#F8FAFC` | App background (light) |
| `ink-100` | `#F1F5F9` | Subtle section fill, table header fill |
| `ink-200` | `#E2E8F0` | Borders, dividers |
| `ink-300` | `#CBD5E1` | Disabled borders, input borders (resting) |
| `ink-400` | `#94A3B8` | Placeholder text, disabled text, icons (inactive) |
| `ink-500` | `#64748B` | Secondary/muted text |
| `ink-600` | `#475569` | Secondary text (higher emphasis), default icon color |
| `ink-700` | `#334155` | Body text (secondary headings) |
| `ink-800` | `#1E293B` | Primary body text |
| `ink-900` | `#0F172A` | Headings, high-emphasis text |
| `ink-950` | `#020617` | Reserved for near-black text on light surfaces only |

### 1.2 Brand — "Navy" (primary / interactive)

Existing brand navy, kept as-is and extended one step darker for dark-mode
surfaces. This is the **only** color used for primary buttons, links, focus
rings, checked states, and the active-nav indicator.

| Token | Hex | Typical use |
|---|---|---|
| `navy-50` | `#E8EDF5` | Selected-row tint, info banner background |
| `navy-100` | `#C5D1E8` | Hover tint on light surfaces |
| `navy-200` | `#9FB2D8` | — |
| `navy-300` | `#7893C8` | — |
| `navy-400` | `#5A7ABD` | Links on dark surfaces, secondary icons |
| `navy-500` | `#1E3A5F` | **Primary brand color** — logo, marketing |
| `navy-600` | `#1A3356` | Primary button default |
| `navy-700` | `#152B4C` | Primary button hover |
| `navy-800` | `#102340` | Primary button active/pressed |
| `navy-900` | `#091830` | Sidebar background (light mode), dark-mode raised surface |
| `navy-950` | `#060F1D` | Dark-mode page background |

### 1.3 Accent — "Signal Blue" (data & informational)

A distinct, higher-chroma blue used **only** in charts and informational
callouts — never for buttons or brand marks. Keeping it separate from Navy
prevents the "everything is navy" flatness in data-dense screens and gives
charts a color validated for categorical use (Navy itself fails a
lightness/chroma check for chart marks — see §14).

| Token | Light | Dark |
|---|---|---|
| `signal-blue` | `#2A78D6` | `#3987E5` |

### 1.4 Gold — premium accent (restrained)

Not a UI color. Reserved for a small, deliberate set of "this is elevated"
moments: an Enterprise/VIP client tag, a certificate/verification mark, a
year-in-review or milestone callout. **Never** a button, link, active state, or
chart color. If you're reaching for gold and it isn't one of those three
things, use Navy instead.

| Token | Hex | Use |
|---|---|---|
| `gold-300` | `#EED877` | Gold text on dark navy surfaces |
| `gold-500` | `#D4AF37` | Icon/border accent on premium badges |
| `gold-700` | `#B08A25` | Gold text on light surfaces (AA-safe) |

### 1.5 Semantic / status colors

Shared 1:1 with the chart status palette (§14) so a "Delayed" badge and a
"Delayed" chart segment are always the same hue. Four tiers, fixed meaning,
never reused for anything else (never "category 4").

| Role | Hex | WCAG vs white | Use |
|---|---|---|---|
| `success` | `#0CA30C` | 3.3:1 (pair with icon) | Delivered, Paid, Reconciled |
| `warning` | `#B8790E`* | 4.6:1 | Delayed, Pending approval, Due soon |
| `serious` | `#C24F1E`* | 4.5:1 | At risk, Overdue < 7 days |
| `critical` | `#D03B3B` | 4.7:1 | Failed delivery, Overdue, Exception |

\* `warning`/`serious` are darkened one step from the dataviz reference
(`#FAB219`/`#EC835A`) specifically for **text and icon use** on white, where
the reference hues drop below 3:1. Charts may use the lighter reference steps
directly since chart marks pair with mandatory labels (§14). Full status→hex
table including dark-mode steps lives in §14.

**Status token usage in this product:**

| Domain | good | neutral/info | warning | critical |
|---|---|---|---|---|
| Shipment | Delivered | In Transit, Booked | Delayed | Exception / Lost |
| Payment | Paid, Reconciled | Pending | Due Soon | Overdue |
| Invoice/Ledger | Settled | Draft | Partial | Disputed |

### 1.6 Contrast rule

All text-on-surface pairings must hit **WCAG AA (4.5:1 body, 3:1 large
text/icons)**. `ink-500` is the lightest gray permitted for body copy on
`ink-50`/white; anything lighter is decorative/disabled only.

---

## 2. Typography System

**UI typeface:** Inter (variable), fallback `system-ui, -apple-system, "Segoe UI", sans-serif`.
**Numeric/ID typeface:** JetBrains Mono, fallback `ui-monospace, "SFMono-Regular", Consolas, monospace` — used only for waybill numbers, tracking IDs, invoice numbers, and other codes that benefit from fixed-width alignment and unambiguous characters (`0` vs `O`, `1` vs `l`).

No serif, no display face, anywhere.

### 2.1 Type scale

| Token | Size / Line-height | Weight | Use |
|---|---|---|---|
| `text-xs` | 12px / 16px | 400–500 | Table meta, badges, timestamps |
| `text-sm` | 13px / 20px | 400–500 | Table body, form labels, secondary UI |
| `text-base` | 14px / 20px | 400 | Default body text, inputs |
| `text-md` | 16px / 24px | 400–500 | Card titles, section intros |
| `text-lg` | 18px / 26px | 600 | Panel/modal headings |
| `text-xl` | 20px / 28px | 600 | Page headings (dashboard sections) |
| `text-2xl` | 24px / 32px | 600 | Page title (e.g. "Shipments") |
| `text-3xl` | 30px / 38px | 600–700 | KPI stat values |
| `text-4xl` | 36px / 44px | 700 | Rare — landing/marketing hero only |

Note the base UI size is **14px**, not 16px — this is deliberate density
consistent with Stripe/Ramp/Linear; the marketing site (`/`) may use a larger
scale (`text-md`+ as body) since it's a persuasion surface, not a work surface.

### 2.2 Weight usage

- 400 (Regular) — body copy, table cells, input text
- 500 (Medium) — labels, nav items, button text, table headers
- 600 (Semibold) — headings, KPI values, active nav item
- 700 (Bold) — hero numbers only, used sparingly

### 2.3 Numeric formatting rules

- Any column of currency/weight/count values: `font-variant-numeric: tabular-nums`, right-aligned.
- Waybill numbers, tracking codes, invoice IDs: monospace, `ink-700`, never a link color unless clickable.
- Currency: always show `₹` prefix with no space, negative values in `critical` red with a leading `–`, never red parentheses.

---

## 3. Spacing Scale

4px base unit. Use the scale exclusively — no arbitrary padding values in new UI.

| Token | Value | Typical use |
|---|---|---|
| `space-0.5` | 2px | Icon-to-text gap (tight) |
| `space-1` | 4px | Chip internal padding |
| `space-2` | 8px | Input/button internal padding (vertical), tight stacks |
| `space-3` | 12px | Default gap between form fields |
| `space-4` | 16px | Card padding (default), section internal gap |
| `space-5` | 20px | — |
| `space-6` | 24px | Card padding (comfortable), gap between cards |
| `space-8` | 32px | Section gap within a page |
| `space-10` | 40px | Page top padding |
| `space-12` | 48px | Major section separation |
| `space-16` | 64px | Marketing-page section spacing |

Rule of thumb: **components use 2/3/4**, **layout uses 6/8/10/12+**.

---

## 4. Border Radius

Tight, precise radii — enough to soften edges, never enough to look playful.

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 6px | Chips, badges, small buttons |
| `radius-md` | 8px | Inputs, buttons (default), table row hover fill |
| `radius-lg` | 10px | Cards, dropdown menus, modals' inner elements |
| `radius-xl` | 12px | Modals, popovers (outer container) |
| `radius-full` | 9999px | Avatars, status dots, pill badges |

Nothing above 12px except avatars/pills. This is the single fastest way to
avoid the "student project" look — Bootstrap-era UI over-rounds everything.

---

## 5. Elevation / Shadows

Elevation is communicated primarily by **border + background-layer**, not
shadow. Shadow is reserved for elements that float above the page on the
z-axis (menus, modals, toasts, popovers) and is always soft and low-opacity —
never a hard drop shadow.

| Token | Value | Use |
|---|---|---|
| `shadow-none` | — | Cards, sidebar, table (bordered instead) |
| `shadow-xs` | `0 1px 2px rgba(15,23,42,0.04)` | Buttons on press, subtle input focus |
| `shadow-sm` | `0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)` | Dropdown menus, tooltips |
| `shadow-md` | `0 4px 16px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)` | Popovers, date pickers |
| `shadow-lg` | `0 12px 32px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.04)` | Modals, dialogs |
| `shadow-focus` | `0 0 0 3px rgba(30,58,95,0.16)` | Focus ring (paired with `navy-600` border) |

Dark mode: same structure, opacity roughly doubled, tinted black rather than navy (`rgba(0,0,0,0.4–0.6)`), since navy-tinted shadow on a navy background disappears.

---

## 6. Button Variants

Built as CVA variants (the project already depends on `class-variance-authority`).
Base: `radius-md`, `text-sm` (13px), weight 500, height per size token, `transition-colors duration-150`.

| Variant | Background | Text | Border | Hover | Use |
|---|---|---|---|---|---|
| `primary` | `navy-600` | white | none | `navy-700` | Main CTA per view (one per screen) |
| `secondary` | `ink-100` | `ink-800` | none | `ink-200` | Secondary actions |
| `outline` | transparent | `ink-800` | `ink-300` | bg `ink-50`, border `ink-400` | Toolbar actions, filters |
| `ghost` | transparent | `ink-700` | none | bg `ink-100` | Icon buttons, table row actions |
| `destructive` | `critical` (`#D03B3B`) | white | none | darken 8% | Delete, void, cancel shipment |
| `link` | transparent | `navy-600` | none | underline | Inline text actions |

**Sizes:**

| Size | Height | Padding-x | Icon size |
|---|---|---|---|
| `sm` | 32px | 10px | 14px |
| `md` (default) | 36px | 14px | 16px |
| `lg` | 40px | 18px | 18px |
| `icon` | 36×36px | — | 16px |

**States:** `disabled` → 40% opacity, no pointer events. `loading` → text
replaced/prefixed by a 14px spinner in the current text color, button stays
same width (reserve width to avoid layout shift). Focus → `shadow-focus` ring,
never removed (never `outline: none` without a replacement).

---

## 7. Form Components

Base input height **36px** (matches button `md`) so inputs and buttons align
on the same row. Label above field, never inline/floating labels (floating
labels hurt scanability in dense forms).

| Element | Spec |
|---|---|
| Label | `text-sm`, weight 500, `ink-700`, 6px margin-bottom |
| Input / Select / Textarea | 36px height (textarea min 80px), `radius-md`, border `ink-300`, bg white, `text-base`, padding-x 12px |
| Focus state | border → `navy-600`, `shadow-focus` ring, no color change to label |
| Placeholder | `ink-400` |
| Help text | `text-xs`, `ink-500`, 4px margin-top |
| Error state | border → `critical`, help text becomes error text in `critical`, small alert-circle icon before message |
| Disabled | bg `ink-50`, border `ink-200`, text `ink-400`, cursor not-allowed |
| Checkbox / Radio | 16px box, `radius-sm` (checkbox) / full (radio), checked = `navy-600` fill + white check, via Radix primitives already in the stack |
| Switch | Radix Switch, track `ink-300`→`navy-600` checked, 20px thumb |
| Select (dropdown) | Same field chrome as input + chevron-down icon (`ink-500`), menu uses `shadow-sm` + `ink-200` border |
| Required marker | Asterisk in `critical`, never color-alone — pair with "required" in help text on complex forms |

Field groups (e.g. New Shipment form) use `space-3` (12px) vertical gap between fields and `space-6` (24px) between logical sections, with an `text-sm` weight-600 `ink-900` section heading.

---

## 8. Table Design

The workhorse component of this ERP (Shipments, Ledger, Payments, Manifest, Audit). Dense, bordered, scannable — modeled on Stripe/Ramp transaction tables.

| Property | Spec |
|---|---|
| Row height | 44px (default), 40px for very dense views (Manifest), never below 36px |
| Header | `ink-50` background, `text-xs` weight 600, `ink-600`, uppercase tracking-wide, sticky on scroll |
| Row divider | 1px `ink-200` hairline between rows — **no zebra striping** (zebra reads as dated/Bootstrap) |
| Row hover | bg `ink-50` (light) — signals row is clickable/actionable |
| Selected row | bg `navy-50`, left 2px `navy-600` bar |
| Numeric columns | right-aligned, tabular-nums |
| ID/code columns | monospace, `ink-700` |
| Status column | pill badge (§1.5 colors), never bare colored text |
| Row actions | icon-only ghost buttons, revealed on row hover (not permanently visible) to reduce clutter |
| Empty state | centered icon (24px, `ink-400`) + `text-sm` `ink-500` message + primary action if applicable |
| Pagination | footer row, `text-sm`, "Showing X–Y of Z", prev/next as icon buttons, page-size select |
| Sortable header | chevron indicator appears on hover, filled when active |
| Print variant (Manifest, ledgers) | existing `@media print` rules retained: full borders, black-on-white, no shadows/hover states |

---

## 9. Card Design

Flat, bordered, minimal — the default container for grouped content and KPIs.

| Property | Spec |
|---|---|
| Background | white (light) / `navy-900` surface (dark) |
| Border | 1px `ink-200` (light) / `rgba(255,255,255,0.08)` (dark) |
| Radius | `radius-lg` (10px) |
| Shadow | none by default; `shadow-xs` only for cards that need to visually lift off a tinted page background |
| Padding | `space-6` (24px) default, `space-4` (16px) for compact/KPI cards |
| Header | `text-md` weight 600 title + optional `text-sm` `ink-500` subtitle, optional right-aligned action (button/menu) |
| Divider | 1px `ink-200` between header and body when header has actions |
| Footer | reserved for meta info (last updated, totals) — `text-xs`, `ink-500` |

**Stat/KPI card** (dashboard summary row): label (`text-sm`, `ink-500`) above value (`text-3xl`, weight 600, `ink-900`), optional trend chip below (▲/▼ + % in `success`/`critical`, never color alone — always paired with the arrow glyph).

---

## 10. Sidebar Design

Fixed, persistent, dark — the one place Navy dominates as background rather than accent, establishing brand identity without touching the (neutral) work surfaces.

| Property | Spec |
|---|---|
| Width | 256px expanded, 68px collapsed (icon-only) |
| Background | `navy-900` |
| Logo/brand zone | top, 64px height, wordmark in white + tagline hidden below `md` breakpoint |
| Nav item | 36px height, `radius-md`, `text-sm` weight 500, icon 18px + label, `space-3` internal padding |
| Nav item — default | text `navy-100`, icon `navy-300` |
| Nav item — hover | bg `rgba(255,255,255,0.06)` |
| Nav item — active | bg `rgba(255,255,255,0.08)`, text white, **left 3px bar in `signal-blue`** (not gold — retires the old gold active-indicator per §1.4), icon white |
| Section label | `text-xs` uppercase weight 600 `navy-400`, `space-6` top margin between groups |
| Role-gated items | identical styling; items simply absent for `OFFICE_MANAGER` rather than shown-disabled |
| Collapse control | bottom of sidebar, ghost icon button |
| Footer (user menu) | avatar (28px) + name/role (`text-sm`/`text-xs`) + chevron, opens dropdown via Radix |

---

## 11. Dashboard Layout

| Region | Spec |
|---|---|
| Shell | Sidebar (fixed, §10) + main column (TopBar + content), no page-level horizontal scroll |
| TopBar | 56px height, white/`ink-50` bg, 1px bottom border `ink-200`, breadcrumb or page title left, search + notifications + user actions right |
| Content max-width | 1400px, centered, `space-8` (32px) horizontal padding on desktop, `space-4` on mobile |
| Content vertical rhythm | page title block → KPI row → primary content (table/chart) → secondary content, each separated by `space-8` |
| KPI row | 4-up grid on desktop (`grid-cols-4`, `gap-4`), 2-up tablet, 1-up mobile — stat cards per §9 |
| Primary grid | 12-column grid, `gap-6`; typical pattern: 8-col chart/table + 4-col side panel (recent activity, alerts) |
| Breakpoints | `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1400 (matches existing Tailwind container config) |
| Loading state | skeleton blocks (`ink-100` pulse), matching the shape of the content they replace — never a full-page spinner for in-place data |

---

## 12. Icon Style

**Library:** `lucide-react` (already in the stack) — outline style exclusively.

| Rule | Spec |
|---|---|
| Stroke width | 1.5 (2 only for very small 12–14px icons where 1.5 disappears) |
| Sizes | 14 / 16 / 18 / 20 / 24px — pick from this set only |
| Color | inherits text color (`ink-500`/`ink-600` default, `navy-600` when interactive/active) — icons are **never** a decorative brand color |
| Filled icons | none, except tiny status dots (8px solid circle) for online/offline-type indicators |
| Custom illustrations | avoid entirely in-product; if the marketing site needs illustration, use simple geometric line art, never stock "cartoon truck/package" iconography |

---

## 13. Motion Guidelines

Motion communicates state change, not personality. Fast, linear-ish, no bounce.

| Token | Duration | Easing | Use |
|---|---|---|---|
| `motion-instant` | 100ms | `ease-out` | Button/input hover, color changes |
| `motion-fast` | 150ms | `ease-out` | Row hover, focus ring appearance |
| `motion-base` | 200ms | `cubic-bezier(0.4,0,0.2,1)` | Dropdown/popover open, accordion |
| `motion-modal` | 240ms | `cubic-bezier(0.16,1,0.3,1)` | Modal/dialog enter (slight scale 0.98→1 + fade) |
| `motion-page` | none | — | No route-transition animation — instant navigation, enterprise users value speed over flourish |

Rules: animate `opacity`/`transform` only (never `width`/`height`/`top` for perf); respect `prefers-reduced-motion` by dropping to opacity-only or instant; no autoplay, no looping decorative animation anywhere.

---

## 14. Chart Style

Built on Recharts (already in the stack), following the categorical/sequential/status method validated for this product's actual surfaces (`#FFFFFF` light, `#0B1424` dark — BlueRoute's navy-ink dark surface, not a generic black).

### 14.1 Categorical palette (validated)

Fixed order — never cycled or reassigned per filter. Slot 1 (blue) is visually
distinct from brand Navy on purpose (Navy fails the chart lightness/chroma
check on its own — confirmed via the validator — so charts use this brighter,
chart-safe blue instead).

| Slot | Hue | Light | Dark |
|---|---|---|---|
| 1 | blue | `#2A78D6` | `#3987E5` |
| 2 | teal | `#1BAF7A` | `#199E70` |
| 3 | amber | `#EDA100` | `#C98500` |
| 4 | green | `#008300` | `#008300` |
| 5 | violet | `#4A3AA7` | `#9085E9` |
| 6 | red | `#E34948` | `#E66767` |
| 7 | magenta | `#E87BA4` | `#D55181` |
| 8 | orange | `#EB6834` | `#D95926` |

Validated (`scripts/validate_palette.js`) against both surfaces: lightness
band, chroma floor, and CVD separation all pass. Slots 2/3/7 fall below 3:1
contrast on the light surface — the **relief rule** applies: always pair with
a direct label or a legend, never color-alone.

### 14.2 Sequential (single-hue magnitude — e.g. revenue heatmap)

One hue (blue), light→dark, 100→700 steps — see reference palette for full
ramp. Lightest step reads as "near zero."

### 14.3 Diverging (e.g. profit/loss variance)

Blue (positive) ↔ Red (negative), neutral gray midpoint (`ink-100` light /
`ink-800` dark). Equal step count per arm. Never a hue at the zero point.

### 14.4 Status colors in charts

Same four tokens as §1.5 (`success`/`warning`/`serious`/`critical`), kept
visually distinct from the eight categorical slots so a status color never
gets mistaken for "series 4."

### 14.5 Marks & chrome

| Element | Spec |
|---|---|
| Line width | 2px |
| Bar/area corner | 4px rounded on the data-end only, square at baseline |
| Gap between stacked segments / adjacent bars | 2px surface-color gap |
| Gridlines | `ink-200` (light) / `#2C2C2A`-equivalent hairline (dark), horizontal only unless a bar chart needs vertical |
| Axis/baseline | `ink-300`, `text-xs` `ink-500` labels |
| Tooltip | styled as a `shadow-sm` card (§5/§9), not a native browser tooltip — crosshair on line/area charts |
| Legend | always present for 2+ series; direct labels in addition for ≤4 series; never omitted in favor of color alone |
| Dark mode | not an inverted flip — dark steps above are separately validated against `#0B1424`, not auto-generated |

Before any chart implementation ships, re-run
`node scripts/validate_palette.js "<hexes>" --mode light|dark --surface "<actual bg>"`
against the literal surface color that chart renders on.

---

## 15. Dark Mode Strategy

Dark mode is a **first-class second theme**, not an auto-inverted filter — every token below is separately chosen, not algorithmically flipped.

### 15.1 Surface elevation ladder

Instead of shadows (which vanish on dark backgrounds), elevation in dark mode
is expressed as **progressively lighter navy-tinted surfaces**:

| Token | Hex | Use |
|---|---|---|
| `surface-0` | `#05070C` | Page background |
| `surface-1` | `#0B1424` | Sidebar, cards, table rows |
| `surface-2` | `#121D33` | Raised: popovers, dropdown menus, modals |
| `surface-3` | `rgba(255,255,255,0.06)` overlay | Hover/pressed state on any surface above |

### 15.2 Text & borders

| Token | Hex | Use |
|---|---|---|
| Primary text | `#F1F5F9` (`ink-100`) | Headings, high-emphasis |
| Secondary text | `#94A3B8` (`ink-400`) | Body, labels |
| Muted text | `#64748B` (`ink-500`) | Timestamps, placeholders |
| Border (default) | `rgba(255,255,255,0.08)` | Card/table borders |
| Border (emphasis) | `rgba(255,255,255,0.16)` | Input borders, dividers needing more presence |

### 15.3 Brand & accent adjustments

- Primary buttons: `navy-500`→lighter than light-mode default (`navy-400` equivalent) is **not** used; instead primary buttons stay `navy-600` but get a 1px `rgba(255,255,255,0.12)` inner border to separate from the dark page — flat navy-on-near-black has insufficient edge definition otherwise.
- `signal-blue`, status colors, and the chart categorical palette all switch to their pre-validated dark-column values (§14) — never the light values dimmed via opacity.
- Focus ring in dark mode: `0 0 0 3px rgba(57,135,229,0.28)` (signal-blue, not navy, for better visibility against dark navy surfaces).

### 15.4 Implementation

The project already has `darkMode: "class"` in `tailwind.config.ts` and an HSL
CSS-variable layer in `globals.css`. Dark mode should extend that same
variable set (`--background`, `--card`, `--border`, etc.) with a `.dark` block
supplying the tokens above, rather than introducing a parallel styling system.
Gold (§1.4) keeps its restrained role in dark mode — `gold-300` for text on
dark surfaces is the only variant that changes.

### 15.5 Theme switching

- Respect OS preference by default (`prefers-color-scheme`), with a manual
  override stored per-user (matches existing NextAuth user model — a natural
  place for a `themePreference` field later).
- No mid-page flash: theme class applied before first paint (existing Next.js
  app shell can set this via a blocking inline script or server-read cookie).

---

## Appendix: Mapping to the existing codebase

For when implementation begins (not part of this task):

- `tailwind.config.ts` already defines `navy` and `gold` scales matching §1.2/§1.4 — no changes needed there.
- The HSL CSS variables in `src/app/globals.css` (`--primary`, `--secondary`, `--accent`, etc.) currently point secondary/accent at gold (`43 67% 52%`); per §1.4 these should be repointed away from gold toward `ink`/`signal-blue` roles when redesign work starts.
- `.sidebar-active` in `globals.css` currently uses gold fill/border (§10 supersedes this with a `signal-blue` left-bar).
- No `src/components/ui/*` primitives exist yet beyond `toaster.tsx` despite Radix + CVA being installed — button/input/table/card primitives should be built per §6–§9 as shared components rather than styled inline per page, which is the current pattern across `*Client.tsx` files.
- Recharts is already installed; §14 palette should be wired in as a shared `chartColors.ts` constant rather than per-chart literals.
