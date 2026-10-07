import { mockDelay } from "@/api-config/mock";
import { getMockDb, type MockDb } from "@/mocks/db";
import { dateOf, dateTimeOf, dayOf } from "@/mocks/calendar";
import {
  bucketIndexer,
  buildBuckets,
  inRange,
  kpi,
  mrrAt,
  paginate,
  resolveQuery,
  revenueIn,
  type DayRange,
} from "@/mocks/queries";
import type { MockPayment } from "@/mocks/types";
import { ratio } from "@/utils/metrics";
import type { PeriodQuery } from "@/types/analytics";
import {
  PAID_PLAN_IDS,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "@/types/domain";
import type {
  PaymentRow,
  PaymentsListParams,
  PaymentsListResponse,
  PaymentsSummaryResponse,
} from "./payments.types";

function paymentsIn(db: MockDb, range: DayRange): MockPayment[] {
  return db.payments.filter((payment) => inRange(payment.day, range));
}

function successRate(payments: MockPayment[]): number | null {
  const paid = payments.filter((p) => p.status === "paid").length;
  const failed = payments.filter((p) => p.status === "failed").length;
  return ratio(paid, paid + failed);
}

function toRow(db: MockDb, payment: MockPayment): PaymentRow {
  return {
    id: payment.id,
    created_at: dateTimeOf(payment.day, payment.minute),
    org_id: payment.orgId,
    org_name: db.orgById.get(payment.orgId)!.name,
    plan: payment.plan,
    billing: payment.billing,
    amount: payment.amount,
    provider: payment.provider,
    status: payment.status,
    kind: payment.kind,
  };
}

export const paymentsMock = {
  async summary(params: PeriodQuery): Promise<PaymentsSummaryResponse> {
    await mockDelay();
    const db = getMockDb();
    const query = resolveQuery(params, db.today);
    const current = paymentsIn(db, query.current);
    const paid = current.filter((p) => p.status === "paid");

    const buckets = buildBuckets(query.current, query.granularity);
    const indexOf = bucketIndexer(buckets);
    const revenueSeries = buckets.map((bucket) => ({ date: dateOf(bucket.start), payme: 0, click: 0, total: 0 }));
    for (const payment of paid) {
      const point = revenueSeries[indexOf(payment.day)];
      point[payment.provider] += payment.amount;
      point.total += payment.amount;
    }

    return {
      kpis: {
        revenue: kpi((r) => revenueIn(db, r), query),
        paid_count: kpi((r) => paymentsIn(db, r).filter((p) => p.status === "paid").length, query),
        success_rate: kpi((r) => successRate(paymentsIn(db, r)), query),
        arpa: kpi((r) => {
          const snapshot = mrrAt(db, r.to);
          return snapshot.paying > 0 ? Math.round(snapshot.mrr / snapshot.paying) : null;
        }, query),
        average_check: kpi((r) => {
          const items = paymentsIn(db, r).filter((p) => p.status === "paid");
          return items.length > 0 ? Math.round(items.reduce((s, p) => s + p.amount, 0) / items.length) : null;
        }, query),
      },
      granularity: query.granularity,
      revenue_series: revenueSeries,
      providers: PAYMENT_PROVIDERS.map((provider) => {
        const items = current.filter((p) => p.provider === provider);
        const providerPaid = items.filter((p) => p.status === "paid");
        return {
          provider,
          revenue: providerPaid.reduce((s, p) => s + p.amount, 0),
          paid: providerPaid.length,
          failed: items.filter((p) => p.status === "failed").length,
          success_rate: successRate(items),
        };
      }),
      statuses: PAYMENT_STATUSES.map((status) => {
        const items = current.filter((p) => p.status === status);
        return { status, count: items.length, amount: items.reduce((s, p) => s + p.amount, 0) };
      }),
      plans: PAID_PLAN_IDS.map((plan) => {
        const items = paid.filter((p) => p.plan === plan);
        return { plan, revenue: items.reduce((s, p) => s + p.amount, 0), paid: items.length };
      }),
    };
  },

  async list(params: PaymentsListParams): Promise<PaymentsListResponse> {
    await mockDelay();
    const db = getMockDb();
    const range = { from: dayOf(params.from), to: Math.min(dayOf(params.to), db.today) };
    const search = params.search?.trim().toLowerCase();
    const filtered = paymentsIn(db, range)
      .filter(
        (p) =>
          (!params.provider || p.provider === params.provider) &&
          (!params.status || p.status === params.status) &&
          (!params.plan || p.plan === params.plan) &&
          (!search || db.orgById.get(p.orgId)!.name.toLowerCase().includes(search)),
      )
      .reverse(); // eng yangisi birinchi
    const { items, pagination } = paginate(filtered, params.page, params.limit);
    return {
      payments: items.map((payment) => toRow(db, payment)),
      pagination,
      totals: {
        count: filtered.length,
        amount: filtered.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0),
      },
    };
  },
};
