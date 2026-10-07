import { useTranslation } from "react-i18next";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { ColumnChart } from "@/components/shared/charts/ColumnChart";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import { useFormatters } from "@/utils/format";
import { PLATFORMS, type Platform } from "@/types/domain";
import type { GrowthSummaryResponse } from "@/api/growth/growth.types";

/** Rang platformaga bog'langan: Telegram — 1-slot, Web — 2, PWA — 3. */
export const PLATFORM_COLORS: Record<Platform, string> = {
  telegram: SERIES_COLORS[0],
  web: SERIES_COLORS[1],
  pwa: SERIES_COLORS[2],
};

interface SignupsChartProps {
  data: GrowthSummaryResponse;
  className?: string;
}

/** Ro'yxatdan o'tishlar platformalar bo'yicha ustma-ust (qism-butun). */
export function SignupsChart({ data, className }: SignupsChartProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const series = PLATFORMS.map((platform) => ({
    key: platform,
    label: t(`domain.platform.${platform}`),
    color: PLATFORM_COLORS[platform],
  }));
  const rows = data.signups_series.map((point, index) => ({ id: index, ...point }));

  return (
    <ChartCard
      className={className}
      title={t("sections.growth.signups.title")}
      subtitle={t("sections.growth.signups.subtitle")}
      legend={series.map((item) => ({ label: item.label, color: item.color, shape: "rect" }))}
      table={{
        rows,
        columns: [
          { key: "date", header: t("charts.table.date"), render: (row) => fmt.bucketLabel(row.date, data.granularity) },
          ...PLATFORMS.map((platform) => ({
            key: platform,
            header: t(`domain.platform.${platform}`),
            align: "right" as const,
            render: (row: (typeof rows)[number]) => fmt.number(row[platform]),
          })),
          { key: "total", header: t("charts.table.total"), align: "right", render: (row) => fmt.number(row.total) },
        ],
      }}
    >
      <ColumnChart
        data={data.signups_series}
        series={series}
        stacked
        integer
        granularity={data.granularity}
        formatValue={fmt.number}
        formatAxis={fmt.compact}
      />
    </ChartCard>
  );
}
