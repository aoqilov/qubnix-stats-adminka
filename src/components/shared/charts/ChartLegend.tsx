export interface LegendItem {
  label: string;
  color: string;
  /** Belgi grafik belgisini takrorlaydi: ustun/maydon — to'rtburchak, chiziq — chiziqcha. */
  shape: "rect" | "line";
}

/** Legend — matn token rangida, rang faqat yonidagi belgida. */
export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-secondary">
          <span
            aria-hidden
            className={item.shape === "rect" ? "size-2.5 rounded-sm" : "h-0.5 w-3.5 rounded-chip"}
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
