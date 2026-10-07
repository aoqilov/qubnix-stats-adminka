import { Menu, Portal } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { LuCheck } from "react-icons/lu";

const SCOPE = "cus-menu-list";

const menuListStyles = `
  .${SCOPE} [data-part="item"]:not([data-disabled]):hover,
  .${SCOPE} [data-part="item"].${SCOPE}-item-active {
    background: var(--bg-hover);
  }
`;

export interface CusMenuListItem {
  value: string;
  label: string;
  icon?: ReactNode;
  /** Icon uchun maxsus rang — berilmasa, standart --text-muted ishlatiladi. */
  iconColor?: string;
  image?: string;
  disabled?: boolean;
}

interface CusMenuListProps {
  trigger: ReactNode | ((open: boolean) => ReactNode);
  items: CusMenuListItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  placement?:
    | "bottom"
    | "bottom-end"
    | "bottom-start"
    | "top"
    | "top-end"
    | "top-start"
    | "left"
    | "right";
  width?: number | string;
}

export function CusMenuList({
  trigger,
  items,
  value,
  onValueChange,
  placement = "bottom-end",
  width = 200,
}: CusMenuListProps) {
  const [open, setOpen] = useState(false);

  return (
    <Menu.Root
      positioning={{ placement }}
      lazyMount
      unmountOnExit
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Menu.Trigger asChild>
        {typeof trigger === "function" ? trigger(open) : trigger}
      </Menu.Trigger>
      <Portal>
      <Menu.Positioner>
        <Menu.Content
          className={SCOPE}
          style={{
            width,
            background: "var(--bg-second)",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "var(--shadow-dropdown)",
            padding: 4,
            outline: "none",
          }}
        >
          <style>{menuListStyles}</style>
          <Menu.RadioItemGroup
            value={value}
            onValueChange={(details) => onValueChange?.(details.value)}
          >
            {items.map((item) => {
              const isActive = item.value === value;
              return (
                <Menu.RadioItem
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className={isActive ? `${SCOPE}-item-active` : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 8,
                    fontSize: 14,
                    color: "var(--text-2)",
                    cursor: item.disabled ? "not-allowed" : "pointer",
                    opacity: item.disabled ? 0.5 : 1,
                    outline: "none",
                  }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      style={{
                        width: 18,
                        height: 18,
                        flex: "none",
                        borderRadius: 4,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  {item.icon && (
                    <span
                      style={{
                        display: "inline-flex",
                        flex: "none",
                        color: item.iconColor ?? "var(--text-muted)",
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  <Menu.ItemText style={{ flex: 1 }}>
                    {item.label}
                  </Menu.ItemText>
                  {isActive && (
                    <LuCheck
                      size={14}
                      color="var(--color-blue)"
                      style={{ flex: "none" }}
                    />
                  )}
                </Menu.RadioItem>
              );
            })}
          </Menu.RadioItemGroup>
        </Menu.Content>
      </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

// ─── Ishlatish misoli ─────────────────────────────────────────────────────────
//
// const [lang, setLang] = useState("uz");
//
// <CusMenuList
//   value={lang}
//   onValueChange={setLang}
//   items={[
//     { value: "uz", label: "O'zbek", image: "/flags/uz.svg" },
//     { value: "ru", label: "Русский", image: "/flags/ru.svg" },
//     { value: "en", label: "English", icon: <LuGlobe /> },
//   ]}
//   trigger={
//     <button className="flex items-center gap-1">
//       <span>O'zbek</span>
//       <LuChevronDown size={14} />
//     </button>
//   }
// />
