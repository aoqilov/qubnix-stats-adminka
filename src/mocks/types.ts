import type {
  BillingPeriod,
  ChannelId,
  PaidPlanId,
  PaymentProvider,
  PaymentStatus,
  PeriodKind,
  Platform,
  UiLanguage,
} from "@/types/domain";

/** Mock "baza" yozuvlari. Sanalar — day index (`calendar.ts`). */

export interface MockUser {
  /** Barqaror kalit — seed ham shundan (qarang: random.ts). */
  key: number;
  index: number;
  firstName: string;
  lastName: string;
  createdDay: number;
  channel: ChannelId;
  campaignId: string | null;
  platform: Platform;
  language: UiLanguage;
  /** 0..1 — qanchalik muntazam qaytadi. */
  stickiness: number;
  /** Birinchi vazifa kuni (bugundan keyin bo'lishi mumkin — so'rovlar `<= today` tekshiradi). */
  activationDay: number | null;
  /** Shu haftadan keyin umuman qaytmaydi. */
  quitWeek: number;
  /** Faol haftada nechta kun kiradi (1..6). */
  daysPerWeek: number;
  orgId: number | null;
  isOwner: boolean;
}

export interface MockPeriod {
  plan: PaidPlanId;
  billing: BillingPeriod;
  startDay: number;
  /** Kirmaydi: obuna `startDay <= d < endDay` kunlarda faol. */
  endDay: number;
  kind: PeriodKind;
}

export interface MockOrg {
  id: number;
  name: string;
  ownerIndex: number;
  createdDay: number;
  channel: ChannelId;
  campaignId: string | null;
  /** Egasi bilan birga. Xodim kompaniyaga ro'yxatdan o'tgan kunida qo'shiladi (`createdDay`). */
  memberIndexes: number[];
  /**
   * Kompaniya istagan hajm — tarif limiti bilan cheklanmagan. Haqiqiy son = min(istak, limit);
   * istak limitdan katta bo'lsa — kompaniya limitga "urilgan" (upsell signali).
   */
  wantedMembers: number;
  wantedProjects: number;
  wantedRoutines: number;
  /** Bir faol xodim-haftaga vazifalar. */
  taskRate: number;
  firstProjectDay: number | null;
  invitedDay: number | null;
  firstPaidDay: number | null;
  /** Vaqt bo'yicha tartiblangan; ketma-ket davrlar uzluksiz (keyingisi oldingisining endDay'ida). */
  periods: MockPeriod[];
}

export interface MockPayment {
  id: number;
  orgId: number;
  plan: PaidPlanId;
  billing: BillingPeriod;
  amount: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  day: number;
  /** Kun ichidagi daqiqa. */
  minute: number;
  kind: MockPeriod["kind"] | null;
}

/** Bot start'lar (ro'yxatdan o'tganlar ham, o'tmaganlar ham) — kun/kanal/kampaniya bo'yicha. */
export interface MockLeadCount {
  day: number;
  channel: ChannelId;
  campaignId: string | null;
  leads: number;
}
