import { useTranslation } from "react-i18next";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { TimeSeriesChart } from "@/components/shared/charts/TimeSeriesChart";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import { useFormatters } from "@/utils/format";
import type { GrowthSummaryResponse } from "@/api/growth/growth.types";

interface ActiveUsersChartProps {
  data: GrowthSummaryResponse;
  className?: string;
}

/** DAU dinamikasi — bitta seriya, legend shart emas. */
export function ActiveUsersChart({ data, className }: ActiveUsersChartProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const rows = data.active_series.map((point, index) => ({ id: index, ...point }));

  return (
    <ChartCard
      className={className}
      title={t("sections.growth.active.title")}
      subtitle={t("sections.growth.active.subtitle")}
      table={{
        rows,
        columns: [
          { key: "date", header: t("charts.table.date"), render: (row) => fmt.bucketLabel(row.date, data.granularity) },
          { key: "dau", header: t("sections.growth.active.series"), align: "right", render: (row) => fmt.number(row.dau) },
        ],
      }}
    >
      <TimeSeriesChart
        data={data.active_series}
        series={[{ key: "dau", label: t("sections.growth.active.series"), color: SERIES_COLORS[0] }]}
        granularity={data.granularity}
        formatValue={fmt.number}
        formatAxis={fmt.compact}
      />
    </ChartCard>
  );
}
