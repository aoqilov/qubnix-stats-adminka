import type { Granularity, KpiValue } from "@/types/analytics";
import type { Platform, UiLanguage } from "@/types/domain";

/** GET /api/v1/admin/analytics/growth */
export interface GrowthSummaryResponse {
  kpis: {
    /** Barcha ro'yxatdan o'tishlar (taklif qilinganlar ham). */
    new_users: KpiValue;
    new_orgs: KpiValue;
    /** 0..1 — yangi foydalanuvchilarning taklif havolasi orqali kelgan ulushi. */
    invited_share: KpiValue;
    dau: KpiValue;
    /** Davr oxirigacha 7 kun. */
    wau: KpiValue;
    /** Davr oxirigacha 30 kun. */
    mau: KpiValue;
    stickiness: KpiValue;
  };
  granularity: Granularity;
  /** Ro'yxatdan o'tishlar platforma bo'yicha; `invited` — shulardan taklif orqali. */
  signups_series: { date: string; telegram: number; web: number; pwa: number; total: number; invited: number }[];
  /** Qadam ichidagi o'rtacha DAU. */
  active_series: { date: string; dau: number }[];
  /** Davrdagi yangi foydalanuvchilar. */
  platforms: { platform: Platform; users: number; share: number }[];
  languages: { language: UiLanguage; users: number; share: number }[];
}
