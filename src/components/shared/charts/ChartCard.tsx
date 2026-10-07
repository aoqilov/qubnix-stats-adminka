import { useTranslation } from "react-i18next";
import { useState, type ReactNode } from "react";
import { LuChartColumn, LuTable2 } from "react-icons/lu";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusSegment } from "@/components/ui/segment/CusSegment";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { ChartLegend, type LegendItem } from "./ChartLegend";

interface ChartCardProps<T extends { id: number }> {
  title: string;
  subtitle?: ReactNode;
  /** Sarlavha ostidagi bosh raqam (hero) yoki qisqa xulosa. */
  headline?: ReactNode;
  /** 2+ seriya bo'lsa doim; bitta seriyada kerak emas — sarlavha uni nomlaydi. */
  legend?: LegendItem[];
  /** Grafikning jadval ko'rinishi — har bir qiymat tooltip'siz ham o'qilishi uchun. */
  table: { columns: ColumnDef<T>[]; rows: T[] };
  children: ReactNode;
  className?: string;
}

/** Grafik konteyneri: sarlavha, legend, "График / Таблица" almashtirgich. */
export function ChartCard<T extends { id: number }>({
  title,
  subtitle,
  headline,
  legend,
  table,
  children,
  className = "",
}: ChartCardProps<T>) {
  const { t } = useTranslation();
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <CusCardbox className={`flex min-w-0 flex-col gap-3 rounded-card p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-primary">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-secondary">{subtitle}</p>}
        </div>
        <CusSegment
          items={[
            { id: "chart", label: t("charts.view.chart"), icon: <LuChartColumn size={14} /> },
            { id: "table", label: t("charts.view.table"), icon: <LuTable2 size={14} /> },
          ]}
          value={view}
          onValueChange={(value) => setView(value as "chart" | "table")}
          size="xs"
          layout="inline"
          accent="var(--brand-default)"
        />
      </div>

      {headline}
      {legend && legend.length > 1 && view === "chart" && <ChartLegend items={legend} />}

      {view === "chart" ? (
        children
      ) : (
        <CusTable columns={table.columns} data={table.rows} size="sm" maxH="320px" stickyHeader />
      )}
    </CusCardbox>
  );
}
