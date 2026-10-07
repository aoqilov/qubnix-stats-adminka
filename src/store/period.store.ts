import { create } from "zustand";
import { PERIOD_PRESETS, type DateRange, type PeriodPreset } from "@/utils/period";

const STORAGE_KEY = "qubnix_admin_period";

interface StoredPeriod {
  preset: PeriodPreset;
  customRange: DateRange | null;
  compare: boolean;
}

const DEFAULT_PERIOD: StoredPeriod = { preset: "30d", customRange: null, compare: true };

function readStored(): StoredPeriod {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<StoredPeriod> | null;
    if (!parsed || !PERIOD_PRESETS.includes(parsed.preset as PeriodPreset)) return DEFAULT_PERIOD;
    return {
      preset: parsed.preset as PeriodPreset,
      customRange: parsed.customRange ?? null,
      compare: parsed.compare ?? DEFAULT_PERIOD.compare,
    };
  } catch {
    return DEFAULT_PERIOD;
  }
}

function writeStored(value: StoredPeriod): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // localStorage yopiq — filtr faqat shu sessiyada qoladi.
  }
}

interface PeriodState extends StoredPeriod {
  setPreset: (preset: PeriodPreset) => void;
  setCustomRange: (range: DateRange) => void;
  setCompare: (compare: boolean) => void;
}

/**
 * Header'dagi global davr filtri — barcha analitika bo'limlari shunga qarab so'raydi
 * (`usePeriod()` → query key). Sahifa yangilansa ham saqlanadi.
 */
export const usePeriodStore = create<PeriodState>((set, get) => {
  const persist = (patch: Partial<StoredPeriod>) => {
    const { preset, customRange, compare } = { ...get(), ...patch };
    writeStored({ preset, customRange, compare });
    set(patch);
  };

  return {
    ...readStored(),
    setPreset: (preset) => persist({ preset }),
    setCustomRange: (customRange) => persist({ customRange, preset: "custom" }),
    setCompare: (compare) => persist({ compare }),
  };
});
