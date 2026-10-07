import { useTranslation } from "react-i18next";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { PeriodCaption } from "@/components/shared/period-caption/PeriodCaption";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import { useTariffsSummary } from "./hooks/useApiTariffs";
import { PlanCards } from "./components/PlanCards";
import { MovementKpis } from "./components/MovementKpis";
import { SubscriptionFlowChart } from "./components/SubscriptionFlowChart";
import { PlanFlows } from "./components/PlanFlows";
import { ExpiringSubscriptions } from "./components/ExpiringSubscriptions";
import { UpsellCandidates } from "./components/UpsellCandidates";

export default function FeatureTariffs() {
  const { t } = useTranslation();
  const summary = useTariffsSummary();

  return (
    <>
      <CusPageTitle title={t("sections.tariffs.title")} subtitle={<PeriodCaption />} className="mb-6" />
      <div className="flex flex-col gap-6">
        <QueryBoundary query={summary}>
          {(data) => (
            <div className="flex flex-col gap-6">
              <PlanCards plans={data.plans} distribution={data.distribution} />
              <MovementKpis movements={data.movements} />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <SubscriptionFlowChart data={data} className="xl:col-span-2" />
                <PlanFlows flows={data.flows} />
              </div>
              <ExpiringSubscriptions summary={data.expiring} />
            </div>
          )}
        </QueryBoundary>
        <UpsellCandidates />
      </div>
    </>
  );
}
