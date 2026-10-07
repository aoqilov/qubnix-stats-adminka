import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // ─── Design token'lar → Tailwind sinflari ───────────────────────────
      // Har bir sinf globals.css dagi semantik token'ga ishora qiladi, ya'ni
      // dark tema avtomatik ishlaydi. Komponentda hex yozilmaydi; `bg-surface`
      // yoki `bg-[var(--bg-surface)]` — ikkalasi ham bir xil natija beradi.

      // bg-*, text-*, border-*, ring-* — hammasida ishlaydi
      colors: {
        brand: {
          DEFAULT: "var(--brand-default)", // bg-brand, text-brand, border-brand
          hover: "var(--brand-hover)",
          pressed: "var(--brand-pressed)",
          subtle: "var(--brand-subtle-bg)", // bg-brand-subtle
        },
        // status-*: DEFAULT = solid (to'ldirilgan), soft = fon, strong = matn
        success: {
          DEFAULT: "var(--status-success-solid)",
          soft: "var(--status-success-bg)",
          strong: "var(--status-success-text)",
        },
        warning: {
          DEFAULT: "var(--status-warning-solid)",
          soft: "var(--status-warning-bg)",
          strong: "var(--status-warning-text)",
        },
        error: {
          DEFAULT: "var(--status-error-solid)",
          soft: "var(--status-error-bg)",
          strong: "var(--status-error-text)",
        },
        // info va progress uchun Figma'da `solid` varianti yo'q — faqat fon+matn
        info: {
          soft: "var(--status-info-bg)",
          strong: "var(--status-info-text)",
        },
        progress: {
          soft: "var(--status-progress-bg)",
          strong: "var(--status-progress-text)",
        },
        // Teg/kategoriya ranglari (avatar ranglari avatarColorVar() orqali)
        teal: { DEFAULT: "var(--accent-teal)" },
        orange: { DEFAULT: "var(--accent-orange)" },
        pink: { DEFAULT: "var(--accent-pink)" },
        cyan: { DEFAULT: "var(--accent-cyan)" },

        // ⛔ DEPRECATED — eski komponentlar uchun. Yangi kodda `brand` ishlating.
        vio: "var(--vio)",
      },

      backgroundColor: {
        canvas: "var(--bg-canvas)", // bg-canvas — sahifa foni
        surface: {
          DEFAULT: "var(--bg-surface)", // bg-surface — karta/panel foni
          secondary: "var(--bg-surface-secondary)", // bg-surface-secondary — hover/ichki blok
        },
        overlay: "var(--bg-overlay)", // bg-overlay — tooltip
      },

      textColor: {
        primary: "var(--text-primary)", // text-primary
        secondary: "var(--text-secondary)", // text-secondary
        disabled: "var(--text-disabled)", // text-disabled
        inverse: "var(--text-inverse)", // text-inverse — qorong'i fon ustida
        "on-brand": "var(--text-on-brand)", // text-on-brand — brend foni ustida
      },

      borderColor: {
        default: "var(--border-default)", // border-default
        subtle: "var(--border-subtle)", // border-subtle
        focus: "var(--border-focus)", // border-focus
      },

      borderRadius: {
        input: "var(--radius-input)", // 8px  — rounded-input
        button: "var(--radius-button)", // 12px — rounded-button
        card: "var(--radius-card)", // 12px — rounded-card
        popover: "var(--radius-popover)", // 16px — rounded-popover
        modal: "var(--radius-modal)", // 24px — rounded-modal
        chip: "var(--radius-chip)", // to'liq — rounded-chip
        avatar: "var(--radius-avatar)", // to'liq — rounded-avatar
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        dropdown: "var(--shadow-dropdown)",
        modal: "var(--shadow-modal)",
      },

      zIndex: {
        sticky: "var(--z-sticky)",
        dropdown: "var(--z-dropdown)",
        drawer: "var(--z-drawer)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },

      // Eslatma: `spacing` ataylab kengaytirilmagan — Tailwind'ning standart
      // shkalasi (p-1=4px, p-2=8px, ...) globals.css dagi --space-* bilan
      // aynan bir xil. --space-* o'zgaruvchilari inline CSS/calc() uchun qoldi.

      fontFamily: {
        sans: ["Barlow", "system-ui", "sans-serif"],
        condensed: ["Barlow Condensed", "system-ui", "sans-serif"],
      },
      // Profildagi "Shrift kattaligi" (sm/md/lg) sozlamasi shu yerdan boshqariladi —
      // --font-scale faqat matn o'lchamini o'zgartiradi, spacing/icon'larga tegmaydi
      // (ular rem/px orqali mustaqil, ui.store.ts'dagi setFontSize'ga qarang).
      fontSize: {
        xs: ["calc(0.75rem * var(--font-scale, 1))", { lineHeight: "calc(1rem * var(--font-scale, 1))" }],
        sm: ["calc(0.875rem * var(--font-scale, 1))", { lineHeight: "calc(1.25rem * var(--font-scale, 1))" }],
        base: ["calc(1rem * var(--font-scale, 1))", { lineHeight: "calc(1.5rem * var(--font-scale, 1))" }],
        lg: ["calc(1.125rem * var(--font-scale, 1))", { lineHeight: "calc(1.75rem * var(--font-scale, 1))" }],
        xl: ["calc(1.25rem * var(--font-scale, 1))", { lineHeight: "calc(1.75rem * var(--font-scale, 1))" }],
        "2xl": ["calc(1.5rem * var(--font-scale, 1))", { lineHeight: "calc(2rem * var(--font-scale, 1))" }],
        "3xl": ["calc(1.875rem * var(--font-scale, 1))", { lineHeight: "calc(2.25rem * var(--font-scale, 1))" }],
        "4xl": ["calc(2.25rem * var(--font-scale, 1))", { lineHeight: "calc(2.5rem * var(--font-scale, 1))" }],
        "5xl": ["calc(3rem * var(--font-scale, 1))", { lineHeight: "1" }],
        "6xl": ["calc(3.75rem * var(--font-scale, 1))", { lineHeight: "1" }],
        "7xl": ["calc(4.5rem * var(--font-scale, 1))", { lineHeight: "1" }],
        "8xl": ["calc(6rem * var(--font-scale, 1))", { lineHeight: "1" }],
        "9xl": ["calc(8rem * var(--font-scale, 1))", { lineHeight: "1" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
