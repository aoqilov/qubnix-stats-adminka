import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import CusSelect from "@/components/ui/select/CusSelect";
import { PeriodCaption } from "@/components/shared/period-caption/PeriodCaption";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import { CHANNEL_IDS } from "@/types/domain";
import type { FunnelParams } from "@/api/funnel/funnel.types";
import { useFunnel } from "./hooks/useApiFunnel";
import { FunnelKpis } from "./components/FunnelKpis";
import { FunnelSteps } from "./components/FunnelSteps";

type DirectChannel = NonNullable<FunnelParams["channel"]>;
const DIRECT_CHANNELS = CHANNEL_IDS.filter((channel): channel is DirectChannel => channel !== "invite");
const ALL = "all";

export default function FeatureFunnel() {
  const { t } = useTranslation();
  const [channel, setChannel] = useState<DirectChannel | typeof ALL>(ALL);
  const funnel = useFunnel(channel === ALL ? undefined : channel);

  return (
    <>
      <CusPageTitle
        title={t("sections.funnel.title")}
        subtitle={<PeriodCaption />}
        className="mb-6"
        action={
          <div className="w-56">
            <CusSelect<string>
              size="sm"
              options={[
                { value: ALL, label: t("sections.funnel.allChannels") },
                ...DIRECT_CHANNELS.map((value) => ({ value, label: t(`domain.channel.${value}`) })),
              ]}
              value={channel}
              onChange={(value) => setChannel((value || ALL) as DirectChannel | typeof ALL)}
            />
          </div>
        }
      />
      <QueryBoundary query={funnel}>
        {(data) => (
          <div className="flex flex-col gap-6">
            <FunnelKpis steps={data.steps} />
            <FunnelSteps steps={data.steps} />
          </div>
        )}
      </QueryBoundary>
    </>
  );
}
