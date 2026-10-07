import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import type { PaymentProvider } from "@/types/domain";

/** Rang to'lov tizimiga bog'langan (filtr yoki tartibga emas): Payme — 1-slot, Click — 2-slot. */
export const PROVIDER_COLORS: Record<PaymentProvider, string> = {
  payme: SERIES_COLORS[0],
  click: SERIES_COLORS[1],
};
