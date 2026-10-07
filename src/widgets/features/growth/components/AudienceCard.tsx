import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { BarList } from "@/components/shared/charts/BarList";
import { useFormatters } from "@/utils/format";
import type { GrowthSummaryResponse } from "@/api/growth/growth.types";

/** Davrdagi yangi foydalanuvchilar: platforma va interfeys tili bo'yicha (bitta seriya — bitta rang). */
export function AudienceCard({ data }: { data: GrowthSummaryResponse }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  return (
    <CusCardbox className="flex flex-col gap-5 rounded-card p-5">
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-primary">{t("sections.growth.platforms.title")}</h2>
        <BarList
          items={data.platforms.map((item) => ({
            key: item.platform,
            label: t(`domain.platform.${item.platform}`),
            value: item.users,
            display: fmt.number(item.users),
            note: fmt.percent(item.share),
          }))}
        />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-primary">{t("sections.growth.languages.title")}</h2>
        <BarList
          items={data.languages.map((item) => ({
            key: item.language,
            label: t(`domain.language.${item.language}`),
            value: item.users,
            display: fmt.number(item.users),
            note: fmt.percent(item.share),
          }))}
        />
      </section>
    </CusCardbox>
  );
}
