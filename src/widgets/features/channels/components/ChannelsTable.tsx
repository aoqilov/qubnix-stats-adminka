import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusTable } from "@/components/ui/table/CusTable";
import { useFormatters } from "@/utils/format";
import type { ChannelsSummaryResponse } from "@/api/channels/channels.types";
import { CHANNEL_GROUP, GROUP_COLORS } from "../lib/channelGroups";
import { RomiValue } from "./RomiValue";

/** Barcha 7 kanal — to'liq ko'rsatkichlar jadvalda (grafikda guruhlangan). */
export function ChannelsTable({ channels }: { channels: ChannelsSummaryResponse["channels"] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const rows = channels.map((item, index) => ({ id: index, ...item }));
  const share = (value: number | null) => (value === null ? "—" : fmt.percent(value));
  const money = (value: number | null) => (value === null || value === 0 ? "—" : fmt.moneyCompact(value));

  return (
    <CusCardbox className="flex flex-col gap-4 rounded-card p-5">
      <h2 className="font-semibold text-primary">{t("sections.channels.table.title")}</h2>
      <CusTable
        size="sm"
        data={rows}
        columns={[
          {
            key: "channel",
            header: t("sections.channels.table.channel"),
            render: (row) => (
              <span className="flex items-center gap-2 font-medium text-primary">
                <span
                  aria-hidden
                  className="size-2 flex-none rounded-sm"
                  style={{ background: GROUP_COLORS[CHANNEL_GROUP[row.channel]] }}
                />
                {t(`domain.channel.${row.channel}`)}
              </span>
            ),
          },
          { key: "leads", header: t("sections.channels.table.leads"), align: "right", render: (row) => fmt.number(row.leads) },
          {
            key: "signups",
            header: t("sections.channels.table.signups"),
            align: "right",
            render: (row) => fmt.number(row.signups),
          },
          {
            key: "reg_rate",
            header: t("sections.channels.table.regRate"),
            align: "right",
            render: (row) => share(row.reg_rate),
          },
          {
            key: "activation_rate",
            header: t("sections.channels.table.activation"),
            align: "right",
            render: (row) => share(row.activation_rate),
          },
          { key: "paying", header: t("sections.channels.table.paying"), align: "right", render: (row) => fmt.number(row.paying) },
          { key: "revenue", header: t("sections.channels.table.revenue"), align: "right", render: (row) => money(row.revenue) },
          { key: "spend", header: t("sections.channels.table.spend"), align: "right", render: (row) => money(row.spend) },
          { key: "cac", header: t("sections.channels.table.cac"), align: "right", render: (row) => money(row.cac) },
          { key: "romi", header: t("sections.channels.table.romi"), align: "right", render: (row) => <RomiValue value={row.romi} /> },
        ]}
      />
    </CusCardbox>
  );
}
