import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { ChartLegend } from "@/components/shared/charts/ChartLegend";
import { DivergingBarList } from "@/components/shared/charts/DivergingBarList";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import { useFormatters } from "@/utils/format";
import type { ChannelsSummaryResponse } from "@/api/channels/channels.types";

/** Pullik kanallar ROMI'si — bazaviy chiziqdan o'ngga (o'zini oqlaydi) / chapga (zarar). */
export function RomiCard({ channels }: { channels: ChannelsSummaryResponse["channels"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const paid = channels
    .filter((item) => item.spend > 0 && item.romi !== null)
    .sort((a, b) => (b.romi ?? 0) - (a.romi ?? 0));

  return (
    <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
      <div>
        <h2 className="font-semibold text-primary">{t("sections.channels.romi.title")}</h2>
        <p className="mt-0.5 text-xs text-secondary">{t("sections.channels.romi.subtitle")}</p>
      </div>
      {paid.length === 0 ? (
        <p className="py-6 text-center text-sm text-secondary">{t("sections.channels.romi.empty")}</p>
      ) : (
        <>
          <ChartLegend
            items={[
              { label: t("sections.channels.romi.positive"), color: SERIES_COLORS[0], shape: "rect" },
              { label: t("sections.channels.romi.negative"), color: SERIES_COLORS[1], shape: "rect" },
            ]}
          />
          <DivergingBarList
            items={paid.map((item) => ({
              key: item.channel,
              label: t(`domain.channel.${item.channel}`),
              value: item.romi ?? 0,
              display: fmt.signedPercent(item.romi ?? 0),
            }))}
          />
        </>
      )}
    </CusCardbox>
  );
}
