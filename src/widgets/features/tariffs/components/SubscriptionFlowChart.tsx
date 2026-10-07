import { useTranslation } from "react-i18next";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { ColumnChart } from "@/components/shared/charts/ColumnChart";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import { useFormatters } from "@/utils/format";
import type { TariffsSummaryResponse } from "@/api/tariffs/tariffs.types";

interface SubscriptionFlowChartProps {
  data: TariffsSummaryResponse;
  className?: string;
}

/** Diverging ustunlar: yangi obunalar bazadan yuqoriga, ketganlar — pastga (bitta o'q). */
export function SubscriptionFlowChart({ data, className }: SubscriptionFlowChartProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const series = [
    { key: "new", label: t("sections.tariffs.chart.new"), color: SERIES_COLORS[0] },
    { key: "churned", label: t("sections.tariffs.chart.churned"), color: SERIES_COLORS[1], below: true },
  ];
  const rows = data.series.map((point, index) => ({ id: index, ...point }));

  return (
    <ChartCard
      className={className}
      title={t("sections.tariffs.chart.title")}
      subtitle={t("sections.tariffs.chart.subtitle")}
      legend={series.map((item) => ({ label: item.label, color: item.color, shape: "rect" }))}
      table={{
        rows,
        columns: [
          { key: "date", header: t("charts.table.date"), render: (row) => fmt.bucketLabel(row.date, data.granularity) },
          { key: "new", header: t("sections.tariffs.chart.new"), align: "right", render: (row) => fmt.number(row.new) },
          {
            key: "churned",
            header: t("sections.tariffs.chart.churned"),
            align: "right",
            render: (row) => fmt.number(row.churned),
          },
          {
            key: "net",
            header: t("sections.tariffs.movements.net"),
            align: "right",
            render: (row) => fmt.signedNumber(row.new - row.churned),
          },
        ],
      }}
    >
      <ColumnChart
        data={data.series}
        series={series}
        integer
        granularity={data.granularity}
        formatValue={fmt.number}
        formatAxis={fmt.compact}
      />
    </ChartCard>
  );
}
