import { useTranslation } from "react-i18next";
import { KpiTile } from "@/components/shared/kpi/KpiTile";
import { useFormatters } from "@/utils/format";
import type { PaymentsSummaryResponse } from "@/api/payments/payments.types";

export function RevenueKpis({ kpis }: { kpis: PaymentsSummaryResponse["kpis"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
      <KpiTile label={t("sections.revenue.kpi.revenue")} kpi={kpis.revenue} format={fmt.moneyCompact} />
      <KpiTile label={t("sections.revenue.kpi.paid")} kpi={kpis.paid_count} format={fmt.number} />
      <KpiTile
        label={t("sections.revenue.kpi.successRate")}
        kpi={kpis.success_rate}
        format={fmt.percent}
        mode="points"
        hint={t("sections.revenue.kpi.successRateHint")}
      />
      <KpiTile
        label={t("sections.revenue.kpi.arpa")}
        kpi={kpis.arpa}
        format={fmt.moneyCompact}
        hint={t("sections.revenue.kpi.arpaHint")}
      />
      <KpiTile label={t("sections.revenue.kpi.averageCheck")} kpi={kpis.average_check} format={fmt.moneyCompact} />
    </div>
  );
}
