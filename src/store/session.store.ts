import { create } from "zustand";
import type { AdminUser } from "@/api/auth/auth.types";

const TOKEN_KEY = "qubnix_admin_token";

// Safari private rejimi va bloklangan saqlash localStorage'da xato tashlaydi.
function readStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(value: string | null): void {
  try {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Saqlab bo'lmasa — sessiya shu tab yopilguncha ishlaydi.
  }
}

interface SessionState {
  /** `POST /admin/auth/login` javobidagi token — localStorage'da, sahifa yangilansa ham qoladi. */
  token: string | null;
  admin: AdminUser | null;
  /** `routes/AppRoutes.tsx` shunga qarab login, yuklanish yoki panelni ko'rsatadi. */
  status: "authenticating" | "authenticated" | "unauthenticated";
  setSession: (token: string, admin: AdminUser) => void;
  setAdmin: (admin: AdminUser) => void;
  clearSession: () => void;
}

const initialToken = readStoredToken();

export const useSessionStore = create<SessionState>((set) => ({
  token: initialToken,
  admin: null,
  // Token bor bo'lsa — restoreSession() uni /me orqali tekshirguncha "authenticating".
  status: initialToken ? "authenticating" : "unauthenticated",
  setSession: (token, admin) => {
    writeStoredToken(token);
    set({ token, admin, status: "authenticated" });
  },
  setAdmin: (admin) => set({ admin, status: "authenticated" }),
  clearSession: () => {
    writeStoredToken(null);
    set({ token: null, admin: null, status: "unauthenticated" });
  },
}));
