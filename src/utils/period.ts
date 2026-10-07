import { addApiDays, daysInclusive, toApiDate } from "@/utils/apiDate";
import type { Granularity, PeriodQuery } from "@/types/analytics";

export type PeriodPreset = "7d" | "30d" | "90d" | "12m" | "custom";

export const PERIOD_PRESETS: readonly PeriodPreset[] = ["7d", "30d", "90d", "12m", "custom"];

/** Ikkala chet ham kiradi, `YYYY-MM-DD`. */
export interface DateRange {
  from: string;
  to: string;
}

export interface ResolvedPeriod {
  current: DateRange;
  /** Xuddi shu uzunlikdagi, `current`dan oldingi davr — "oldingi davrga nisbatan %" uchun. */
  previous: DateRange;
  days: number;
}

const PRESET_DAYS: Record<Exclude<PeriodPreset, "custom">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

/**
 * Davr filtrini aniq sanalarga aylantiradi. Bugun ham kiradi: "7 kun" = bugun va oldingi 6 kun.
 * `custom` uchun oraliq berilmagan bo'lsa — 30 kun.
 */
export function resolvePeriod(
  preset: PeriodPreset,
  customRange: DateRange | null,
  today: string = toApiDate(new Date()),
): ResolvedPeriod {
  const current =
    preset === "custom" && customRange
      ? customRange
      : {
          from: addApiDays(today, -((preset === "custom" ? 30 : PRESET_DAYS[preset]) - 1)),
          to: today,
        };
  const days = daysInclusive(current.from, current.to);
  const previous = {
    from: addApiDays(current.from, -days),
    to: addApiDays(current.from, -1),
  };
  return { current, previous, days };
}

/** Vaqt qatori qadami: ~3 oygacha — kun, ~13 oygacha — hafta, undan uzun — oy. */
export function autoGranularity(days: number): Granularity {
  if (days <= 92) return "day";
  if (days <= 400) return "week";
  return "month";
}

/** Davr filtri → API parametrlari. Solishtirish o'chiq bo'lsa `compare_*` yuborilmaydi. */
export function toPeriodQuery(
  period: ResolvedPeriod & { compare: boolean },
  granularity?: Granularity,
): PeriodQuery {
  return {
    from: period.current.from,
    to: period.current.to,
    ...(period.compare ? { compare_from: period.previous.from, compare_to: period.previous.to } : {}),
    granularity: granularity ?? autoGranularity(period.days),
  };
}
