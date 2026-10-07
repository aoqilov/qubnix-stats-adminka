import { useTranslation } from "react-i18next";
import { LuArrowDown } from "react-icons/lu";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import { useFormatters } from "@/utils/format";
import type { FunnelResponse } from "@/api/funnel/funnel.types";

/**
 * Voronka — bitta seriya (har qadamdagi odamlar), bitta rang; tartib joylashuvda.
 * Har qadam orasida yo'qotish yozilgan, barcha qiymatlar ko'rinadi — tooltip shart emas.
 */
export function FunnelSteps({ steps }: { steps: FunnelResponse["steps"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const max = Math.max(1, steps[0]?.count ?? 1);
  const rows = steps.map((step, index) => ({ id: index, ...step }));
  const share = (value: number | null) => (value === null ? "—" : fmt.percent(value));

  return (
    <ChartCard
      title={t("sections.funnel.chartTitle")}
      subtitle={t("sections.funnel.subtitle")}
      table={{
        rows,
        columns: [
          { key: "key", header: t("sections.funnel.columns.step"), render: (row) => t(`sections.funnel.steps.${row.key}`) },
          { key: "count", header: t("sections.funnel.columns.count"), align: "right", render: (row) => fmt.number(row.count) },
          {
            key: "from_prev",
            header: t("sections.funnel.columns.fromPrev"),
            align: "right",
            render: (row) => share(row.from_prev),
          },
          {
            key: "from_start",
            header: t("sections.funnel.columns.fromStart"),
            align: "right",
            render: (row) => share(row.from_start),
          },
          {
            key: "previous",
            header: t("sections.funnel.columns.previous"),
            align: "right",
            render: (row) => (row.previous === null ? "—" : fmt.number(row.previous)),
          },
        ],
      }}
    >
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const next = steps[index + 1];
          return (
            <li key={step.key} className="flex flex-col">
              <div className="grid grid-cols-[11rem_1fr_9rem] items-center gap-4 py-1.5">
                <span className="text-sm text-primary">
                  <span className="mr-1.5 text-secondary tabular-nums">{index + 1}.</span>
                  {t(`sections.funnel.steps.${step.key}`)}
                </span>
                <div className="h-6">
                  <div
                    className="h-full rounded-r"
                    style={{
                      width: `${(step.count / max) * 100}%`,
                      minWidth: step.count > 0 ? 2 : 0,
                      background: SERIES_COLORS[0],
                    }}
                  />
                </div>
                <div className="flex flex-col items-end leading-tight">
                  <span className="font-semibold tabular-nums text-primary">{fmt.number(step.count)}</span>
                  <span className="text-xs text-secondary">
                    {index === 0
                      ? step.previous === null
                        ? ""
                        : t("sections.funnel.previous", { value: fmt.number(step.previous) })
                      : t("sections.funnel.fromStart", { value: share(step.from_start) })}
                  </span>
                </div>
              </div>
              {next && (
                <div className="grid grid-cols-[11rem_1fr_9rem] gap-4">
                  <span />
                  <span className="flex items-center gap-1 pb-1 text-xs text-secondary">
                    <LuArrowDown size={12} aria-hidden />
                    {t("sections.funnel.dropped", {
                      lost: fmt.number(step.count - next.count),
                      value: share(next.from_prev),
                    })}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </ChartCard>
  );
}
