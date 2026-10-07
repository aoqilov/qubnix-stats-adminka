import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { featureUsageApi } from "@/api/feature-usage/feature-usage.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { PeriodQuery } from "@/types/analytics";

export const FEATURE_USAGE_KEYS = {
  all: ["feature-usage"] as const,
  summary: (params: PeriodQuery) => [...FEATURE_USAGE_KEYS.all, "summary", params] as const,
};

export function useFeatureUsage() {
  const params = usePeriodQuery();
  return useQuery({
    queryKey: FEATURE_USAGE_KEYS.summary(params),
    queryFn: () => featureUsageApi.summary(params),
    placeholderData: keepPreviousData,
  });
}
