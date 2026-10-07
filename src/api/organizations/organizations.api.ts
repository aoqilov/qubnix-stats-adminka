import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import type { PeriodQuery } from "@/types/analytics";
import { organizationsMock } from "./organizations.mock";
import type {
  OrganizationSegmentsResponse,
  OrganizationsListParams,
  OrganizationsListResponse,
} from "./organizations.types";

export const organizationsApi = {
  list: (params: OrganizationsListParams): Promise<OrganizationsListResponse> =>
    USE_MOCK
      ? organizationsMock.list(params)
      : api
          .get<ApiEnvelope<OrganizationsListResponse>>("/api/v1/admin/organizations", { params })
          .then((r) => r.data.data),

  segments: (params: PeriodQuery): Promise<OrganizationSegmentsResponse> =>
    USE_MOCK
      ? organizationsMock.segments(params)
      : api
          .get<ApiEnvelope<OrganizationSegmentsResponse>>("/api/v1/admin/analytics/organizations/segments", {
            params,
          })
          .then((r) => r.data.data),
};
