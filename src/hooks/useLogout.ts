import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth/auth.api";
import { useSessionStore } from "@/store/session.store";

/** Backend'da sessiya yopiladi (xato bo'lsa ham), keyin lokal sessiya va kesh tozalanadi. */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useSessionStore((s) => s.clearSession);

  return async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      queryClient.clear();
    }
  };
}
