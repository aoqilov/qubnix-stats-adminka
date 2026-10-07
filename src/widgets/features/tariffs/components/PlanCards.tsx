import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { useFormatters } from "@/utils/format";
import type { TariffPlan } from "@/types/domain";
import type { TariffsSummaryResponse } from "@/api/tariffs/tariffs.types";

interface PlanCardsProps {
  plans: TariffPlan[];
  distribution: TariffsSummaryResponse["distribution"];
}

/** Har tarif: davr oxiridagi kompaniyalar, ulush, MRR, to'lov turi va katalogdagi narx/limitlar. */
export function PlanCards({ plans, distribution }: PlanCardsProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const limitText = (value: number | null) => (value === null ? t("sections.tariffs.plan.unlimited") : fmt.number(value));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {distribution.map((item) => {
        const plan = plans.find((candidate) => candidate.id === item.plan);
        if (!plan) return null;
        const isFree = plan.price_monthly === 0;
        return (
          <CusCardbox key={item.plan} className="flex flex-col gap-3 rounded-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-condensed text-2xl font-semibold text-primary">{plan.name}</h2>
              <span className="text-xs text-secondary">
                {isFree
                  ? t("sections.tariffs.plan.free")
                  : `${t("sections.tariffs.plan.perMonth", { price: fmt.money(plan.price_monthly) })} · ${t(
                      "sections.tariffs.plan.perYear",
                      { price: fmt.money(plan.price_yearly) },
                    )}`}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-3xl font-semibold text-primary">{fmt.number(item.orgs)}</span>
              <span className="text-sm text-secondary">{t("sections.tariffs.plan.orgs")}</span>
              <span className="ml-auto text-sm text-secondary">
                {t("sections.tariffs.plan.share", { value: fmt.percent(item.share) })}
              </span>
            </div>

            {!isFree && (
              <div className="flex flex-col gap-1 border-t border-subtle pt-3 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-secondary">{t("sections.tariffs.plan.mrr")}</span>
                  <span className="font-semibold text-primary">{fmt.moneyCompact(item.mrr)}</span>
                </div>
                <span className="text-xs text-secondary">
                  {t("sections.tariffs.plan.billingSplit", {
                    monthly: fmt.number(item.monthly),
                    yearly: fmt.number(item.yearly),
                  })}
                </span>
              </div>
            )}

            <p className="mt-auto border-t border-subtle pt-3 text-xs leading-relaxed text-secondary">
              {t("sections.tariffs.plan.limits", {
                members: limitText(plan.limits.members),
                projects: limitText(plan.limits.projects),
                routines: limitText(plan.limits.routines),
                stats: t(`domain.statsDepth.${plan.limits.stats}`),
              })}
            </p>
          </CusCardbox>
        );
      })}
    </div>
  );
}
