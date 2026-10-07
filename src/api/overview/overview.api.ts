import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import type { PeriodQuery } from "@/types/analytics";
import { overviewMock } from "./overview.mock";
import type { OverviewResponse } from "./overview.types";

export const overviewApi = {
  get: (params: PeriodQuery): Promise<OverviewResponse> =>
    USE_MOCK
      ? overviewMock.get(params)
      : api
          .get<ApiEnvelope<OverviewResponse>>("/api/v1/admin/analytics/overview", { params })
          .then((r) => r.data.data),
};
