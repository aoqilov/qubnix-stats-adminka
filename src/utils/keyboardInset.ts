/** Toolbar yashirinishi (~50-80px) klaviatura deb hisoblanmasin. */
const MIN_KEYBOARD_HEIGHT = 120;

/**
 * Virtual klaviatura ochilganda ko'rinib turgan maydonni CSS o'zgaruvchilarga yozadi:
 *   --keyboard-inset — ekran pastidan klaviatura yopib turgan balandlik;
 *   --keyboard-top   — fokusdagi input ko'rinsin deb brauzer sahifani qancha yuqoriga surgani.
 * Klaviatura yopiq bo'lsa ikkalasi ham olib tashlanadi (fallback 0px).
 *
 * iOS (Safari, PWA, Telegram iOS) va Android Chrome'da klaviatura layout viewport'ni
 * kichraytirmaydi — 100dvh o'zgarmaydi, `fixed` modal'ning footer'i klaviatura ostida qoladi.
 * Faqat `visualViewport` kichrayadi, shuning uchun qiymat o'shandan olinadi.
 * Telegram Android'da webview o'zi kichrayadi — u yerda inset ~0 bo'lib, hech narsa o'zgarmaydi.
 *
 * Boot'da (main.tsx) bir marta chaqiriladi.
 */
export function trackKeyboardInset(): void {
  const vv = window.visualViewport;
  if (!vv) return;

  const root = document.documentElement;
  let frame = 0;
  let lastInset = 0;

  const update = () => {
    frame = 0;
    // clientHeight — layout viewport balandligi, klaviatura ochilganda o'zgarmaydi.
    const inset = Math.round(root.clientHeight - vv.height - vv.offsetTop);
    // Pinch-zoom ham vv.height'ni kichraytiradi — u klaviatura emas.
    const isOpen = vv.scale < 1.01 && inset > MIN_KEYBOARD_HEIGHT;

    if (isOpen) {
      root.style.setProperty("--keyboard-inset", `${inset}px`);
      root.style.setProperty("--keyboard-top", `${Math.round(vv.offsetTop)}px`);
    } else {
      root.style.removeProperty("--keyboard-inset");
      root.style.removeProperty("--keyboard-top");
    }

    // Modal ko'rinadigan maydonga qisqargach, fokusdagi input body scroll'idan tashqarida qolib ketmasin.
    const nextInset = isOpen ? inset : 0;
    if (nextInset > lastInset) requestAnimationFrame(revealFocusedField);
    lastInset = nextInset;
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  vv.addEventListener("resize", schedule);
  vv.addEventListener("scroll", schedule);
  update();
}

function revealFocusedField() {
  const el = document.activeElement;
  if (!(el instanceof HTMLElement) || !el.closest('[role="dialog"], [role="alertdialog"]')) return;
  if (el.matches("input, textarea, select") || el.isContentEditable) {
    el.scrollIntoView({ block: "nearest" });
  }
}

/**
 * CusDialog/CusDrawer positioner'i uchun: klaviatura ochiq bo'lsa modal faqat uning ustidagi
 * ko'rinib turgan maydonni egallaydi — footer tugmalari klaviatura ustida turadi.
 * Klaviatura yopiq bo'lsa Chakra'ning odatiy qiymatlari bilan bir xil (top: 0, height: 100dvh).
 */
export const KEYBOARD_AWARE_POSITIONER = {
  top: "var(--keyboard-top, 0px)",
  height: "calc(100dvh - var(--keyboard-top, 0px) - var(--keyboard-inset, 0px))",
} as const;
