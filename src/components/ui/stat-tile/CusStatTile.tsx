import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { LuArrowDownRight, LuArrowUpRight, LuMinus } from "react-icons/lu";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";

export interface StatTileDelta {
  /** Tayyor matn: "+10,1 %" yoki "+2,2 п.п.". */
  text: string;
  direction: "up" | "down" | "flat";
  /** Yo'nalish yaxshimi — rang shundan (o'sish har doim ham yaxshi emas: churn). */
  tone: "good" | "bad" | "neutral";
}

interface CusStatTileProps {
  /** Jumla registrida, oxirida ikki nuqtasiz. */
  label: string;
  /** Formatlangan qiymat. */
  value: string;
  delta?: StatTileDelta | null;
  /** Oldingi davr qiymati (formatlangan) — "было …". */
  previous?: string | null;
  /** Qisqa ta'rif — qanday hisoblanadi. */
  hint?: string;
  /** "hero" — sahifadagi yagona bosh raqam (≥ 48px). */
  size?: "md" | "hero";
  /** O'ng yuqori burchak (masalan, kichik izoh yoki belgi). */
  aside?: ReactNode;
  className?: string;
}

const TONE_CLASS: Record<StatTileDelta["tone"], string> = {
  good: "text-success-strong",
  bad: "text-error-strong",
  neutral: "text-secondary",
};

const DIRECTION_ICON = {
  up: LuArrowUpRight,
  down: LuArrowDownRight,
  flat: LuMinus,
} as const;

/** O'zgarish qatori: strelka + belgili qiymat (rang — yaxshi/yomon) va "было …". */
export function CusStatDelta({ delta, previous }: { delta?: StatTileDelta | null; previous?: string | null }) {
  const { t } = useTranslation();
  if (!delta && !previous) return null;
  const Icon = delta ? DIRECTION_ICON[delta.direction] : null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
      {delta && Icon && (
        <span className={`inline-flex items-center gap-0.5 font-semibold ${TONE_CLASS[delta.tone]}`}>
          <Icon size={14} aria-hidden />
          {delta.direction === "flat" ? t("ui.statTile.noChange") : delta.text}
        </span>
      )}
      {previous && <span className="text-secondary">{t("ui.statTile.previous", { value: previous })}</span>}
    </div>
  );
}

/** KPI kartasi: nom, qiymat, oldingi davrga nisbatan o'zgarish (belgi + strelka + rang). */
export function CusStatTile({
  label,
  value,
  delta,
  previous,
  hint,
  size = "md",
  aside,
  className = "",
}: CusStatTileProps) {
  return (
    <CusCardbox className={`flex min-w-0 flex-col gap-1 rounded-card p-4 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font-medium text-secondary">{label}</span>
        {aside}
      </div>
      <span
        className={`truncate font-semibold leading-tight text-primary ${size === "hero" ? "text-5xl" : "text-2xl"}`}
      >
        {value}
      </span>
      <CusStatDelta delta={delta} previous={previous} />
      {hint && <span className="truncate text-xs text-secondary">{hint}</span>}
    </CusCardbox>
  );
}

// Ishlatish:
// <CusStatTile label="Выручка" value="34,6 млн сум" delta={{ text: "+12 %", direction: "up", tone: "good" }} previous="30,9 млн сум" />
