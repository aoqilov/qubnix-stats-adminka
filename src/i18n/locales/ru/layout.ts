// Sidebar, header va global davr filtri.
const layout = {
  nav: {
    groups: {
      main: "Главное",
      money: "Доход",
      users: "Пользователи",
      product: "Продукт",
    },
    overview: "Обзор",
    tariffs: "Тарифы",
    revenue: "Доход и платежи",
    growth: "Рост",
    funnel: "Воронка",
    retention: "Удержание",
    channels: "Маркетинг-каналы",
    featureUsage: "Функции",
    organizations: "Компании",
  },
  sidebar: {
    collapse: "Свернуть меню",
    expand: "Развернуть меню",
    mockData: "Mock-данные",
    version: "Версия {{version}}",
  },
  header: {
    darkTheme: "Тёмная тема",
    lightTheme: "Светлая тема",
    logout: "Выйти",
  },
  period: {
    // Qisqa — header'da kalendar va solishtirish bilan bir qatorga sig'sin.
    presets: {
      "7d": "7 дн.",
      "30d": "30 дн.",
      "90d": "90 дн.",
      "12m": "12 мес.",
      custom: "Период",
    },
    compare: "Сравнить с прошлым",
    // Header ostidagi izoh: "1 окт – 7 окт 2026"
    range: "{{from}} – {{to}}",
    previous: "сравнение: {{from}} – {{to}}",
  },
  roles: {
    admin: "Администратор",
    marketing: "Маркетинг",
    analyst: "Аналитик",
  },
};

export default layout;
