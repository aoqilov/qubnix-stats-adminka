import type { Granularity, KpiValue, PeriodQuery } from "@/types/analytics";
import type { OrgHealth, OrgSizeSegment, PaidPlanId, PlanId } from "@/types/domain";
import { autoGranularity } from "@/utils/period";
import { HEALTH_ACTIVE_DAYS, HEALTH_COOLING_DAYS, monthlyEquivalent } from "@/utils/metrics";
import { dayOf, monthOf, monthStartDay, weekOf } from "./calendar";
import { activeWeekdayMask } from "./activity";
import { planById, priceOf } from "./catalog";
import type { MockDb } from "./db";
import type { MockOrg, MockPeriod, MockUser } from "./types";

/**
 * Mock "backend" ning umumiy hisob-kitoblari. Hammasi xom yozuvlardan — shuning uchun
 * bir bo'limdagi raqam boshqa bo'limdagisi bilan mos keladi.
 */

// ─── Davr ─────────────────────────────────────────────────────────────────────

/** Ikkala chet ham kiradi (day index). */
export interface DayRange {
  from: number;
  to: number;
}

export interface ResolvedQuery {
  current: DayRange;
  previous: DayRange | null;
  granularity: Granularity;
}

/** API parametrlari → kunlar. Kelajak kesiladi (bugungacha). */
export function resolveQuery(params: PeriodQuery, today: number): ResolvedQuery {
  const current = { from: dayOf(params.from), to: Math.min(dayOf(params.to), today) };
  const previous =
    params.compare_from && params.compare_to
      ? { from: dayOf(params.compare_from), to: Math.min(dayOf(params.compare_to), today) }
      : null;
  return {
    current,
    previous,
    granularity: params.granularity ?? autoGranularity(current.to - current.from + 1),
  };
}

export function kpi(compute: (range: DayRange) => number | null, query: ResolvedQuery): KpiValue {
  return {
    value: compute(query.current),
    previous: query.previous ? compute(query.previous) : null,
  };
}

export function inRange(day: number | null, range: DayRange): day is number {
  return day !== null && day >= range.from && day <= range.to;
}

// ─── Vaqt qatori qadamlari ───────────────────────────────────────────────────

export interface Bucket {
  start: number;
  end: number;
}

/** Davrni qadamlarga bo'ladi; hafta — dushanbadan, oy — 1-sanadan, chetlari davr bilan kesiladi. */
export function buildBuckets(range: DayRange, granularity: Granularity): Bucket[] {
  const buckets: Bucket[] = [];
  let start = range.from;
  while (start <= range.to) {
    let end = start;
    if (granularity === "week") end = weekOf(start) * 7 + 6;
    if (granularity === "month") end = monthStartDay(monthOf(start) + 1) - 1;
    end = Math.min(end, range.to);
    buckets.push({ start, end });
    start = end + 1;
  }
  return buckets;
}

/** Kun → qadam indeksi (davrdan tashqari bo'lsa −1). */
export function bucketIndexer(buckets: Bucket[]): (day: number) => number {
  return (day) => {
    let lo = 0;
    let hi = buckets.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (day < buckets[mid].start) hi = mid - 1;
      else if (day > buckets[mid].end) lo = mid + 1;
      else return mid;
    }
    return -1;
  };
}

// ─── Obunalar va MRR ─────────────────────────────────────────────────────────

export function periodAt(org: MockOrg, day: number): MockPeriod | null {
  for (const period of org.periods) {
    if (period.startDay <= day && day < period.endDay) return period;
  }
  return null;
}

export function planAt(org: MockOrg, day: number): PlanId {
  return periodAt(org, day)?.plan ?? "start";
}

export function periodMrr(period: MockPeriod): number {
  return monthlyEquivalent(priceOf(period.plan, period.billing), period.billing);
}

export interface PlanSnapshot {
  orgs: number;
  mrr: number;
  monthly: number;
  yearly: number;
}

export interface MrrSnapshot {
  mrr: number;
  paying: number;
  byPlan: Record<PaidPlanId, PlanSnapshot>;
}

export function mrrAt(db: MockDb, day: number): MrrSnapshot {
  const empty = (): PlanSnapshot => ({ orgs: 0, mrr: 0, monthly: 0, yearly: 0 });
  const snapshot: MrrSnapshot = { mrr: 0, paying: 0, byPlan: { pro: empty(), business: empty() } };
  for (const org of db.payingOrgs) {
    const period = periodAt(org, day);
    if (!period) continue;
    const mrr = periodMrr(period);
    const plan = snapshot.byPlan[period.plan];
    snapshot.mrr += mrr;
    snapshot.paying += 1;
    plan.orgs += 1;
    plan.mrr += mrr;
    plan[period.billing] += 1;
  }
  return snapshot;
}

/** Davrdagi pullik kompaniya-kunlar yig'indisi (oylik churn maxraji). Davrlar ustma-ust tushmaydi. */
export function payingOrgDaysIn(db: MockDb, range: DayRange): number {
  let days = 0;
  for (const org of db.payingOrgs) {
    for (const period of org.periods) {
      const start = Math.max(range.from, period.startDay);
      const end = Math.min(range.to, period.endDay - 1);
      if (end >= start) days += end - start + 1;
    }
  }
  return days;
}

/** Yangilanmay tugagan obuna kuni (churn); obuna hali davom etayotgan bo'lsa — null. */
export function churnDayOf(db: MockDb, org: MockOrg): number | null {
  const last = org.periods[org.periods.length - 1];
  return last && last.endDay <= db.today ? last.endDay : null;
}

/** Davrda boshlangan obuna davrlari (yangi, yangilangan, upgrade, downgrade). */
export function periodsStartedIn(db: MockDb, range: DayRange): { org: MockOrg; period: MockPeriod }[] {
  const result: { org: MockOrg; period: MockPeriod }[] = [];
  for (const org of db.payingOrgs) {
    for (const period of org.periods) {
      if (inRange(period.startDay, range)) result.push({ org, period });
    }
  }
  return result;
}

export function churnedIn(db: MockDb, range: DayRange): MockOrg[] {
  return db.payingOrgs.filter((org) => inRange(churnDayOf(db, org), range));
}

export function firstPaidIn(db: MockDb, range: DayRange): MockOrg[] {
  return db.payingOrgs.filter((org) => inRange(org.firstPaidDay, range));
}

export function orgsCreatedIn(db: MockDb, range: DayRange): MockOrg[] {
  return db.orgs.filter((org) => inRange(org.createdDay, range));
}

export function revenueIn(db: MockDb, range: DayRange, orgFilter?: (org: MockOrg) => boolean): number {
  let total = 0;
  for (const payment of db.payments) {
    if (payment.status !== "paid" || !inRange(payment.day, range)) continue;
    if (orgFilter && !orgFilter(db.orgById.get(payment.orgId)!)) continue;
    total += payment.amount;
  }
  return total;
}

// ─── Foydalanuvchilar va faollik ─────────────────────────────────────────────

export function usersCreatedIn(db: MockDb, range: DayRange): MockUser[] {
  return db.users.filter((user) => inRange(user.createdDay, range));
}

export function userWeekActive(db: MockDb, user: MockUser, week: number): boolean {
  return week >= 0 && week < db.weeks && db.weekActive[user.index * db.weeks + week] === 1;
}

/** Davrdagi o'rtacha DAU. */
export function avgDau(db: MockDb, range: DayRange): number {
  let sum = 0;
  for (let day = range.from; day <= range.to; day += 1) {
    if (day >= 0 && day <= db.today) sum += db.dau[day];
  }
  return Math.round(sum / (range.to - range.from + 1));
}

/** Foydalanuvchi [from, to] da kamida bir kun faol bo'lganmi. */
export function userActiveInRange(db: MockDb, user: MockUser, from: number, to: number): boolean {
  if (user.createdDay > to || db.lastActiveDay[user.index] < from) return false;
  if (user.createdDay >= from) return true;
  const lastWeek = Math.min(weekOf(to), db.weeks - 1);
  for (let week = Math.max(weekOf(from), 0); week <= lastWeek; week += 1) {
    if (!userWeekActive(db, user, week)) continue;
    const mask = activeWeekdayMask(user, week);
    for (let weekday = 0; weekday < 7; weekday += 1) {
      if ((mask & (1 << weekday)) === 0) continue;
      const day = week * 7 + weekday;
      if (day >= from && day <= to && day > user.createdDay && day <= db.today) return true;
    }
  }
  return false;
}

/** [from, to] da faol bo'lgan foydalanuvchilar soni (WAU/MAU). */
export function activeUsersBetween(db: MockDb, from: number, to: number, filter?: (user: MockUser) => boolean): number {
  let count = 0;
  for (const user of db.users) {
    if ((!filter || filter(user)) && userActiveInRange(db, user, from, to)) count += 1;
  }
  return count;
}

/** `day` dan kech bo'lmagan oxirgi faol kun. */
export function lastActiveOnOrBefore(db: MockDb, user: MockUser, day: number): number | null {
  if (user.createdDay > day) return null;
  if (db.lastActiveDay[user.index] <= day) return db.lastActiveDay[user.index];
  for (let week = Math.min(weekOf(day), db.weeks - 1); week >= weekOf(user.createdDay); week -= 1) {
    if (!userWeekActive(db, user, week)) continue;
    const mask = activeWeekdayMask(user, week);
    for (let weekday = 6; weekday >= 0; weekday -= 1) {
      const candidate = week * 7 + weekday;
      if ((mask & (1 << weekday)) !== 0 && candidate <= day && candidate > user.createdDay) return candidate;
    }
  }
  return user.createdDay;
}

// ─── Kompaniyalar ────────────────────────────────────────────────────────────

export function orgMembers(db: MockDb, org: MockOrg): MockUser[] {
  return org.memberIndexes.map((index) => db.users[index]);
}

export function membersAt(db: MockDb, org: MockOrg, day: number): number {
  if (org.createdDay > day) return 0;
  return org.memberIndexes.filter((index) => db.users[index].createdDay <= day).length;
}

export function orgActiveInWeek(db: MockDb, org: MockOrg, week: number): boolean {
  return org.memberIndexes.some((index) => userWeekActive(db, db.users[index], week));
}

export function orgLastActive(db: MockDb, org: MockOrg, day: number): number | null {
  let last: number | null = null;
  for (const user of orgMembers(db, org)) {
    const candidate = lastActiveOnOrBefore(db, user, day);
    if (candidate !== null && (last === null || candidate > last)) last = candidate;
  }
  return last;
}

export function healthOf(lastActive: number | null, day: number): OrgHealth {
  if (lastActive === null) return "at_risk";
  const idle = day - lastActive;
  if (idle <= HEALTH_ACTIVE_DAYS) return "active";
  if (idle <= HEALTH_COOLING_DAYS) return "cooling";
  return "at_risk";
}

export function sizeSegmentOf(members: number): OrgSizeSegment {
  if (members <= 1) return "1";
  if (members <= 5) return "2-5";
  if (members <= 20) return "6-20";
  return "21+";
}

/** 0..100: oxirgi 8 haftaning (kompaniya yoshidan oshmagan) nechtasida faol bo'lgan. */
export function activityScore(db: MockDb, org: MockOrg, day: number): number {
  const lastWeek = weekOf(day);
  const firstWeek = Math.max(weekOf(org.createdDay), lastWeek - 7);
  let active = 0;
  for (let week = firstWeek; week <= lastWeek; week += 1) {
    if (orgActiveInWeek(db, org, week)) active += 1;
  }
  return Math.round((active / (lastWeek - firstWeek + 1)) * 100);
}

/** Shu kungacha bo'lgan eng yuqori tarif — loyiha/takroriy vazifalar shu limitgacha yaratilgan bo'ladi. */
export function highestPlanBy(org: MockOrg, day: number): PlanId {
  let highest: PlanId = "start";
  for (const period of org.periods) {
    if (period.startDay > day) break;
    if (period.plan === "business") return "business";
    highest = "pro";
  }
  return highest;
}

export interface OrgUsage {
  members: number;
  projects: number;
  routines: number;
}

/** Haqiqiy foydalanish: istak tarif limiti bilan kesilgan. */
export function usageAt(db: MockDb, org: MockOrg, day: number): OrgUsage {
  const limits = planById(highestPlanBy(org, day)).limits;
  const hasProject = org.firstProjectDay !== null && org.firstProjectDay <= day;
  return {
    members: membersAt(db, org, day),
    projects: hasProject ? Math.min(org.wantedProjects, limits.projects ?? Infinity) : 0,
    routines: hasProject ? Math.min(org.wantedRoutines, limits.routines ?? Infinity) : 0,
  };
}

export function ownerOf(db: MockDb, org: MockOrg): MockUser {
  return db.users[org.ownerIndex];
}

export function fullName(user: MockUser): string {
  return `${user.firstName} ${user.lastName}`;
}

// ─── Ro'yxatlar ──────────────────────────────────────────────────────────────

export function paginate<T>(items: T[], page = 1, limit = 20) {
  const safeLimit = Math.max(1, Math.min(limit, 1000));
  const totalPages = Math.max(1, Math.ceil(items.length / safeLimit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    pagination: { page: safePage, limit: safeLimit, total: items.length, total_pages: totalPages },
  };
}

/** Kichik LRU kesh — bir davr uchun og'ir hisobni sahifalash/filtrda qayta qilmaslik uchun. */
export function memo<T>(size: number): (key: string, compute: () => T) => T {
  const cache = new Map<string, T>();
  return (key, compute) => {
    const hit = cache.get(key);
    if (hit !== undefined) {
      cache.delete(key);
      cache.set(key, hit);
      return hit;
    }
    const value = compute();
    cache.set(key, value);
    if (cache.size > size) cache.delete(cache.keys().next().value as string);
    return value;
  };
}
