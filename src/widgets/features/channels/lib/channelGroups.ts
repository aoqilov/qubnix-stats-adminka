import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import type { ChannelId } from "@/types/domain";

/** 7 ta kanal grafik uchun ko'p (rang chegarasi — 3) — grafikda 3 guruhga yig'iladi, jadvalda hammasi. */
export type ChannelGroup = "paid" | "organic" | "invite";

export const CHANNEL_GROUPS: readonly ChannelGroup[] = ["paid", "organic", "invite"];

export const CHANNEL_GROUP: Record<ChannelId, ChannelGroup> = {
  instagram: "paid",
  telegram_ads: "paid",
  telegram_channels: "paid",
  google: "paid",
  organic: "organic",
  referral: "organic",
  invite: "invite",
};

/** Rang guruhga bog'langan, tartibga emas. */
export const GROUP_COLORS: Record<ChannelGroup, string> = {
  paid: SERIES_COLORS[0],
  organic: SERIES_COLORS[1],
  invite: SERIES_COLORS[2],
};
