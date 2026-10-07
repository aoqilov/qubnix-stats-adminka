import { mockDelay } from "@/api-config/mock";
import { getMockDb } from "@/mocks/db";
import { dateOf } from "@/mocks/calendar";
import {
  activeUsersBetween,
  avgDau,
  buildBuckets,
  churnedIn,
  firstPaidIn,
  kpi,
  mrrAt,
  orgsCreatedIn,
  payingOrgDaysIn,
  resolveQuery,
  revenueIn,
  usersCreatedIn,
} from "@/mocks/queries";
import { monthlyChurnRate, ratio } from "@/utils/metrics";
import type { PeriodQuery } from "@/types/analytics";
import type { OverviewResponse } from "./overview.types";

export const overviewMock = {
  async get(params: PeriodQuery): Promise<OverviewResponse> {
    await mockDelay();
    const db = getMockDb();
    const query = resolveQuery(params, db.today);
    const end = mrrAt(db, query.current.to);
    const orgsAtEnd = db.orgs.filter((org) => org.createdDay <= query.current.to).length;

    return {
      kpis: {
        mrr: kpi((r) => mrrAt(db, r.to).mrr, query),
        arr: kpi((r) => mrrAt(db, r.to).mrr * 12, query),
        paying_orgs: kpi((r) => mrrAt(db, r.to).paying, query),
        revenue: kpi((r) => revenueIn(db, r), query),
        new_users: kpi((r) => usersCreatedIn(db, r).length, query),
        new_orgs: kpi((r) => orgsCreatedIn(db, r).length, query),
        dau: kpi((r) => avgDau(db, r), query),
        mau: kpi((r) => activeUsersBetween(db, r.to - 29, r.to), query),
        stickiness: kpi(
          (r) => ratio(avgDau(db, { from: r.to - 29, to: r.to }), activeUsersBetween(db, r.to - 29, r.to)),
          query,
        ),
        conversion: kpi((r) => ratio(firstPaidIn(db, r).length, orgsCreatedIn(db, r).length), query),
        churn_rate: kpi((r) => monthlyChurnRate(churnedIn(db, r).length, payingOrgDaysIn(db, r)), query),
      },
      granularity: query.granularity,
      mrr_series: buildBuckets(query.current, query.granularity).map((bucket) => {
        const snapshot = mrrAt(db, bucket.end);
        return { date: dateOf(bucket.start), mrr: snapshot.mrr, paying_orgs: snapshot.paying };
      }),
      plan_share: [
        { plan: "start", orgs: orgsAtEnd - end.paying, mrr: 0 },
        { plan: "pro", orgs: end.byPlan.pro.orgs, mrr: end.byPlan.pro.mrr },
        { plan: "business", orgs: end.byPlan.business.orgs, mrr: end.byPlan.business.mrr },
      ],
    };
  },
};
