import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useIntlLocale } from "@/i18n/useIntlLocale";
import { fromApiDate } from "@/utils/apiDate";
import type { Granularity } from "@/types/analytics";

/** Davr qadamining oxirgi kuni (hafta — +6 kun, oy — oy oxiri). */
function bucketEnd(start: Date, granularity: Granularity): Date {
  if (granularity === "day") return start;
  if (granularity === "week") return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return new Date(start.getFullYear(), start.getMonth() + 1, 0);
}

/**
 * Joriy tildagi raqam/pul/foiz/sana formatlari. Komponentlar `Intl`ni o'zi chaqirmaydi —
 * hammasi shu yerdan, til almashsa birga yangilanadi.
 */
export function useFormatters() {
  const locale = useIntlLocale();
  const { t } = useTranslation();

  return useMemo(() => {
    const integer = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
    const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 });
    const decimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const signedPercent = new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
      signDisplay: "exceptZero",
    });
    const signedDecimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, signDisplay: "exceptZero" });
    const signedInteger = new Intl.NumberFormat(locale, { maximumFractionDigits: 0, signDisplay: "exceptZero" });
    const dayMonth = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
    const monthYear = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" });
    const fullDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
    const longMonth = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
    const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
    const currency = t("common.currency.uzs");

    return {
      number: (value: number) => integer.format(value),
      compact: (value: number) => compact.format(value),
      decimal: (value: number) => decimal.format(value),
      /** 149 000 сум */
      money: (value: number) => `${integer.format(value)} ${currency}`,
      /** 36,5 млн сум */
      moneyCompact: (value: number) => `${compact.format(value)} ${currency}`,
      /** 0..1 → 13,7 % */
      percent: (fraction: number) => percent.format(fraction),
      /** +10,1 % — nisbiy o'zgarish. */
      signedPercent: (fraction: number) => signedPercent.format(fraction),
      /** +2,2 п.п. — ulushning o'zgarishi (foiz punktlarda). */
      signedPoints: (fractionDiff: number) => `${signedDecimal.format(fractionDiff * 100)} ${t("common.units.pp")}`,
      signedNumber: (value: number) => signedInteger.format(value),
      /** 7 окт. 2026 г. */
      date: (apiDate: string) => fullDate.format(fromApiDate(apiDate)),
      /** "2026-10-07T20:50:00" → 7 окт. 2026 г., 20:50 */
      dateTime: (iso: string) => {
        const [day, clock] = iso.split("T");
        const [hours, minutes] = clock.split(":").map(Number);
        const date = fromApiDate(day);
        date.setHours(hours, minutes);
        return `${fullDate.format(date)}, ${time.format(date)}`;
      },
      /** O'q belgisi: kun/hafta — "8 сент.", oy — "сент. 2026". */
      bucketTick: (apiDate: string, granularity: Granularity) =>
        granularity === "month" ? monthYear.format(fromApiDate(apiDate)) : dayMonth.format(fromApiDate(apiDate)),
      /** Tooltip/jadval: kun — "8 сент. 2026", hafta — "8 сент. – 14 сент. 2026", oy — "сентябрь 2026". */
      bucketLabel: (apiDate: string, granularity: Granularity) => {
        const start = fromApiDate(apiDate);
        if (granularity === "day") return fullDate.format(start);
        if (granularity === "month") return longMonth.format(start);
        return `${dayMonth.format(start)} – ${fullDate.format(bucketEnd(start, granularity))}`;
      },
    };
  }, [locale, t]);
}

export type Formatters = ReturnType<typeof useFormatters>;
