import { FEATURE_KEYS, type FeatureKey, type PlanId } from "@/types/domain";
import { weekOf } from "./calendar";
import { activeWeekdayMask } from "./activity";
import { hash3 } from "./random";
import type { MockDb } from "./db";
import { memo, orgActiveInWeek, planAt, usageAt, userWeekActive, type DayRange } from "./queries";

/**
 * Funksiyalardan foydalanish hodisalari — saqlanmaydi, faol xodim-haftalardan hisoblanadi.
 * Hafta davr chetida qisman kirsa, hodisalar davrga tushgan faol kunlar ulushiga kamaytiriladi.
 * Hodisa haftaning davr ichidagi birinchi faol kuniga yoziladi (kunlik grafik uchun).
 */

export const FEATURE_INDEX: Record<FeatureKey, number> = {
  tasks: 0,
  routines: 1,
  calendar: 2,
  statistics: 3,
  files: 4,
  audio: 5,
};

export interface UsageTotals {
  /** Kompaniya → 6 ta funksiya bo'yicha hodisalar (FEATURE_KEYS tartibida). */
  byOrg: Map<number, number[]>;
  /** Kun → 6 ta funksiya bo'yicha hodisalar. */
  byDay: Map<number, number[]>;
  /** Tarif → funksiya → shu tarifda funksiyadan foydalangan kompaniyalar. */
  orgsByPlan: Record<PlanId, Set<number>[]>;
  /** Tarif → funksiya → hodisalar. */
  eventsByPlan: Record<PlanId, number[]>;
  /** Davrda faol bo'lgan kompaniyalar (kamida bitta xodim) va ularning davr oxiridagi tarifi. */
  activeOrgPlans: Map<number, PlanId>;
}

function zeros(): number[] {
  return [0, 0, 0, 0, 0, 0];
}

/** p ehtimol bilan 1..max hodisa. */
function occasional(key: number, week: number, salt: number, p: number, max: number): number {
  if (hash3(key, week, salt) >= p) return 0;
  return 1 + Math.floor(hash3(key, week, salt + 1) * max);
}

function compute(db: MockDb, range: DayRange): UsageTotals {
  const totals: UsageTotals = {
    byOrg: new Map(),
    byDay: new Map(),
    orgsByPlan: {
      start: FEATURE_KEYS.map(() => new Set<number>()),
      pro: FEATURE_KEYS.map(() => new Set<number>()),
      business: FEATURE_KEYS.map(() => new Set<number>()),
    },
    eventsByPlan: { start: zeros(), pro: zeros(), business: zeros() },
    activeOrgPlans: new Map(),
  };

  const add = (orgId: number, plan: PlanId, feature: FeatureKey, day: number, events: number) => {
    if (events <= 0) return;
    const index = FEATURE_INDEX[feature];
    const orgRow = totals.byOrg.get(orgId) ?? zeros();
    orgRow[index] += events;
    totals.byOrg.set(orgId, orgRow);
    const dayRow = totals.byDay.get(day) ?? zeros();
    dayRow[index] += events;
    totals.byDay.set(day, dayRow);
    totals.orgsByPlan[plan][index].add(orgId);
    totals.eventsByPlan[plan][index] += events;
  };

  const firstWeek = Math.max(0, weekOf(range.from));
  const lastWeek = Math.min(db.weeks - 1, weekOf(range.to));

  for (const org of db.orgs) {
    if (org.createdDay > range.to) continue;

    for (const index of org.memberIndexes) {
      const user = db.users[index];
      if (user.createdDay > range.to || db.lastActiveDay[index] < range.from) continue;

      for (let week = Math.max(firstWeek, weekOf(user.createdDay)); week <= lastWeek; week += 1) {
        if (!userWeekActive(db, user, week)) continue;
        const mask = activeWeekdayMask(user, week);
        let firstDay = -1;
        let daysInRange = 0;
        for (let weekday = 0; weekday < 7; weekday += 1) {
          const day = week * 7 + weekday;
          const active = (mask & (1 << weekday)) !== 0 || day === user.createdDay;
          if (!active || day < range.from || day > range.to || day < user.createdDay || day > db.today) continue;
          daysInRange += 1;
          if (firstDay < 0) firstDay = day;
        }
        if (daysInRange === 0) continue;

        const scale = Math.min(1, daysInRange / user.daysPerWeek);
        const plan = planAt(org, firstDay);
        totals.activeOrgPlans.set(org.id, planAt(org, range.to));
        const k = user.key;
        // Ba'zi faol haftalarda xodim faqat ko'radi, vazifa yaratmaydi.
        const createsTasks = hash3(k, week, 20) < 0.85;
        add(org.id, plan, "tasks", firstDay, createsTasks ? Math.round(org.taskRate * (0.6 + hash3(k, week, 21) * 0.8) * scale) : 0);
        add(org.id, plan, "calendar", firstDay, Math.round(occasional(k, week, 22, 0.45, 4) * scale));
        add(org.id, plan, "statistics", firstDay, Math.round(occasional(k, week, 24, plan === "start" ? 0.12 : 0.35, 3) * scale));
        add(org.id, plan, "files", firstDay, Math.round(occasional(k, week, 26, 0.22, 5) * scale));
        add(org.id, plan, "audio", firstDay, Math.round(occasional(k, week, 28, user.platform === "telegram" ? 0.15 : 0.04, 3) * scale));
      }
    }

    // Takroriy vazifalar o'zi ishga tushadi — kompaniya o'sha haftada faol bo'lsa hisoblanadi.
    for (let week = Math.max(firstWeek, weekOf(org.createdDay)); week <= lastWeek; week += 1) {
      const weekStart = Math.max(range.from, week * 7, org.createdDay);
      const weekEnd = Math.min(range.to, week * 7 + 6, db.today);
      if (weekEnd < weekStart || !orgActiveInWeek(db, org, week)) continue;
      const routines = usageAt(db, org, weekEnd).routines;
      if (routines === 0) continue;
      const share = (weekEnd - weekStart + 1) / 7;
      add(org.id, planAt(org, weekStart), "routines", weekStart, Math.round(routines * share));
    }
  }

  return totals;
}

const cache = memo<UsageTotals>(6);

export function usageTotals(db: MockDb, range: DayRange): UsageTotals {
  return cache(`${db.today}:${range.from}:${range.to}`, () => compute(db, range));
}
