import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusSegment } from "@/components/ui/segment/CusSegment";
import { CusTable } from "@/components/ui/table/CusTable";
import { CusBadge } from "@/components/ui/badge/CusBadge";
import { useFormatters } from "@/utils/format";
import type { ChannelsSummaryResponse } from "@/api/channels/channels.types";
import { RomiValue } from "./RomiValue";

type CampaignFilter = "all" | "active";

/** Kampaniyalar (UTM / bot start parametri) — davrdagi natija, xarajat bo'yicha saralangan. */
export function CampaignsTable({ campaigns }: { campaigns: ChannelsSummaryResponse["campaigns"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const [filter, setFilter] = useState<CampaignFilter>("all");
  const rows = campaigns
    .filter((item) => filter === "all" || item.active)
    .sort((a, b) => b.spend - a.spend)
    .map((item, index) => ({ ...item, key: item.id, id: index }));
  const money = (value: number | null) => (value === null || value === 0 ? "—" : fmt.moneyCompact(value));

  return (
    <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-primary">{t("sections.channels.campaigns.title")}</h2>
          <p className="mt-0.5 text-xs text-secondary">{t("sections.channels.campaigns.subtitle")}</p>
        </div>
        <CusSegment
          items={[
            { id: "all", label: t("sections.channels.campaigns.all") },
            { id: "active", label: t("sections.channels.campaigns.active") },
          ]}
          value={filter}
          onValueChange={(value) => setFilter(value as CampaignFilter)}
          size="xs"
          layout="inline"
          accent="var(--brand-default)"
        />
      </div>
      <CusTable
        size="sm"
        data={rows}
        columns={[
          {
            key: "key",
            header: t("sections.channels.campaigns.campaign"),
            render: (row) => (
              <div className="flex flex-col">
                <span className="font-mono text-xs font-medium text-primary">{row.key}</span>
                <span className="text-xs text-secondary">{t(`domain.channel.${row.channel}`)}</span>
              </div>
            ),
          },
          {
            key: "starts_at",
            header: t("sections.channels.campaigns.period"),
            render: (row) => (
              <span className="whitespace-nowrap text-xs">
                {row.ends_at
                  ? `${fmt.date(row.starts_at)} – ${fmt.date(row.ends_at)}`
                  : t("sections.channels.campaigns.always", { from: fmt.date(row.starts_at) })}
              </span>
            ),
          },
          {
            key: "active",
            header: "",
            render: (row) => (
              <CusBadge tone={row.active ? "success" : "neutral"} dot>
                {row.active ? t("sections.channels.campaigns.statusActive") : t("sections.channels.campaigns.statusFinished")}
              </CusBadge>
            ),
          },
          {
            key: "signups",
            header: t("sections.channels.table.signups"),
            align: "right",
            render: (row) => fmt.number(row.signups),
          },
          { key: "paying", header: t("sections.channels.table.paying"), align: "right", render: (row) => fmt.number(row.paying) },
          { key: "spend", header: t("sections.channels.table.spend"), align: "right", render: (row) => money(row.spend) },
          { key: "cac", header: t("sections.channels.table.cac"), align: "right", render: (row) => money(row.cac) },
          { key: "romi", header: t("sections.channels.table.romi"), align: "right", render: (row) => <RomiValue value={row.romi} /> },
        ]}
      />
    </CusCardbox>
  );
}
