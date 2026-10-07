import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { retentionApi } from "@/api/retention/retention.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { RetentionParams } from "@/api/retention/retention.types";

export const RETENTION_KEYS = {
  all: ["retention"] as const,
  cohorts: (params: RetentionParams) => [...RETENTION_KEYS.all, "cohorts", params] as const,
};

/** Kohortalar — boshlanishi global davrga tushganlar. */
export function useRetention(options: Omit<RetentionParams, "from" | "to">) {
  const { from, to } = usePeriodQuery();
  const params: RetentionParams = { from, to, ...options };
  return useQuery({
    queryKey: RETENTION_KEYS.cohorts(params),
    queryFn: () => retentionApi.cohorts(params),
    placeholderData: keepPreviousData,
  });
}
