import type { Granularity, KpiValue } from "@/types/analytics";
import type { FeatureKey, PlanId } from "@/types/domain";

/**
 * GET /api/v1/admin/analytics/feature-usage. Hodisalar: tasks — yaratilgan vazifalar,
 * routines — takroriy vazifalar ishga tushishi, calendar / statistics — ochilishlar,
 * files — yuklangan fayllar, audio — ovozli tavsiflar.
 */
export interface FeatureUsageResponse {
  /** Davrda faol bo'lgan kompaniyalar (kamida bitta xodimi). */
  active_orgs: KpiValue;
  /** Faol kompaniyalar davr oxiridagi tarif bo'yicha. */
  active_orgs_by_plan: { plan: PlanId; orgs: number }[];
  features: {
    feature: FeatureKey;
    events: KpiValue;
    /** Funksiyadan foydalangan kompaniyalar. */
    orgs: number;
    /** 0..1 — faol kompaniyalardagi ulushi. */
    org_share: number | null;
    by_plan: { plan: PlanId; events: number; orgs: number; org_share: number | null }[];
  }[];
  granularity: Granularity;
  series: ({ date: string } & Record<FeatureKey, number>)[];
}
