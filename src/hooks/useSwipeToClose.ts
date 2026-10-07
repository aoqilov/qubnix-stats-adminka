import { useCallback, useEffect, useRef, useState } from "react";

type Placement = "start" | "end" | "top" | "bottom";
type Axis = "x" | "y";

// `sign` — yopish yo'nalishi: o'ngdan chiqqan panel o'ngga (+x), pastdan chiqqani pastga (+y) suriladi.
const CLOSE_DIRECTION: Record<Placement, { axis: Axis; sign: 1 | -1 }> = {
  end: { axis: "x", sign: 1 },
  start: { axis: "x", sign: -1 },
  bottom: { axis: "y", sign: 1 },
  top: { axis: "y", sign: -1 },
};

// Siljish shu masofadan oshganda yo'nalish aniqlanadi (drag yoki oddiy scroll).
const LOCK_DISTANCE = 8;
const CLOSE_RATIO = 0.35;
// px/ms — qisqa, lekin tez siltash ham yopadi.
const CLOSE_VELOCITY = 0.5;
const DURATION_MS = 200;

/** Swipe boshlangan joy slider/input yoki o'zi scroll bo'ladigan blok ichida bo'lsa — drawer'ni tortmaymiz. */
function isIgnored(target: EventTarget | null, root: HTMLElement, placement: Placement): boolean {
  const { axis, sign } = CLOSE_DIRECTION[placement];
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== root) {
    if (node.matches("input, textarea, select, [data-no-swipe]")) return true;
    const style = getComputedStyle(node);
    if (axis === "x") {
      if (/(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth) return true;
    } else if (/(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight) {
      // Vertikal drawer faqat scroll chetida (bottom — tepada, top — pastda) tortiladi.
      const atEdge =
        sign === 1
          ? node.scrollTop <= 0
          : node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      if (!atEdge) return true;
    }
    node = node.parentElement;
  }
  return false;
}

interface UseSwipeToCloseOptions {
  enabled: boolean;
  placement: Placement;
  open: boolean;
  onClose: () => void;
}

/**
 * Drawer panelini barmoq bilan chetga tortib yopish (faqat touch — desktop sichqonchasiga tegmaydi).
 * Qaytgan callback ref'ni panel elementiga bering. Element lazyMount tufayli keyin paydo bo'ladi,
 * shuning uchun ref state'ga yoziladi.
 */
export function useSwipeToClose({ enabled, placement, open, onClose }: UseSwipeToCloseOptions) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const openRef = useRef(open);
  const onCloseRef = useRef(onClose);
  openRef.current = open;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!el || !enabled) return;
    const { axis, sign } = CLOSE_DIRECTION[placement];
    const translate = (px: number) => (axis === "x" ? `translateX(${px}px)` : `translateY(${px}px)`);

    let mode: "idle" | "pending" | "drag" | "off" = "idle";
    let startX = 0;
    let startY = 0;
    let offset = 0;
    let prev = { offset: 0, t: 0 };
    let last = { offset: 0, t: 0 };

    const snapBack = () => {
      el.style.transition = `transform ${DURATION_MS}ms ease-out`;
      el.style.transform = translate(0);
      window.setTimeout(() => {
        if (!el.isConnected) return;
        el.style.transition = "";
        el.style.transform = "";
      }, DURATION_MS);
    };

    const dismiss = () => {
      const size = axis === "x" ? el.offsetWidth : el.offsetHeight;
      el.style.transition = `transform ${DURATION_MS}ms ease-out`;
      el.style.transform = translate(sign * size);
      window.setTimeout(() => {
        if (!el.isConnected) return;
        // Chakra'ning chiqish animatsiyasi panelni 0 dan qayta boshlab yubormasligi uchun o'chiriladi.
        el.style.animation = "none";
        onCloseRef.current();
        // Ota komponent yopishni rad etgan bo'lsa (masalan, tasdiq so'raydi) — panel joyiga qaytadi.
        window.setTimeout(() => {
          if (el.isConnected && openRef.current) snapBack();
        }, DURATION_MS + 100);
      }, DURATION_MS);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isIgnored(e.target, el, placement)) {
        mode = "off";
        return;
      }
      mode = "pending";
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      offset = 0;
      prev = last = { offset: 0, t: e.timeStamp };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (mode === "off" || mode === "idle") return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      const main = (axis === "x" ? dx : dy) * sign;
      const cross = axis === "x" ? dy : dx;

      if (mode === "pending") {
        if (Math.max(Math.abs(main), Math.abs(cross)) < LOCK_DISTANCE) return;
        // Yopish yo'nalishida va ko'ndalangiga qaraganda aniq ustun bo'lsagina drag boshlanadi.
        mode = main > 0 && Math.abs(main) > Math.abs(cross) * 1.2 ? "drag" : "off";
        if (mode === "off") return;
      }

      if (e.cancelable) e.preventDefault();
      offset = Math.max(0, main);
      prev = last;
      last = { offset, t: e.timeStamp };
      el.style.transition = "none";
      el.style.transform = translate(sign * offset);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const wasDragging = mode === "drag";
      mode = "idle";
      if (!wasDragging) return;
      const size = axis === "x" ? el.offsetWidth : el.offsetHeight;
      const dt = last.t - prev.t;
      const velocity = dt > 0 ? (last.offset - prev.offset) / dt : 0;
      if (e.type === "touchend" && (offset > size * CLOSE_RATIO || velocity > CLOSE_VELOCITY)) {
        dismiss();
      } else {
        snapBack();
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    // passive: false — drag boshlanganda brauzer scroll'ini to'xtatish uchun.
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [el, enabled, placement]);

  return useCallback((node: HTMLElement | null) => setEl(node), []);
}
