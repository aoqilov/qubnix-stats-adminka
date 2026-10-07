import { useTranslation } from "react-i18next";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { PeriodCaption } from "@/components/shared/period-caption/PeriodCaption";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import { useChannelsSummary } from "./hooks/useApiChannels";
import { ChannelsKpis } from "./components/ChannelsKpis";
import { SourcesChart } from "./components/SourcesChart";
import { RomiCard } from "./components/RomiCard";
import { ChannelsTable } from "./components/ChannelsTable";
import { CampaignsTable } from "./components/CampaignsTable";

export default function FeatureChannels() {
  const { t } = useTranslation();
  const channels = useChannelsSummary();

  return (
    <>
      <CusPageTitle title={t("sections.channels.title")} subtitle={<PeriodCaption />} className="mb-6" />
      <QueryBoundary query={channels}>
        {(data) => (
          <div className="flex flex-col gap-6">
            <ChannelsKpis totals={data.totals} />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <SourcesChart data={data} className="xl:col-span-2" />
              <RomiCard channels={data.channels} />
            </div>
            <ChannelsTable channels={data.channels} />
            <CampaignsTable campaigns={data.campaigns} />
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
