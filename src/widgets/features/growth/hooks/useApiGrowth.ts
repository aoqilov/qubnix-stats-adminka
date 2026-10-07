import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { growthApi } from "@/api/growth/growth.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { PeriodQuery } from "@/types/analytics";

export const GROWTH_KEYS = {
  all: ["growth"] as const,
  summary: (params: PeriodQuery) => [...GROWTH_KEYS.all, "summary", params] as const,
};

export function useGrowthSummary() {
  const params = usePeriodQuery();
  return useQuery({
    queryKey: GROWTH_KEYS.summary(params),
    queryFn: () => growthApi.summary(params),
    placeholderData: keepPreviousData,
  });
}
