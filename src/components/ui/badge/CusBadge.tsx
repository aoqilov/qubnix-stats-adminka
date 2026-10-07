import { Badge } from "@chakra-ui/react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BadgeVariant = "solid" | "subtle" | "outline" | "surface" | "plain";
type BadgeSize = "xs" | "sm" | "md" | "lg";

/** globals.css dagi semantik tokenlarga mos rang oilalari — Chakra'ning zavod
 * palitrasi (purple/blue/gray...) emas. "neutral" — default/gray o'rnini bosadi. */
export type BadgeTone =
  | "brand"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "progress"
  | "teal"
  | "orange"
  | "pink"
  | "cyan"
  | "neutral";

// ─── Tone → token rezolyutsiyasi ───────────────────────────────────────────────

interface ToneColors {
  bg: string;
  text: string;
  border: string;
  solidBg: string;
  solidText: string;
}

function resolveTone(tone: BadgeTone): ToneColors {
  switch (tone) {
    case "brand":
      return {
        bg: "var(--brand-subtle-bg)",
        text: "var(--brand-default)",
        border: "var(--brand-default)",
        solidBg: "var(--brand-default)",
        solidText: "var(--text-on-brand)",
      };
    case "success":
      return {
        bg: "var(--status-success-bg)",
        text: "var(--status-success-text)",
        border: "var(--status-success-solid)",
        solidBg: "var(--status-success-solid)",
        solidText: "var(--text-on-brand)",
      };
    case "warning":
      return {
        bg: "var(--status-warning-bg)",
        text: "var(--status-warning-text)",
        border: "var(--status-warning-solid)",
        solidBg: "var(--status-warning-solid)",
        solidText: "var(--text-on-brand)",
      };
    case "error":
      return {
        bg: "var(--status-error-bg)",
        text: "var(--status-error-text)",
        border: "var(--status-error-solid)",
        solidBg: "var(--status-error-solid)",
        solidText: "var(--text-on-brand)",
      };
    case "info":
      // Figma'da info uchun solid variant yo'q — text tokeni solid fon sifatida ham ishlatiladi.
      return {
        bg: "var(--status-info-bg)",
        text: "var(--status-info-text)",
        border: "var(--status-info-text)",
        solidBg: "var(--status-info-text)",
        solidText: "var(--text-on-brand)",
      };
    case "progress":
      return {
        bg: "var(--status-progress-bg)",
        text: "var(--status-progress-text)",
        border: "var(--status-progress-text)",
        solidBg: "var(--status-progress-text)",
        solidText: "var(--text-on-brand)",
      };
    case "neutral":
      return {
        bg: "var(--bg-surface-secondary)",
        text: "var(--text-secondary)",
        border: "var(--border-default)",
        solidBg: "var(--text-secondary)",
        solidText: "var(--text-on-brand)",
      };
    default: {
      // teal | orange | pink | cyan — teg/accent ranglar, faqat bitta token bor,
      // shuning uchun subtle fon color-mix orqali hisoblanadi.
      const accent = `var(--accent-${tone})`;
      return {
        bg: `color-mix(in srgb, ${accent} 16%, transparent)`,
        text: accent,
        border: accent,
        solidBg: accent,
        solidText: "var(--text-on-brand)",
      };
    }
  }
}

function variantStyle(variant: BadgeVariant, c: ToneColors) {
  switch (variant) {
    case "solid":
      return { bg: c.solidBg, color: c.solidText, borderColor: "transparent" };
    case "outline":
      return { bg: "transparent", color: c.text, borderColor: c.border };
    case "surface":
      return { bg: c.bg, color: c.text, borderColor: c.border };
    case "plain":
      return { bg: "transparent", color: c.text, borderColor: "transparent" };
    case "subtle":
    default:
      return { bg: c.bg, color: c.text, borderColor: "transparent" };
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CusBadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  tone?: BadgeTone;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  dot?: boolean;
  dotColor?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CusBadge({
  children,
  variant = "subtle",
  size = "sm",
  tone = "neutral",
  leftIcon,
  rightIcon,
  dot = false,
  dotColor,
}: CusBadgeProps) {
  const colors = resolveTone(tone);
  const style = variantStyle(variant, colors);

  return (
    <Badge
      variant={variant}
      size={size}
      display="inline-flex"
      alignItems="center"
      gap="1"
      bg={style.bg}
      color={style.color}
      border="1px solid"
      borderColor={style.borderColor}
      boxShadow="none"
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: dotColor ?? "currentColor",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
      )}
      {leftIcon && !dot && (
        <span style={{ display: "flex", alignItems: "center" }}>{leftIcon}</span>
      )}
      {children}
      {rightIcon && (
        <span style={{ display: "flex", alignItems: "center" }}>{rightIcon}</span>
      )}
    </Badge>
  );
}
