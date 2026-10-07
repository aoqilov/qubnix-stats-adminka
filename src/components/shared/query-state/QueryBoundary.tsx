import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { LuCircleAlert, LuRotateCw } from "react-icons/lu";
import type { UseQueryResult } from "@tanstack/react-query";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusButton } from "@/components/ui/buttons/CusButton";
import { CusLoader } from "@/components/ui/loader/CusLoader";

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}

/**
 * So'rov holatlari bir xil ko'rinishda: birinchi yuklash — spinner, xato — qayta urinish,
 * davr almashganda — oldingi ma'lumot xiralashib turadi (sakrash va skeleton yo'q).
 */
export function QueryBoundary<T>({ query, children }: QueryBoundaryProps<T>) {
  const { t } = useTranslation();

  if (query.data === undefined) {
    if (query.isError) {
      return (
        <CusCardbox className="flex flex-col items-center gap-3 rounded-card p-8 text-center">
          <LuCircleAlert size={24} className="text-error-strong" />
          <div>
            <p className="font-semibold text-primary">{t("common.states.loadError")}</p>
            <p className="text-sm text-secondary">{t("common.states.loadErrorHint")}</p>
          </div>
          <CusButton variant="outline" size="sm" leftIcon={<LuRotateCw size={14} />} onClick={() => void query.refetch()}>
            {t("common.actions.retry")}
          </CusButton>
        </CusCardbox>
      );
    }
    return <CusLoader label={t("common.states.loading")} />;
  }

  return (
    <div
      className="transition-opacity duration-200"
      style={{ opacity: query.isPlaceholderData ? 0.55 : 1 }}
      aria-busy={query.isFetching}
    >
      {children(query.data)}
    </div>
  );
}
