import type { PeriodQuery } from "@/types/analytics";
import type { ChannelId } from "@/types/domain";

export type FunnelStepKey =
  | "bot_start"
  | "registered"
  | "workspace"
  | "first_project"
  | "first_task"
  | "invited"
  | "paid";

/**
 * GET /api/v1/admin/analytics/funnel — kohorta: davrda botni ishga tushirgan / ro'yxatdan
 * o'tgan bevosita foydalanuvchilar (taklif qilingan xodimlar kirmaydi). Keyingi qadamlar
 * bugungacha bajarilgan bo'lsa hisoblanadi; har qadam oldingisining ichida.
 */
export interface FunnelParams extends PeriodQuery {
  channel?: Exclude<ChannelId, "invite">;
}

export interface FunnelStep {
  key: FunnelStepKey;
  count: number;
  /** Solishtirish davridagi son. */
  previous: number | null;
  /** 0..1 — oldingi qadamdan o'tganlar ulushi. */
  from_prev: number | null;
  /** 0..1 — birinchi qadamdan. */
  from_start: number | null;
}

export interface FunnelResponse {
  steps: FunnelStep[];
}
