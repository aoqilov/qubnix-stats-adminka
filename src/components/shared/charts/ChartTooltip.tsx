import type { TooltipContentProps } from "recharts";

interface ChartTooltipProps {
  /** recharts beradigan holat. */
  active?: boolean;
  payload?: TooltipContentProps<number, string>["payload"];
  label?: string | number;
  formatValue: (value: number) => string;
  formatLabel: (label: string) => string;
}

/**
 * Bitta tooltip — shu nuqtadagi barcha seriyalar. Qiymat oldinda va qalin, seriya nomi
 * ikkinchi darajali; kalit — seriya rangidagi qisqa chiziq. Matn React orqali (escape).
 */
export function ChartTooltip({ active, payload, label, formatValue, formatLabel }: ChartTooltipProps) {
  if (!active || !payload?.length || label === undefined) return null;

  return (
    <div className="min-w-[160px] rounded-input border border-default bg-canvas px-3 py-2 text-xs shadow-dropdown">
      <div className="mb-1.5 text-secondary">{formatLabel(String(label))}</div>
      <ul className="flex flex-col gap-1">
        {payload.map((item) => (
          <li key={String(item.dataKey)} className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-3 flex-none rounded-chip" style={{ background: item.color }} />
            <span className="font-semibold tabular-nums text-primary">
              {formatValue(Math.abs(Number(item.value ?? 0)))}
            </span>
            <span className="truncate text-secondary">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
