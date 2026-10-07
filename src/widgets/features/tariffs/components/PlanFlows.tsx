import { useTranslation } from "react-i18next";
import { LuArrowRight, LuTrendingDown, LuTrendingUp } from "react-icons/lu";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { useFormatters } from "@/utils/format";
import { PLAN_NAMES, PLAN_RANK } from "@/types/domain";
import type { TariffsSummaryResponse } from "@/api/tariffs/tariffs.types";

/** Davrdagi tariflar orasidagi o'tishlar: yuqoriga (yashil, ↗) va pastga (qizil, ↘) — belgi + rang. */
export function PlanFlows({ flows }: { flows: TariffsSummaryResponse["flows"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <CusCardbox className="flex flex-col gap-3 rounded-card p-5">
      <div>
        <h2 className="font-semibold text-primary">{t("sections.tariffs.flows.title")}</h2>
        <p className="mt-0.5 text-xs text-secondary">{t("sections.tariffs.flows.subtitle")}</p>
      </div>

      {flows.length === 0 ? (
        <p className="py-6 text-center text-sm text-secondary">{t("sections.tariffs.flows.empty")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
          {flows.map((flow) => {
            const up = PLAN_RANK[flow.to] > PLAN_RANK[flow.from];
            const Icon = up ? LuTrendingUp : LuTrendingDown;
            return (
              <li key={`${flow.from}-${flow.to}`} className="flex items-center gap-3 py-2.5">
                <Icon size={16} aria-hidden className={`flex-none ${up ? "text-success-strong" : "text-error-strong"}`} />
                <span className="flex flex-1 items-center gap-1.5 text-sm text-primary">
                  {PLAN_NAMES[flow.from]}
                  <LuArrowRight size={14} aria-hidden className="text-secondary" />
                  {PLAN_NAMES[flow.to]}
                </span>
                <span className="font-semibold tabular-nums text-primary">{fmt.number(flow.orgs)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </CusCardbox>
  );
}
