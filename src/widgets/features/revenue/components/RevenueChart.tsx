import { useTranslation } from "react-i18next";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { ColumnChart } from "@/components/shared/charts/ColumnChart";
import { useFormatters } from "@/utils/format";
import { PAYMENT_PROVIDERS } from "@/types/domain";
import type { PaymentsSummaryResponse } from "@/api/payments/payments.types";
import { PROVIDER_COLORS } from "../lib/providerColors";

interface RevenueChartProps {
  data: PaymentsSummaryResponse;
  className?: string;
}

/** Daromad qadamlar bo'yicha, to'lov tizimlari ustma-ust (qism-butun). */
export function RevenueChart({ data, className }: RevenueChartProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const series = PAYMENT_PROVIDERS.map((provider) => ({
    key: provider,
    label: t(`domain.provider.${provider}`),
    color: PROVIDER_COLORS[provider],
  }));
  const rows = data.revenue_series.map((point, index) => ({ id: index, ...point }));

  return (
    <ChartCard
      className={className}
      title={t("sections.revenue.chart.title")}
      subtitle={t("sections.revenue.chart.subtitle")}
      legend={series.map((item) => ({ label: item.label, color: item.color, shape: "rect" }))}
      table={{
        rows,
        columns: [
          { key: "date", header: t("charts.table.date"), render: (row) => fmt.bucketLabel(row.date, data.granularity) },
          ...series.map((item) => ({
            key: item.key,
            header: item.label,
            align: "right" as const,
            render: (row: (typeof rows)[number]) => fmt.money(row[item.key as "payme" | "click"]),
          })),
          { key: "total", header: t("charts.table.total"), align: "right", render: (row) => fmt.money(row.total) },
        ],
      }}
    >
      <ColumnChart
        data={data.revenue_series}
        series={series}
        stacked
        granularity={data.granularity}
        formatValue={fmt.money}
        formatAxis={fmt.compact}
      />
    </ChartCard>
  );
}
