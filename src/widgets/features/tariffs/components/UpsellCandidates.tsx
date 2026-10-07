import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusSegment } from "@/components/ui/segment/CusSegment";
import { CusTable } from "@/components/ui/table/CusTable";
import { CusPagination } from "@/components/ui/table/CusPagination";
import { CusBadge } from "@/components/ui/badge/CusBadge";
import { CusMeter } from "@/components/ui/meter/CusMeter";
import { HealthBadge } from "@/components/shared/badges/StatusBadges";
import { useFormatters } from "@/utils/format";
import { PLAN_NAMES } from "@/types/domain";
import type { LimitKey, LimitUsage, UpsellParams } from "@/api/tariffs/tariffs.types";
import { useUpsellCandidates } from "../hooks/useApiTariffs";

const PAGE_SIZE = 10;
const LIMIT_KEYS: LimitKey[] = ["members", "projects", "routines"];

type PlanFilter = "all" | NonNullable<UpsellParams["plan"]>;

function LimitMeter({ usage }: { usage: LimitUsage }) {
  const { t } = useTranslation();
  const blocked = usage.limit !== null && usage.wanted > usage.limit;
  return (
    <CusMeter
      value={usage.used}
      max={usage.limit}
      tone={blocked ? "warning" : "brand"}
      // "нужно N" — faqat ehtiyoj hozirgi sondan katta bo'lsa (sobiq Business'da 53/2 o'zi yetarli).
      note={blocked && usage.wanted > usage.used ? t("sections.tariffs.upsell.wants", { count: usage.wanted }) : undefined}
    />
  );
}

/** Tarif limitiga urilgan faol kompaniyalar — kimga qaysi tarifni taklif qilish (bugungi holat). */
export function UpsellCandidates() {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [plan, setPlan] = useState<PlanFilter>("all");
  const [page, setPage] = useState(1);
  const query = useUpsellCandidates({ plan: plan === "all" ? undefined : plan, page, limit: PAGE_SIZE });
  const summary = query.data?.summary;
  const rows = (query.data?.candidates ?? []).map((item) => ({ id: item.org_id, ...item }));

  return (
    <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-primary">{t("sections.tariffs.upsell.title")}</h2>
          <p className="mt-0.5 text-xs text-secondary">{t("sections.tariffs.upsell.subtitle")}</p>
        </div>
        <CusSegment
          items={[
            { id: "all", label: t("sections.tariffs.upsell.all") },
            { id: "start", label: PLAN_NAMES.start },
            { id: "pro", label: PLAN_NAMES.pro },
          ]}
          value={plan}
          onValueChange={(value) => {
            setPlan(value as PlanFilter);
            setPage(1);
          }}
          size="xs"
          layout="inline"
          accent="var(--brand-default)"
        />
      </div>

      {summary && (
        <div className="flex flex-wrap items-end gap-8">
          <div>
            <div className="text-xs text-secondary">{t("sections.tariffs.upsell.total")}</div>
            <div className="text-2xl font-semibold text-primary">{fmt.number(summary.total)}</div>
          </div>
          <div>
            <div className="text-xs text-secondary">{t("sections.tariffs.upsell.potential")}</div>
            <div className="text-2xl font-semibold text-primary">{fmt.moneyCompact(summary.potential_mrr)}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-secondary">{t("sections.tariffs.upsell.byReason")}</div>
            <div className="flex flex-wrap gap-2">
              {LIMIT_KEYS.map((key) => (
                <CusBadge key={key} tone="neutral" size="md">
                  {t(`domain.limit.${key}`)}: {fmt.number(summary.by_reason[key])}
                </CusBadge>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ opacity: query.isPlaceholderData ? 0.55 : 1 }} className="transition-opacity">
        <CusTable
          size="sm"
          isLoading={query.isLoading}
          data={rows}
          columns={[
            {
              key: "org_name",
              header: t("sections.tariffs.upsell.columns.org"),
              render: (row) => (
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-medium text-primary">{row.org_name}</span>
                  <span className="text-xs text-secondary">{row.owner_name}</span>
                  {row.previous_plan && (
                    <CusBadge tone="info" size="xs">
                      {t("sections.tariffs.upsell.winBack", { plan: PLAN_NAMES[row.previous_plan] })}
                    </CusBadge>
                  )}
                </div>
              ),
            },
            { key: "plan", header: t("sections.tariffs.upsell.columns.plan"), render: (row) => PLAN_NAMES[row.plan] },
            {
              key: "members",
              header: t("sections.tariffs.upsell.columns.members"),
              render: (row) => <LimitMeter usage={row.members} />,
            },
            {
              key: "projects",
              header: t("sections.tariffs.upsell.columns.projects"),
              render: (row) => <LimitMeter usage={row.projects} />,
            },
            {
              key: "routines",
              header: t("sections.tariffs.upsell.columns.routines"),
              render: (row) => <LimitMeter usage={row.routines} />,
            },
            {
              key: "suggested_plan",
              header: t("sections.tariffs.upsell.columns.suggested"),
              render: (row) => (
                <CusBadge tone="brand" variant="solid">
                  {PLAN_NAMES[row.suggested_plan]}
                </CusBadge>
              ),
            },
            {
              key: "activity_score",
              header: t("sections.tariffs.upsell.columns.activity"),
              render: (row) => (
                <div className="flex flex-col items-start gap-1">
                  <span className="tabular-nums text-primary">{row.activity_score}</span>
                  <HealthBadge health={row.health} />
                </div>
              ),
            },
            {
              key: "potential_mrr",
              header: t("sections.tariffs.upsell.columns.potential"),
              align: "right",
              render: (row) => <span className="tabular-nums">{fmt.money(row.potential_mrr)}</span>,
            },
          ]}
        />
      </div>

      {summary && summary.total > PAGE_SIZE && (
        <CusPagination count={summary.total} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
      )}
    </CusCardbox>
  );
}
