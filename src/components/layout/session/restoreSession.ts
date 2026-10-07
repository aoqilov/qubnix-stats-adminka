import { authApi } from "@/api/auth/auth.api";
import { useSessionStore } from "@/store/session.store";

/**
 * Boot'da (main.tsx) bir marta: saqlangan token bo'lsa `/admin/auth/me` bilan tekshiriladi.
 * Render kutdirilmaydi — AppRoutes `status`ga qarab yuklanish ekranini o'zi ko'rsatadi.
 */
export async function restoreSession(): Promise<void> {
  const { token, setAdmin, clearSession } = useSessionStore.getState();
  if (!token) return;
  try {
    setAdmin(await authApi.me());
  } catch {
    clearSession();
  }
}
