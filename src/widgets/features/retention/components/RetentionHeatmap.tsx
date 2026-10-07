import { useTranslation } from "react-i18next";
import { LuInfo } from "react-icons/lu";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CohortHeatmap } from "@/components/shared/charts/CohortHeatmap";
import { useFormatters } from "@/utils/format";
import type { RetentionResponse } from "@/api/retention/retention.types";

/** Kamida shuncha kohorta bo'lmasa — davrni uzaytirish maslahati. */
const MIN_COHORTS = 3;

export function RetentionHeatmap({ data }: { data: RetentionResponse }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const shortKey = data.granularity === "week" ? "weekShort" : "monthShort";

  return (
    <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
      <div>
        <h2 className="font-semibold text-primary">{t("sections.retention.heatmap.title")}</h2>
        <p className="mt-0.5 text-xs text-secondary">{t("sections.retention.heatmap.subtitle")}</p>
      </div>

      {data.cohorts.length < MIN_COHORTS && (
        <p className="flex items-center gap-2 rounded-input bg-info-soft px-3 py-2 text-sm text-info-strong">
          <LuInfo size={16} aria-hidden className="flex-none" />
          {t("sections.retention.heatmap.fewCohorts")}
        </p>
      )}

      <CohortHeatmap
        rows={data.cohorts.map((cohort) => ({
          key: cohort.start,
          label: data.granularity === "week" ? fmt.date(cohort.start) : fmt.bucketLabel(cohort.start, "month"),
          size: cohort.size,
          values: cohort.values,
        }))}
        average={data.average}
        columnLabel={(k) => t(`sections.retention.heatmap.${shortKey}`, { count: k })}
        formatPercent={(value) => fmt.percent(value)}
        formatNumber={fmt.number}
        labels={{
          cohort: t("sections.retention.heatmap.cohort"),
          size: t("sections.retention.heatmap.size"),
          average: t("sections.retention.heatmap.average"),
          scaleLow: t("sections.retention.heatmap.scaleLow"),
          scaleHigh: t("sections.retention.heatmap.scaleHigh"),
        }}
      />
    </CusCardbox>
  );
}
