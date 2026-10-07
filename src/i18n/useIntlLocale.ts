import { useTranslation } from "react-i18next";
import i18n from "./index";
import { intlLocaleOf } from "./languages";

/** Komponent ichida — til almashganda qayta render bo'ladi. `Intl.*` va `CusCalendar` uchun. */
export function useIntlLocale(): string {
  const { i18n: instance } = useTranslation();
  return intlLocaleOf(instance.language);
}

/**
 * Komponentdan tashqaridagi util'lar uchun (formatWeekdayDate, weekDays ...). Chaqiruvchi
 * komponent `useTranslation` ishlatgani uchun til almashganda u baribir qayta render bo'ladi.
 */
export function currentIntlLocale(): string {
  return intlLocaleOf(i18n.language);
}
