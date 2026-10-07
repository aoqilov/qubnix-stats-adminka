import { useTranslation } from "react-i18next";
import { CusBadge, type BadgeTone } from "@/components/ui/badge/CusBadge";
import type { OrgHealth, PaymentStatus } from "@/types/domain";

const HEALTH_TONE: Record<OrgHealth, BadgeTone> = {
  active: "success",
  cooling: "warning",
  at_risk: "error",
};

const PAYMENT_TONE: Record<PaymentStatus, BadgeTone> = {
  paid: "success",
  pending: "warning",
  failed: "error",
  cancelled: "neutral",
};

/** Holat ranglari faqat nom bilan birga — rang yolg'iz ma'no tashimaydi. */
export function HealthBadge({ health }: { health: OrgHealth }) {
  const { t } = useTranslation();
  return (
    <CusBadge tone={HEALTH_TONE[health]} dot>
      {t(`domain.health.${health}`)}
    </CusBadge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useTranslation();
  return (
    <CusBadge tone={PAYMENT_TONE[status]} dot>
      {t(`domain.paymentStatus.${status}`)}
    </CusBadge>
  );
}
