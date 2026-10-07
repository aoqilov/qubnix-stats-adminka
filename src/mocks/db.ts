import { generate } from "./generate";
import { activeWeekdayMask, isActiveWeek } from "./activity";
import { todayDay, weekOf } from "./calendar";
import type { MockLeadCount, MockOrg, MockPayment, MockUser } from "./types";

export interface MockDb {
  today: number;
  /** Haftalar soni (0..weekOf(today)). */
  weeks: number;
  users: MockUser[];
  orgs: MockOrg[];
  orgById: Map<number, MockOrg>;
  /** Kamida bir marta to'lagan kompaniyalar — MRR/obuna hisoblari faqat shular bo'yicha. */
  payingOrgs: MockOrg[];
  /** Kun va vaqt bo'yicha tartiblangan. */
  payments: MockPayment[];
  leads: MockLeadCount[];
  /** users.length × weeks: 1 — foydalanuvchi o'sha haftada faol. */
  weekActive: Uint8Array;
  /** Har kun uchun faol foydalanuvchilar soni (0..today). */
  dau: Int32Array;
  /** Har foydalanuvchining bugungacha oxirgi faol kuni. */
  lastActiveDay: Int32Array;
}

function build(today: number): MockDb {
  const { users, orgs, payments, leads } = generate(today);
  const weeks = weekOf(today) + 1;
  const weekActive = new Uint8Array(users.length * weeks);
  const dau = new Int32Array(today + 1);
  const lastActiveDay = new Int32Array(users.length);

  for (const user of users) {
    let last = user.createdDay;
    dau[user.createdDay] += 1;
    const lastWeek = Math.min(weeks - 1, user.quitWeek);
    for (let week = weekOf(user.createdDay); week <= lastWeek; week += 1) {
      if (!isActiveWeek(user, week)) continue;
      weekActive[user.index * weeks + week] = 1;
      const mask = activeWeekdayMask(user, week);
      for (let weekday = 0; weekday < 7; weekday += 1) {
        if ((mask & (1 << weekday)) === 0) continue;
        const day = week * 7 + weekday;
        if (day <= user.createdDay || day > today) continue;
        dau[day] += 1;
        if (day > last) last = day;
      }
    }
    lastActiveDay[user.index] = last;
  }

  return {
    today,
    weeks,
    users,
    orgs,
    orgById: new Map(orgs.map((org) => [org.id, org])),
    payingOrgs: orgs.filter((org) => org.periods.length > 0),
    payments,
    leads,
    weekActive,
    dau,
    lastActiveDay,
  };
}

let cached: MockDb | null = null;

/**
 * Mock "baza" — birinchi so'rovda bir marta yaratiladi. Sana almashsa (panel yarim tundan
 * keyin ham ochiq turgan bo'lsa) qayta yaratiladi: yangi kun qo'shiladi, o'tmish o'zgarmaydi.
 */
export function getMockDb(): MockDb {
  const today = todayDay();
  if (!cached || cached.today !== today) cached = build(today);
  return cached;
}
