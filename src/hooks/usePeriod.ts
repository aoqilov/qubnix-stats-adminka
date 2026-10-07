import { useMemo } from "react";
import { usePeriodStore } from "@/store/period.store";
import { resolvePeriod, type ResolvedPeriod } from "@/utils/period";

export interface PeriodFilter extends ResolvedPeriod {
  compare: boolean;
}

/**
 * Joriy davr aniq sanalarda. Analitika hook'lari buni query key'ga qo'shadi —
 * filtr o'zgarsa so'rov avtomatik qayta ketadi.
 */
export function usePeriod(): PeriodFilter {
  const preset = usePeriodStore((s) => s.preset);
  const customRange = usePeriodStore((s) => s.customRange);
  const compare = usePeriodStore((s) => s.compare);

  return useMemo(
    () => ({ ...resolvePeriod(preset, customRange), compare }),
    [preset, customRange, compare],
  );
}
