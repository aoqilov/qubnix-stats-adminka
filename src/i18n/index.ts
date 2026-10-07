import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "./locales/ru";
import { DEFAULT_LANGUAGE } from "./languages";

/**
 * Barcha bo'limlar (common, ui, layout, ...) bitta `translation` namespace ichida —
 * kalit to'liq yo'l bilan yoziladi: t("common.actions.save"), t("layout.nav.overview").
 * Kalitlar `types-global/i18next.d.ts` orqali tiplangan.
 */
export const resources = {
  ru: { translation: ru },
} as const;

export const defaultNS = "translation";

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS,
  interpolation: { escapeValue: false }, // React o'zi escape qiladi.
  returnNull: false,
});

document.documentElement.lang = i18n.language;

export default i18n;
