import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import { funnelMock } from "./funnel.mock";
import type { FunnelParams, FunnelResponse } from "./funnel.types";

export const funnelApi = {
  get: (params: FunnelParams): Promise<FunnelResponse> =>
    USE_MOCK
      ? funnelMock.get(params)
      : api
          .get<ApiEnvelope<FunnelResponse>>("/api/v1/admin/analytics/funnel", { params })
          .then((r) => r.data.data),
};
