import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusSegment } from "@/components/ui/segment/CusSegment";
import { CusTable } from "@/components/ui/table/CusTable";
import { CusPagination } from "@/components/ui/table/CusPagination";
import { CusBadge } from "@/components/ui/badge/CusBadge";
import { HealthBadge } from "@/components/shared/badges/StatusBadges";
import { useFormatters } from "@/utils/format";
import { PLAN_NAMES } from "@/types/domain";
import type { TariffsSummaryResponse } from "@/api/tariffs/tariffs.types";
import { useExpiringSubscriptions } from "../hooks/useApiTariffs";

const PAGE_SIZE = 10;
/** Shuncha kun yoki kamroq qolsa — ogohlantirish rangida. */
const URGENT_DAYS = 3;

/** Bugun faol va yaqin kunlarda yangilanishi kerak bo'lgan obunalar (davr filtriga bog'liq emas). */
export function ExpiringSubscriptions({ summary }: { summary: TariffsSummaryResponse["expiring"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [days, setDays] = useState<7 | 30>(7);
  const [page, setPage] = useState(1);
  const query = useExpiringSubscriptions({ days, page, limit: PAGE_SIZE });

  const count = days === 7 ? summary.in_7_days : summary.in_30_days;
  const mrr = days === 7 ? summary.mrr_7_days : summary.mrr_30_days;
  const rows = (query.data?.subscriptions ?? []).map((item) => ({ id: item.org_id, ...item }));

  return (
    <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-primary">{t("sections.tariffs.expiring.title")}</h2>
          <p className="mt-0.5 text-xs text-secondary">{t("sections.tariffs.expiring.subtitle")}</p>
        </div>
        <CusSegment
          items={[
            { id: "7", label: t("sections.tariffs.expiring.days7") },
            { id: "30", label: t("sections.tariffs.expiring.days30") },
          ]}
          value={String(days)}
          onValueChange={(value) => {
            setDays(value === "30" ? 30 : 7);
            setPage(1);
          }}
          size="xs"
          layout="inline"
          accent="var(--brand-default)"
        />
      </div>

      <div className="flex flex-wrap gap-8">
        <div>
          <div className="text-xs text-secondary">{t("sections.tariffs.expiring.count")}</div>
          <div className="text-2xl font-semibold text-primary">{fmt.number(count)}</div>
        </div>
        <div>
          <div className="text-xs text-secondary">{t("sections.tariffs.expiring.mrr")}</div>
          <div className="text-2xl font-semibold text-primary">{fmt.moneyCompact(mrr)}</div>
        </div>
      </div>

      <div style={{ opacity: query.isPlaceholderData ? 0.55 : 1 }} className="transition-opacity">
        <CusTable
          size="sm"
          isLoading={query.isLoading}
          data={rows}
          columns={[
            {
              key: "org_name",
              header: t("sections.tariffs.expiring.columns.org"),
              render: (row) => (
                <div className="flex flex-col">
                  <span className="font-medium text-primary">{row.org_name}</span>
                  <span className="text-xs text-secondary">{row.owner_name}</span>
                </div>
              ),
            },
            {
              key: "plan",
              header: t("sections.tariffs.expiring.columns.plan"),
              render: (row) => (
                <div className="flex flex-col">
                  <span className="text-primary">{PLAN_NAMES[row.plan]}</span>
                  <span className="text-xs text-secondary">{t(`domain.billing.${row.billing}`)}</span>
                </div>
              ),
            },
            { key: "ends_at", header: t("sections.tariffs.expiring.columns.ends"), render: (row) => fmt.date(row.ends_at) },
            {
              key: "days_left",
              header: t("sections.tariffs.expiring.columns.daysLeft"),
              render: (row) => (
                <CusBadge tone={row.days_left <= URGENT_DAYS ? "warning" : "neutral"}>
                  {t("common.units.days", { count: row.days_left })}
                </CusBadge>
              ),
            },
            {
              key: "mrr",
              header: t("sections.tariffs.expiring.columns.mrr"),
              align: "right",
              render: (row) => <span className="tabular-nums">{fmt.money(row.mrr)}</span>,
            },
            {
              key: "period_number",
              header: t("sections.tariffs.expiring.columns.period"),
              align: "right",
              render: (row) => <span className="tabular-nums">{row.period_number}</span>,
            },
            {
              key: "health",
              header: t("sections.tariffs.expiring.columns.health"),
              render: (row) => <HealthBadge health={row.health} />,
            },
          ]}
        />
      </div>

      {count > PAGE_SIZE && (
        <CusPagination count={count} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
      )}
    </CusCardbox>
  );
}
