import { useTranslation } from "react-i18next";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { PeriodCaption } from "@/components/shared/period-caption/PeriodCaption";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import { useOverview } from "./hooks/useApiOverview";
import { MrrCard } from "./components/MrrCard";
import { PlanShareCard } from "./components/PlanShareCard";
import { OverviewKpis } from "./components/OverviewKpis";

export default function FeatureOverview() {
  const { t } = useTranslation();
  const overview = useOverview();

  return (
    <>
      <CusPageTitle title={t("sections.overview.title")} subtitle={<PeriodCaption />} className="mb-6" />
      <QueryBoundary query={overview}>
        {(data) => (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <MrrCard data={data} className="xl:col-span-2" />
              <PlanShareCard plans={data.plan_share} />
            </div>
            <OverviewKpis kpis={data.kpis} />
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
