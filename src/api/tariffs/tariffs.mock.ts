import { mockDelay } from "@/api-config/mock";
import { getMockDb, type MockDb } from "@/mocks/db";
import { PLANS, planById } from "@/mocks/catalog";
import { dateOf } from "@/mocks/calendar";
import {
  activityScore,
  bucketIndexer,
  buildBuckets,
  churnDayOf,
  churnedIn,
  fullName,
  healthOf,
  highestPlanBy,
  kpi,
  mrrAt,
  orgLastActive,
  ownerOf,
  paginate,
  periodAt,
  periodMrr,
  periodsStartedIn,
  planAt,
  resolveQuery,
  usageAt,
  type DayRange,
} from "@/mocks/queries";
import type { MockOrg } from "@/mocks/types";
import { ratio } from "@/utils/metrics";
import type { PeriodQuery } from "@/types/analytics";
import type { PaidPlanId, PeriodKind, PlanId } from "@/types/domain";
import type {
  ExpiringParams,
  ExpiringResponse,
  ExpiringSubscription,
  LimitKey,
  TariffsSummaryResponse,
  UpsellCandidate,
  UpsellParams,
  UpsellResponse,
} from "./tariffs.types";

function countKind(db: MockDb, range: DayRange, kind: PeriodKind): number {
  return periodsStartedIn(db, range).filter(({ period }) => period.kind === kind).length;
}

/** Bugun faol va `days` kun ichida tugaydigan obunalar. */
function expiringSubscriptions(db: MockDb, days: number): ExpiringSubscription[] {
  const result: ExpiringSubscription[] = [];
  for (const org of db.payingOrgs) {
    const period = periodAt(org, db.today);
    if (!period) continue;
    const daysLeft = period.endDay - db.today;
    if (daysLeft > days) continue;
    result.push({
      org_id: org.id,
      org_name: org.name,
      owner_name: fullName(ownerOf(db, org)),
      plan: period.plan,
      billing: period.billing,
      ends_at: dateOf(period.endDay - 1),
      days_left: daysLeft,
      mrr: periodMrr(period),
      period_number: org.periods.indexOf(period) + 1,
      health: healthOf(orgLastActive(db, org, db.today), db.today),
    });
  }
  return result.sort((a, b) => a.days_left - b.days_left || b.mrr - a.mrr);
}

/** Istakka mos eng arzon tarif. */
function suggestedPlan(org: MockOrg, current: "start" | "pro"): PaidPlanId {
  if (current === "pro") return "business";
  const pro = planById("pro").limits;
  const fitsPro =
    org.wantedMembers <= pro.members &&
    org.wantedProjects <= (pro.projects ?? Infinity) &&
    org.wantedRoutines <= (pro.routines ?? Infinity);
  return fitsPro ? "pro" : "business";
}

function upsellCandidates(db: MockDb): UpsellCandidate[] {
  const result: UpsellCandidate[] = [];
  for (const org of db.orgs) {
    const plan = planAt(org, db.today);
    if (plan === "business") continue;
    const health = healthOf(orgLastActive(db, org, db.today), db.today);
    if (health === "at_risk") continue;

    const limits = planById(plan).limits;
    const used = usageAt(db, org, db.today);
    const dims: Record<LimitKey, { used: number; wanted: number; limit: number | null }> = {
      members: { used: used.members, wanted: Math.max(org.wantedMembers, used.members), limit: limits.members },
      projects: { used: used.projects, wanted: Math.max(org.wantedProjects, used.projects), limit: limits.projects },
      routines: { used: used.routines, wanted: Math.max(org.wantedRoutines, used.routines), limit: limits.routines },
    };
    const blockedBy = (Object.keys(dims) as LimitKey[]).filter((key) => {
      const { wanted, limit } = dims[key];
      return limit !== null && wanted > limit;
    });
    if (blockedBy.length === 0) continue;

    const pressure = Math.max(
      ...blockedBy.map((key) => dims[key].wanted / (dims[key].limit as number)),
    );
    const suggested = suggestedPlan(org, plan);
    const currentPeriod = periodAt(org, db.today);
    const currentMrr = currentPeriod ? periodMrr(currentPeriod) : 0;
    const highest = highestPlanBy(org, db.today);
    result.push({
      org_id: org.id,
      org_name: org.name,
      owner_name: fullName(ownerOf(db, org)),
      plan,
      previous_plan: highest !== "start" && highest !== plan ? highest : null,
      suggested_plan: suggested,
      ...dims,
      pressure: Math.round(pressure * 100) / 100,
      blocked_by: blockedBy,
      activity_score: activityScore(db, org, db.today),
      health,
      potential_mrr: Math.max(0, planById(suggested).price_monthly - currentMrr),
    });
  }
  return result.sort((a, b) => b.pressure - a.pressure || b.activity_score - a.activity_score);
}

export const tariffsMock = {
  async plans() {
    await mockDelay();
    return [...PLANS];
  },

  async summary(params: PeriodQuery): Promise<TariffsSummaryResponse> {
    await mockDelay();
    const db = getMockDb();
    const query = resolveQuery(params, db.today);
    const { current } = query;
    const end = mrrAt(db, current.to);
    const orgsAtEnd = db.orgs.filter((org) => org.createdDay <= current.to).length;

    const started = periodsStartedIn(db, current);
    const churned = churnedIn(db, current);
    const flows = new Map<string, { from: PlanId; to: PlanId; orgs: number }>();
    const addFlow = (from: PlanId, to: PlanId) => {
      const key = `${from}>${to}`;
      const flow = flows.get(key) ?? { from, to, orgs: 0 };
      flow.orgs += 1;
      flows.set(key, flow);
    };
    for (const { period } of started) {
      if (period.kind === "new") addFlow("start", period.plan);
      if (period.kind === "upgrade") addFlow("pro", "business");
      if (period.kind === "downgrade") addFlow("business", "pro");
    }
    for (const org of churned) addFlow(org.periods[org.periods.length - 1].plan, "start");

    const buckets = buildBuckets(current, query.granularity);
    const indexOf = bucketIndexer(buckets);
    const series = buckets.map((bucket) => ({
      date: dateOf(bucket.start),
      new: 0,
      renewals: 0,
      upgrades: 0,
      downgrades: 0,
      churned: 0,
    }));
    const seriesKey: Record<PeriodKind, "new" | "renewals" | "upgrades" | "downgrades"> = {
      new: "new",
      renewal: "renewals",
      upgrade: "upgrades",
      downgrade: "downgrades",
    };
    for (const { period } of started) series[indexOf(period.startDay)][seriesKey[period.kind]] += 1;
    for (const org of churned) series[indexOf(churnDayOf(db, org)!)].churned += 1;

    const in7 = expiringSubscriptions(db, 7);
    const in30 = expiringSubscriptions(db, 30);

    return {
      plans: [...PLANS],
      distribution: [
        { plan: "start", orgs: orgsAtEnd - end.paying, share: ratio(orgsAtEnd - end.paying, orgsAtEnd) ?? 0, mrr: 0, monthly: 0, yearly: 0 },
        { plan: "pro", ...end.byPlan.pro, share: ratio(end.byPlan.pro.orgs, orgsAtEnd) ?? 0 },
        { plan: "business", ...end.byPlan.business, share: ratio(end.byPlan.business.orgs, orgsAtEnd) ?? 0 },
      ],
      movements: {
        new: kpi((r) => countKind(db, r, "new"), query),
        renewals: kpi((r) => countKind(db, r, "renewal"), query),
        upgrades: kpi((r) => countKind(db, r, "upgrade"), query),
        downgrades: kpi((r) => countKind(db, r, "downgrade"), query),
        churned: kpi((r) => churnedIn(db, r).length, query),
        net_paying: kpi((r) => countKind(db, r, "new") - churnedIn(db, r).length, query),
      },
      flows: [...flows.values()].sort((a, b) => b.orgs - a.orgs),
      granularity: query.granularity,
      series,
      expiring: {
        in_7_days: in7.length,
        in_30_days: in30.length,
        mrr_7_days: in7.reduce((sum, item) => sum + item.mrr, 0),
        mrr_30_days: in30.reduce((sum, item) => sum + item.mrr, 0),
      },
    };
  },

  async expiring({ days, page, limit }: ExpiringParams): Promise<ExpiringResponse> {
    await mockDelay();
    const { items, pagination } = paginate(expiringSubscriptions(getMockDb(), days), page, limit);
    return { subscriptions: items, pagination };
  },

  async upsell({ plan, page, limit }: UpsellParams): Promise<UpsellResponse> {
    await mockDelay();
    const all = upsellCandidates(getMockDb()).filter((item) => !plan || item.plan === plan);
    const { items, pagination } = paginate(all, page, limit);
    const byReason: Record<LimitKey, number> = { members: 0, projects: 0, routines: 0 };
    for (const item of all) for (const reason of item.blocked_by) byReason[reason] += 1;
    return {
      candidates: items,
      pagination,
      summary: {
        total: all.length,
        by_reason: byReason,
        potential_mrr: all.reduce((sum, item) => sum + item.potential_mrr, 0),
      },
    };
  },
};
