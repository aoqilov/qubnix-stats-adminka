import { Spinner } from "@chakra-ui/react";

interface CusLoaderProps {
  /** Spinner ostidagi matn (masalan `t("common.states.loading")`). */
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Butun ekran — boot/sessiya tekshiruvi uchun. Aks holda blok ichida, vertikal padding bilan. */
  fullScreen?: boolean;
  className?: string;
}

/** Yuklanish holati — brend rangidagi spinner. */
export function CusLoader({ label, size = "lg", fullScreen = false, className = "" }: CusLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen bg-canvas" : "py-10"
      } ${className}`}
    >
      <Spinner size={size} color="var(--brand-default)" borderWidth="3px" />
      {label && <span className="text-sm text-secondary">{label}</span>}
    </div>
  );
}

// Ishlatish:
// <CusLoader label={t("common.states.loading")} />
// <CusLoader fullScreen />
