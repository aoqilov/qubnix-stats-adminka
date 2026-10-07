import type { BillingPeriod } from "@/types/domain";

/**
 * Metrikalar ta'riflari — bitta joyda. Mock generator ham shu funksiyalar bilan hisoblaydi,
 * backend ulanganda u ham aynan shu ta'riflarga amal qilishi kerak (kontrakt).
 *
 * MRR            — kunning oxiridagi faol pullik obunalarning oylik ekvivalenti yig'indisi
 *                  (yillik obuna: narx / 12). ARR = MRR × 12.
 * Pullik kompaniya — shu kunda faol pullik obunasi bor kompaniya.
 * Daromad        — davrdagi `paid` holatidagi to'lovlar yig'indisi (failed/cancelled/pending kirmaydi).
 * Konversiya     — davrda birinchi marta to'lagan kompaniyalar / davrda yaratilgan kompaniyalar.
 * Churn (oylik)  — davrda yangilanmay tugagan obunalar / davrdagi pullik "kompaniya-oylar"
 *                  (pullik kompaniya-kunlar / 30). Davr uzunligidan qat'i nazar oyga keltirilgan:
 *                  7 kun, 30 kun va 12 oy uchun raqamlar solishtiriladi.
 * ARPA           — davr oxiridagi MRR / davr oxiridagi pullik kompaniyalar.
 * O'rtacha chek  — davrdagi daromad / davrdagi muvaffaqiyatli to'lovlar soni.
 * To'lov muvaffaqiyati — paid / (paid + failed); cancelled (to'lov oynasidan chiqib ketgan) kirmaydi.
 * DAU            — davrdagi kunlik faol foydalanuvchilarning o'rtachasi.
 * WAU / MAU      — davr oxirigacha bo'lgan 7 / 30 kunda kamida bir marta faol bo'lgan foydalanuvchilar.
 * Stickiness     — o'sha 30 kundagi o'rtacha DAU / MAU.
 * Faollashish    — ro'yxatdan o'tgach 7 kun ichida birinchi vazifani yaratgan foydalanuvchi.
 * CAC            — kanal xarajati / davrda shu kanaldan kelgan yangi pullik kompaniyalar.
 * ROMI           — (shu kanal kompaniyalaridan davrdagi daromad − xarajat) / xarajat.
 * Retention      — kohortaning k-davrda faol bo'lgan ulushi (kompaniya: kamida bitta xodimi faol).
 * Kompaniya holati — oxirgi faollik `to` dan: ≤ 7 kun — active, 8–30 — cooling, > 30 — at_risk.
 */

export const ACTIVATION_WINDOW_DAYS = 7;
export const HEALTH_ACTIVE_DAYS = 7;
export const HEALTH_COOLING_DAYS = 30;
/** Yuqori foydalanish chegarasi — upsell nomzodi (limitning 80%+). */
export const UPSELL_USAGE_THRESHOLD = 0.8;

/** Obunaning oylik ekvivalenti (MRR ulushi). */
export function monthlyEquivalent(price: number, billing: BillingPeriod): number {
  return billing === "yearly" ? Math.round(price / 12) : price;
}

/** Ulush 0..1; maxraj 0 bo'lsa — null (UI "—" ko'rsatadi). */
export function ratio(part: number, total: number): number | null {
  return total > 0 ? part / total : null;
}

/** Foizdagi o'zgarish: (joriy − oldingi) / oldingi. Oldingisi 0 yoki yo'q bo'lsa — null. */
export function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

/** Oylik churn: ketganlar / (pullik kompaniya-kunlar / 30). */
export function monthlyChurnRate(churned: number, payingOrgDays: number): number | null {
  return payingOrgDays > 0 ? churned / (payingOrgDays / 30) : null;
}

export function cac(spend: number, newPaying: number): number | null {
  return newPaying > 0 ? Math.round(spend / newPaying) : null;
}

export function romi(revenue: number, spend: number): number | null {
  return spend > 0 ? (revenue - spend) / spend : null;
}

/** Limitdan foydalanish ulushi; cheksiz (null) limit — 0. */
export function limitUsage(used: number, limit: number | null): number {
  return limit === null || limit === 0 ? 0 : used / limit;
}
