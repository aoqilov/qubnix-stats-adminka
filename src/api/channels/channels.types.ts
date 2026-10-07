import type { Granularity, KpiValue } from "@/types/analytics";
import type { ChannelId } from "@/types/domain";

/** Kanal yoki kampaniya bo'yicha davrdagi natija. Ta'riflar: utils/metrics.ts. */
export interface AcquisitionStats {
  /** Bot start'lar. */
  leads: number;
  signups: number;
  /** 0..1 — signups / leads. */
  reg_rate: number | null;
  /** 7 kun ichida birinchi vazifani yaratganlar. */
  activated: number;
  activation_rate: number | null;
  /** Davrda birinchi marta to'lagan kompaniyalar (egasi shu manbadan kelgan). */
  paying: number;
  /** Davrdagi daromad — egasi shu manbadan kelgan kompaniyalardan. */
  revenue: number;
  spend: number;
  cac: number | null;
  romi: number | null;
}

export interface ChannelStats extends AcquisitionStats {
  channel: ChannelId;
}

export interface CampaignStats extends AcquisitionStats {
  /** UTM / bot start parametri. */
  id: string;
  channel: ChannelId;
  starts_at: string;
  /** null — doimiy kampaniya. */
  ends_at: string | null;
  /** Bugun faolmi. */
  active: boolean;
}

/** GET /api/v1/admin/analytics/channels */
export interface ChannelsSummaryResponse {
  totals: {
    leads: KpiValue;
    signups: KpiValue;
    paying: KpiValue;
    revenue: KpiValue;
    spend: KpiValue;
    /** Pullik kanallar xarajati / barcha yangi pullik kompaniyalar (blended CAC). */
    cac: KpiValue;
    /** Pullik kanallar bo'yicha. */
    romi: KpiValue;
  };
  channels: ChannelStats[];
  campaigns: CampaignStats[];
  granularity: Granularity;
  /** Ro'yxatdan o'tishlar kanal bo'yicha. */
  series: ({ date: string } & Record<ChannelId, number>)[];
}
