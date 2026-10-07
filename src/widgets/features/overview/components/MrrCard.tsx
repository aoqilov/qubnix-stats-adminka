import { useTranslation } from "react-i18next";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { TimeSeriesChart } from "@/components/shared/charts/TimeSeriesChart";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import { kpiDelta } from "@/components/shared/kpi/KpiTile";
import { CusStatDelta } from "@/components/ui/stat-tile/CusStatTile";
import { useFormatters } from "@/utils/format";
import type { OverviewResponse } from "@/api/overview/overview.types";

interface MrrCardProps {
  data: OverviewResponse;
  className?: string;
}

/** Sahifaning bosh raqami (MRR) va uning dinamikasi — bitta seriya, legend shart emas. */
export function MrrCard({ data, className }: MrrCardProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { mrr, arr } = data.kpis;
  const rows = data.mrr_series.map((point, index) => ({ id: index, ...point }));

  return (
    <ChartCard
      className={className}
      title={t("sections.overview.mrr.title")}
      subtitle={t("sections.overview.mrr.subtitle")}
      headline={
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-5xl font-semibold leading-none text-primary">
              {mrr.value === null ? "—" : fmt.moneyCompact(mrr.value)}
            </span>
            {arr.value !== null && (
              <span className="text-sm text-secondary">
                {t("sections.overview.mrr.arr", { value: fmt.moneyCompact(arr.value) })}
              </span>
            )}
          </div>
          <CusStatDelta
            delta={kpiDelta(mrr, fmt, {})}
            previous={mrr.previous === null ? null : fmt.moneyCompact(mrr.previous)}
          />
        </div>
      }
      table={{
        rows,
        columns: [
          { key: "date", header: t("charts.table.date"), render: (row) => fmt.bucketLabel(row.date, data.granularity) },
          { key: "mrr", header: t("sections.overview.mrr.series"), align: "right", render: (row) => fmt.money(row.mrr) },
          {
            key: "paying_orgs",
            header: t("sections.overview.mrr.paying"),
            align: "right",
            render: (row) => fmt.number(row.paying_orgs),
          },
        ],
      }}
    >
      <TimeSeriesChart
        data={data.mrr_series}
        series={[{ key: "mrr", label: t("sections.overview.mrr.series"), color: SERIES_COLORS[0] }]}
        granularity={data.granularity}
        formatValue={fmt.money}
        formatAxis={fmt.compact}
      />
    </ChartCard>
  );
}
