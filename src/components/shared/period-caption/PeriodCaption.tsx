import { useTranslation } from "react-i18next";
import { usePeriod } from "@/hooks/usePeriod";
import { useIntlLocale } from "@/i18n/useIntlLocale";
import { fromApiDate } from "@/utils/apiDate";
import type { DateRange } from "@/utils/period";

function formatRange(range: DateRange, locale: string): { from: string; to: string } {
  const from = fromApiDate(range.from);
  const to = fromApiDate(range.to);
  const sameYear = from.getFullYear() === to.getFullYear();
  return {
    from: from.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: sameYear ? undefined : "numeric",
    }),
    to: to.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }),
  };
}

/** Sahifa sarlavhasi ostida: tanlangan davr aniq sanalarda (va solishtirish yoqilgan bo'lsa — oldingi davr). */
export function PeriodCaption() {
  const { t } = useTranslation();
  const locale = useIntlLocale();
  const { current, previous, compare } = usePeriod();

  return (
    <span>
      {t("layout.period.range", formatRange(current, locale))}
      {compare && (
        <span className="font-normal text-secondary">
          {" · "}
          {t("layout.period.previous", formatRange(previous, locale))}
        </span>
      )}
    </span>
  );
}
