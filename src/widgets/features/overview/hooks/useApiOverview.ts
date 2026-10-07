import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { overviewApi } from "@/api/overview/overview.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { PeriodQuery } from "@/types/analytics";

export const OVERVIEW_KEYS = {
  all: ["overview"] as const,
  summary: (params: PeriodQuery) => [...OVERVIEW_KEYS.all, "summary", params] as const,
};

/** Davr filtri o'zgarsa qayta so'raydi; yangisi kelguncha oldingi ma'lumot ko'rinib turadi. */
export function useOverview() {
  const params = usePeriodQuery();
  return useQuery({
    queryKey: OVERVIEW_KEYS.summary(params),
    queryFn: () => overviewApi.get(params),
    placeholderData: keepPreviousData,
  });
}
