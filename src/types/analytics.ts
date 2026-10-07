/** Vaqt qatorlari qadami. Javobdagi `date` — qadam boshlanadigan kun (YYYY-MM-DD). */
export type Granularity = "day" | "week" | "month";

/**
 * Analitika so'rovlarining umumiy parametrlari — `usePeriod()` dan `toPeriodQuery()` orqali.
 * `compare_*` berilmasa javobdagi `previous` qiymatlar `null` bo'ladi.
 */
export interface PeriodQuery {
  /** YYYY-MM-DD, kiradi. */
  from: string;
  /** YYYY-MM-DD, kiradi. */
  to: string;
  compare_from?: string;
  compare_to?: string;
  /** Berilmasa — davr uzunligiga qarab (`autoGranularity`). */
  granularity?: Granularity;
}

/**
 * Bitta ko'rsatkich: joriy davr va solishtirish davri. `null` — hisoblab bo'lmaydi
 * (masalan, xarajat bor, lekin to'lovchi yo'q — CAC yo'q) yoki solishtirish o'chiq.
 */
export interface KpiValue {
  value: number | null;
  previous: number | null;
}
