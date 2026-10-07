import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { KpiTile } from "@/components/shared/kpi/KpiTile";
import { useFormatters } from "@/utils/format";
import type { GrowthSummaryResponse } from "@/api/growth/growth.types";

function Group({ title, children, columns }: { title: string; children: ReactNode; columns: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium uppercase tracking-wide text-secondary">{title}</h2>
      <div className={`grid grid-cols-2 gap-4 ${columns}`}>{children}</div>
    </section>
  );
}

export function GrowthKpis({ kpis }: { kpis: GrowthSummaryResponse["kpis"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <div className="flex flex-col gap-5">
      <Group title={t("sections.growth.groups.signups")} columns="lg:grid-cols-3">
        <KpiTile label={t("sections.growth.kpi.newUsers")} kpi={kpis.new_users} format={fmt.number} />
        <KpiTile label={t("sections.growth.kpi.newOrgs")} kpi={kpis.new_orgs} format={fmt.number} />
        <KpiTile
          label={t("sections.growth.kpi.invitedShare")}
          kpi={kpis.invited_share}
          format={fmt.percent}
          mode="points"
          goodWhenUp="neutral"
          hint={t("sections.growth.kpi.invitedShareHint")}
        />
      </Group>
      <Group title={t("sections.growth.groups.activity")} columns="lg:grid-cols-4">
        <KpiTile label={t("sections.growth.kpi.dau")} kpi={kpis.dau} format={fmt.number} />
        <KpiTile
          label={t("sections.growth.kpi.wau")}
          kpi={kpis.wau}
          format={fmt.number}
          hint={t("sections.growth.kpi.wauHint")}
        />
        <KpiTile
          label={t("sections.growth.kpi.mau")}
          kpi={kpis.mau}
          format={fmt.number}
          hint={t("sections.growth.kpi.mauHint")}
        />
        <KpiTile
          label={t("sections.growth.kpi.stickiness")}
          kpi={kpis.stickiness}
          format={fmt.percent}
          mode="points"
          hint={t("sections.growth.kpi.stickinessHint")}
        />
      </Group>
    </div>
  );
}
