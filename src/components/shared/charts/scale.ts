/** Yumaloq qadam: 1 / 2 / 2.5 / 5 × 10ⁿ. Butun sonlar uchun 2.5 o'rniga 5 (0,5 ta "obuna" bo'lmaydi). */
function niceStep(rough: number, integer: boolean): number {
  if (rough <= 0) return 1;
  const exponent = Math.floor(Math.log10(rough));
  const base = 10 ** exponent;
  const fraction = rough / base;
  let nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  if (integer && nice === 2.5 && exponent === 0) nice = 5;
  const step = nice * base;
  return integer ? Math.max(1, step) : step;
}

/**
 * Y o'qi uchun toza belgilar (0 / 10 mln / 20 mln …), 0 doim kiradi — ustun va maydon bazadan
 * o'sadi. Manfiy qiymatlar bo'lsa (diverging) pastki qism ham yumaloq qadamda.
 */
export function niceTicks(min: number, max: number, { count = 4, integer = false } = {}): number[] {
  const low = Math.min(0, min);
  const high = Math.max(0, max);
  if (high === low) return [0, 1];
  const step = niceStep((high - low) / count, integer);
  const start = Math.floor(low / step) * step;
  const end = Math.ceil(high / step) * step;
  const ticks: number[] = [];
  // Suzuvchi nuqta xatosi to'planmasin — har belgini indeksdan hisoblaymiz.
  for (let i = 0; start + i * step <= end + step / 1e6; i += 1) ticks.push(start + i * step);
  return ticks;
}
