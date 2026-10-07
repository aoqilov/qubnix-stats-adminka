/**
 * Grafik rollari → globals.css dagi `--chart-*` tokenlar (qubnix primitivlariga havola, hex yo'q).
 *
 * Kategorik slotlar dataviz validatori bilan tekshirilgan (2026-10-07, sirt = --bg-surface):
 * - Light: brand-500, orange-500, info-500 — CVD va oddiy ko'rish chegaralaridan o'tadi; orange
 *   kontrasti 2.75:1 (< 3:1) → har grafikda legend + "Таблица" ko'rinishi majburiy (bor).
 * - Dark: brand-400, warning-700, info-500 — barcha tekshiruvlardan to'liq o'tadi.
 * - Maksimum 3 seriya. Ko'proq kerak bo'lsa — "Прочее"ga yig'ing, guruhlang yoki small multiples;
 *   teal/pink/cyan qo'shilganda CVD tekshiruvi yiqiladi (pink↔cyan ΔE 4).
 *
 * Ketma-ket shkala (heatmap) — bitta brand rampi, monoton yorug'lik; dark'da teskari (nolga yaqin —
 * sirtga yaqin qorong'i). Eng och qadam ataylab sirtga yaqin: "deyarli nol" degani.
 *
 * Seriya rangi ob'ektga bog'lanadi (Payme doim 1-slot), tartib/filtrga emas.
 */
export const SERIES_COLORS = [
  "var(--chart-series-1)",
  "var(--chart-series-2)",
  "var(--chart-series-3)",
] as const;

export const SEQUENTIAL_COLORS = [
  "var(--chart-seq-1)",
  "var(--chart-seq-2)",
  "var(--chart-seq-3)",
  "var(--chart-seq-4)",
  "var(--chart-seq-5)",
  "var(--chart-seq-6)",
  "var(--chart-seq-7)",
] as const;

export const CHART_COLORS = {
  /** Gorizontal yordamchi chiziqlar — hairline, qattiq. */
  grid: "var(--border-subtle)",
  /** Bazaviy chiziq / o'q. */
  axis: "var(--border-default)",
  tick: "var(--text-secondary)",
  /** Karta foni — segmentlar orasidagi 2px "bo'shliq" va nuqta halqasi shu rangda. */
  surface: "var(--bg-surface)",
  /** Ustunli grafikda hover qatlami. */
  cursor: "var(--bg-surface-secondary)",
} as const;

export const TICK_STYLE = { fill: CHART_COLORS.tick, fontSize: 12 } as const;

export interface SeriesDef {
  key: string;
  label: string;
  color: string;
}
