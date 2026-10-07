import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/api/payments/payments.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { PeriodQuery } from "@/types/analytics";
import type { PaymentRow, PaymentsListParams } from "@/api/payments/payments.types";

export const PAYMENTS_KEYS = {
  all: ["payments"] as const,
  summary: (params: PeriodQuery) => [...PAYMENTS_KEYS.all, "summary", params] as const,
  list: (params: PaymentsListParams) => [...PAYMENTS_KEYS.all, "list", params] as const,
};

export type PaymentsFilters = Omit<PaymentsListParams, "from" | "to" | "page" | "limit">;

/** Eksport uchun bitta so'rovdagi eng katta sahifa. */
const EXPORT_PAGE_SIZE = 1000;

export function usePaymentsSummary() {
  const params = usePeriodQuery();
  return useQuery({
    queryKey: PAYMENTS_KEYS.summary(params),
    queryFn: () => paymentsApi.summary(params),
    placeholderData: keepPreviousData,
  });
}

/** Davr — global filtrdan; provayder, holat, qidiruv va sahifa — sahifaning o'zidan. */
export function usePaymentsList(filters: Omit<PaymentsListParams, "from" | "to">) {
  const { from, to } = usePeriodQuery();
  const params: PaymentsListParams = { from, to, ...filters };
  return useQuery({
    queryKey: PAYMENTS_KEYS.list(params),
    queryFn: () => paymentsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Filtrga mos barcha to'lovlar (sahifama-sahifa) — CSV eksport uchun. */
export function useExportPayments() {
  const { from, to } = usePeriodQuery();
  return useMutation({
    mutationFn: async (filters: PaymentsFilters): Promise<PaymentRow[]> => {
      const rows: PaymentRow[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await paymentsApi.list({ from, to, ...filters, page, limit: EXPORT_PAGE_SIZE });
        rows.push(...response.payments);
        totalPages = response.pagination.total_pages;
        page += 1;
      } while (page <= totalPages);
      return rows;
    },
  });
}
