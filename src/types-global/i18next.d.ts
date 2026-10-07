import "i18next";
import type ru from "@/i18n/locales/ru";

// Kalitlar tipi — `t("common.actions.save")` noto'g'ri yozilsa typecheck xato beradi.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: typeof ru };
    returnNull: false;
  }
}
