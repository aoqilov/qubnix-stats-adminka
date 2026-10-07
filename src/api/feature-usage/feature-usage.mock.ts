import { mockDelay } from "@/api-config/mock";
import { getMockDb } from "@/mocks/db";
import { dateOf } from "@/mocks/calendar";
import { bucketIndexer, buildBuckets, kpi, resolveQuery } from "@/mocks/queries";
import { FEATURE_INDEX, usageTotals } from "@/mocks/usage";
import { ratio } from "@/utils/metrics";
import type { PeriodQuery } from "@/types/analytics";
import { FEATURE_KEYS, PLAN_IDS, type FeatureKey, type PlanId } from "@/types/domain";
import type { FeatureUsageResponse } from "./feature-usage.types";

export const featureUsageMock = {
  async summary(params: PeriodQuery): Promise<FeatureUsageResponse> {
    await mockDelay();
    const db = getMockDb();
    const query = resolveQuery(params, db.today);
    const totals = usageTotals(db, query.current);

    const activeByPlan: Record<PlanId, number> = { start: 0, pro: 0, business: 0 };
    for (const plan of totals.activeOrgPlans.values()) activeByPlan[plan] += 1;
    const activeOrgs = totals.activeOrgPlans.size;

    const buckets = buildBuckets(query.current, query.granularity);
    const indexOf = bucketIndexer(buckets);
    const series = buckets.map((bucket) => ({
      date: dateOf(bucket.start),
      ...(Object.fromEntries(FEATURE_KEYS.map((feature) => [feature, 0])) as Record<FeatureKey, number>),
    }));
    for (const [day, row] of totals.byDay) {
      const point = series[indexOf(day)];
      FEATURE_KEYS.forEach((feature, i) => {
        point[feature] += row[i];
      });
    }

    const eventsOf = (feature: FeatureKey) => (range: { from: number; to: number }) => {
      const index = FEATURE_INDEX[feature];
      let sum = 0;
      for (const row of usageTotals(db, range).byDay.values()) sum += row[index];
      return sum;
    };

    return {
      active_orgs: kpi((r) => usageTotals(db, r).activeOrgPlans.size, query),
      active_orgs_by_plan: PLAN_IDS.map((plan) => ({ plan, orgs: activeByPlan[plan] })),
      features: FEATURE_KEYS.map((feature) => {
        const index = FEATURE_INDEX[feature];
        const orgs = new Set<number>();
        for (const plan of PLAN_IDS) for (const id of totals.orgsByPlan[plan][index]) orgs.add(id);
        return {
          feature,
          events: kpi(eventsOf(feature), query),
          orgs: orgs.size,
          org_share: ratio(orgs.size, activeOrgs),
          by_plan: PLAN_IDS.map((plan) => ({
            plan,
            events: totals.eventsByPlan[plan][index],
            orgs: totals.orgsByPlan[plan][index].size,
            org_share: ratio(totals.orgsByPlan[plan][index].size, activeByPlan[plan]),
          })),
        };
      }),
      granularity: query.granularity,
      series,
    };
  },
};
