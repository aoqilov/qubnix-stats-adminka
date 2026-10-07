import { useTranslation } from "react-i18next";
import { KpiTile } from "@/components/shared/kpi/KpiTile";
import { useFormatters } from "@/utils/format";
import type { TariffsSummaryResponse } from "@/api/tariffs/tariffs.types";

export function MovementKpis({ movements }: { movements: TariffsSummaryResponse["movements"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <KpiTile label={t("sections.tariffs.movements.new")} kpi={movements.new} format={fmt.number} />
      <KpiTile label={t("sections.tariffs.movements.renewals")} kpi={movements.renewals} format={fmt.number} />
      <KpiTile label={t("sections.tariffs.movements.upgrades")} kpi={movements.upgrades} format={fmt.number} />
      <KpiTile
        label={t("sections.tariffs.movements.downgrades")}
        kpi={movements.downgrades}
        format={fmt.number}
        goodWhenUp={false}
      />
      <KpiTile
        label={t("sections.tariffs.movements.churned")}
        kpi={movements.churned}
        format={fmt.number}
        goodWhenUp={false}
      />
      <KpiTile label={t("sections.tariffs.movements.net")} kpi={movements.net_paying} format={fmt.signedNumber} />
    </div>
  );
}
