/**
 * Avatar / workspace / teg ranglari.
 *
 * Rang qo'lda tanlanmaydi va hech qayerda hex yozilmaydi — ID'dan barqaror
 * hash orqali globals.css dagi `--avatar-1..6` palitrasidan bittasi tanlanadi.
 * Bir xil ID doim bir xil rangni beradi (sessiya, qurilma, qayta yuklashdan
 * qat'i nazar), dark temada esa o'sha token avtomatik mos qiymatga o'tadi.
 */

/** globals.css dagi --avatar-N token'lari soni. */
export const AVATAR_COLOR_COUNT = 6;

/**
 * ID'ni `--avatar-N` token'iga aylantiradi.
 *
 * @example
 * <span style={{ background: avatarColorVar(workspace.id) }}>SD</span>
 */
export function avatarColorVar(id: string | number): string {
  return `var(--avatar-${avatarColorIndex(id)})`;
}

/**
 * Tanlangan slot raqami (1..AVATAR_COLOR_COUNT).
 * Odatda `avatarColorVar()` yetarli; bu faqat slot raqami kerak bo'lganda.
 */
export function avatarColorIndex(id: string | number): number {
  return (hash(String(id)) % AVATAR_COLOR_COUNT) + 1;
}

/**
 * djb2 + avalanche finalizer — barqaror, platformadan mustaqil string hash.
 *
 * Yalang'och djb2 ning quyi bitlari ketma-ket ID'larda korrelyatsiya qiladi,
 * `% 6` dan keyin esa bu ranglarni juft-juft qilib g'ijimlaydi. Finalizer
 * (murmur3 fmix32) bitlarni aralashtiradi va taqsimotni tekislaydi.
 * `>>> 0` har qadamda 32-bit musbat songa keltiradi — natija hamma joyda bir xil.
 */
function hash(value: string): number {
  let h = 5381;
  for (let i = 0; i < value.length; i++) {
    h = ((h * 33) ^ value.charCodeAt(i)) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}
