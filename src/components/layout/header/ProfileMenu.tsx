import { useTranslation } from "react-i18next";
import { LuChevronDown, LuLogOut } from "react-icons/lu";
import { useSessionStore } from "@/store/session.store";
import { useLogout } from "@/hooks/useLogout";
import { avatarColorVar } from "@/utils/avatarColor";
import { CusPopover } from "@/components/ui/popover/CusPopover";

function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileMenu() {
  const { t } = useTranslation();
  const admin = useSessionStore((s) => s.admin);
  const logout = useLogout();

  if (!admin) return null;

  return (
    <CusPopover
      placement="bottom-end"
      width={220}
      trigger={(open) => (
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-card px-2 py-1 text-left transition-colors hover:bg-surface-secondary"
        >
          <span
            className="flex size-9 flex-none items-center justify-center rounded-avatar text-sm font-semibold text-on-brand"
            style={{ background: avatarColorVar(String(admin.id)) }}
          >
            {initialsOf(admin.fullName)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="max-w-[180px] truncate text-sm font-semibold text-primary">{admin.fullName}</span>
            <span className="text-xs text-secondary">{t(`layout.roles.${admin.role}`)}</span>
          </span>
          <LuChevronDown
            size={16}
            className={`flex-none text-secondary transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
    >
      {(close) => (
        <div className="p-1">
          <button
            type="button"
            onClick={() => {
              close();
              void logout();
            }}
            className="flex w-full items-center gap-2 rounded-input px-3 py-2 text-sm font-medium text-error-strong hover:bg-surface-secondary"
          >
            <LuLogOut size={16} />
            {t("layout.header.logout")}
          </button>
        </div>
      )}
    </CusPopover>
  );
}
