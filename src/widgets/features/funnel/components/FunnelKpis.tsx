import { useTranslation } from "react-i18next";
import { KpiTile } from "@/components/shared/kpi/KpiTile";
import { useFormatters } from "@/utils/format";
import { ratio } from "@/utils/metrics";
import type { FunnelResponse, FunnelStepKey } from "@/api/funnel/funnel.types";

export function FunnelKpis({ steps }: { steps: FunnelResponse["steps"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const step = (key: FunnelStepKey) => steps.find((item) => item.key === key)!;
  const kpiOf = (key: FunnelStepKey) => ({ value: step(key).count, previous: step(key).previous });
  const start = step("bot_start");
  const paid = step("paid");

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <KpiTile label={t("sections.funnel.kpi.starts")} kpi={kpiOf("bot_start")} format={fmt.number} />
      <KpiTile label={t("sections.funnel.kpi.registered")} kpi={kpiOf("registered")} format={fmt.number} />
      <KpiTile
        label={t("sections.funnel.kpi.paid")}
        kpi={kpiOf("paid")}
        format={fmt.number}
        hint={t("sections.funnel.kpi.maturingHint")}
      />
      <KpiTile
        hint={t("sections.funnel.kpi.maturingHint")}
        label={t("sections.funnel.kpi.conversion")}
        kpi={{
          value: ratio(paid.count, start.count),
          previous: paid.previous === null || start.previous === null ? null : ratio(paid.previous, start.previous),
        }}
        format={fmt.percent}
        mode="points"
      />
    </div>
  );
}
