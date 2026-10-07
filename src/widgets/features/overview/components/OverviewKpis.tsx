import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { KpiTile } from "@/components/shared/kpi/KpiTile";
import { useFormatters } from "@/utils/format";
import type { OverviewResponse } from "@/api/overview/overview.types";

function Group({ title, children, columns }: { title: string; children: ReactNode; columns: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wide text-secondary">{title}</h2>
      <div className={`grid grid-cols-2 gap-4 lg:grid-cols-3 ${columns}`}>{children}</div>
    </section>
  );
}

export function OverviewKpis({ kpis }: { kpis: OverviewResponse["kpis"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <div className="flex flex-col gap-5">
      <Group title={t("sections.overview.groups.money")} columns="xl:grid-cols-4">
        <KpiTile label={t("sections.overview.kpi.payingOrgs")} kpi={kpis.paying_orgs} format={fmt.number} />
        <KpiTile label={t("sections.overview.kpi.revenue")} kpi={kpis.revenue} format={fmt.moneyCompact} />
        <KpiTile
          label={t("sections.overview.kpi.conversion")}
          kpi={kpis.conversion}
          format={fmt.percent}
          mode="points"
          hint={t("sections.overview.kpi.conversionHint")}
        />
        <KpiTile
          label={t("sections.overview.kpi.churn")}
          kpi={kpis.churn_rate}
          format={fmt.percent}
          mode="points"
          goodWhenUp={false}
          hint={t("sections.overview.kpi.churnHint")}
        />
      </Group>

      <Group title={t("sections.overview.groups.audience")} columns="xl:grid-cols-5">
        <KpiTile label={t("sections.overview.kpi.newUsers")} kpi={kpis.new_users} format={fmt.number} />
        <KpiTile label={t("sections.overview.kpi.newOrgs")} kpi={kpis.new_orgs} format={fmt.number} />
        <KpiTile label={t("sections.overview.kpi.dau")} kpi={kpis.dau} format={fmt.number} />
        <KpiTile
          label={t("sections.overview.kpi.mau")}
          kpi={kpis.mau}
          format={fmt.number}
          hint={t("sections.overview.kpi.mauHint")}
        />
        <KpiTile
          label={t("sections.overview.kpi.stickiness")}
          kpi={kpis.stickiness}
          format={fmt.percent}
          mode="points"
          hint={t("sections.overview.kpi.stickinessHint")}
        />
      </Group>
    </div>
  );
}
