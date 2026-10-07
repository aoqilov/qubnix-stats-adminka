import { useTranslation } from "react-i18next";
import { MOCK_LOGIN_HINTS } from "@/api/auth/auth.mock";

/** Faqat mock rejimida — demo akkauntlar ro'yxati (FeatureLogin `USE_MOCK` bo'lsagina chizadi). */
export function MockAccountsHint() {
  const { t } = useTranslation();

  return (
    <div className="mt-5 rounded-card bg-surface-secondary p-3 text-sm text-secondary">
      <p className="mb-1.5 font-medium">{t("auth.mockHint")}</p>
      <ul className="flex flex-col gap-0.5 font-mono text-xs">
        {MOCK_LOGIN_HINTS.map(({ login, password }) => (
          <li key={login}>
            {login} / {password}
          </li>
        ))}
      </ul>
    </div>
  );
}
