export type RetentionGranularity = "week" | "month";
export type RetentionEntity = "users" | "organizations";

/**
 * GET /api/v1/admin/analytics/retention — kohortalar: boshlanishi [from, to] ga tushgan
 * haftalar/oylar (dushanba / 1-sana bo'yicha tekislangan).
 */
export interface RetentionParams {
  from: string;
  to: string;
  granularity: RetentionGranularity;
  entity: RetentionEntity;
  /** Ustunlar soni (0-davr ham kiradi). Default 12. */
  periods?: number;
}

export interface RetentionCohort {
  /** Kohorta boshlanishi, YYYY-MM-DD. */
  start: string;
  size: number;
  /** values[k] — k-davrda faol bo'lgan ulush 0..1; null — davr hali boshlanmagan. */
  values: (number | null)[];
}

export interface RetentionResponse {
  granularity: RetentionGranularity;
  entity: RetentionEntity;
  periods: number;
  cohorts: RetentionCohort[];
  /** Kohortalar hajmi bo'yicha o'rtacha (har ustun uchun). */
  average: (number | null)[];
}
