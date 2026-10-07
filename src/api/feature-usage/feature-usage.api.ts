import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import type { PeriodQuery } from "@/types/analytics";
import { featureUsageMock } from "./feature-usage.mock";
import type { FeatureUsageResponse } from "./feature-usage.types";

export const featureUsageApi = {
  summary: (params: PeriodQuery): Promise<FeatureUsageResponse> =>
    USE_MOCK
      ? featureUsageMock.summary(params)
      : api
          .get<ApiEnvelope<FeatureUsageResponse>>("/api/v1/admin/analytics/feature-usage", { params })
          .then((r) => r.data.data),
};
