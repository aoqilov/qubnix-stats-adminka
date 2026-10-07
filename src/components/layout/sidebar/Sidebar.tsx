import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import { useUiStore } from "@/store/ui.store";
import { USE_MOCK } from "@/api-config/mock";
import { NAV_GROUPS } from "@/const/navigation";
import { CusBadge } from "@/components/ui/badge/CusBadge";
import { QubnixLogoIntro } from "@/components/shared/enter-logo-page/EnterLogoPage";

function navLinkClass(isActive: boolean, collapsed: boolean) {
  return `flex items-center gap-3 rounded-input py-2 text-base font-medium transition-colors ${
    collapsed ? "justify-center px-2" : "px-3"
  } ${isActive ? "bg-brand text-on-brand" : "text-secondary hover:bg-surface-secondary hover:text-primary"}`;
}

export function Sidebar() {
  const { t } = useTranslation();
  const collapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  // "system" emas: ui.store faqat `.dark` qo'yadi — OS dark + panel light bo'lsa matn oq chiqardi.
  const logoTheme = useUiStore((s) => (s.isDarkMode ? "dark" : "light"));

  return (
    <aside
      className={`flex flex-none flex-col border-r border-subtle bg-surface transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-[248px]"
      }`}
    >
      <div className={`flex h-16 flex-none items-center ${collapsed ? "justify-center" : "justify-between px-5"}`}>
        {!collapsed && (
          <QubnixLogoIntro
            animated={false}
            theme={logoTheme}
            className="w-28"
            // Statik logo 0.88 masshtabda — chap chetga tekislanib tursin.
            style={{ transformOrigin: "left center" }}
          />
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? t("layout.sidebar.expand") : t("layout.sidebar.collapse")}
          title={collapsed ? t("layout.sidebar.expand") : t("layout.sidebar.collapse")}
          className="rounded-input p-1.5 text-secondary hover:bg-surface-secondary"
        >
          {collapsed ? <LuPanelLeftOpen size={20} /> : <LuPanelLeftClose size={20} />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="flex flex-col gap-1">
            {collapsed ? (
              <div className="mx-3 my-2 border-t border-subtle first:hidden" />
            ) : (
              <div className="mt-4 px-3 pb-1 text-[10px] font-medium uppercase tracking-wide text-disabled">
                {t(group.labelKey)}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={t(item.labelKey)}
                className={({ isActive }) => navLinkClass(isActive, collapsed)}
              >
                <item.icon size={20} className="flex-none" />
                {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="flex flex-none items-center justify-between gap-2 border-t border-subtle px-5 py-3">
          <span className="text-xs text-disabled">
            {t("layout.sidebar.version", { version: __APP_VERSION__ })}
          </span>
          {USE_MOCK && (
            <CusBadge tone="warning" size="sm" dot>
              {t("layout.sidebar.mockData")}
            </CusBadge>
          )}
        </div>
      )}
    </aside>
  );
}
