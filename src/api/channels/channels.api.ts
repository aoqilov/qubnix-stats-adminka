import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import type { PeriodQuery } from "@/types/analytics";
import { channelsMock } from "./channels.mock";
import type { ChannelsSummaryResponse } from "./channels.types";

export const channelsApi = {
  summary: (params: PeriodQuery): Promise<ChannelsSummaryResponse> =>
    USE_MOCK
      ? channelsMock.summary(params)
      : api
          .get<ApiEnvelope<ChannelsSummaryResponse>>("/api/v1/admin/analytics/channels", { params })
          .then((r) => r.data.data),
};
