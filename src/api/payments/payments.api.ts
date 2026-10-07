import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import type { ApiEnvelope } from "@/types/api";
import type { PeriodQuery } from "@/types/analytics";
import { paymentsMock } from "./payments.mock";
import type {
  PaymentsListParams,
  PaymentsListResponse,
  PaymentsSummaryResponse,
} from "./payments.types";

export const paymentsApi = {
  summary: (params: PeriodQuery): Promise<PaymentsSummaryResponse> =>
    USE_MOCK
      ? paymentsMock.summary(params)
      : api
          .get<ApiEnvelope<PaymentsSummaryResponse>>("/api/v1/admin/analytics/payments", { params })
          .then((r) => r.data.data),

  list: (params: PaymentsListParams): Promise<PaymentsListResponse> =>
    USE_MOCK
      ? paymentsMock.list(params)
      : api
          .get<ApiEnvelope<PaymentsListResponse>>("/api/v1/admin/payments", { params })
          .then((r) => r.data.data),
};
