import { PLAN_NAMES, type ChannelId, type PaidPlanId, type PlanId, type TariffPlan } from "@/types/domain";
import { dayOf } from "./calendar";

/** Tariflar — qubnix `src/queries/profile.queries.ts` bilan bir xil (narx, limit). */
export const PLANS: readonly TariffPlan[] = [
  {
    id: "start",
    name: PLAN_NAMES.start,
    price_monthly: 0,
    price_yearly: 0,
    limits: { members: 2, projects: 1, routines: 3, stats: "today" },
  },
  {
    id: "pro",
    name: PLAN_NAMES.pro,
    price_monthly: 149_000,
    price_yearly: 1_490_000,
    limits: { members: 10, projects: 5, routines: 30, stats: "3months" },
  },
  {
    id: "business",
    name: PLAN_NAMES.business,
    price_monthly: 349_000,
    price_yearly: 3_490_000,
    limits: { members: 100, projects: null, routines: null, stats: "full" },
  },
];

export function planById(id: PlanId): TariffPlan {
  return PLANS.find((plan) => plan.id === id)!;
}

export function priceOf(plan: PaidPlanId, billing: "monthly" | "yearly"): number {
  const tariff = planById(plan);
  return billing === "yearly" ? tariff.price_yearly : tariff.price_monthly;
}

/**
 * Bevosita (taklifsiz) kanallar xulq-atvori:
 * share — kunlik bazaviy ro'yxatdan o'tishlardagi ulushi (kampaniyasiz),
 * regRate — bot start'dan ro'yxatdan o'tishgacha, activation — 7 kunda birinchi vazifa,
 * stickShift — faollik moyilligiga qo'shimcha, payMult — to'lov ehtimoli ko'paytuvchisi.
 */
export interface ChannelProfile {
  share: number;
  regRate: number;
  activation: number;
  stickShift: number;
  payMult: number;
}

export const CHANNEL_PROFILES: Record<ChannelId, ChannelProfile> = {
  organic: { share: 0.3, regRate: 0.68, activation: 0.5, stickShift: 0.05, payMult: 1.1 },
  referral: { share: 0.12, regRate: 0.74, activation: 0.62, stickShift: 0.1, payMult: 1.4 },
  instagram: { share: 0.22, regRate: 0.52, activation: 0.36, stickShift: -0.06, payMult: 0.8 },
  telegram_ads: { share: 0.16, regRate: 0.58, activation: 0.42, stickShift: 0, payMult: 0.9 },
  telegram_channels: { share: 0.12, regRate: 0.62, activation: 0.46, stickShift: 0, payMult: 1 },
  google: { share: 0.08, regRate: 0.6, activation: 0.52, stickShift: 0.05, payMult: 1.2 },
  // Taklif qilingan xodim — kanal ulushi yo'q, kompaniya o'sishidan keladi.
  invite: { share: 0, regRate: 0.88, activation: 0.78, stickShift: 0, payMult: 0 },
};

/** Bevosita kanallar — tartib barqaror (generator shu tartibda yuradi). */
export const DIRECT_CHANNELS: readonly ChannelId[] = [
  "organic",
  "referral",
  "instagram",
  "telegram_ads",
  "telegram_channels",
  "google",
];

export interface Campaign {
  /** UTM / bot start parametri. */
  id: string;
  channel: ChannelId;
  startDay: number;
  /** null — doimiy (always-on). Kiradi. */
  endDay: number | null;
  /** Kunlik byudjet, so'm. */
  dailyBudget: number;
  /** Kanal hajmiga qo'shadigan ko'paytuvchi (always-on = 1). */
  boost: number;
}

function campaign(
  id: string,
  channel: ChannelId,
  from: string,
  to: string | null,
  dailyBudget: number,
  boost: number,
): Campaign {
  return { id, channel, startDay: dayOf(from), endDay: to ? dayOf(to) : null, dailyBudget, boost };
}

export const CAMPAIGNS: readonly Campaign[] = [
  campaign("ig_always_on", "instagram", "2025-04-07", null, 90_000, 1),
  campaign("ig_launch_spring25", "instagram", "2025-04-14", "2025-05-31", 250_000, 2),
  campaign("ig_back_to_work", "instagram", "2025-09-01", "2025-09-30", 240_000, 1.8),
  campaign("ig_new_year", "instagram", "2025-12-10", "2026-01-10", 300_000, 2.2),
  campaign("ig_reels_autumn26", "instagram", "2026-09-01", "2026-10-31", 350_000, 2.5),
  campaign("tg_ads_always_on", "telegram_ads", "2025-04-07", null, 70_000, 1),
  campaign("tg_ads_pro_promo", "telegram_ads", "2026-02-01", "2026-03-15", 200_000, 1.8),
  campaign("tg_ads_q3", "telegram_ads", "2026-07-01", "2026-08-31", 180_000, 1.6),
  campaign("tgch_partner_posts", "telegram_channels", "2025-04-07", null, 50_000, 1),
  campaign("tgch_biznes_posts", "telegram_channels", "2025-06-01", "2025-07-15", 120_000, 2),
  campaign("tgch_it_channels", "telegram_channels", "2026-04-01", "2026-05-15", 150_000, 2),
  campaign("google_search_brand", "google", "2025-04-07", null, 40_000, 1),
  campaign("google_search_tasks", "google", "2026-05-01", "2026-10-31", 90_000, 1.5),
];

export function isCampaignActive(item: Campaign, day: number): boolean {
  return day >= item.startDay && (item.endDay === null || day <= item.endDay);
}

/** Kun bo'yicha kampaniya xarajati, so'm. */
export function campaignSpend(item: Campaign, from: number, to: number): number {
  const start = Math.max(from, item.startDay);
  const end = Math.min(to, item.endDay ?? to);
  return end >= start ? (end - start + 1) * item.dailyBudget : 0;
}

/** Web versiya va PWA paydo bo'lgan kunlar — undan oldin bu platformalardan ro'yxatdan o'tish yo'q. */
export const WEB_LAUNCH_DAY = dayOf("2026-03-01");
export const PWA_LAUNCH_DAY = dayOf("2026-08-20");
