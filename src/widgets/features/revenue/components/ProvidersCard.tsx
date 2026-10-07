import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { PaymentStatusBadge } from "@/components/shared/badges/StatusBadges";
import { useFormatters } from "@/utils/format";
import type { PaymentsSummaryResponse } from "@/api/payments/payments.types";
import { PROVIDER_COLORS } from "../lib/providerColors";

interface ProvidersCardProps {
  providers: PaymentsSummaryResponse["providers"];
  statuses: PaymentsSummaryResponse["statuses"];
}

/** Payme va Click solishtiruvi + barcha to'lovlar holatlari bo'yicha. */
export function ProvidersCard({ providers, statuses }: ProvidersCardProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <CusCardbox className="flex flex-col gap-5 rounded-card p-5">
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-primary">{t("sections.revenue.providers.title")}</h2>
        {providers.map((item) => (
          <div key={item.provider} className="flex flex-col gap-1.5 rounded-input bg-canvas p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium text-primary">
                <span aria-hidden className="size-2.5 rounded-sm" style={{ background: PROVIDER_COLORS[item.provider] }} />
                {t(`domain.provider.${item.provider}`)}
              </span>
              <span className="font-semibold text-primary">{fmt.moneyCompact(item.revenue)}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-secondary">
              <span>
                {t("sections.revenue.providers.paid")}: <span className="text-primary">{fmt.number(item.paid)}</span>
              </span>
              <span>
                {t("sections.revenue.providers.failed")}: <span className="text-primary">{fmt.number(item.failed)}</span>
              </span>
              <span>
                {t("sections.revenue.providers.successRate")}:{" "}
                <span className="text-primary">{item.success_rate === null ? "—" : fmt.percent(item.success_rate)}</span>
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <div>
          <h2 className="font-semibold text-primary">{t("sections.revenue.statuses.title")}</h2>
          <p className="mt-0.5 text-xs text-secondary">{t("sections.revenue.statuses.subtitle")}</p>
        </div>
        <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
          {statuses.map((item) => (
            <li key={item.status} className="flex items-center justify-between gap-3 py-2 text-sm">
              <PaymentStatusBadge status={item.status} />
              <span className="tabular-nums">
                <span className="font-semibold text-primary">{fmt.number(item.count)}</span>
                <span className="ml-2 text-xs text-secondary">{fmt.moneyCompact(item.amount)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </CusCardbox>
  );
}
