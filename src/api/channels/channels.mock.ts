import { mockDelay } from "@/api-config/mock";
import { getMockDb, type MockDb } from "@/mocks/db";
import { CAMPAIGNS, campaignSpend, isCampaignActive } from "@/mocks/catalog";
import { dateOf } from "@/mocks/calendar";
import {
  bucketIndexer,
  buildBuckets,
  firstPaidIn,
  inRange,
  kpi,
  resolveQuery,
  revenueIn,
  usersCreatedIn,
  type DayRange,
} from "@/mocks/queries";
import type { MockOrg, MockUser } from "@/mocks/types";
import { ACTIVATION_WINDOW_DAYS, cac, ratio, romi } from "@/utils/metrics";
import type { PeriodQuery } from "@/types/analytics";
import { CHANNEL_IDS, type ChannelId } from "@/types/domain";
import type { AcquisitionStats, ChannelsSummaryResponse } from "./channels.types";

interface SourceFilter {
  user: (user: MockUser) => boolean;
  org: (org: MockOrg) => boolean;
  lead: (channel: ChannelId, campaignId: string | null) => boolean;
  spend: (range: DayRange) => number;
}

function isActivated(db: MockDb, user: MockUser): boolean {
  return (
    user.activationDay !== null &&
    user.activationDay <= db.today &&
    user.activationDay - user.createdDay < ACTIVATION_WINDOW_DAYS
  );
}

function stats(db: MockDb, range: DayRange, source: SourceFilter): AcquisitionStats {
  const leads = db.leads
    .filter((lead) => inRange(lead.day, range) && source.lead(lead.channel, lead.campaignId))
    .reduce((sum, lead) => sum + lead.leads, 0);
  const signups = usersCreatedIn(db, range).filter(source.user);
  const activated = signups.filter((user) => isActivated(db, user)).length;
  const paying = firstPaidIn(db, range).filter(source.org).length;
  const revenue = revenueIn(db, range, source.org);
  const spend = source.spend(range);
  return {
    leads,
    signups: signups.length,
    reg_rate: ratio(signups.length, leads),
    activated,
    activation_rate: ratio(activated, signups.length),
    paying,
    revenue,
    spend,
    cac: cac(spend, paying),
    romi: romi(revenue, spend),
  };
}

function channelSource(channel: ChannelId): SourceFilter {
  const campaigns = CAMPAIGNS.filter((item) => item.channel === channel);
  return {
    user: (user) => user.channel === channel,
    org: (org) => org.channel === channel,
    lead: (leadChannel) => leadChannel === channel,
    spend: (range) => campaigns.reduce((sum, item) => sum + campaignSpend(item, range.from, range.to), 0),
  };
}

const PAID_CHANNELS = new Set(CAMPAIGNS.map((item) => item.channel));

const paidSource: SourceFilter = {
  user: (user) => PAID_CHANNELS.has(user.channel),
  org: (org) => PAID_CHANNELS.has(org.channel),
  lead: (channel) => PAID_CHANNELS.has(channel),
  spend: (range) => CAMPAIGNS.reduce((sum, item) => sum + campaignSpend(item, range.from, range.to), 0),
};

const allSource: SourceFilter = {
  user: () => true,
  org: () => true,
  lead: () => true,
  spend: paidSource.spend,
};

export const channelsMock = {
  async summary(params: PeriodQuery): Promise<ChannelsSummaryResponse> {
    await mockDelay();
    const db = getMockDb();
    const query = resolveQuery(params, db.today);
    const { current } = query;

    const buckets = buildBuckets(current, query.granularity);
    const indexOf = bucketIndexer(buckets);
    const series = buckets.map((bucket) => ({
      date: dateOf(bucket.start),
      ...(Object.fromEntries(CHANNEL_IDS.map((channel) => [channel, 0])) as Record<ChannelId, number>),
    }));
    for (const user of usersCreatedIn(db, current)) series[indexOf(user.createdDay)][user.channel] += 1;

    return {
      totals: {
        leads: kpi((r) => stats(db, r, allSource).leads, query),
        signups: kpi((r) => stats(db, r, allSource).signups, query),
        paying: kpi((r) => stats(db, r, allSource).paying, query),
        revenue: kpi((r) => stats(db, r, allSource).revenue, query),
        spend: kpi((r) => paidSource.spend(r), query),
        cac: kpi((r) => cac(paidSource.spend(r), stats(db, r, allSource).paying), query),
        romi: kpi((r) => stats(db, r, paidSource).romi, query),
      },
      channels: CHANNEL_IDS.map((channel) => ({ channel, ...stats(db, current, channelSource(channel)) })),
      campaigns: CAMPAIGNS.map((item) => ({
        id: item.id,
        channel: item.channel,
        starts_at: dateOf(item.startDay),
        ends_at: item.endDay === null ? null : dateOf(item.endDay),
        active: isCampaignActive(item, db.today),
        ...stats(db, current, {
          user: (user) => user.campaignId === item.id,
          org: (org) => org.campaignId === item.id,
          lead: (_channel, campaignId) => campaignId === item.id,
          spend: (range) => campaignSpend(item, range.from, range.to),
        }),
      })),
      granularity: query.granularity,
      series,
    };
  },
};
