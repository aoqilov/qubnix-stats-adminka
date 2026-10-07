import { useTranslation } from "react-i18next";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { PeriodCaption } from "@/components/shared/period-caption/PeriodCaption";
import { SectionPlaceholder } from "@/components/shared/section-placeholder/SectionPlaceholder";

export default function FeatureFeatureUsage() {
  const { t } = useTranslation();

  return (
    <>
      <CusPageTitle title={t("sections.featureUsage.title")} subtitle={<PeriodCaption />} className="mb-6" />
      <SectionPlaceholder phase={5} items={t("sections.featureUsage.planned", { returnObjects: true })} />
    </>
  );
}
