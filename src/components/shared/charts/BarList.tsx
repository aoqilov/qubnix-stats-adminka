import type { ReactNode } from "react";

export interface BarListItem {
  key: string;
  label: ReactNode;
  value: number;
  /** Formatlangan qiymat — ustun uchida. */
  display: string;
  /** Qiymat yonidagi ikkinchi darajali matn (ulush va h.k.). */
  note?: string;
}

interface BarListProps {
  items: BarListItem[];
  /** Bitta seriya — barcha ustunlar bir rangda (kategoriyalar nomi o'q vazifasini bajaradi). */
  color?: string;
}

/**
 * Gorizontal ustunlar ro'yxati — kam sonli kategoriyani solishtirish uchun. Qiymat har doim
 * yozilgan (tooltip shart emas), ustun ingichka, uchi 4px yumaloq.
 */
export function BarList({ items, color = "var(--brand-default)" }: BarListProps) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-primary">{item.label}</span>
            <span className="flex-none tabular-nums">
              <span className="font-semibold text-primary">{item.display}</span>
              {item.note && <span className="ml-1.5 text-xs text-secondary">{item.note}</span>}
            </span>
          </div>
          <div className="h-2 w-full">
            <div
              className="h-full rounded-r"
              style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value > 0 ? 2 : 0, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
