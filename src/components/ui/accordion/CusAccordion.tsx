import { Accordion } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";

export interface CusAccordionItem {
  value: string;
  title: string;
  icon?: ReactNode;
  badge?: ReactNode;
  content: ReactNode;
}

interface CusAccordionProps {
  items: CusAccordionItem[];
  /** Bir nechta bo'lim bir vaqtda ochiq turishi mumkinmi. Default: false (faqat bittasi). */
  multiple?: boolean;
  defaultValue?: string[];
  /** Bo'lim tarkibi faqat birinchi ochilganda yaratiladi — ichidagi so'rovlar ham shunda ketadi. */
  lazyMount?: boolean;
}

export function CusAccordion({ items, multiple = false, defaultValue, lazyMount = false }: CusAccordionProps) {
  return (
    <Accordion.Root
      multiple={multiple}
      collapsible
      defaultValue={defaultValue}
      lazyMount={lazyMount}
      display="flex"
      flexDirection="column"
      gap="2"
    >
      {items.map((item) => (
        <Accordion.Item
          key={item.value}
          value={item.value}
          bg="var(--bg-surface)"
          borderWidth="1px"
          borderColor="var(--border-subtle)"
          borderRadius="var(--radius-card)"
          overflow="hidden"
        >
          <Accordion.ItemTrigger
            display="flex"
            alignItems="center"
            gap="3"
            px="4"
            py="3.5"
            cursor="pointer"
            _hover={{ bg: "var(--bg-surface-secondary)" }}
          >
            {item.icon && (
              <span
                className="flex size-9 flex-none items-center justify-center rounded-input bg-surface-secondary text-secondary"
              >
                {item.icon}
              </span>
            )}
            <span className="min-w-0 flex-1 text-left text-sm font-semibold text-primary">
              {item.title}
            </span>
            {item.badge}
            <Accordion.ItemIndicator
              display="flex"
              color="var(--text-secondary)"
              transition="transform 0.2s ease"
            >
              <LuChevronDown size={16} />
            </Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody
              px="4"
              pb="4"
              pt="0"
              fontSize="sm"
              color="var(--text-secondary)"
              style={{ lineHeight: 1.5 }}
            >
              {item.content}
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

// ─── Ishlatish misoli ─────────────────────────────────────────────────────────
//
// <CusAccordion
//   items={[
//     { value: "owner", title: "Владелец", icon: <LuCrown size={18} />, content: "..." },
//     { value: "admin", title: "Админ", icon: <LuShieldCheck size={18} />, content: "..." },
//   ]}
// />
