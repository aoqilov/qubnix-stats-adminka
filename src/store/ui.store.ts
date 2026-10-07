import { create } from "zustand";

const DARK_MODE_KEY = "qubnix_admin_dark_mode";
const SIDEBAR_KEY = "qubnix_admin_sidebar_collapsed";

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // localStorage yopiq — sozlama faqat shu sessiyada qoladi.
  }
}

function applyDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

const initialDarkMode = readFlag(DARK_MODE_KEY);
applyDarkClass(initialDarkMode);

interface UiState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  isSidebarCollapsed: readFlag(SIDEBAR_KEY),
  toggleSidebar: () => {
    const next = !get().isSidebarCollapsed;
    writeFlag(SIDEBAR_KEY, next);
    set({ isSidebarCollapsed: next });
  },
  isDarkMode: initialDarkMode,
  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    writeFlag(DARK_MODE_KEY, next);
    applyDarkClass(next);
    set({ isDarkMode: next });
  },
}));
