import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { channelsApi } from "@/api/channels/channels.api";
import { usePeriodQuery } from "@/hooks/usePeriodQuery";
import type { PeriodQuery } from "@/types/analytics";

export const CHANNELS_KEYS = {
  all: ["channels"] as const,
  summary: (params: PeriodQuery) => [...CHANNELS_KEYS.all, "summary", params] as const,
};

export function useChannelsSummary() {
  const params = usePeriodQuery();
  return useQuery({
    queryKey: CHANNELS_KEYS.summary(params),
    queryFn: () => channelsApi.summary(params),
    placeholderData: keepPreviousData,
  });
}
