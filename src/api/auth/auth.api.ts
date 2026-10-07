import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import { authMock } from "@/api/auth/auth.mock";
import { useSessionStore } from "@/store/session.store";
import type { AdminUser, LoginRequest, LoginResponse } from "@/api/auth/auth.types";
import type { ApiEnvelope } from "@/types/api";

// Endpoint yo'llari — taklif (backend bilan hali kelishilmagan).
export const authApi = {
  login: (payload: LoginRequest): Promise<LoginResponse> =>
    USE_MOCK
      ? authMock.login(payload)
      : api
          .post<ApiEnvelope<LoginResponse>>("/api/v1/admin/auth/login", { data: payload })
          .then((r) => r.data.data),

  me: (): Promise<AdminUser> =>
    USE_MOCK
      ? authMock.me(useSessionStore.getState().token)
      : api
          .get<ApiEnvelope<{ admin: AdminUser }>>("/api/v1/admin/auth/me")
          .then((r) => r.data.data.admin),

  logout: (): Promise<void> =>
    USE_MOCK
      ? authMock.logout()
      : api.post("/api/v1/admin/auth/logout").then(() => undefined),
};
