import { useTranslation } from "react-i18next";
import { LuCheck, LuConstruction } from "react-icons/lu";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusBadge } from "@/components/ui/badge/CusBadge";

interface SectionPlaceholderProps {
  /** Rejadagi faza raqami — bo'lim shu fazada quriladi. */
  phase: number;
  /** Bo'limda nimalar bo'lishi — `sections.<bo'lim>.planned`. */
  items: string[];
}

/** Hali qurilmagan bo'lim: nimalar ko'rsatilishi rejalashtirilgani. Bo'lim qurilganda olib tashlanadi. */
export function SectionPlaceholder({ phase, items }: SectionPlaceholderProps) {
  const { t } = useTranslation();

  return (
    <CusCardbox className="max-w-3xl rounded-card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-primary">
          <LuConstruction size={20} className="text-brand" />
          <h2 className="text-lg font-semibold">{t("sections.placeholder.title")}</h2>
        </div>
        <CusBadge tone="brand" size="md">
          {t("sections.placeholder.badge", { phase })}
        </CusBadge>
      </div>

      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-primary">
            <LuCheck size={16} className="mt-0.5 flex-none text-success" />
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs text-secondary">{t("sections.placeholder.hint")}</p>
    </CusCardbox>
  );
}
