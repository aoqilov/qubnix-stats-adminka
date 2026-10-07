import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFormatters } from "@/utils/format";
import type { Granularity } from "@/types/analytics";
import { CHART_COLORS, TICK_STYLE, type SeriesDef } from "./chartTokens";
import { ChartTooltip } from "./ChartTooltip";
import { niceTicks } from "./scale";

interface TimeSeriesChartProps<T extends { date: string }> {
  data: T[];
  series: SeriesDef[];
  granularity: Granularity;
  /** Tooltip qiymati (to'liq). */
  formatValue: (value: number) => string;
  /** Y o'qi belgisi (qisqa). */
  formatAxis: (value: number) => string;
  /** X o'qi belgisi — berilmasa `date` granularity bo'yicha sana sifatida formatlanadi. */
  formatTick?: (x: string) => string;
  /** Tooltip sarlavhasi — berilmasa davr qadami (sana oralig'i). */
  formatLabel?: (x: string) => string;
  height?: number;
}

/**
 * Vaqt bo'yicha trend: 2px chiziq + ~10% yuvilgan maydon, vertikal crosshair eng yaqin
 * nuqtaga yopishadi, tooltip barcha seriyalarni ko'rsatadi. Bitta Y o'qi.
 */
export function TimeSeriesChart<T extends { date: string }>({
  data,
  series,
  granularity,
  formatValue,
  formatAxis,
  formatTick,
  formatLabel,
  height = 260,
}: TimeSeriesChartProps<T>) {
  const fmt = useFormatters();
  const values = data.flatMap((row) =>
    series.map((item) => Number((row as Record<string, unknown>)[item.key] ?? 0)),
  );
  const ticks = niceTicks(Math.min(0, ...values), Math.max(0, ...values));

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => (formatTick ? formatTick(value) : fmt.bucketTick(value, granularity))}
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.axis }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={formatAxis}
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            width={72}
            ticks={ticks}
            domain={[ticks[0], ticks[ticks.length - 1]]}
            interval={0}
          />
          <Tooltip
            cursor={{ stroke: CHART_COLORS.tick, strokeWidth: 1 }}
            content={(props) => (
              <ChartTooltip
                {...props}
                formatValue={formatValue}
                formatLabel={(label) => (formatLabel ? formatLabel(label) : fmt.bucketLabel(label, granularity))}
              />
            )}
          />
          {series.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2}
              fill={item.color}
              fillOpacity={0.1}
              dot={false}
              activeDot={{ r: 4, stroke: CHART_COLORS.surface, strokeWidth: 2, fill: item.color }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
