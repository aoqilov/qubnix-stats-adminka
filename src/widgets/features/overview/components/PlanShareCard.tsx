import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { BarList } from "@/components/shared/charts/BarList";
import { useFormatters } from "@/utils/format";
import { ratio } from "@/utils/metrics";
import { PLAN_NAMES } from "@/types/domain";
import type { OverviewResponse } from "@/api/overview/overview.types";

/** Davr oxirida tariflar bo'yicha kompaniyalar va MRR — kam kategoriya, qiymatlar yozilgan. */
export function PlanShareCard({ plans }: { plans: OverviewResponse["plan_share"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const totalOrgs = plans.reduce((sum, plan) => sum + plan.orgs, 0);
  const paid = plans.filter((plan) => plan.plan !== "start");

  return (
    <CusCardbox className="flex flex-col gap-5 rounded-card p-5">
      <h2 className="font-semibold text-primary">{t("sections.overview.plans.title")}</h2>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-secondary">
          {t("sections.overview.plans.orgs")}
        </h3>
        <BarList
          items={plans.map((plan) => ({
            key: plan.plan,
            label: PLAN_NAMES[plan.plan],
            value: plan.orgs,
            display: fmt.number(plan.orgs),
            note: fmt.percent(ratio(plan.orgs, totalOrgs) ?? 0),
          }))}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-secondary">
          {t("sections.overview.plans.mrr")}
        </h3>
        <BarList
          items={paid.map((plan) => ({
            key: plan.plan,
            label: PLAN_NAMES[plan.plan],
            value: plan.mrr,
            display: fmt.moneyCompact(plan.mrr),
          }))}
        />
      </section>
    </CusCardbox>
  );
}
