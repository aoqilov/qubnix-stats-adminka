import { useTranslation } from "react-i18next";
import { LuMoon, LuSun } from "react-icons/lu";
import { useUiStore } from "@/store/ui.store";
import { PeriodFilter } from "./PeriodFilter";
import { ProfileMenu } from "./ProfileMenu";

export function Header() {
  const { t } = useTranslation();
  const isDarkMode = useUiStore((s) => s.isDarkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);
  const themeLabel = isDarkMode ? t("layout.header.lightTheme") : t("layout.header.darkTheme");

  return (
    // Tor ekranda (ixtiyoriy davr ochiq bo'lsa) profil bloki keyingi qatorga, o'ng chetga o'tadi.
    <header className="flex min-h-16 flex-none flex-wrap items-center gap-4 border-b border-subtle bg-surface px-6 py-2">
      <PeriodFilter />

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={themeLabel}
          title={themeLabel}
          className="flex size-9 items-center justify-center rounded-input text-secondary transition-colors hover:bg-surface-secondary hover:text-primary"
        >
          {isDarkMode ? <LuSun size={18} /> : <LuMoon size={18} />}
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}
