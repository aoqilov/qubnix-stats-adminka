import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { ColumnChart } from "@/components/shared/charts/ColumnChart";
import { useFormatters } from "@/utils/format";
import { CHANNEL_IDS } from "@/types/domain";
import type { ChannelsSummaryResponse } from "@/api/channels/channels.types";
import { CHANNEL_GROUP, CHANNEL_GROUPS, GROUP_COLORS, type ChannelGroup } from "../lib/channelGroups";

interface SourcesChartProps {
  data: ChannelsSummaryResponse;
  className?: string;
}

/** Ro'yxatdan o'tishlar 3 guruh bo'yicha ustma-ust: pullik, organika+referal, takliflar. */
export function SourcesChart({ data, className }: SourcesChartProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  const points = useMemo(
    () =>
      data.series.map((point) => {
        const groups: Record<ChannelGroup, number> = { paid: 0, organic: 0, invite: 0 };
        for (const channel of CHANNEL_IDS) groups[CHANNEL_GROUP[channel]] += point[channel];
        return { date: point.date, ...groups, total: groups.paid + groups.organic + groups.invite };
      }),
    [data.series],
  );
  const series = CHANNEL_GROUPS.map((group) => ({
    key: group,
    label: t(`sections.channels.groups.${group}`),
    color: GROUP_COLORS[group],
  }));
  const rows = points.map((point, index) => ({ id: index, ...point }));

  return (
    <ChartCard
      className={className}
      title={t("sections.channels.signups.title")}
      subtitle={t("sections.channels.signups.subtitle")}
      legend={series.map((item) => ({ label: item.label, color: item.color, shape: "rect" }))}
      table={{
        rows,
        columns: [
          { key: "date", header: t("charts.table.date"), render: (row) => fmt.bucketLabel(row.date, data.granularity) },
          ...CHANNEL_GROUPS.map((group) => ({
            key: group,
            header: t(`sections.channels.groups.${group}`),
            align: "right" as const,
            render: (row: (typeof rows)[number]) => fmt.number(row[group]),
          })),
          { key: "total", header: t("charts.table.total"), align: "right", render: (row) => fmt.number(row.total) },
        ],
      }}
    >
      <ColumnChart
        data={points}
        series={series}
        stacked
        integer
        granularity={data.granularity}
        formatValue={fmt.number}
        formatAxis={fmt.compact}
      />
    </ChartCard>
  );
}
