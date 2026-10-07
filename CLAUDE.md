# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`qubnix-admin` is an **internal marketing & analytics panel** for the qubnix SaaS (task management, Telegram Mini App + web). It is used by qubnix's own marketing/statistics team — it is **not** an owner/customer feature and has nothing to do with organization roles in the main app. Its job: full product analytics (growth, funnel, retention, channels, feature usage) and tariff/revenue data.

It is a **separate project** from the main app (`D:/qubnix`). From qubnix it borrows only the UI kit, design tokens, folder structure and package/config setup — no API, auth, Telegram, SSE or PWA code. **All data is mocked**; there is no backend yet.

Web/desktop only (min ~1280px wide). No mobile layout.

## Commands

```bash
npm install                 # if ENOSPC on C: → npm install --cache "D:/temp-npm-cache"
npm run dev                 # vite dev server, http://localhost:5174 (5173 is the main qubnix app)
npm run build               # tsc -b && vite build
npm run typecheck           # tsc -b --noEmit — the only automated check; run after every non-trivial change
npm run preview
```

No lint, no test runner — don't invent `npm run lint`/`npm test`.

## Architecture

```
src/
  main.tsx, App.tsx, chakra-system.ts
  api-config/        axiosInstance, interceptors (Bearer token, 401 → clearSession), queryClient, mock.ts (USE_MOCK)
  api/<resource>/    <resource>.api.ts · <resource>.types.ts · <resource>.mock.ts
  components/ui/     Cus* kit (copied from qubnix + additions, see below)
  components/layout/ AdminLayout, sidebar/, header/ (PeriodFilter, ProfileMenu), session/restoreSession.ts
  components/shared/ composite pieces used by several features (PeriodCaption, SectionPlaceholder, charts later)
  const/navigation.ts  sidebar groups — i18n keys + icons; must match routes/routes.tsx
  widgets/features/<feature>/  components/ hooks/useApi<Feature>.ts modals/ types/ Feature<Name>.tsx
  pages/<Name>Page.tsx         one-line wrapper that only renders the Feature
  routes/            routes.tsx (adminRoutes under AdminLayout), AppRoutes.tsx (auth gate)
  store/             session.store, period.store, ui.store (Zustand)
  mocks/             seeded mock "database" + aggregations (see Mock layer) — only *.mock.ts files import it
  hooks/ utils/ i18n/
  types/             api.ts (envelope, pagination), analytics.ts (PeriodQuery, KpiValue), domain.ts (plans, channels, …)
```

Same template as qubnix, minus the desktop/mobile platform split. Adding a section: feature folder → page wrapper → route in `routes/routes.tsx` → item in `const/navigation.ts` → `layout.nav.*` and `sections.*` keys. A `CusDrawer`/`CusDialog` used by a feature goes in that feature's `modals/`.

### Mock layer — one switch

- `api-config/mock.ts` has a single `USE_MOCK = true`. Every API function is written in the real endpoint shape and branches on it: `USE_MOCK ? <resource>Mock.fn(...) : api.get(...)`. When the backend lands, flip that flag — hooks, screens and types stay untouched. Don't add a second mock path anywhere else.
- `mockDelay()` (300–600 ms) on every mock call so loading states are visible; mock errors are `MockApiError(status, message)`, read by `utils/apiErrorMessage.ts` the same way as axios errors.
- Endpoint paths (`/api/v1/admin/...`) and the `{ statusCode, data }` envelope follow qubnix conventions but are **proposals**, not agreed with backend. Response types are snake_case like the qubnix API.
- **Metric definitions live in one place: `utils/metrics.ts`** (MRR, churn, conversion, DAU/WAU/MAU, stickiness, activation, CAC, ROMI, health…). Mocks compute with these; the backend must follow the same definitions.

**Resources** (`api/<resource>/`, hook in `widgets/features/<feature>/hooks/useApi<Feature>.ts`): `overview` (KPIs, MRR series, plan share) · `tariffs` (summary, expiring subscriptions, upsell candidates, plans) · `payments` (summary, list) · `growth` · `funnel` · `retention` (cohorts) · `channels` (channels + campaigns, spend/CAC/ROMI) · `feature-usage` · `organizations` (list, segments). All analytics endpoints take `PeriodQuery` (`types/analytics.ts`: `from`, `to`, optional `compare_from/compare_to`, `granularity`) and return `KpiValue { value, previous }` for KPIs and `{ date, ... }[]` series where `date` = bucket start. Hooks build params with `usePeriodQuery()` and use `placeholderData: keepPreviousData`.

**Generator (`src/mocks/`)** — a seeded in-memory "database" built once on first call (~100 ms), rebuilt when the date changes:
- `config.ts` (volumes, rates — tune here), `catalog.ts` (plans = qubnix prices/limits, channel profiles, campaigns with daily budgets), `calendar.ts` (dates are integer day indexes since `LAUNCH_DATE` 2025-04-07, a Monday), `random.ts`, `names.ts`, `types.ts`.
- `generate.ts` walks day by day from launch to today: bot starts → registrations per channel/campaign → users → some create an organization → invited members (channel `invite`) → subscriptions (new/renewal/upgrade/downgrade, churn when not renewed) → payments (paid/failed/cancelled/pending, Payme/Click).
- **Stability rule:** every entity seeds its own RNG from a stable key (`seedOf(key, salt)`), and all random draws for an entity happen up front, before the "is it ≤ today" cutoff. That's why adding a new day only appends data and the past never changes. Keep this when editing the generator — never draw from a shared RNG in an order that depends on `today`.
- Activity isn't stored: `activity.ts` derives "active in week" / "active weekdays" from `(user key, week)` hashes; `db.ts` precomputes `weekActive`, `dau`, `lastActiveDay`. Feature usage events (`usage.ts`) are derived from active member-weeks and memoized per range.
- `queries.ts` holds the shared aggregations (MRR at a day, churn, buckets, activity, org health/usage, pagination). Every number shown anywhere must come from the raw records through these — never hardcode a KPI.
- Cross-section consistency is verified (MRR, revenue, new users, funnel vs channels, new paying, tasks): overview = tariffs = payments = channels = organizations. Re-check after touching the generator.

### Auth (separate from qubnix users, mocked)

- Admin accounts (`api/auth/auth.mock.ts`: admin / marketing / analyst, password `<login>123`) — shown on the login screen only while `USE_MOCK`.
- Token in `localStorage` (`qubnix_admin_token`), sent as `Authorization: Bearer`. `restoreSession()` (called in `main.tsx`, not awaited) validates it via `authApi.me()`.
- `routes/AppRoutes.tsx` is the gate: `authenticating` → `CusLoader fullScreen`; not authenticated → `FeatureLogin` instead of the whole router (URL is kept, so after login the same page opens).
- Roles (`AdminRole`) exist but don't restrict anything yet — role-based menus are a later phase.

### Global period filter

`store/period.store.ts` (preset 7d/30d/90d/12m/custom, custom range, compare flag; persisted in `localStorage` `qubnix_admin_period`) → `hooks/usePeriod()` returns concrete `current` / `previous` ranges (`YYYY-MM-DD`, both ends inclusive, previous = same length right before). **Every analytics query must include `usePeriod()` values in its query key.** `PeriodCaption` shows the resolved dates under each page title.

## UI rules (same as qubnix)

- **Design tokens** live in `src/styles/globals.css` (copied from qubnix, generated from Figma; the only admin-specific addition is the `--chart-*` roles in blocks 2/3, which reference qubnix primitives — no new hex. The user said: take design tokens from qubnix). Never write hex/rgba in components — only `var(--token)` or the mapped Tailwind class (`bg-surface`, `text-secondary`, `border-subtle`, `rounded-card`, `bg-brand`, `text-success`, …; see `tailwind.config.ts`). New code uses semantic tokens only; block-7 `⛔ DEPRECATED` aliases (`--vio`, `--bg-second`, `--text-muted`, `--color-blue`, …) appear only inside the copied `components/ui/` files. Don't invent tokens. Dark mode = `.dark` class on `<html>` (`ui.store`).
- **Cus\* kit is mandatory for page/feature content** — no raw Chakra elements or hand-rolled Tailwind buttons/inputs in features; card/wrapper blocks use `CusCardbox`. Layout chrome (`components/layout/**`) is exempt.
- **If a needed Cus\* component doesn't exist, build it yourself** in `components/ui/<group>/Cus<Name>.tsx` (the user explicitly approved this for this project — no need to ask). New Cus\* components use semantic tokens only and keep their text in the `ui` i18n section. Added so far: `CusLoader`, `CusPasswordInput`, `CusStatTile` (+ `CusStatDelta`), `CusMeter`, `type` prop on `CusButton` (`"submit"` for forms).

### Charts & numbers (follow the `dataviz` skill — load it before touching charts)

- Features never import `recharts` directly — use `components/shared/charts/`: `ChartCard` (title, legend, mandatory **График/Таблица** toggle = table twin of every chart), `TimeSeriesChart` (2px line + 10% area, crosshair), `ColumnChart` (≤24px bars, 4px rounded data end, 2px surface gap when stacked, `below` series for diverging, `integer` for counts), `BarList` (few categories, values written), `DivergingBarList` (signed values around a baseline, e.g. ROMI), `CohortHeatmap` (HTML table, sequential ramp, value in every cell, scale legend), `ChartTooltip` (value first, line key), `scale.ts` `niceTicks` (clean round Y ticks, 0 always included). `TimeSeriesChart` takes `formatTick`/`formatLabel` when X isn't a date (retention curve). **One Y axis only** — never dual axis.
- **Colors** (`chartTokens.ts` → `--chart-*` in globals.css): categorical `--chart-series-1..3` = light brand-500 / orange-500 / info-500, dark brand-400 / warning-700 / info-500 — validated with the skill's `validate_palette.js` (all checks pass in dark; light orange is 2.75:1 → legend + table view are mandatory). **Max 3 series** — more categories go to a table, get grouped (see `channels/lib/channelGroups.ts`: 7 channels → 3 groups), or one hue. Sequential `--chart-seq-1..7` = brand ramp, flipped in dark. Color follows the entity (`providerColors`, `PLATFORM_COLORS`, `GROUP_COLORS`), never rank. Status colors only with a label (`components/shared/badges/StatusBadges.tsx`).
- KPIs: `components/shared/kpi/KpiTile.tsx` turns `KpiValue` into a tile — `mode="points"` for shares (п.п., not relative %), `goodWhenUp={false}` for churn/downgrades/CAC, `goodWhenUp="neutral"` when direction isn't a judgement (ad spend, invited share). Max ~4–5 tiles per row — longer rows truncate labels. Exactly one hero figure per page.
- Formatting only via `utils/format.ts` `useFormatters()` (money, compact, percent, signed, bucket labels by granularity). CSV via `utils/csv.ts` (`;` + BOM for Excel).
- Query states via `components/shared/query-state/QueryBoundary.tsx`: first load → spinner, error → retry, refetch → previous data at reduced opacity (hooks use `keepPreviousData`), no skeleton flash.
- Gotcha (from qubnix): with `disableLayers: true`, Chakra's unlayered reset can override Tailwind `bg-*` on `<button>` elements — for an important button background, use inline `style`.
- Gotcha: Chakra `Field.Root` (CusSwitch, CusInput, …) is `width: 100%` — inside a flex row, wrap it in `<div className="flex-none">` or it takes a whole line.

## i18n

i18next, **ru only** for now (`src/i18n/locales/ru/<section>.ts`, registered in `locales/ru/index.ts`, keys typed via `types-global/i18next.d.ts`). Never hardcode UI text; keys are full paths (`t("layout.nav.overview")`). No text in module-level constants — store keys (see `const/navigation.ts`). Dates/numbers via `useIntlLocale()`, never a hardcoded locale. `common` and `ui` keys used by the Cus* kit must not be removed.

## Plan / status

1. ✅ Skeleton: configs, Cus* kit, tokens, i18n, layout, period filter, mock auth, placeholder sections.
2. ✅ Mock layer: seeded generator, types, api + mock per resource, query hooks, `utils/metrics.ts`.
3. ✅ Overview (MRR hero + chart, plan share, KPIs), Tariffs (plan cards, movements, new/churned diverging chart, plan flows, expiring subscriptions, upsell candidates), Revenue (KPIs, Payme/Click chart, providers & statuses, payments table with filters + CSV).
4. ✅ Growth (KPIs, signups by platform, DAU, platforms/languages, direct vs invited), Funnel (channel filter, 7 steps with drop-offs; cohort funnel — latest steps "mature" over time), Retention (users/companies × weeks/months, curve + cohort heatmap), Channels (KPIs, signups by source group, ROMI diverging list, channels and campaigns tables).
5. Organizations (aggregates only, no customer content), Feature usage, CSV export, polish.

Each section page currently renders `SectionPlaceholder` with its planned metrics (`sections.<key>.planned`); remove the placeholder and the `planned` keys when the section is built.

## Misc

- Path alias `@` → `src/`.
- Don't put a `.ts` and `.d.ts` with the same base name in one folder — ambient types go in `types-global/`.
