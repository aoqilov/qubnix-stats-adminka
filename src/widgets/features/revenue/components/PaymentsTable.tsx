import { useTranslation } from "react-i18next";
import { useState } from "react";
import { LuDownload, LuSearch } from "react-icons/lu";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusInput } from "@/components/ui/inputs/CusInput";
import CusSelect from "@/components/ui/select/CusSelect";
import { CusButton } from "@/components/ui/buttons/CusButton";
import { CusTable } from "@/components/ui/table/CusTable";
import { CusPagination } from "@/components/ui/table/CusPagination";
import { PaymentStatusBadge } from "@/components/shared/badges/StatusBadges";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import { useFormatters } from "@/utils/format";
import { downloadCsv } from "@/utils/csv";
import {
  PAID_PLAN_IDS,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  PLAN_NAMES,
  type PaidPlanId,
  type PaymentProvider,
  type PaymentStatus,
} from "@/types/domain";
import type { PaymentRow } from "@/api/payments/payments.types";
import { useExportPayments, usePaymentsList, type PaymentsFilters } from "../hooks/useApiRevenue";
import { PROVIDER_COLORS } from "../lib/providerColors";

const PAGE_SIZE = 10;

/** To'lovlar ro'yxati: davr — global filtr, qolgan filtrlar shu yerda; CSV — filtrga mos hammasi. */
export function PaymentsTable() {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const { from, to } = usePeriodQuery();
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState<PaymentProvider | undefined>();
  const [status, setStatus] = useState<PaymentStatus | undefined>();
  const [plan, setPlan] = useState<PaidPlanId | undefined>();
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const filters: PaymentsFilters = {
    search: debouncedSearch || undefined,
    provider,
    status,
    plan,
  };
  const query = usePaymentsList({ ...filters, page, limit: PAGE_SIZE });
  const exportPayments = useExportPayments();

  // Filtr o'zgarsa birinchi sahifaga qaytiladi.
  const withReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const columns = {
    date: t("sections.revenue.payments.columns.date"),
    org: t("sections.revenue.payments.columns.org"),
    plan: t("sections.revenue.payments.columns.plan"),
    billing: t("sections.revenue.payments.columns.billing"),
    amount: t("sections.revenue.payments.columns.amount"),
    provider: t("sections.revenue.payments.columns.provider"),
    status: t("sections.revenue.payments.columns.status"),
    kind: t("sections.revenue.payments.columns.kind"),
  };

  const exportCsv = () =>
    exportPayments.mutate(filters, {
      onSuccess: (rows: PaymentRow[]) =>
        downloadCsv(
          `${t("sections.revenue.payments.fileName")}_${from}_${to}`,
          Object.values(columns),
          rows.map((row) => [
            row.created_at.replace("T", " "),
            row.org_name,
            PLAN_NAMES[row.plan],
            t(`domain.billing.${row.billing}`),
            row.amount,
            t(`domain.provider.${row.provider}`),
            t(`domain.paymentStatus.${row.status}`),
            row.kind ? t(`domain.periodKind.${row.kind}`) : "",
          ]),
        ),
    });

  const data = query.data;

  return (
    <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-primary">{t("sections.revenue.payments.title")}</h2>
        <CusButton
          variant="outline"
          size="sm"
          leftIcon={<LuDownload size={14} />}
          isLoading={exportPayments.isPending}
          loadingText={t("common.states.exporting")}
          isDisabled={!data || data.totals.count === 0}
          onClick={exportCsv}
        >
          {t("common.actions.export")}
        </CusButton>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-72">
          <CusInput
            inputSize="sm"
            placeholder={t("sections.revenue.payments.search")}
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
            leftElement={<LuSearch size={14} />}
            leftElementWidth="2.25rem"
          />
        </div>
        <div className="w-44">
          <CusSelect<PaymentProvider>
            size="sm"
            clearable
            placeholder={t("sections.revenue.payments.allProviders")}
            options={PAYMENT_PROVIDERS.map((value) => ({ value, label: t(`domain.provider.${value}`) }))}
            value={provider}
            onChange={(value) => withReset(setProvider)(value || undefined)}
          />
        </div>
        <div className="w-44">
          <CusSelect<PaymentStatus>
            size="sm"
            clearable
            placeholder={t("sections.revenue.payments.allStatuses")}
            options={PAYMENT_STATUSES.map((value) => ({ value, label: t(`domain.paymentStatus.${value}`) }))}
            value={status}
            onChange={(value) => withReset(setStatus)(value || undefined)}
          />
        </div>
        <div className="w-40">
          <CusSelect<PaidPlanId>
            size="sm"
            clearable
            placeholder={t("sections.revenue.payments.allPlans")}
            options={PAID_PLAN_IDS.map((value) => ({ value, label: PLAN_NAMES[value] }))}
            value={plan}
            onChange={(value) => withReset(setPlan)(value || undefined)}
          />
        </div>
        {data && (
          <span className="ml-auto text-sm text-secondary">
            {t("sections.revenue.payments.totals", {
              count: data.totals.count,
              formatted: fmt.number(data.totals.count),
              amount: fmt.money(data.totals.amount),
            })}
          </span>
        )}
      </div>

      <div style={{ opacity: query.isPlaceholderData ? 0.55 : 1 }} className="transition-opacity">
        <CusTable
          size="sm"
          isLoading={query.isLoading}
          data={data?.payments ?? []}
          columns={[
            {
              key: "created_at",
              header: columns.date,
              render: (row) => <span className="whitespace-nowrap">{fmt.dateTime(row.created_at)}</span>,
            },
            {
              key: "org_name",
              header: columns.org,
              render: (row) => <span className="font-medium text-primary">{row.org_name}</span>,
            },
            {
              key: "plan",
              header: columns.plan,
              render: (row) => (
                <div className="flex flex-col">
                  <span className="text-primary">{PLAN_NAMES[row.plan]}</span>
                  <span className="text-xs text-secondary">{t(`domain.billing.${row.billing}`)}</span>
                </div>
              ),
            },
            {
              key: "amount",
              header: columns.amount,
              align: "right",
              render: (row) => <span className="whitespace-nowrap tabular-nums">{fmt.money(row.amount)}</span>,
            },
            {
              key: "provider",
              header: columns.provider,
              render: (row) => (
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="size-2 rounded-sm" style={{ background: PROVIDER_COLORS[row.provider] }} />
                  {t(`domain.provider.${row.provider}`)}
                </span>
              ),
            },
            { key: "status", header: columns.status, render: (row) => <PaymentStatusBadge status={row.status} /> },
            {
              key: "kind",
              header: columns.kind,
              render: (row) => (row.kind ? t(`domain.periodKind.${row.kind}`) : "—"),
            },
          ]}
        />
      </div>

      {data && data.pagination.total > PAGE_SIZE && (
        <CusPagination count={data.pagination.total} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
      )}
    </CusCardbox>
  );
}
