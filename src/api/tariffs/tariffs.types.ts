import type { Granularity, KpiValue } from "@/types/analytics";
import type { Pagination } from "@/types/api";
import type { BillingPeriod, OrgHealth, PaidPlanId, PlanId, TariffPlan } from "@/types/domain";

/** GET /api/v1/admin/analytics/tariffs */
export interface TariffsSummaryResponse {
  plans: TariffPlan[];
  /** Davr oxirida. `share` — barcha kompaniyalardagi ulush, 0..1. */
  distribution: {
    plan: PlanId;
    orgs: number;
    share: number;
    mrr: number;
    monthly: number;
    yearly: number;
  }[];
  /** Davrda: yangi obunalar, yangilanishlar, tarif almashtirishlar, yangilanmay tugaganlar. */
  movements: {
    new: KpiValue;
    renewals: KpiValue;
    upgrades: KpiValue;
    downgrades: KpiValue;
    churned: KpiValue;
    /** new − churned. */
    net_paying: KpiValue;
  };
  /** Davrdagi tariflar orasidagi o'tishlar (start → pro, pro → business, pro → start, ...). */
  flows: { from: PlanId; to: PlanId; orgs: number }[];
  granularity: Granularity;
  series: {
    date: string;
    new: number;
    renewals: number;
    upgrades: number;
    downgrades: number;
    churned: number;
  }[];
  /** Bugungi holat bo'yicha (davr filtriga bog'liq emas). */
  expiring: {
    in_7_days: number;
    in_30_days: number;
    mrr_7_days: number;
    mrr_30_days: number;
  };
}

/** GET /api/v1/admin/subscriptions/expiring */
export interface ExpiringParams {
  days: 7 | 30;
  page?: number;
  limit?: number;
}

export interface ExpiringSubscription {
  org_id: number;
  org_name: string;
  owner_name: string;
  plan: PaidPlanId;
  billing: BillingPeriod;
  /** Oxirgi faol kun, YYYY-MM-DD. */
  ends_at: string;
  days_left: number;
  mrr: number;
  /** Kompaniyaning nechanchi to'lov davri (1 — birinchi). */
  period_number: number;
  health: OrgHealth;
}

export interface ExpiringResponse {
  subscriptions: ExpiringSubscription[];
  pagination: Pagination;
}

/** GET /api/v1/admin/analytics/tariffs/upsell */
export type LimitKey = "members" | "projects" | "routines";

export interface UpsellParams {
  plan?: "start" | "pro";
  page?: number;
  limit?: number;
}

export interface LimitUsage {
  used: number;
  /** Kompaniya istagan hajm (limitga urilgan urinishlar bilan). */
  wanted: number;
  /** null — cheksiz. */
  limit: number | null;
}

export interface UpsellCandidate {
  org_id: number;
  org_name: string;
  owner_name: string;
  plan: "start" | "pro";
  /** Ilgari to'lagan yuqoriroq tarif (obunani yangilamagan) — qaytarish (win-back) nomzodi. */
  previous_plan: PaidPlanId | null;
  suggested_plan: PaidPlanId;
  members: LimitUsage;
  projects: LimitUsage;
  routines: LimitUsage;
  /** Eng katta istak / limit nisbati (> 1 — limitdan oshishga uringan). */
  pressure: number;
  blocked_by: LimitKey[];
  activity_score: number;
  health: OrgHealth;
  /** Taklif qilingan tarifga o'tsa qo'shiladigan MRR. */
  potential_mrr: number;
}

export interface UpsellResponse {
  candidates: UpsellCandidate[];
  pagination: Pagination;
  summary: {
    total: number;
    by_reason: Record<LimitKey, number>;
    potential_mrr: number;
  };
}
