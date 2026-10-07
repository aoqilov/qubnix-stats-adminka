// qubnix domenining umumiy qiymatlari — API type'lari ham, mock generator ham shularni ishlatadi.
// Matn emas, kod: UI ularni i18n orqali tarjima qiladi.

export type PlanId = "start" | "pro" | "business";
export type PaidPlanId = Exclude<PlanId, "start">;
export type BillingPeriod = "monthly" | "yearly";

/** Obuna davri qanday boshlangan. */
export type PeriodKind = "new" | "renewal" | "upgrade" | "downgrade";

export type Platform = "telegram" | "web" | "pwa";
export type UiLanguage = "ru" | "uz" | "uz-Cyrl";

/**
 * Ro'yxatdan o'tish manbai: bot `start` parametri / UTM. `invite` — kompaniyaga taklif
 * havolasi orqali kelgan xodim (marketing kanali emas, virusli o'sish).
 */
export type ChannelId =
  | "organic"
  | "referral"
  | "instagram"
  | "telegram_ads"
  | "telegram_channels"
  | "google"
  | "invite";

export type PaymentProvider = "payme" | "click";
export type PaymentStatus = "paid" | "failed" | "cancelled" | "pending";

export type FeatureKey = "tasks" | "routines" | "calendar" | "statistics" | "files" | "audio";

export type OrgHealth = "active" | "cooling" | "at_risk";
export type OrgSizeSegment = "1" | "2-5" | "6-20" | "21+";

export type StatsDepth = "today" | "3months" | "full";

/** Tarif chegaralari; null — cheksiz. qubnix'dagi `TariffLimits` bilan bir xil. */
export interface PlanLimits {
  members: number;
  projects: number | null;
  routines: number | null;
  stats: StatsDepth;
}

export interface TariffPlan {
  id: PlanId;
  /** Brend nomi — tarjima qilinmaydi. */
  name: string;
  price_monthly: number;
  price_yearly: number;
  limits: PlanLimits;
}

export const PLAN_IDS: readonly PlanId[] = ["start", "pro", "business"];

/** Tarif nomlari — brend, tarjima qilinmaydi (qubnix'da ham shunday). */
export const PLAN_NAMES: Record<PlanId, string> = {
  start: "Start",
  pro: "Pro",
  business: "Business",
};

/** Tarif darajasi — o'tish yuqoriga (upgrade) yoki pastga ekanini aniqlash uchun. */
export const PLAN_RANK: Record<PlanId, number> = { start: 0, pro: 1, business: 2 };
export const PAID_PLAN_IDS: readonly PaidPlanId[] = ["pro", "business"];
export const PLATFORMS: readonly Platform[] = ["telegram", "web", "pwa"];
export const UI_LANGUAGES: readonly UiLanguage[] = ["ru", "uz", "uz-Cyrl"];
export const CHANNEL_IDS: readonly ChannelId[] = [
  "organic",
  "referral",
  "instagram",
  "telegram_ads",
  "telegram_channels",
  "google",
  "invite",
];
export const PAYMENT_PROVIDERS: readonly PaymentProvider[] = ["payme", "click"];
export const PAYMENT_STATUSES: readonly PaymentStatus[] = ["paid", "failed", "cancelled", "pending"];
export const FEATURE_KEYS: readonly FeatureKey[] = ["tasks", "routines", "calendar", "statistics", "files", "audio"];
export const ORG_HEALTHS: readonly OrgHealth[] = ["active", "cooling", "at_risk"];
export const ORG_SIZE_SEGMENTS: readonly OrgSizeSegment[] = ["1", "2-5", "6-20", "21+"];
