import { useUiStore } from "@/store/ui.store";
import { SEQUENTIAL_COLORS } from "./chartTokens";

export interface HeatmapRow {
  key: string;
  label: string;
  size: number;
  /** 0..1 yoki null (davr hali kelmagan). */
  values: (number | null)[];
}

interface CohortHeatmapProps {
  rows: HeatmapRow[];
  average: (number | null)[];
  columnLabel: (index: number) => string;
  formatPercent: (value: number) => string;
  formatNumber: (value: number) => string;
  labels: { cohort: string; size: string; average: string; scaleLow: string; scaleHigh: string };
}

/** Qiymat → shkala qadami (0..6). Pastki qadamlar tor — kichik ulushlar ham farqlansin. */
const THRESHOLDS = [0.1, 0.2, 0.3, 0.45, 0.6, 0.8];

function stepOf(value: number): number {
  const index = THRESHOLDS.findIndex((threshold) => value < threshold);
  return index === -1 ? THRESHOLDS.length : index;
}

/**
 * Kohorta jadvali (heatmap) — HTML jadval, har katakda qiymat yozilgan (o'zi jadval ko'rinishi).
 * Bitta rang rampi; katak matni fonning yorqinligiga qarab och yoki to'q (kontrast ≥ 4:1).
 * Kataklar orasida 2px sirt rangidagi bo'shliq.
 */
export function CohortHeatmap({ rows, average, columnLabel, formatPercent, formatNumber, labels }: CohortHeatmapProps) {
  const isDark = useUiStore((s) => s.isDarkMode);
  // Light: och qadamlarda to'q matn; dark: shkala teskari — yorqin qadamlarda to'q matn.
  const textColor = (step: number) =>
    (isDark ? step >= 4 : step >= 3) ? (isDark ? "var(--text-inverse)" : "var(--text-on-brand)") : "var(--text-primary)";

  const cell = (value: number | null, key: string, title: string, bold = false) => {
    if (value === null) return <td key={key} className="h-9 min-w-[52px]" />;
    const step = stepOf(value);
    return (
      <td
        key={key}
        title={title}
        className={`h-9 min-w-[52px] rounded-sm px-1.5 text-center text-xs tabular-nums transition-[filter] hover:brightness-110 ${bold ? "font-semibold" : ""}`}
        style={{ background: SEQUENTIAL_COLORS[step], color: textColor(step) }}
      >
        {formatPercent(value)}
      </td>
    );
  };

  const columns = average.map((_, index) => index);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-sticky bg-surface pr-3 text-left text-xs font-medium text-secondary">
                {labels.cohort}
              </th>
              <th className="pr-3 text-right text-xs font-medium text-secondary">{labels.size}</th>
              {columns.map((index) => (
                <th key={index} className="text-center text-xs font-medium text-secondary">
                  {columnLabel(index)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="sticky left-0 z-sticky bg-surface pr-3 text-left text-sm font-semibold text-primary">
                {labels.average}
              </th>
              <td className="pr-3 text-right text-xs text-secondary tabular-nums">
                {formatNumber(rows.reduce((sum, row) => sum + row.size, 0))}
              </td>
              {columns.map((index) =>
                cell(average[index], `avg-${index}`, `${labels.average} · ${columnLabel(index)}`, true),
              )}
            </tr>
            {rows.map((row) => (
              <tr key={row.key}>
                <th className="sticky left-0 z-sticky whitespace-nowrap bg-surface pr-3 text-left text-sm font-normal text-primary">
                  {row.label}
                </th>
                <td className="pr-3 text-right text-xs text-secondary tabular-nums">{formatNumber(row.size)}</td>
                {columns.map((index) =>
                  cell(row.values[index] ?? null, `${row.key}-${index}`, `${row.label} · ${columnLabel(index)}`),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ketma-ket shkala legendasi. */}
      <div className="flex items-center gap-2 text-xs text-secondary">
        <span>{labels.scaleLow}</span>
        <div className="flex gap-0.5">
          {SEQUENTIAL_COLORS.map((color) => (
            <span key={color} className="h-2.5 w-6 rounded-sm" style={{ background: color }} />
          ))}
        </div>
        <span>{labels.scaleHigh}</span>
      </div>
    </div>
  );
}
