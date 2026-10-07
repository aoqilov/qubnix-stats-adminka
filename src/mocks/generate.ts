import type { ChannelId, PaidPlanId, PeriodKind, Platform } from "@/types/domain";
import { MOCK_CONFIG as C } from "./config";
import {
  CAMPAIGNS,
  CHANNEL_PROFILES,
  DIRECT_CHANNELS,
  PWA_LAUNCH_DAY,
  WEB_LAUNCH_DAY,
  isCampaignActive,
  priceOf,
} from "./catalog";
import { Rng, seedOf } from "./random";
import { weekOf, weekdayOf } from "./calendar";
import { FIRST_NAMES, LAST_NAMES, companyName } from "./names";
import { isActiveWeek } from "./activity";
import type { MockLeadCount, MockOrg, MockPayment, MockPeriod, MockUser } from "./types";

export interface GeneratedData {
  users: MockUser[];
  orgs: MockOrg[];
  payments: MockPayment[];
  leads: MockLeadCount[];
}

// Har bir obyekt turi uchun seed "tuzi" — bir xil kalitli turli obyektlar oqimi aralashmasin.
const SALT = { day: 1, user: 3, org: 5, member: 7 } as const;

/** Bevosita foydalanuvchi kaliti: kun × 1000 + kun ichidagi tartib. Taklif qilingan xodim: alohida diapazon. */
const MEMBER_KEY_BASE = 10_000_000;

const ACTIVATION_DELAYS = [
  [0, 0.5],
  [1, 0.22],
  [2, 0.12],
  [3, 0.08],
  [5, 0.05],
  [6, 0.03],
] as const;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function platformWeights(day: number): readonly (readonly [Platform, number])[] {
  if (day >= PWA_LAUNCH_DAY) return C.platform.afterPwa;
  if (day >= WEB_LAUNCH_DAY) return C.platform.afterWeb;
  return C.platform.beforeWeb;
}

function payProbabilityBySize(size: number): number {
  return C.org.payBySize.find(([maxSize]) => size <= maxSize)![1];
}

/** Kanalning shu kundagi manbalari: kampaniyasiz kanal — bitta manba; pullik kanal — faol kampaniyalar. */
function sourcesFor(channel: ChannelId, day: number): { campaignId: string | null; weight: number }[] {
  const campaigns = CAMPAIGNS.filter((item) => item.channel === channel);
  if (campaigns.length === 0) return [{ campaignId: null, weight: 1 }];
  return campaigns
    .filter((item) => isCampaignActive(item, day))
    .map((item) => ({ campaignId: item.id, weight: item.boost }));
}

/**
 * Butun tarixni ishga tushgan kundan bugungacha kunma-kun yaratadi. Har bir obyekt o'z kalitidan
 * seed oladi, tasodifiy qarorlar avval to'liq olinadi, keyin "bugun"ga qarab kesiladi — shuning
 * uchun ertaga faqat yangi yozuvlar qo'shiladi, o'tmish o'zgarmaydi.
 */
export function generate(today: number): GeneratedData {
  const users: MockUser[] = [];
  const orgs: MockOrg[] = [];
  const payments: MockPayment[] = [];
  const leads: MockLeadCount[] = [];
  const usedNames = new Set<string>();
  const growthRate = Math.log(C.signups.growthFactor) / C.signups.growthHorizonDays;
  // Bugungi to'lovlar hozirgi vaqtdan keyin yozilmasin (faqat vaqt, tasodifiy qarorlar o'zgarmaydi).
  const now = new Date();
  const nowMinute = now.getHours() * 60 + now.getMinutes();

  function createUser(
    key: number,
    day: number,
    channel: ChannelId,
    campaignId: string | null,
    rng: Rng,
    stickiness: number,
    willActivate: boolean,
    activationDelay: number,
  ): MockUser {
    const user: MockUser = {
      key,
      index: users.length,
      firstName: rng.pick(FIRST_NAMES),
      lastName: rng.pick(LAST_NAMES),
      createdDay: day,
      channel,
      campaignId,
      platform: rng.weighted(platformWeights(day)),
      language: rng.weighted(C.language),
      stickiness,
      activationDay: willActivate ? day + activationDelay : null,
      quitWeek: weekOf(day) + Math.round(rng.expo(6 + 70 * stickiness)),
      daysPerWeek: Math.min(6, 1 + Math.floor(rng.float() * (1 + 4.5 * stickiness))),
      orgId: null,
      isOwner: false,
    };
    users.push(user);
    return user;
  }

  function addMember(org: MockOrg, owner: MockUser, slot: number, joinDay: number): void {
    const key = MEMBER_KEY_BASE + owner.key * 100 + slot;
    const rng = new Rng(seedOf(key, SALT.member));
    const stickiness = clamp01(owner.stickiness * 0.5 + rng.float() * 0.5);
    const willActivate = rng.chance(CHANNEL_PROFILES.invite.activation);
    const activationDelay = rng.int(0, 2);
    const extraLead = rng.chance(1 / CHANNEL_PROFILES.invite.regRate - 1);
    const member = createUser(key, joinDay, "invite", null, rng, stickiness, willActivate, activationDelay);
    member.orgId = org.id;
    org.memberIndexes.push(member.index);
    leads.push({ day: joinDay, channel: "invite", campaignId: null, leads: extraLead ? 2 : 1 });
  }

  function buildOrg(owner: MockUser, orgDelay: number): void {
    const rng = new Rng(seedOf(owner.key, SALT.org));
    // Nom birinchi — kelajakdagi kompaniyalar ham nom "band qiladi", tartib bugunga bog'liq emas.
    const name = companyName(() => rng.float(), usedNames);
    const createdDay = owner.createdDay + orgDelay;
    if (createdDay > today) return;

    // ─── Barcha qarorlar oldindan, qat'iy tartibda ───────────────────────────
    const [minSize, maxSize] = rng.weighted<readonly [number, number]>(C.org.sizes);
    const wantedMembers = rng.int(minSize, maxSize);
    const payScore =
      payProbabilityBySize(wantedMembers) * (0.5 + owner.stickiness) * CHANNEL_PROFILES[owner.channel].payMult;
    const payIntent = rng.chance(Math.min(0.95, payScore));
    const firstPayDelay = rng.int(5, 45);
    const billing = rng.chance(C.org.yearlyShare) ? "yearly" : "monthly";
    const projectsRoll = rng.float();
    const routinesOn = rng.chance(0.55);
    const routinesRoll = rng.float();
    const taskRate = 2 + rng.float() * 8;
    const hasFirstProject = rng.chance(C.org.firstProjectChance);
    const firstProjectDelay = rng.int(0, 2);
    const abandon = rng.chance(C.subscription.abandonedCheckout);
    const abandonDelay = rng.int(1, 60);
    const abandonMinute = rng.int(9 * 60, 22 * 60);
    const abandonProvider = rng.chance(C.subscription.paymeShare) ? "payme" : "click";
    const joinOffsets = Array.from(
      { length: wantedMembers - 1 },
      () => 1 + Math.round(rng.expo(C.org.memberJoinMeanDays)),
    );

    const initialPlan: PaidPlanId = wantedMembers > 10 ? "business" : "pro";
    const firstPayDay = payIntent ? createdDay + firstPayDelay : null;

    const org: MockOrg = {
      id: owner.key,
      name,
      ownerIndex: owner.index,
      createdDay,
      channel: owner.channel,
      campaignId: owner.campaignId,
      memberIndexes: [owner.index],
      wantedMembers,
      wantedProjects: 1 + Math.floor(projectsRoll * projectsRoll * Math.min(12, wantedMembers * 1.5)),
      wantedRoutines: routinesOn ? Math.floor(routinesRoll * routinesRoll * (wantedMembers <= 2 ? 6 : 40)) : 0,
      taskRate,
      firstProjectDay: hasFirstProject ? createdDay + firstProjectDelay : null,
      invitedDay: null,
      firstPaidDay: null,
      periods: [],
    };
    owner.orgId = org.id;
    owner.isOwner = true;
    orgs.push(org);

    // ─── Xodimlar: bepul tarifda 2 kishidan oshmaydi, 3-xodim to'lovdan keyin keladi ──
    const memberCount = payIntent ? wantedMembers : Math.min(wantedMembers, 2);
    const joinDays: number[] = [];
    for (let slot = 1; slot < memberCount; slot += 1) {
      const offset = joinOffsets[slot - 1];
      let joinDay = createdDay + offset;
      if (slot >= 2 && firstPayDay !== null) joinDay = Math.max(joinDay, firstPayDay + (offset % 5));
      joinDays.push(joinDay);
    }
    if (joinDays.length > 0) org.invitedDay = Math.max(createdDay, Math.min(...joinDays) - 1);
    joinDays.forEach((joinDay, i) => {
      if (joinDay <= today) addMember(org, owner, i + 1, joinDay);
    });

    // ─── To'lovlar ───────────────────────────────────────────────────────────
    let paymentSeq = 0;
    const addPayment = (payment: Omit<MockPayment, "id" | "orgId">) => {
      paymentSeq += 1;
      // Bugungi to'lovlar kun boshidan hozirgacha proporsional siqiladi (tartib saqlanadi, bir daqiqaga yig'ilmaydi).
      const minute = payment.day === today ? Math.floor((payment.minute * nowMinute) / (24 * 60)) : payment.minute;
      payments.push({ id: org.id * 1000 + paymentSeq, orgId: org.id, ...payment, minute });
    };

    const abandonDay = createdDay + abandonDelay;
    if (abandon && abandonDay <= today && (firstPayDay === null || abandonDay < firstPayDay)) {
      addPayment({
        plan: initialPlan,
        billing,
        amount: priceOf(initialPlan, billing),
        provider: abandonProvider,
        status: "cancelled",
        day: abandonDay,
        minute: abandonMinute,
        kind: null,
      });
    }

    if (firstPayDay === null || firstPayDay > today) return;

    const members = () => org.memberIndexes.map((index) => users[index]);
    let plan = initialPlan;
    let bill: "monthly" | "yearly" = billing;
    let start = firstPayDay;
    let kind: PeriodKind = "new";

    for (;;) {
      const end = start + (bill === "monthly" ? 30 : 365);
      const period: MockPeriod = { plan, billing: bill, startDay: start, endDay: end, kind };
      org.periods.push(period);

      const provider = rng.chance(C.subscription.paymeShare) ? "payme" : "click";
      const failedFirst = rng.chance(C.subscription.failedFirstAttempt);
      const minute = rng.int(8 * 60, 23 * 60);
      const pendingRoll = rng.float();
      const amount = priceOf(plan, bill);
      if (failedFirst) {
        addPayment({
          plan,
          billing: bill,
          amount,
          provider,
          status: "failed",
          day: start,
          minute: Math.max(0, minute - 20 - Math.floor(pendingRoll * 90)),
          kind,
        });
      }
      addPayment({
        plan,
        billing: bill,
        amount,
        provider,
        // Bugun boshlangan to'lovning yarmi hali tasdiqlanmagan.
        status: start === today && pendingRoll < 0.5 ? "pending" : "paid",
        day: start,
        minute,
        kind,
      });

      if (end > today) break;

      // Yangilash: obuna tugashidan oldingi haftada kimdir faol bo'lganmi. Faqat `end`dan oldin
      // qo'shilganlar — keyin qo'shilgan xodim o'tgan qarorni o'zgartirmasin.
      const lastWeek = weekOf(end - 1);
      const active = members().some((user) => user.createdDay < end && isActiveWeek(user, lastWeek));
      const renewChance =
        bill === "monthly"
          ? active
            ? C.subscription.renewMonthlyActive
            : C.subscription.renewMonthlyInactive
          : active
            ? C.subscription.renewYearlyActive
            : C.subscription.renewYearlyInactive;
      const renewRoll = rng.float();
      const changeRoll = rng.float();
      const switchRoll = rng.float();
      if (renewRoll >= renewChance) break;

      if (plan === "pro" && changeRoll < C.subscription.upgradeAtRenewal) {
        plan = "business";
        kind = "upgrade";
      } else if (plan === "business" && changeRoll < C.subscription.downgradeAtRenewal) {
        plan = "pro";
        kind = "downgrade";
      } else {
        kind = "renewal";
      }
      if (bill === "monthly" && switchRoll < C.subscription.switchToYearly) bill = "yearly";
      start = end;
    }

    org.firstPaidDay = org.periods[0]?.startDay ?? null;
  }

  // ─── Kunlik sikl: bot start'lar va bevosita ro'yxatdan o'tishlar ────────────
  for (let day = 0; day <= today; day += 1) {
    const rng = new Rng(seedOf(day, SALT.day));
    const base =
      C.signups.startPerDay *
      Math.exp(growthRate * day) *
      C.signups.weekday[weekdayOf(day)] *
      rng.noise(C.signups.dailyNoise);
    let seq = 0;

    for (const channel of DIRECT_CHANNELS) {
      const profile = CHANNEL_PROFILES[channel];
      for (const source of sourcesFor(channel, day)) {
        const expected = base * profile.share * source.weight;
        const registered = rng.poisson(expected);
        const notRegistered = rng.poisson(expected * (1 / profile.regRate - 1));
        if (registered + notRegistered > 0) {
          leads.push({ day, channel, campaignId: source.campaignId, leads: registered + notRegistered });
        }

        for (let n = 0; n < registered; n += 1) {
          seq += 1;
          const key = day * 1000 + seq;
          const userRng = new Rng(seedOf(key, SALT.user));
          const stickiness = clamp01((userRng.float() + userRng.float() + userRng.float()) / 3 + profile.stickShift);
          const willActivate = userRng.chance(profile.activation);
          const activationDelay = userRng.weighted(ACTIVATION_DELAYS);
          const createsOrg = userRng.chance(
            willActivate ? C.org.createIfActivated : C.org.createIfNotActivated,
          );
          const orgDelay = userRng.int(0, 12);
          const user = createUser(key, day, channel, source.campaignId, userRng, stickiness, willActivate, activationDelay);
          if (createsOrg) buildOrg(user, orgDelay);
        }
      }
    }
  }

  payments.sort((a, b) => a.day - b.day || a.minute - b.minute || a.id - b.id);
  return { users, orgs, payments, leads };
}
