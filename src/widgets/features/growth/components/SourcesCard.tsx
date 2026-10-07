import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { BarList } from "@/components/shared/charts/BarList";
import { useFormatters } from "@/utils/format";
import { ratio } from "@/utils/metrics";
import type { GrowthSummaryResponse } from "@/api/growth/growth.types";

/** O'zi kelganlar va kompaniya taklifi bilan kelganlar — virusli o'sish ulushi. */
export function SourcesCard({ data }: { data: GrowthSummaryResponse }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const total = data.signups_series.reduce((sum, point) => sum + point.total, 0);
  const invited = data.signups_series.reduce((sum, point) => sum + point.invited, 0);
  const direct = total - invited;

  return (
    <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
      <h2 className="font-semibold text-primary">{t("sections.growth.sources.title")}</h2>
      <BarList
        items={[
          {
            key: "direct",
            label: t("sections.growth.sources.direct"),
            value: direct,
            display: fmt.number(direct),
            note: fmt.percent(ratio(direct, total) ?? 0),
          },
          {
            key: "invited",
            label: t("sections.growth.sources.invited"),
            value: invited,
            display: fmt.number(invited),
            note: fmt.percent(ratio(invited, total) ?? 0),
          },
        ]}
      />
    </CusCardbox>
  );
}
