import type { Granularity, KpiValue } from "@/types/analytics";
import type { Pagination } from "@/types/api";
import type {
  BillingPeriod,
  PaidPlanId,
  PaymentProvider,
  PaymentStatus,
  PeriodKind,
} from "@/types/domain";

/** GET /api/v1/admin/analytics/payments */
export interface PaymentsSummaryResponse {
  kpis: {
    /** So'm, faqat `paid`. */
    revenue: KpiValue;
    paid_count: KpiValue;
    /** 0..1 — paid / (paid + failed). */
    success_rate: KpiValue;
    /** Davr oxiridagi MRR / pullik kompaniyalar. */
    arpa: KpiValue;
    /** Daromad / muvaffaqiyatli to'lovlar. */
    average_check: KpiValue;
  };
  granularity: Granularity;
  revenue_series: { date: string; payme: number; click: number; total: number }[];
  providers: {
    provider: PaymentProvider;
    revenue: number;
    paid: number;
    failed: number;
    success_rate: number | null;
  }[];
  statuses: { status: PaymentStatus; count: number; amount: number }[];
  plans: { plan: PaidPlanId; revenue: number; paid: number }[];
}

/** GET /api/v1/admin/payments */
export interface PaymentsListParams {
  from: string;
  to: string;
  provider?: PaymentProvider;
  status?: PaymentStatus;
  plan?: PaidPlanId;
  /** Kompaniya nomi bo'yicha. */
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaymentRow {
  id: number;
  /** Mahalliy vaqt, "YYYY-MM-DDTHH:mm:ss". */
  created_at: string;
  org_id: number;
  org_name: string;
  plan: PaidPlanId;
  billing: BillingPeriod;
  amount: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  /** Qaysi obuna davri uchun; to'lov oynasidan chiqib ketilgan (cancelled) bo'lsa — null. */
  kind: PeriodKind | null;
}

export interface PaymentsListResponse {
  payments: PaymentRow[];
  pagination: Pagination;
  /** Filtrga mos barcha to'lovlar bo'yicha (sahifa emas). `amount` — faqat paid. */
  totals: { count: number; amount: number };
}
