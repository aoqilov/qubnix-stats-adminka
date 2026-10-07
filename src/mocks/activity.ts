import { hash2, hash3 } from "./random";
import { weekOf, weekdayOf } from "./calendar";
import type { MockUser } from "./types";

/**
 * Foydalanuvchi faolligi — saqlanmaydi, (kalit, hafta, kun) dan hisoblanadi:
 * hafta faolmi → shu haftaning qaysi kunlari faol. Ro'yxatdan o'tgan kun doim faol.
 */

/** Ro'yxatdan o'tgan haftadan k hafta o'tgach faol bo'lish ehtimoli. */
function weekActiveProbability(user: MockUser, k: number): number {
  // activationDay saqlangan qaror (bugundan keyin bo'lsa ham) — shuning uchun o'tmish barqaror.
  if (user.activationDay === null) return 0.06 * Math.exp(-k / 2);
  const floor = 0.12 + 0.5 * user.stickiness;
  return floor + (0.95 - floor) * Math.exp(-k / 2.5);
}

export function isActiveWeek(user: MockUser, week: number): boolean {
  const startWeek = weekOf(user.createdDay);
  if (week < startWeek || week > user.quitWeek) return false;
  if (week === startWeek) return true;
  return hash2(user.key, week) < weekActiveProbability(user, week - startWeek);
}

/** Faol haftadagi faol kunlar — bitmask, 0-bit dushanba. Aynan `daysPerWeek` ta kun. */
export function activeWeekdayMask(user: MockUser, week: number): number {
  const offset = Math.floor(hash3(user.key, week, 9) * 7);
  let mask = 0;
  // 3 va 7 o'zaro tub — j = 0..6 barcha kunlarni bir martadan bosib o'tadi.
  for (let j = 0; j < user.daysPerWeek; j += 1) mask |= 1 << ((offset + j * 3) % 7);
  return mask;
}

export function isActiveDay(user: MockUser, day: number): boolean {
  if (day < user.createdDay) return false;
  if (day === user.createdDay) return true;
  const week = weekOf(day);
  return isActiveWeek(user, week) && (activeWeekdayMask(user, week) & (1 << weekdayOf(day))) !== 0;
}
