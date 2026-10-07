import { mockDelay } from "@/api-config/mock";
import { getMockDb, type MockDb } from "@/mocks/db";
import { inRange, resolveQuery, type DayRange } from "@/mocks/queries";
import type { MockUser } from "@/mocks/types";
import { ratio } from "@/utils/metrics";
import type { FunnelParams, FunnelResponse, FunnelStepKey } from "./funnel.types";

const STEP_KEYS: FunnelStepKey[] = [
  "bot_start",
  "registered",
  "workspace",
  "first_project",
  "first_task",
  "invited",
  "paid",
];

function stepCounts(db: MockDb, range: DayRange, channel: FunnelParams["channel"]): number[] {
  const matches = (value: string) => (channel ? value === channel : value !== "invite");
  const done = (day: number | null) => day !== null && day <= db.today;

  const leads = db.leads
    .filter((lead) => matches(lead.channel) && inRange(lead.day, range))
    .reduce((sum, lead) => sum + lead.leads, 0);

  const users = db.users.filter((user) => matches(user.channel) && inRange(user.createdDay, range));
  const orgOf = (user: MockUser) => (user.isOwner && user.orgId !== null ? db.orgById.get(user.orgId)! : null);

  const workspace = users.filter((user) => orgOf(user) !== null);
  const firstProject = workspace.filter((user) => done(orgOf(user)!.firstProjectDay));
  const firstTask = firstProject.filter((user) => done(user.activationDay));
  const invited = firstTask.filter((user) => done(orgOf(user)!.invitedDay));
  const paid = invited.filter((user) => done(orgOf(user)!.firstPaidDay));

  return [leads, users.length, workspace.length, firstProject.length, firstTask.length, invited.length, paid.length];
}

export const funnelMock = {
  async get(params: FunnelParams): Promise<FunnelResponse> {
    await mockDelay();
    const db = getMockDb();
    const query = resolveQuery(params, db.today);
    const current = stepCounts(db, query.current, params.channel);
    const previous = query.previous ? stepCounts(db, query.previous, params.channel) : null;

    return {
      steps: STEP_KEYS.map((key, i) => ({
        key,
        count: current[i],
        previous: previous ? previous[i] : null,
        from_prev: i === 0 ? null : ratio(current[i], current[i - 1]),
        from_start: i === 0 ? null : ratio(current[i], current[0]),
      })),
    };
  },
};
