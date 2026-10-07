import { mockDelay } from "@/api-config/mock";
import { getMockDb } from "@/mocks/db";
import { dateOf } from "@/mocks/calendar";
import {
  activeUsersBetween,
  avgDau,
  bucketIndexer,
  buildBuckets,
  kpi,
  orgsCreatedIn,
  resolveQuery,
  usersCreatedIn,
} from "@/mocks/queries";
import { ratio } from "@/utils/metrics";
import type { PeriodQuery } from "@/types/analytics";
import { PLATFORMS, UI_LANGUAGES } from "@/types/domain";
import type { GrowthSummaryResponse } from "./growth.types";

export const growthMock = {
  async summary(params: PeriodQuery): Promise<GrowthSummaryResponse> {
    await mockDelay();
    const db = getMockDb();
    const query = resolveQuery(params, db.today);
    const newUsers = usersCreatedIn(db, query.current);

    const buckets = buildBuckets(query.current, query.granularity);
    const indexOf = bucketIndexer(buckets);
    const signups = buckets.map((bucket) => ({
      date: dateOf(bucket.start),
      telegram: 0,
      web: 0,
      pwa: 0,
      total: 0,
      invited: 0,
    }));
    for (const user of newUsers) {
      const point = signups[indexOf(user.createdDay)];
      point[user.platform] += 1;
      point.total += 1;
      if (user.channel === "invite") point.invited += 1;
    }

    return {
      kpis: {
        new_users: kpi((r) => usersCreatedIn(db, r).length, query),
        new_orgs: kpi((r) => orgsCreatedIn(db, r).length, query),
        invited_share: kpi((r) => {
          const users = usersCreatedIn(db, r);
          return ratio(users.filter((user) => user.channel === "invite").length, users.length);
        }, query),
        dau: kpi((r) => avgDau(db, r), query),
        wau: kpi((r) => activeUsersBetween(db, r.to - 6, r.to), query),
        mau: kpi((r) => activeUsersBetween(db, r.to - 29, r.to), query),
        stickiness: kpi(
          (r) => ratio(avgDau(db, { from: r.to - 29, to: r.to }), activeUsersBetween(db, r.to - 29, r.to)),
          query,
        ),
      },
      granularity: query.granularity,
      signups_series: signups,
      active_series: buckets.map((bucket) => ({
        date: dateOf(bucket.start),
        dau: avgDau(db, { from: bucket.start, to: bucket.end }),
      })),
      platforms: PLATFORMS.map((platform) => {
        const users = newUsers.filter((user) => user.platform === platform).length;
        return { platform, users, share: ratio(users, newUsers.length) ?? 0 };
      }),
      languages: UI_LANGUAGES.map((language) => {
        const users = newUsers.filter((user) => user.language === language).length;
        return { language, users, share: ratio(users, newUsers.length) ?? 0 };
      }),
    };
  },
};
