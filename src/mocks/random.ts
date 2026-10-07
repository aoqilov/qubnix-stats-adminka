/**
 * Deterministik tasodif. Har bir obyekt (foydalanuvchi, kompaniya, kun) o'zining barqaror
 * kalitidan seed oladi — shuning uchun bugun yangi kun qo'shilsa ham o'tgan ma'lumot o'zgarmaydi,
 * sahifa yangilansa ham raqamlar bir xil chiqadi.
 */

const SEED = 0x5eed_2026;

function mix(h: number, v: number): number {
  let k = Math.imul(v | 0, 0xcc9e2d51);
  k = (k << 15) | (k >>> 17);
  k = Math.imul(k, 0x1b873593);
  h ^= k;
  h = (h << 13) | (h >>> 19);
  return (Math.imul(h, 5) + 0xe6546b64) | 0;
}

function finalize(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Ikki sondan barqaror 32-bit seed. */
export function seedOf(a: number, b: number): number {
  return finalize(mix(mix(SEED, a), b));
}

/** (a, b) uchun barqaror [0, 1) — tez, issiq sikllar uchun (massiv yaratmaydi). */
export function hash2(a: number, b: number): number {
  return finalize(mix(mix(SEED, a), b)) / 4294967296;
}

export function hash3(a: number, b: number, c: number): number {
  return finalize(mix(mix(mix(SEED, a), b), c)) / 4294967296;
}

/** mulberry32 asosidagi generator. */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  float(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** [min, max] butun son, ikkala chet ham kiradi. */
  int(min: number, max: number): number {
    return min + Math.floor(this.float() * (max - min + 1));
  }

  chance(p: number): boolean {
    return this.float() < p;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.float() * items.length)];
  }

  /** Vaznli tanlov: [[qiymat, vazn], ...]. */
  weighted<T>(entries: readonly (readonly [T, number])[]): T {
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = this.float() * total;
    for (const [value, weight] of entries) {
      roll -= weight;
      if (roll < 0) return value;
    }
    return entries[entries.length - 1][0];
  }

  /** Eksponensial taqsimot, o'rtachasi `mean`. */
  expo(mean: number): number {
    return -Math.log(1 - this.float()) * mean;
  }

  /** Puasson taqsimoti — kunlik hodisalar soni. Katta o'rtacha uchun normal yaqinlashuv. */
  poisson(mean: number): number {
    if (mean <= 0) return 0;
    if (mean > 40) {
      const u = Math.max(this.float(), 1e-12);
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.float());
      return Math.max(0, Math.round(mean + Math.sqrt(mean) * z));
    }
    const limit = Math.exp(-mean);
    let k = 0;
    let p = this.float();
    while (p > limit) {
      k += 1;
      p *= this.float();
    }
    return k;
  }

  /** 1 atrofidagi ko'paytuvchi: ±spread oralig'ida tekis shovqin. */
  noise(spread: number): number {
    return 1 + (this.float() * 2 - 1) * spread;
  }
}
