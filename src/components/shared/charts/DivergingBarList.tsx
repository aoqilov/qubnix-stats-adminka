import type { ReactNode } from "react";
import { CHART_COLORS, SERIES_COLORS } from "./chartTokens";

export interface DivergingBarItem {
  key: string;
  label: ReactNode;
  /** Ishorali qiymat: musbat — o'ngga, manfiy — chapga. */
  value: number;
  display: string;
}

interface DivergingBarListProps {
  items: DivergingBarItem[];
  positiveColor?: string;
  negativeColor?: string;
}

/**
 * Ustun treking yarmining shuncha foizigacha cho'ziladi — qolgani uchidagi qiymat yozuviga joy
 * (tor kartada ham "+185,5 %" chetdan chiqmasin).
 */
const MAX_HALF = 26;

/**
 * Bazaviy chiziq atrofidagi gorizontal ustunlar (diverging): ikki qarama-qarshi rang,
 * o'rtada neytral chiziq. Nom ustun ustida, qiymat ustun uchida — tooltip shart emas.
 */
export function DivergingBarList({
  items,
  positiveColor = SERIES_COLORS[0],
  negativeColor = SERIES_COLORS[1],
}: DivergingBarListProps) {
  const max = Math.max(1e-9, ...items.map((item) => Math.abs(item.value)));

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const positive = item.value >= 0;
        const width = (Math.abs(item.value) / max) * MAX_HALF;
        return (
          <li key={item.key} className="flex flex-col gap-0.5">
            <span className="truncate text-sm text-primary">{item.label}</span>
            <div className="relative h-5">
              <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: CHART_COLORS.axis }} />
              <div
                className="absolute top-1/2 h-2 -translate-y-1/2"
                style={{
                  left: positive ? "50%" : `${50 - width}%`,
                  width: `${width}%`,
                  minWidth: item.value !== 0 ? 2 : 0,
                  background: positive ? positiveColor : negativeColor,
                  borderRadius: positive ? "0 4px 4px 0" : "4px 0 0 4px",
                }}
              />
              <span
                className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-semibold tabular-nums text-primary"
                style={positive ? { left: `calc(${50 + width}% + 6px)` } : { right: `calc(${50 + width}% + 6px)` }}
              >
                {item.display}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
