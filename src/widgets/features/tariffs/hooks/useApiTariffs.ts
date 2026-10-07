import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { tariffsApi } from "@/api/tariffs/tariffs.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { PeriodQuery } from "@/types/analytics";
import type { ExpiringParams, UpsellParams } from "@/api/tariffs/tariffs.types";

export const TARIFFS_KEYS = {
  all: ["tariffs"] as const,
  plans: () => [...TARIFFS_KEYS.all, "plans"] as const,
  summary: (params: PeriodQuery) => [...TARIFFS_KEYS.all, "summary", params] as const,
  expiring: (params: ExpiringParams) => [...TARIFFS_KEYS.all, "expiring", params] as const,
  upsell: (params: UpsellParams) => [...TARIFFS_KEYS.all, "upsell", params] as const,
};

export function useTariffPlans() {
  return useQuery({
    queryKey: TARIFFS_KEYS.plans(),
    queryFn: tariffsApi.plans,
    staleTime: Infinity,
  });
}

export function useTariffsSummary() {
  const params = usePeriodQuery();
  return useQuery({
    queryKey: TARIFFS_KEYS.summary(params),
    queryFn: () => tariffsApi.summary(params),
    placeholderData: keepPreviousData,
  });
}

/** Bugungi holat — davr filtriga bog'liq emas. */
export function useExpiringSubscriptions(params: ExpiringParams) {
  return useQuery({
    queryKey: TARIFFS_KEYS.expiring(params),
    queryFn: () => tariffsApi.expiring(params),
    placeholderData: keepPreviousData,
  });
}

/** Bugungi holat — davr filtriga bog'liq emas. */
export function useUpsellCandidates(params: UpsellParams) {
  return useQuery({
    queryKey: TARIFFS_KEYS.upsell(params),
    queryFn: () => tariffsApi.upsell(params),
    placeholderData: keepPreviousData,
  });
}
