/**
 * Qo'llab-quvvatlanadigan tillar. Hozircha faqat `ru` — panel ichki jamoa (marketing va
 * statistika bo'limi) uchun. Til qo'shilsa: `locales/<code>/` (`typeof ru` bilan) va shu ro'yxat.
 */
export const LANGUAGES = [{ code: "ru", label: "Русский", intlLocale: "ru-RU" }] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "ru";

/** `Intl.*` va `CusCalendar` uchun — til kodidan to'liq locale. */
export function intlLocaleOf(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.intlLocale ?? "ru-RU";
}
