import { mockDelay } from "@/api-config/mock";
import { getMockDb, type MockDb } from "@/mocks/db";
import { dateOf, dayOf } from "@/mocks/calendar";
import {
  activityScore,
  fullName,
  healthOf,
  memo,
  orgLastActive,
  ownerOf,
  paginate,
  periodAt,
  periodMrr,
  planAt,
  sizeSegmentOf,
  usageAt,
  type DayRange,
} from "@/mocks/queries";
import { FEATURE_INDEX, usageTotals } from "@/mocks/usage";
import type { PeriodQuery } from "@/types/analytics";
import { ORG_HEALTHS, ORG_SIZE_SEGMENTS } from "@/types/domain";
import type {
  OrganizationRow,
  OrganizationSegmentsResponse,
  OrganizationSort,
  OrganizationsListParams,
  OrganizationsListResponse,
} from "./organizations.types";

function rangeOf(db: MockDb, from: string, to: string): DayRange {
  return { from: dayOf(from), to: Math.min(dayOf(to), db.today) };
}

function buildRows(db: MockDb, range: DayRange): OrganizationRow[] {
  const usage = usageTotals(db, range);
  const tasksIndex = FEATURE_INDEX.tasks;
  return db.orgs
    .filter((org) => org.createdDay <= range.to)
    .map((org) => {
      const period = periodAt(org, range.to);
      const used = usageAt(db, org, range.to);
      const lastActive = orgLastActive(db, org, range.to);
      return {
        id: org.id,
        name: org.name,
        owner_name: fullName(ownerOf(db, org)),
        channel: org.channel,
        created_at: dateOf(org.createdDay),
        plan: planAt(org, range.to),
        billing: period?.billing ?? null,
        mrr: period ? periodMrr(period) : 0,
        members: used.members,
        projects: used.projects,
        routines: used.routines,
        tasks_in_period: usage.byOrg.get(org.id)?.[tasksIndex] ?? 0,
        activity_score: activityScore(db, org, range.to),
        last_active_at: lastActive === null ? null : dateOf(lastActive),
        health: healthOf(lastActive, range.to),
        size_segment: sizeSegmentOf(used.members),
        paid_since: org.firstPaidDay !== null && org.firstPaidDay <= range.to ? dateOf(org.firstPaidDay) : null,
      };
    });
}

const rowsCache = memo<OrganizationRow[]>(4);

function rowsFor(db: MockDb, range: DayRange): OrganizationRow[] {
  return rowsCache(`${db.today}:${range.from}:${range.to}`, () => buildRows(db, range));
}

const SORT_VALUE: Record<OrganizationSort, (row: OrganizationRow) => number | string> = {
  mrr: (row) => row.mrr,
  members: (row) => row.members,
  activity: (row) => row.activity_score,
  created_at: (row) => row.created_at,
  tasks: (row) => row.tasks_in_period,
  last_active: (row) => row.last_active_at ?? "",
};

export const organizationsMock = {
  async list(params: OrganizationsListParams): Promise<OrganizationsListResponse> {
    await mockDelay();
    const db = getMockDb();
    const search = params.search?.trim().toLowerCase();
    const sortValue = SORT_VALUE[params.sort ?? "mrr"];
    const direction = params.order === "asc" ? 1 : -1;
    const filtered = rowsFor(db, rangeOf(db, params.from, params.to))
      .filter(
        (row) =>
          (!params.plan || row.plan === params.plan) &&
          (!params.size || row.size_segment === params.size) &&
          (!params.health || row.health === params.health) &&
          (!search || row.name.toLowerCase().includes(search) || row.owner_name.toLowerCase().includes(search)),
      )
      .sort((a, b) => {
        const left = sortValue(a);
        const right = sortValue(b);
        if (left === right) return b.activity_score - a.activity_score || a.id - b.id;
        return (left < right ? -1 : 1) * direction;
      });
    const { items, pagination } = paginate(filtered, params.page, params.limit);
    return { organizations: items, pagination };
  },

  async segments(params: PeriodQuery): Promise<OrganizationSegmentsResponse> {
    await mockDelay();
    const db = getMockDb();
    const rows = rowsFor(db, rangeOf(db, params.from, params.to));
    const summarize = (items: OrganizationRow[]) => ({
      orgs: items.length,
      paying: items.filter((row) => row.plan !== "start").length,
      mrr: items.reduce((sum, row) => sum + row.mrr, 0),
    });
    return {
      total: rows.length,
      by_size: ORG_SIZE_SEGMENTS.map((segment) => ({
        segment,
        ...summarize(rows.filter((row) => row.size_segment === segment)),
      })),
      by_health: ORG_HEALTHS.map((health) => ({
        health,
        ...summarize(rows.filter((row) => row.health === health)),
      })),
    };
  },
};
