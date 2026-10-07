import { mockDelay } from "@/api-config/mock";
import { getMockDb, type MockDb } from "@/mocks/db";
import { dateOf, dayOf, monthOf, monthStartDay, weekOf } from "@/mocks/calendar";
import { orgActiveInWeek, orgMembers, userActiveInRange, userWeekActive } from "@/mocks/queries";
import type { MockOrg, MockUser } from "@/mocks/types";
import type {
  RetentionCohort,
  RetentionGranularity,
  RetentionParams,
  RetentionResponse,
} from "./retention.types";

const DEFAULT_PERIODS = 12;

interface PeriodWindow {
  start: number;
  end: number;
}

/** Kohorta/davr indeksi → kunlar oralig'i. */
function windowOf(index: number, granularity: RetentionGranularity): PeriodWindow {
  if (granularity === "week") return { start: index * 7, end: index * 7 + 6 };
  return { start: monthStartDay(index), end: monthStartDay(index + 1) - 1 };
}

function indexOf(day: number, granularity: RetentionGranularity): number {
  return granularity === "week" ? weekOf(day) : monthOf(day);
}

function userActive(db: MockDb, user: MockUser, index: number, granularity: RetentionGranularity): boolean {
  if (granularity === "week") return userWeekActive(db, user, index);
  const window = windowOf(index, granularity);
  return userActiveInRange(db, user, window.start, Math.min(window.end, db.today));
}

function orgActive(db: MockDb, org: MockOrg, index: number, granularity: RetentionGranularity): boolean {
  if (granularity === "week") return orgActiveInWeek(db, org, index);
  return orgMembers(db, org).some((user) => userActive(db, user, index, granularity));
}

export const retentionMock = {
  async cohorts(params: RetentionParams): Promise<RetentionResponse> {
    await mockDelay();
    const db = getMockDb();
    const { granularity, entity } = params;
    const periods = Math.max(1, Math.min(params.periods ?? DEFAULT_PERIODS, 24));
    const firstCohort = indexOf(dayOf(params.from), granularity);
    const lastCohort = indexOf(Math.min(dayOf(params.to), db.today), granularity);
    const currentIndex = indexOf(db.today, granularity);

    const cohorts: RetentionCohort[] = [];
    for (let cohort = firstCohort; cohort <= lastCohort; cohort += 1) {
      const members =
        entity === "users"
          ? db.users.filter((user) => indexOf(user.createdDay, granularity) === cohort)
          : db.orgs.filter((org) => indexOf(org.createdDay, granularity) === cohort);
      const values: (number | null)[] = [];
      for (let k = 0; k < periods; k += 1) {
        const index = cohort + k;
        if (index > currentIndex || members.length === 0) {
          values.push(null);
          continue;
        }
        const active =
          entity === "users"
            ? (members as MockUser[]).filter((user) => userActive(db, user, index, granularity)).length
            : (members as MockOrg[]).filter((org) => orgActive(db, org, index, granularity)).length;
        values.push(active / members.length);
      }
      cohorts.push({ start: dateOf(windowOf(cohort, granularity).start), size: members.length, values });
    }

    const average = Array.from({ length: periods }, (_, k) => {
      let weighted = 0;
      let size = 0;
      for (const cohort of cohorts) {
        const value = cohort.values[k];
        if (value === null) continue;
        weighted += value * cohort.size;
        size += cohort.size;
      }
      return size > 0 ? weighted / size : null;
    });

    return { granularity, entity, periods, cohorts, average };
  },
};
