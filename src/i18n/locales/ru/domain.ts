// Domen qiymatlari (types/domain.ts) uchun nomlar. Tarif nomlari (Start, Pro, Business) — brend,
// katalogdan keladi va tarjima qilinmaydi.
const domain = {
  billing: {
    monthly: "Помесячно",
    yearly: "Годовая",
  },
  paymentStatus: {
    paid: "Оплачен",
    failed: "Ошибка",
    cancelled: "Отменён",
    pending: "В обработке",
  },
  periodKind: {
    new: "Новая",
    renewal: "Продление",
    upgrade: "Апгрейд",
    downgrade: "Даунгрейд",
  },
  health: {
    active: "Активна",
    cooling: "Затухает",
    at_risk: "Риск ухода",
  },
  limit: {
    members: "Сотрудники",
    projects: "Проекты",
    routines: "Повторяющиеся",
  },
  provider: {
    payme: "Payme",
    click: "Click",
  },
  platform: {
    telegram: "Telegram Mini App",
    web: "Веб",
    pwa: "PWA",
  },
  language: {
    ru: "Русский",
    uz: "Oʻzbekcha (латиница)",
    "uz-Cyrl": "Ўзбекча (кириллица)",
  },
  channel: {
    organic: "Органика",
    referral: "Рефералы",
    instagram: "Instagram",
    telegram_ads: "Telegram Ads",
    telegram_channels: "Telegram-каналы",
    google: "Google",
    invite: "Приглашения",
  },
  statsDepth: {
    today: "только сегодня",
    "3months": "за 3 месяца",
    full: "вся история",
  },
};

export default domain;
