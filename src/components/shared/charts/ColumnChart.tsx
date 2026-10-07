import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFormatters } from "@/utils/format";
import type { Granularity } from "@/types/analytics";
import { CHART_COLORS, TICK_STYLE, type SeriesDef } from "./chartTokens";
import { ChartTooltip } from "./ChartTooltip";
import { niceTicks } from "./scale";

export interface ColumnSeriesDef extends SeriesDef {
  /** Bazaviy chiziqdan pastga chiziladi (masalan, ketgan obunalar) — diverging grafik. */
  below?: boolean;
}

interface ColumnChartProps<T extends { date: string }> {
  data: T[];
  series: ColumnSeriesDef[];
  granularity: Granularity;
  /** true — seriyalar bitta ustunda ustma-ust (qism-butun). */
  stacked?: boolean;
  /** Qiymatlar butun son (soni) — o'q qadami kasr bo'lmaydi. */
  integer?: boolean;
  formatValue: (value: number) => string;
  formatAxis: (value: number) => string;
  height?: number;
}

const ROUND_UP: [number, number, number, number] = [4, 4, 0, 0];
const ROUND_DOWN: [number, number, number, number] = [0, 0, 4, 4];
const SQUARE: [number, number, number, number] = [0, 0, 0, 0];

/**
 * Ustunli grafik: ≤ 24px ustun, ma'lumot uchi 4px yumaloq, bazada to'g'ri burchak; ustma-ust
 * segmentlar orasida 2px sirt rangidagi bo'shliq. `below` seriyalar bazadan pastga — bitta o'q.
 */
export function ColumnChart<T extends { date: string }>({
  data,
  series,
  granularity,
  stacked = false,
  integer = false,
  formatValue,
  formatAxis,
  height = 260,
}: ColumnChartProps<T>) {
  const fmt = useFormatters();
  const hasBelow = series.some((item) => item.below);

  // O'q chegaralari: ustma-ust bo'lsa — har ustunning yig'indisi, aks holda — eng katta bitta ustun.
  const ticks = useMemo(() => {
    let low = 0;
    let high = 0;
    for (const row of data) {
      const value = (key: string) => Number((row as Record<string, unknown>)[key] ?? 0);
      const above = series.filter((item) => !item.below).map((item) => value(item.key));
      const below = series.filter((item) => item.below).map((item) => value(item.key));
      const join = (values: number[]) =>
        stacked || hasBelow ? values.reduce((sum, v) => sum + v, 0) : Math.max(0, ...values);
      high = Math.max(high, join(above));
      low = Math.min(low, -join(below));
    }
    return niceTicks(low, high, { integer });
  }, [data, series, stacked, hasBelow, integer]);

  // Pastga chiziladigan seriyalar manfiyga aylantiriladi; tooltip absolyut qiymatni ko'rsatadi.
  const chartData = useMemo(
    () =>
      hasBelow
        ? data.map((row) => {
            const copy: Record<string, unknown> = { ...row };
            for (const item of series) {
              if (item.below) copy[item.key] = -Number((row as Record<string, unknown>)[item.key] ?? 0);
            }
            return copy;
          })
        : (data as Record<string, unknown>[]),
    [data, series, hasBelow],
  );

  // Ustma-ust bo'lsa faqat eng chetki segment yumaloqlanadi (har yo'nalishda).
  const lastAbove = series.map((item) => !item.below).lastIndexOf(true);
  const lastBelow = series.map((item) => !!item.below).lastIndexOf(true);
  const radiusOf = (index: number, below: boolean) => {
    if (!stacked) return below ? ROUND_DOWN : ROUND_UP;
    if (below) return index === lastBelow ? ROUND_DOWN : SQUARE;
    return index === lastAbove ? ROUND_UP : SQUARE;
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barCategoryGap="24%"
          barGap={2}
          stackOffset={hasBelow ? "sign" : undefined}
        >
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => fmt.bucketTick(value, granularity)}
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.axis }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(value: number) => formatAxis(Math.abs(value))}
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            width={72}
            ticks={ticks}
            domain={[ticks[0], ticks[ticks.length - 1]]}
            interval={0}
          />
          {hasBelow && <ReferenceLine y={0} stroke={CHART_COLORS.axis} />}
          <Tooltip
            cursor={{ fill: CHART_COLORS.cursor, opacity: 0.6 }}
            content={(props) => (
              <ChartTooltip
                {...props}
                formatValue={formatValue}
                formatLabel={(label) => fmt.bucketLabel(label, granularity)}
              />
            )}
          />
          {series.map((item, index) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color}
              stackId={stacked || hasBelow ? "stack" : undefined}
              maxBarSize={24}
              radius={radiusOf(index, !!item.below)}
              // 2px sirt rangidagi bo'shliq — faqat bir-biriga tegib turgan segmentlar uchun.
              stroke={stacked ? CHART_COLORS.surface : undefined}
              strokeWidth={stacked ? 2 : 0}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
