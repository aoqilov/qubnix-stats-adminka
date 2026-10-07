import type { Granularity, KpiValue } from "@/types/analytics";
import type { PlanId } from "@/types/domain";

/** GET /api/v1/admin/analytics/overview — ta'riflar: utils/metrics.ts. */
export interface OverviewResponse {
  kpis: {
    /** Davr oxiridagi MRR, so'm. */
    mrr: KpiValue;
    arr: KpiValue;
    paying_orgs: KpiValue;
    /** Davrdagi daromad, so'm. */
    revenue: KpiValue;
    new_users: KpiValue;
    new_orgs: KpiValue;
    /** O'rtacha DAU. */
    dau: KpiValue;
    /** Davr oxirigacha 30 kun. */
    mau: KpiValue;
    /** 0..1 */
    stickiness: KpiValue;
    /** 0..1 — free → paid. */
    conversion: KpiValue;
    /** Oylik churn, 0..1 — davr uzunligiga bog'liq emas (utils/metrics.ts). */
    churn_rate: KpiValue;
  };
  granularity: Granularity;
  /** Har qadam oxiridagi holat. */
  mrr_series: { date: string; mrr: number; paying_orgs: number }[];
  /** Davr oxirida tariflar bo'yicha kompaniyalar va MRR. */
  plan_share: { plan: PlanId; orgs: number; mrr: number }[];
}
