import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { CusSegment } from "@/components/ui/segment/CusSegment";
import { PeriodCaption } from "@/components/shared/period-caption/PeriodCaption";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import type { RetentionEntity, RetentionGranularity } from "@/api/retention/retention.types";
import { useRetention } from "./hooks/useApiRetention";
import { RetentionKpis } from "./components/RetentionKpis";
import { RetentionCurve } from "./components/RetentionCurve";
import { RetentionHeatmap } from "./components/RetentionHeatmap";

/** Jadval ustunlari soni (0-davr ham kiradi). */
const PERIODS = 12;

export default function FeatureRetention() {
  const { t } = useTranslation();
  const [granularity, setGranularity] = useState<RetentionGranularity>("week");
  const [entity, setEntity] = useState<RetentionEntity>("users");
  const retention = useRetention({ granularity, entity, periods: PERIODS });

  return (
    <>
      <CusPageTitle
        title={t("sections.retention.title")}
        subtitle={<PeriodCaption />}
        className="mb-6"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <CusSegment
              items={[
                { id: "users", label: t("sections.retention.entity.users") },
                { id: "organizations", label: t("sections.retention.entity.organizations") },
              ]}
              value={entity}
              onValueChange={(value) => setEntity(value as RetentionEntity)}
              size="sm"
              layout="inline"
              accent="var(--brand-default)"
            />
            <CusSegment
              items={[
                { id: "week", label: t("sections.retention.granularity.week") },
                { id: "month", label: t("sections.retention.granularity.month") },
              ]}
              value={granularity}
              onValueChange={(value) => setGranularity(value as RetentionGranularity)}
              size="sm"
              layout="inline"
              accent="var(--brand-default)"
            />
          </div>
        }
      />
      <QueryBoundary query={retention}>
        {(data) => (
          <div className="flex flex-col gap-6">
            <RetentionKpis data={data} />
            <RetentionCurve data={data} />
            <RetentionHeatmap data={data} />
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
