import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import type { PeriodQuery } from "@/types/analytics";
import type { TariffPlan } from "@/types/domain";
import { tariffsMock } from "./tariffs.mock";
import type {
  ExpiringParams,
  ExpiringResponse,
  TariffsSummaryResponse,
  UpsellParams,
  UpsellResponse,
} from "./tariffs.types";

export const tariffsApi = {
  plans: (): Promise<TariffPlan[]> =>
    USE_MOCK
      ? tariffsMock.plans()
      : api
          .get<ApiEnvelope<{ plans: TariffPlan[] }>>("/api/v1/admin/tariffs/plans")
          .then((r) => r.data.data.plans),

  summary: (params: PeriodQuery): Promise<TariffsSummaryResponse> =>
    USE_MOCK
      ? tariffsMock.summary(params)
      : api
          .get<ApiEnvelope<TariffsSummaryResponse>>("/api/v1/admin/analytics/tariffs", { params })
          .then((r) => r.data.data),

  expiring: (params: ExpiringParams): Promise<ExpiringResponse> =>
    USE_MOCK
      ? tariffsMock.expiring(params)
      : api
          .get<ApiEnvelope<ExpiringResponse>>("/api/v1/admin/subscriptions/expiring", { params })
          .then((r) => r.data.data),

  upsell: (params: UpsellParams): Promise<UpsellResponse> =>
    USE_MOCK
      ? tariffsMock.upsell(params)
      : api
          .get<ApiEnvelope<UpsellResponse>>("/api/v1/admin/analytics/tariffs/upsell", { params })
          .then((r) => r.data.data),
};
