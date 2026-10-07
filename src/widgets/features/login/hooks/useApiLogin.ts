import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth/auth.api";
import { useSessionStore } from "@/store/session.store";

/** Muvaffaqiyatli bo'lsa sessiya yoziladi — AppRoutes o'zi panelga o'tadi, joriy URL saqlanadi. */
export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, admin }) => setSession(token, admin),
  });
}
