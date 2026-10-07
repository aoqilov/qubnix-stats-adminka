import { CusStatTile, type StatTileDelta } from "@/components/ui/stat-tile/CusStatTile";
import { percentChange } from "@/utils/metrics";
import { useFormatters, type Formatters } from "@/utils/format";
import type { KpiValue } from "@/types/analytics";

interface KpiTileProps {
  label: string;
  kpi: KpiValue;
  format: (value: number) => string;
  /**
   * Churn kabi ko'rsatkichlarda o'sish yomon — false. "neutral" — yo'nalish baho emas
   * (masalan, reklama xarajati): o'zgarish ko'rsatiladi, lekin yashil/qizil emas.
   */
  goodWhenUp?: boolean | "neutral";
  /**
   * relative — nisbiy o'zgarish (%); points — ulushlar uchun foiz punktlardagi farq
   * (konversiya 17 % → 19 % = "+2 п.п.", "+11,8 %" emas).
   */
  mode?: "relative" | "points";
  hint?: string;
  size?: "md" | "hero";
}

/** O'zgarish 0.05 % dan kichik bo'lsa — "без изменений". */
const FLAT_EPSILON = 0.0005;

export function kpiDelta(
  kpi: KpiValue,
  fmt: Formatters,
  { goodWhenUp = true, mode = "relative" }: Pick<KpiTileProps, "goodWhenUp" | "mode">,
): StatTileDelta | null {
  if (kpi.value === null || kpi.previous === null) return null;
  const change = mode === "points" ? kpi.value - kpi.previous : percentChange(kpi.value, kpi.previous);
  if (change === null) return null;
  const direction = Math.abs(change) < FLAT_EPSILON ? "flat" : change > 0 ? "up" : "down";
  const tone =
    direction === "flat" || goodWhenUp === "neutral"
      ? "neutral"
      : (direction === "up") === goodWhenUp
        ? "good"
        : "bad";
  return {
    text: mode === "points" ? fmt.signedPoints(change) : fmt.signedPercent(change),
    direction,
    tone,
  };
}

/** KpiValue → CusStatTile: qiymat, o'zgarish va oldingi qiymat bir xil qoida bilan. */
export function KpiTile({ label, kpi, format, goodWhenUp, mode, hint, size }: KpiTileProps) {
  const fmt = useFormatters();
  return (
    <CusStatTile
      label={label}
      value={kpi.value === null ? "—" : format(kpi.value)}
      delta={kpiDelta(kpi, fmt, { goodWhenUp, mode })}
      previous={kpi.previous === null ? null : format(kpi.previous)}
      hint={hint}
      size={size}
    />
  );
}
