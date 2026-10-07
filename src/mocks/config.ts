/**
 * Mock ma'lumot hajmi va xulq-atvori — sozlash shu yerda. Qiymat o'zgarsa barcha raqamlar
 * birga, bir-biriga mos holda o'zgaradi (hammasi xom yozuvlardan hisoblanadi).
 */
export const MOCK_CONFIG = {
  signups: {
    /** Ishga tushgan kundagi bevosita ro'yxatdan o'tishlar (kanal ulushlari bo'yicha bo'linadi). */
    startPerDay: 3,
    /** `growthHorizonDays` kundan keyin kunlik hajm necha barobar o'sadi. */
    growthFactor: 8,
    growthHorizonDays: 550,
    /** Dushanba … yakshanba. */
    weekday: [1.1, 1.12, 1.1, 1.08, 1.02, 0.78, 0.7],
    dailyNoise: 0.2,
  },
  platform: {
    beforeWeb: [["telegram", 1]] as const,
    afterWeb: [["telegram", 0.74], ["web", 0.26]] as const,
    afterPwa: [["telegram", 0.68], ["web", 0.2], ["pwa", 0.12]] as const,
  },
  language: [["uz", 0.56], ["ru", 0.37], ["uz-Cyrl", 0.07]] as const,
  org: {
    /** Faollashgan / faollashmagan foydalanuvchi kompaniya ochish ehtimoli. */
    createIfActivated: 0.42,
    createIfNotActivated: 0.05,
    /** Kompaniya maqsadli hajmi: [min, max, vazn]. */
    sizes: [
      [[1, 1], 0.3],
      [[2, 2], 0.25],
      [[3, 5], 0.25],
      [[6, 10], 0.12],
      [[11, 20], 0.06],
      [[21, 60], 0.02],
    ] as const,
    /** Hajm bo'yicha to'lash ehtimoli (egasining faolligi va kanal bilan ko'paytiriladi). */
    payBySize: [
      [1, 0.03],
      [2, 0.1],
      [5, 0.3],
      [10, 0.5],
      [20, 0.62],
      [Infinity, 0.7],
    ] as const,
    yearlyShare: 0.14,
    firstProjectChance: 0.9,
    /** O'rtacha: xodim qo'shilishi (kun). */
    memberJoinMeanDays: 18,
  },
  subscription: {
    renewMonthlyActive: 0.95,
    renewMonthlyInactive: 0.5,
    renewYearlyActive: 0.85,
    renewYearlyInactive: 0.35,
    upgradeAtRenewal: 0.07,
    downgradeAtRenewal: 0.04,
    switchToYearly: 0.02,
    failedFirstAttempt: 0.11,
    paymeShare: 0.58,
    abandonedCheckout: 0.1,
  },
} as const;
