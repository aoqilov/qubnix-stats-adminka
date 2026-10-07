import { toApiDate } from "@/utils/apiDate";

/**
 * Mock ichida sanalar butun son — ishga tushirilgan kundan beri o'tgan kunlar ("day index").
 * UTC arifmetikasi: yozgi/qishki vaqt sutkani surmaydi. API chegarasida `YYYY-MM-DD` ga aylanadi.
 */

/** qubnix ishga tushgan kun — dushanba, shuning uchun `weekOf` ISO haftalarga to'g'ri keladi. */
export const LAUNCH_DATE = "2025-04-07";

const MS_PER_DAY = 86_400_000;

function utcMs(apiDate: string): number {
  const [year, month, day] = apiDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

const LAUNCH_MS = utcMs(LAUNCH_DATE);

export function dayOf(apiDate: string): number {
  return Math.round((utcMs(apiDate) - LAUNCH_MS) / MS_PER_DAY);
}

export function dateOf(day: number): string {
  const date = new Date(LAUNCH_MS + day * MS_PER_DAY);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${dayOfMonth}`;
}

/** Bugun — foydalanuvchining mahalliy sanasi bo'yicha (davr filtri bilan bir xil). */
export function todayDay(): number {
  return dayOf(toApiDate(new Date()));
}

/** Hafta raqami (dushanbadan boshlanadi). */
export function weekOf(day: number): number {
  return Math.floor(day / 7);
}

/** 0 — dushanba … 6 — yakshanba. */
export function weekdayOf(day: number): number {
  return ((day % 7) + 7) % 7;
}

/** Oy indeksi: yil × 12 + oy (0..11). */
export function monthOf(day: number): number {
  const date = new Date(LAUNCH_MS + day * MS_PER_DAY);
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

/** Oyning birinchi kuni (day index). */
export function monthStartDay(monthIndex: number): number {
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex % 12;
  return Math.round((Date.UTC(year, month, 1) - LAUNCH_MS) / MS_PER_DAY);
}

/** Vaqt (daqiqa) bilan ISO sana-vaqt: "2026-10-07T14:32:00". */
export function dateTimeOf(day: number, minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${dateOf(day)}T${hours}:${mins}:00`;
}
