import { useMemo } from "react";
import { usePeriod } from "@/hooks/usePeriod";
import { toPeriodQuery } from "@/utils/period";
import type { Granularity, PeriodQuery } from "@/types/analytics";

/** Global davr filtri → API parametrlari (query key'ga shu obyekt qo'shiladi). */
export function usePeriodQuery(granularity?: Granularity): PeriodQuery {
  const period = usePeriod();
  return useMemo(() => toPeriodQuery(period, granularity), [period, granularity]);
}
