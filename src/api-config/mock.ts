/**
 * Backend hali yo'q — barcha `api/<resource>/<resource>.api.ts` funksiyalari shu flag `true`
 * bo'lsa `<resource>.mock.ts` dan javob qaytaradi. Backend ulanganda faqat shu qiymat
 * o'zgaradi: hook'lar, ekranlar va type'lar tegilmaydi. Ikkinchi mock yo'li qo'shmang.
 */
export const USE_MOCK = true;

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 600;

/** Tarmoqqa o'xshash kechikish — loading holatlari ham ko'rinib, tekshirilsin. */
export function mockDelay(): Promise<void> {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock'dagi xato — backend xatosi bilan bir xil ma'lumot (`status`, `message`) beradi,
 * `getApiErrorMessage` ikkalasini bir xil o'qiydi.
 */
export class MockApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MockApiError";
    this.status = status;
  }
}
