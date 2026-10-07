import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import { retentionMock } from "./retention.mock";
import type { RetentionParams, RetentionResponse } from "./retention.types";

export const retentionApi = {
  cohorts: (params: RetentionParams): Promise<RetentionResponse> =>
    USE_MOCK
      ? retentionMock.cohorts(params)
      : api
          .get<ApiEnvelope<RetentionResponse>>("/api/v1/admin/analytics/retention", { params })
          .then((r) => r.data.data),
};
