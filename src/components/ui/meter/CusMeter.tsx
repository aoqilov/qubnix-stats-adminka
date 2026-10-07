import { useTranslation } from "react-i18next";

interface CusMeterProps {
  value: number;
  /** null — cheksiz (shkala chizilmaydi). */
  max: number | null;
  /** Shkala ostidagi qo'shimcha matn (masalan, "нужно 6"). */
  note?: string;
  /** Limitga yetgan/oshgan holat — shkala ogohlantirish rangida. */
  tone?: "brand" | "warning";
  className?: string;
}

/** Limitdan foydalanish: "2 / 2" va bitta rang oilasidagi trek (och) + to'ldirish (to'q). */
export function CusMeter({ value, max, note, tone = "brand", className = "" }: CusMeterProps) {
  const { t } = useTranslation();
  const ratio = max ? Math.min(1, value / max) : 0;
  const fill = tone === "warning" ? "var(--status-warning-solid)" : "var(--brand-default)";
  const track = tone === "warning" ? "var(--status-warning-bg)" : "var(--brand-subtle-bg)";

  return (
    <div className={`flex min-w-[88px] flex-col gap-1 ${className}`}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold tabular-nums text-primary">
          {value}
          {max !== null && <span className="font-normal text-secondary"> / {max}</span>}
        </span>
        {max === null && <span className="text-secondary">{t("ui.meter.unlimited")}</span>}
      </div>
      {max !== null && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-chip"
          style={{ background: track }}
          role="meter"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
        >
          <div className="h-full rounded-chip" style={{ width: `${ratio * 100}%`, background: fill }} />
        </div>
      )}
      {note && <span className="text-xs text-secondary">{note}</span>}
    </div>
  );
}

// Ishlatish:
// <CusMeter value={2} max={2} tone="warning" note="нужно 6" />
