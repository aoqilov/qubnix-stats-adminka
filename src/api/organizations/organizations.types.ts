import type { Pagination } from "@/types/api";
import type {
  BillingPeriod,
  ChannelId,
  OrgHealth,
  OrgSizeSegment,
  PlanId,
} from "@/types/domain";

/** Faqat agregatlar — kompaniya ichidagi kontent (vazifa, loyiha nomlari) ko'rsatilmaydi. */
export interface OrganizationRow {
  id: number;
  name: string;
  owner_name: string;
  /** Egasi qaysi kanaldan kelgan. */
  channel: ChannelId;
  created_at: string;
  /** Davr oxiridagi holat. */
  plan: PlanId;
  billing: BillingPeriod | null;
  mrr: number;
  members: number;
  projects: number;
  routines: number;
  /** Davrda yaratilgan vazifalar. */
  tasks_in_period: number;
  /** 0..100 — oxirgi 8 haftaning nechtasida faol. */
  activity_score: number;
  last_active_at: string | null;
  health: OrgHealth;
  size_segment: OrgSizeSegment;
  /** Birinchi to'lov sanasi. */
  paid_since: string | null;
}

export type OrganizationSort = "mrr" | "members" | "activity" | "created_at" | "tasks" | "last_active";

/** GET /api/v1/admin/organizations */
export interface OrganizationsListParams {
  from: string;
  to: string;
  search?: string;
  plan?: PlanId;
  size?: OrgSizeSegment;
  health?: OrgHealth;
  sort?: OrganizationSort;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface OrganizationsListResponse {
  organizations: OrganizationRow[];
  pagination: Pagination;
}

/** GET /api/v1/admin/analytics/organizations/segments — davr oxiridagi holat. */
export interface OrganizationSegmentsResponse {
  total: number;
  by_size: { segment: OrgSizeSegment; orgs: number; paying: number; mrr: number }[];
  by_health: { health: OrgHealth; orgs: number; paying: number; mrr: number }[];
}
