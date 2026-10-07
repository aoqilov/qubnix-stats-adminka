import { useTranslation } from "react-i18next";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { PeriodCaption } from "@/components/shared/period-caption/PeriodCaption";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import { usePaymentsSummary } from "./hooks/useApiRevenue";
import { RevenueKpis } from "./components/RevenueKpis";
import { RevenueChart } from "./components/RevenueChart";
import { ProvidersCard } from "./components/ProvidersCard";
import { PaymentsTable } from "./components/PaymentsTable";

export default function FeatureRevenue() {
  const { t } = useTranslation();
  const summary = usePaymentsSummary();

  return (
    <>
      <CusPageTitle title={t("sections.revenue.title")} subtitle={<PeriodCaption />} className="mb-6" />
      <div className="flex flex-col gap-6">
        <QueryBoundary query={summary}>
          {(data) => (
            <div className="flex flex-col gap-6">
              <RevenueKpis kpis={data.kpis} />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <RevenueChart data={data} className="xl:col-span-2" />
                <ProvidersCard providers={data.providers} statuses={data.statuses} />
              </div>
            </div>
          )}
        </QueryBoundary>
        <PaymentsTable />
      </div>
    </>
  );
}
