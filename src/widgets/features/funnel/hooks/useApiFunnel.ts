import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { funnelApi } from "@/api/funnel/funnel.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { FunnelParams } from "@/api/funnel/funnel.types";

export const FUNNEL_KEYS = {
  all: ["funnel"] as const,
  steps: (params: FunnelParams) => [...FUNNEL_KEYS.all, "steps", params] as const,
};

/** `channel` berilmasa — barcha bevosita kanallar. */
export function useFunnel(channel?: FunnelParams["channel"]) {
  const period = usePeriodQuery();
  const params: FunnelParams = channel ? { ...period, channel } : period;
  return useQuery({
    queryKey: FUNNEL_KEYS.steps(params),
    queryFn: () => funnelApi.get(params),
    placeholderData: keepPreviousData,
  });
}
