import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import type { PeriodQuery } from "@/types/analytics";
import { growthMock } from "./growth.mock";
import type { GrowthSummaryResponse } from "./growth.types";

export const growthApi = {
  summary: (params: PeriodQuery): Promise<GrowthSummaryResponse> =>
    USE_MOCK
      ? growthMock.summary(params)
      : api
          .get<ApiEnvelope<GrowthSummaryResponse>>("/api/v1/admin/analytics/growth", { params })
          .then((r) => r.data.data),
};
