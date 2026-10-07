import { useEffect, useId, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion"; // `motion` paketida: "motion/react"

/**
 * Qubnix logo intro — 3 s.
 *   0–1000 ms   C (ring) soat 3 dan teskari yo'nalishda chiziladi   easeInOut
 *   1000–1300   check mark chiziladi                                 easeOut
 *   1300–2000   "Qubnix" matni chiqadi (icon bilan birga chapga)     easeOut
 *   2000–3000   butun logo zoom-out 1 → 0.88                          easeInOut
 *
 * Replay: komponentning `key` propini o'zgartiring.
 * Tema: `theme` prop ("system" | "light" | "dark"). Fonni o'rab turgan konteyner beradi (`bg-canvas`).
 * SVG ichidagi hex ranglar — logo rasmining o'zi (brend artwork), UI tokeni emas.
 */
export const QUBNIX_TIMELINE = {
  ring: { start: 0, duration: 1000 },
  check: { start: 1000, duration: 300 },
  text: { start: 1300, duration: 700 },
  zoom: { start: 2000, duration: 1000 },
} as const;

type Bezier = [number, number, number, number];
const EASE: Record<
  "ring" | "check" | "slide" | "letter" | "pop" | "zoom",
  Bezier
> = {
  ring: [0.65, 0, 0.35, 1],
  check: [0.22, 1, 0.36, 1],
  slide: [0.22, 1, 0.36, 1],
  letter: [0.16, 1, 0.3, 1],
  pop: [0.34, 1.56, 0.64, 1],
  zoom: [0.45, 0, 0.55, 1],
};

export type QubnixTheme = "light" | "dark" | "system";

const LIGHT_VARS =
  "--qx-text:#0D1021;--qx-ring-87:#5546D4;--qx-ring-100:#4B3EC8;--qx-shade:1;--qx-check-end:#5745D3;--qx-diamond-end:#5040CC;--qx-arm-78:#5746D1;--qx-arm-end:#4A3BC8";
const DARK_VARS =
  "--qx-text:#F8FAFC;--qx-ring-87:#6051DC;--qx-ring-100:#5A4AD6;--qx-shade:.72;--qx-check-end:#5F4EDB;--qx-diamond-end:#5B4BD8;--qx-arm-78:#5F4ED9;--qx-arm-end:#5B4AD6";

/**
 * Scoped CSS: "system" rejimi avval ilovaning .dark / [data-theme] class'ini,
 * u bo'lmasa OS'ning prefers-color-scheme'ini kuzatadi. JS yo'q → SSR'da rang miltillamaydi.
 */
const themeCss = (c: string) =>
  `.${c}{${LIGHT_VARS}}` +
  `.${c}[data-qx-theme="dark"]{${DARK_VARS}}` +
  `@media (prefers-color-scheme: dark){.${c}[data-qx-theme="system"]{${DARK_VARS}}}` +
  `:is(.dark,[data-theme="dark"]) .${c}[data-qx-theme="system"]{${DARK_VARS}}` +
  `:is(.light,[data-theme="light"]) .${c}[data-qx-theme="system"]{${LIGHT_VARS}}`;

const LETTER_STAGGER = 55; // ms
const LETTER_DURATION = 420; // ms
const DIAMOND_AT = 1720; // ms
const ZOOM_TO = 0.88;

export interface QubnixLogoIntroProps {
  /**
   * "system" (default): ilovadagi .dark / data-theme="dark" class'iga, u bo'lmasa OS sozlamasiga ergashadi.
   * Qubnix ichida aniq bering (`useUiStore().isDarkMode`): ui.store faqat `.dark` qo'yadi, `.light` ni
   * qo'ymaydi — OS dark + ilova light bo'lsa "system" matnni oq qilib qo'yadi.
   * "light" | "dark": majburiy rejim.
   */
  theme?: QubnixTheme;
  /** false → animatsiyasiz statik logo (header va h.k. uchun). Default: true */
  animated?: boolean;
  /** Icon avval markazda chiziladi, keyin matn bilan birga chapga suriladi. Default: true */
  centerIconFirst?: boolean;
  /** false → faqat icon, markazda (kvadrat viewBox), "Qubnix" yozuvisiz. Default: true */
  wordmark?: boolean;
  /** Tezlik koeffitsienti: 0.5 = sekinroq (6 s), 2 = tezroq. Default: 1 */
  speed?: number;
  /** Zoom-out tugaganda (3000 ms) chaqiriladi */
  onComplete?: () => void;
  className?: string;
  style?: CSSProperties;
  /** Screen reader uchun nom. Default: "Qubnix" */
  title?: string;
}

export function QubnixLogoIntro({
  theme = "system",
  animated = true,
  centerIconFirst = true,
  wordmark = true,
  speed = 1,
  onComplete,
  className,
  style,
  title = "Qubnix", // i18n-ignore — brend nomi
}: QubnixLogoIntroProps) {
  const reducedMotion = useReducedMotion();
  const play = animated && !reducedMotion;
  const uid = `qx${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ref = (name: string) => `url(#${uid}-${name})`;
  const sec = (ms: number) => ms / 1000 / speed;

  // statik rejimda ham onComplete chaqirilsin (masalan, splash'ni yopish uchun)
  useEffect(() => {
    if (!play) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  const draw = (startMs: number, durationMs: number, ease: Bezier) =>
    ({
      initial: play ? { pathLength: 0 } : false,
      animate: { pathLength: 1 },
      transition: { delay: sec(startMs), duration: sec(durationMs), ease },
    }) as const;

  const letter = (i: number) => {
    const start = QUBNIX_TIMELINE.text.start + i * LETTER_STAGGER;
    return {
      initial: play ? { opacity: 0, x: -16 } : false,
      animate: { opacity: 1, x: 0 },
      transition: {
        delay: sec(start),
        duration: sec(LETTER_DURATION),
        ease: EASE.letter,
      },
    } as const;
  };

  return (
    <motion.div
      className={className ? `${uid} ${className}` : uid}
      data-qx-theme={theme}
      style={{ display: "inline-block", lineHeight: 0, ...style }}
      initial={play ? { scale: 1 } : false}
      animate={{ scale: ZOOM_TO }}
      transition={{
        delay: sec(QUBNIX_TIMELINE.zoom.start),
        duration: sec(QUBNIX_TIMELINE.zoom.duration),
        ease: EASE.zoom,
      }}
      onAnimationComplete={play ? onComplete : undefined}
    >
      <svg
        viewBox={wordmark ? "-359.5 -100 719 200" : ICON_VIEWBOX}
        width="100%"
        role="img"
        aria-label={title}
        style={{ display: "block", overflow: "visible" }}
      >
        <style>{themeCss(uid)}</style>
        <defs>
          <radialGradient
            id={`${uid}-ringBase`}
            gradientUnits="userSpaceOnUse"
            cx="136"
            cy="30"
            r="175"
          >
            <stop offset="0" stopColor="#a28df8" />
            <stop offset=".07" stopColor="#9c86f5" />
            <stop offset=".32" stopColor="#7b68e4" />
            <stop offset=".43" stopColor="#6755db" />
            <stop offset=".6" stopColor="#5b4ad6" />
            <stop
              offset=".87"
              style={{ stopColor: "var(--qx-ring-87, #5546d4)" }}
            />
            <stop
              offset="1"
              style={{ stopColor: "var(--qx-ring-100, #4b3ec8)" }}
            />
          </radialGradient>
          <radialGradient
            id={`${uid}-fold`}
            gradientUnits="userSpaceOnUse"
            cx="99.9"
            cy="151.3"
            r="77.3"
          >
            <stop offset="0.741" stopColor="#3f34bd" stopOpacity="0" />
            <stop offset="0.909" stopColor="#4237bf" stopOpacity=".55" />
            <stop offset="1" stopColor="#3d32bb" stopOpacity=".95" />
          </radialGradient>
          <radialGradient
            id={`${uid}-inner`}
            gradientUnits="userSpaceOnUse"
            cx="0"
            cy="0"
            r="1"
          >
            <stop offset="0" stopColor="#3a30b8" stopOpacity=".75" />
            <stop offset="1" stopColor="#3a30b8" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id={`${uid}-tip`}
            gradientUnits="userSpaceOnUse"
            cx="141"
            cy="203"
            r="52"
          >
            <stop offset="0" stopColor="#a490fa" stopOpacity=".95" />
            <stop offset=".55" stopColor="#9580f3" stopOpacity=".5" />
            <stop offset="1" stopColor="#8f7af0" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={`${uid}-check`}
            gradientUnits="userSpaceOnUse"
            gradientTransform="rotate(-45)"
            x1="200"
            y1="128"
            x2="160"
            y2="196"
          >
            <stop offset="0" stopColor="#9884f6" />
            <stop offset=".5" stopColor="#7562e3" />
            <stop
              offset="1"
              style={{ stopColor: "var(--qx-check-end, #5745d3)" }}
            />
          </linearGradient>
          <linearGradient
            id={`${uid}-diamond`}
            gradientUnits="userSpaceOnUse"
            x1="292.5"
            y1="34"
            x2="292.5"
            y2="62"
          >
            <stop offset="0" stopColor="#6e5be5" />
            <stop
              offset="1"
              style={{ stopColor: "var(--qx-diamond-end, #5040cc)" }}
            />
          </linearGradient>
          <linearGradient
            id={`${uid}-arm`}
            gradientUnits="userSpaceOnUse"
            x1="372"
            y1="63"
            x2="340"
            y2="94"
          >
            <stop offset="0" stopColor="#9b86f6" />
            <stop offset=".14" stopColor="#917bf1" />
            <stop offset=".46" stopColor="#7964e0" />
            <stop
              offset=".78"
              style={{ stopColor: "var(--qx-arm-78, #5746d1)" }}
            />
            <stop
              offset="1"
              style={{ stopColor: "var(--qx-arm-end, #4a3bc8)" }}
            />
          </linearGradient>
          <linearGradient
            id={`${uid}-foldFade`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="96"
            x2="0"
            y2="124"
          >
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <clipPath id={`${uid}-ringClip`}>
            <path d={RING_D} />
          </clipPath>
          <clipPath id={`${uid}-armClip`}>
            <path d="M334.3 82.7L355 55H396V96H345.9Z" />
          </clipPath>
          <mask
            id={`${uid}-foldRegion`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="221"
            height="232"
          >
            <rect width="109" height="232" fill={ref("foldFade")} />
          </mask>

          {/* Draw-on masklar: oq stroke chizilgan joy ko'rinadi */}
          <mask
            id={`${uid}-ringDraw`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="221"
            height="232"
          >
            <motion.path
              d="M164.35 140.52A48 48 0 0 0 88.69 85.05A48 48 0 0 0 134.53 166.90"
              fill="none"
              stroke="#fff"
              strokeWidth={96}
              {...draw(
                QUBNIX_TIMELINE.ring.start,
                QUBNIX_TIMELINE.ring.duration,
                EASE.ring,
              )}
            />
          </mask>
          <mask
            id={`${uid}-checkDraw`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="221"
            height="232"
          >
            <motion.path
              d="M122.58 139.05L162.71 179.18L208.28 133.61"
              fill="none"
              stroke="#fff"
              strokeWidth={44}
              strokeLinejoin="miter"
              {...draw(
                QUBNIX_TIMELINE.check.start,
                QUBNIX_TIMELINE.check.duration,
                EASE.check,
              )}
            />
          </mask>
        </defs>

        <motion.g
          initial={play ? { x: centerIconFirst || !wordmark ? ICON_DX : 0 } : false}
          animate={{ x: wordmark ? 0 : ICON_DX }}
          transition={{
            delay: sec(QUBNIX_TIMELINE.text.start),
            duration: sec(QUBNIX_TIMELINE.text.duration),
            ease: EASE.slide,
          }}
        >
          {/* ICON */}
          <g transform="translate(-379.36 -118.5)">
            <g mask={ref("ringDraw")}>
              <path d={RING_D} fill={ref("ringBase")} />
              <g clipPath={ref("ringClip")}>
                <g style={{ opacity: "var(--qx-shade, 1)" }}>
                  <g mask={ref("foldRegion")}>
                    <circle cx="99.9" cy="151.3" r="77.3" fill={ref("fold")} />
                  </g>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="1"
                    ry="1"
                    fill={ref("inner")}
                    transform="translate(79 150) rotate(28) scale(12 27)"
                  />
                </g>
                <circle cx="141" cy="203" r="52" fill={ref("tip")} />
              </g>
            </g>
            <g mask={ref("checkDraw")}>
              <g transform="rotate(45)" fill={ref("check")}>
                <rect x={189.0} y={-2.6} width={67.0} height={28.5} rx={5.5} />
                <rect x={227.5} y={-48.8} width={28.5} height={74.7} rx={5.5} />
              </g>
            </g>
          </g>

          {/* WORDMARK */}
          {wordmark && (
            <g transform="translate(-146.98 -108.24) scale(1.32)">
              <g style={{ fill: "var(--qx-text, #0d1021)" }}>
                {LETTERS.slice(0, -1).map((d, i) => (
                  <motion.path key={i} d={d} {...letter(i)} />
                ))}
                <motion.g {...letter(LETTERS.length - 1)}>
                  <path d={LETTERS[LETTERS.length - 1]} />
                  <path
                    d={LETTERS[LETTERS.length - 1]}
                    clipPath={ref("armClip")}
                    fill={ref("arm")}
                  />
                </motion.g>
              </g>
              <motion.g
                initial={play ? { opacity: 0, scale: 0 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  scale: {
                    delay: sec(DIAMOND_AT),
                    duration: sec(2000 - DIAMOND_AT),
                    ease: EASE.pop,
                  },
                  opacity: { delay: sec(DIAMOND_AT), duration: sec(90) },
                }}
              >
                <rect
                  x="282.88"
                  y="38.38"
                  width="19.23"
                  height="19.23"
                  rx="2.6"
                  transform="rotate(45 292.5 48)"
                  fill={ref("diamond")}
                />
              </motion.g>
            </g>
          )}
        </motion.g>
      </svg>
    </motion.div>
  );
}

export default QubnixLogoIntro;

/* ---------- Geometry (logo rasmlaridan vektorlashtirilgan) ---------- */

/** Icon markazga turishi uchun kerak bo'lgan siljish (viewBox birligida) */
const ICON_DX = 257.66;

/** wordmark={false}: markazlangan icon (≈ x -90..94, y -83..83) atrofidagi kvadrat */
const ICON_VIEWBOX = "-100 -100 200 200";

/** C (ring) silueti — icon koordinatalari 0..221 × 0..232 */
const RING_D =
  "M106.9 201.5C103.8 201.4 100.1 201 97.8 200.6C96.9 200.4 95.5 200.1 94.7 200C87.6 198.8 78.1 195.4 72.4 192.1C71.5 191.6 70.5 191 70.2 190.8C68.5 190 62.4 185.4 59.6 183C56.4 180.2 52.3 175.9 50 172.9C47.4 169.7 46.9 168.9 45.1 166.3C40.1 158.7 37 151.9 34.7 143C34 140.4 33.7 138.8 33 134.8C31.7 127.5 31.9 118.6 33.3 110.6C33.5 109.4 33.8 108.1 33.8 107.8C34.1 105.9 36 98.9 37.1 95.6C38.7 90.9 42 83.5 43.5 81.2C43.8 80.8 44.4 79.7 44.9 78.9C47 75 51.2 69.3 54.2 65.9C62.8 56.3 71.8 49.4 82.8 44.1C87.4 41.8 88.8 41.3 96.5 38.8C97.4 38.5 99.7 37.9 101.5 37.6C105.2 36.8 107.7 36.4 114.4 35.7C118 35.4 126.4 35.6 130.9 36.3C131.9 36.4 133.5 36.6 134.5 36.7C138.5 37.3 143 38.2 145.6 39.1C146.3 39.3 147.6 39.7 148.5 39.9C156.9 42.3 167.1 47.5 173.8 52.7C176.8 55.1 177.1 55.3 178.9 57.1C184.4 62.2 187.6 65.9 191.3 71.4C195.8 78.1 199.2 85.4 201.2 92.4C201.4 93.3 201.7 94.4 201.9 95C202.2 96.1 203 100.2 203.2 101.9C204.6 113 203.3 116.1 196.7 117.2C192.6 118 193.4 117.4 177.6 132.6C172.4 137.7 171.8 138.2 170.1 138.8C167.1 139.8 163.8 138.5 162.1 135.8C161.1 134.1 160.8 131.9 161.3 129C162.4 123.3 162.7 119.7 162.7 115.7C162.8 97.7 152.5 82.2 136.3 75.5C131.7 73.7 127.7 72.9 123.2 73.1C114.9 73.5 106.7 75.8 100.3 79.7C86.9 87.6 77.6 100.7 75 115C73.7 122.3 73.9 126.1 75.9 132.8C79.5 144.9 88.2 154.1 100.5 159C102.1 159.7 103.7 160.2 104.4 160.4C106.8 160.9 108.9 161.5 109.5 161.8C110 162.1 112.2 164.3 117.4 169.5C121.4 173.5 127.7 179.8 131.4 183.5C138.9 191.1 138.8 190.9 138.7 192.6C138.5 195.9 135.4 197.6 124.3 200C122.2 200.4 121.5 200.6 119.8 200.7C119.1 200.8 118 201 117.3 201.1C115 201.6 111.4 201.7 106.9 201.5Z";

/** Q, u, b, n, ı, x — wordmark koordinatalari */
const LETTERS = [
  "M81.9 132.1C81.7 132 81 131.3 80.4 130.6C78.6 128.4 76.5 125.9 75.5 124.6C72.9 121.3 70.4 118.5 69.8 118.2C69.2 118 69.1 118 66.4 118.9C55.8 122.5 41.9 121.4 32.8 116.2C25.2 111.9 20.2 106.6 16.5 98.9C14.8 95.4 14.2 93.5 13.2 87.6C12.8 85 12.9 79.1 13.4 76.5C13.5 76.1 13.7 75 13.9 74.1C14.7 69.4 17.6 63.3 21.2 58.8C27.6 50.8 35.9 46.1 47.2 44C49 43.6 57.4 43.5 59.4 43.8C65.3 44.8 71.2 46.6 74.7 48.7C81.9 53 87.1 58.4 90.4 65.1C93.3 70.7 94.7 79.8 93.8 85.9C92.5 94.7 90.6 99.1 85.1 106C83.6 107.9 83.5 108.1 83.5 108.7C83.5 109.4 83.5 109.4 88.9 116.1C94.3 122.9 95.1 124.2 94.7 125.1C94.3 125.8 83.4 132.3 82.5 132.2C82.4 132.2 82.1 132.2 81.9 132.1ZM56.8 105.2C59.7 104.6 59.6 104.1 55.3 98.9C54.4 97.8 53.2 96.3 52.6 95.5C52 94.7 51 93.5 50.4 92.8C47.9 89.7 48.2 89.4 55.3 87C56.3 86.7 57.5 86.2 58.1 86C61.4 84.7 62.9 84.3 63.6 84.7C64.1 85.1 66.1 87.4 70 92.3C71.8 94.5 72.3 95 72.8 94.8C74.2 94.5 76.5 88.9 76.9 84.8C77 83.2 76.9 79 76.7 77.9C75.7 72.9 73.7 69.2 70.3 65.8C67.4 62.9 62.1 60.2 58 59.4C56.3 59.1 50.9 59.1 48.9 59.4C40.6 60.8 33.2 67.3 30.9 75.4C30.6 76.4 30.3 77.5 30.2 77.9C29.9 78.8 29.8 83.8 30 85.5C31.2 95.9 38.8 103.6 49.6 105.3C51 105.5 55.5 105.5 56.8 105.2Z",
  "M117.4 120.6C108.3 119.3 102.5 114.6 99.8 106.2C98.6 102.8 98.7 104 98.7 83.6C98.6 63.5 98.5 65.1 99.5 64.6C100.2 64.3 113.5 64.3 114.2 64.6C115.1 65 115 63.9 115.1 81.3C115.1 98.7 115 97.3 115.9 100.1C116.6 102.2 117.8 103.7 119.9 105C125 108.1 132.7 106.1 135.4 100.9C136.8 98.3 136.9 96.7 136.8 78C136.8 64.8 136.8 65.2 137.4 64.6C137.8 64.4 137.8 64.4 144.8 64.4C152.5 64.4 152.4 64.4 152.8 65.1C153.2 65.8 153.3 118.1 152.9 118.8C152.5 119.6 152.8 119.6 145 119.6C136.4 119.6 137.2 119.9 136.9 117.1C136.7 114.8 136.4 114.6 134.8 115.9C132.7 117.5 130.3 118.9 128.5 119.5C125.1 120.6 120.7 121 117.4 120.6Z",
  "M187.6 120.6C184 120.1 180.5 118.7 177.4 116.5C174.9 114.7 174.6 114.8 174.4 117.4C174.3 119.8 174.8 119.7 166.2 119.7C158.2 119.7 158.4 119.7 157.9 118.6L157.6 118.1L157.6 81.7C157.6 45.6 157.6 45.3 157.8 44.9C158.3 44 158.1 44 166.1 44C174.1 43.9 173.7 43.9 174.2 44.7C174.4 45 174.4 45.8 174.5 56.7C174.5 63.2 174.5 68.6 174.6 68.8C174.9 69.8 175.5 69.8 176.9 68.6C184.5 62.4 197.3 62 206.9 67.7C210.2 69.6 213.8 73.1 215.4 75.8C218.7 81.3 220 86 220 92.4C220 106.1 210.5 117.8 197.5 120.2C194.5 120.7 190 120.9 187.6 120.6ZM191 106.6C197 105.9 202.3 100.6 203 94.7C203.8 87.8 201 82.1 195.3 79.1C191.7 77.3 186.2 77.2 182.9 79C177.6 81.7 174.8 86.4 174.8 92.4C174.8 98.5 177.9 103.4 183.5 105.7C185.5 106.6 188.5 106.9 191 106.6Z",
  "M225 119.8C224.3 119.6 224 119.2 223.9 118.2C223.6 116.3 223.8 65.6 224 65.1C224.5 64.4 224.4 64.4 231.8 64.4C240.3 64.4 239.7 64.2 239.9 67C240.1 69.9 240.3 70 242.6 68.1C246.6 64.9 250.5 63.7 256.6 63.7C262.5 63.7 267.5 65.5 271.5 69C275.6 72.7 277.6 77 278.4 84.4C278.6 86.3 278.7 117.2 278.5 118.2C278.2 119.9 278 119.9 269.1 119.9C263.1 119.8 263 119.8 262.7 119.5C262 119.1 262 119.5 262 102.7C262 92.6 262 86.9 261.9 86.4C260.9 81 257.1 77.8 251.4 77.8C245.6 77.8 242.2 80.4 240.7 85.7L240.3 86.9L240.3 102.8C240.3 120.5 240.3 119.2 239.4 119.6C239 119.8 225.8 120 225 119.8Z",
  "M285.1 119.8C284.2 119.5 284.1 119.3 284 116.7C283.9 115.4 283.9 103.3 283.9 89.9C283.9 65.6 283.9 65.6 284.2 65.1C284.7 64.3 284.4 64.3 292.5 64.3C300.7 64.3 300.3 64.3 300.8 65.2C301 65.6 301.1 107.3 300.9 114.9C300.8 119.1 300.8 119.2 299.9 119.6C299.5 119.8 286 120 285.1 119.8Z",
  "M305.6 119.7C304.4 119.3 304.6 118.6 306.4 116.4C306.9 115.8 307.5 115 307.8 114.7C308.1 114.3 308.6 113.7 309 113.3C309.4 112.9 310 112.1 310.5 111.4C311 110.8 312 109.6 312.8 108.8C313.5 107.9 314.6 106.6 315.2 105.9C315.8 105.2 317.4 103.3 318.7 101.8C320 100.3 321.7 98.3 322.4 97.4C323.2 96.5 324.2 95.2 324.8 94.5C326.4 92.5 326.4 92.3 324 89.3C323 88.2 321.8 86.8 321.4 86.2C321 85.7 319.8 84.2 318.6 82.9C317.5 81.5 316.2 79.9 315.7 79.3C315.2 78.7 314.1 77.4 313.3 76.3C312.4 75.3 311.1 73.8 310.4 72.9C309.7 72 308.2 70.3 307.2 69.1C304.4 65.9 304.1 65.3 304.7 64.7C305.1 64.3 307.4 64.2 315.7 64.3L322.7 64.3L323.3 64.6C323.9 64.9 324.7 65.7 327.3 68.9C328.2 70 329.6 71.7 330.5 72.8C331.4 73.8 332.9 75.6 333.9 76.8C335.5 78.8 336.6 80 336.8 80C336.9 80 337.1 79.8 337.2 79.6C337.7 78.9 341.1 75 342.5 73.4C343.2 72.6 344.2 71.4 344.8 70.8C345.3 70.1 346.1 69.2 346.5 68.8C346.9 68.4 347.7 67.5 348.2 66.9C349.7 65.1 350.6 64.1 351.2 63.8C351.8 63.6 351.9 63.6 362.2 63.6C372.9 63.5 373.6 63.6 374.1 64C374.8 64.7 374.5 65.2 372.3 67.7C371.3 68.8 370.1 70.1 369.7 70.7C367.8 72.9 366.7 74.1 365.3 75.7C363.1 78.3 361.7 79.9 360.7 81.1C360.2 81.6 359.4 82.5 359 83C358.5 83.4 357.8 84.2 357.4 84.8C356.6 85.7 355.1 87.5 352 91.1C350.2 93.1 349.6 93.8 349.2 93.9C348.8 94 349.9 95.7 351.7 97.8C353.8 100.2 359.5 107 361.6 109.6C362.5 110.8 363.9 112.5 364.6 113.3C366.3 115.3 368.5 118.2 368.6 118.6C368.7 119 368.5 119.5 368.2 119.7C368 119.8 366.1 119.8 359.8 119.9C351.5 119.9 350.4 119.8 349.8 119.4C349.3 119.1 346.7 116.1 344.1 112.8C340.3 108.2 338 105.4 337.4 105C336.6 104.4 336.2 104.8 332.8 108.8C331.8 110 330.5 111.5 330 112.1C329.5 112.7 328.2 114.3 327.1 115.5C324.2 119 323.6 119.6 322.8 119.7C321.7 120 306.2 119.9 305.6 119.7Z",
] as const;
