import { useTranslation } from "react-i18next";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { TimeSeriesChart } from "@/components/shared/charts/TimeSeriesChart";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import { useFormatters } from "@/utils/format";
import type { RetentionResponse } from "@/api/retention/retention.types";

interface RetentionCurveProps {
  data: RetentionResponse;
  className?: string;
}

/** O'rtacha ushlab qolish egri chizig'i: X — kohortadan keyingi davr raqami (sana emas). */
export function RetentionCurve({ data, className }: RetentionCurveProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  // TimeSeriesChart X kalitini `date` deb kutadi — bu yerda u davr raqami (0, 1, 2 …).
  const points = data.average.flatMap((value, k) => (value === null ? [] : [{ date: String(k), retention: value }]));
  const periodLabel = (k: string) => t(`sections.retention.curve.${data.granularity}`, { count: Number(k) });
  const rows = points.map((point, index) => ({ id: index, ...point }));

  return (
    <ChartCard
      className={className}
      title={t("sections.retention.curve.title")}
      subtitle={t("sections.retention.curve.subtitle")}
      table={{
        rows,
        columns: [
          { key: "date", header: t("charts.table.date"), render: (row) => periodLabel(row.date) },
          {
            key: "retention",
            header: t("sections.retention.curve.series"),
            align: "right",
            render: (row) => fmt.percent(row.retention),
          },
        ],
      }}
    >
      <TimeSeriesChart
        data={points}
        series={[{ key: "retention", label: t("sections.retention.curve.series"), color: SERIES_COLORS[0] }]}
        granularity="day"
        formatValue={fmt.percent}
        formatAxis={fmt.percent}
        formatTick={(k) => k}
        formatLabel={periodLabel}
      />
    </ChartCard>
  );
}
