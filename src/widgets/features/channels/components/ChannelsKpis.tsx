import { useTranslation } from "react-i18next";
import { KpiTile } from "@/components/shared/kpi/KpiTile";
import { useFormatters } from "@/utils/format";
import type { ChannelsSummaryResponse } from "@/api/channels/channels.types";

export function ChannelsKpis({ totals }: { totals: ChannelsSummaryResponse["totals"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <KpiTile label={t("sections.channels.kpi.leads")} kpi={totals.leads} format={fmt.number} />
      <KpiTile label={t("sections.channels.kpi.signups")} kpi={totals.signups} format={fmt.number} />
      <KpiTile label={t("sections.channels.kpi.paying")} kpi={totals.paying} format={fmt.number} />
      <KpiTile
        label={t("sections.channels.kpi.spend")}
        kpi={totals.spend}
        format={fmt.moneyCompact}
        goodWhenUp="neutral"
      />
      <KpiTile
        label={t("sections.channels.kpi.cac")}
        kpi={totals.cac}
        format={fmt.moneyCompact}
        goodWhenUp={false}
        hint={t("sections.channels.kpi.cacHint")}
      />
      <KpiTile
        label={t("sections.channels.kpi.romi")}
        kpi={totals.romi}
        format={fmt.percent}
        mode="points"
        hint={t("sections.channels.kpi.romiHint")}
      />
    </div>
  );
}
