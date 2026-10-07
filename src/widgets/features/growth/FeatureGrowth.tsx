import { useTranslation } from "react-i18next";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { PeriodCaption } from "@/components/shared/period-caption/PeriodCaption";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import { useGrowthSummary } from "./hooks/useApiGrowth";
import { GrowthKpis } from "./components/GrowthKpis";
import { SignupsChart } from "./components/SignupsChart";
import { AudienceCard } from "./components/AudienceCard";
import { ActiveUsersChart } from "./components/ActiveUsersChart";
import { SourcesCard } from "./components/SourcesCard";

export default function FeatureGrowth() {
  const { t } = useTranslation();
  const growth = useGrowthSummary();

  return (
    <>
      <CusPageTitle title={t("sections.growth.title")} subtitle={<PeriodCaption />} className="mb-6" />
      <QueryBoundary query={growth}>
        {(data) => (
          <div className="flex flex-col gap-6">
            <GrowthKpis kpis={data.kpis} />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <SignupsChart data={data} className="xl:col-span-2" />
              <AudienceCard data={data} />
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <ActiveUsersChart data={data} className="xl:col-span-2" />
              <SourcesCard data={data} />
            </div>
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
