import { useTranslation } from "react-i18next";
import { KpiTile } from "@/components/shared/kpi/KpiTile";
import { useFormatters } from "@/utils/format";
import type { RetentionResponse } from "@/api/retention/retention.types";

/** Kalit nuqtalar: haftalikda 1 / 4 / 8 / 11, oylikda 1 / 3 / 6 / 11. */
const CHECKPOINTS = {
  week: [1, 4, 8, 11],
  month: [1, 3, 6, 11],
} as const;

export function RetentionKpis({ data }: { data: RetentionResponse }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {CHECKPOINTS[data.granularity]
        .filter((k) => k < data.periods)
        .map((k) => (
          <KpiTile
            key={k}
            label={t(`sections.retention.kpi.${data.granularity}`, { count: k })}
            kpi={{ value: data.average[k] ?? null, previous: null }}
            format={fmt.percent}
            hint={t("sections.retention.kpi.hint")}
          />
        ))}
    </div>
  );
}
