import { useTranslation } from "react-i18next";
import { useState } from "react";
import type React from "react";
import { LuLogIn, LuUser } from "react-icons/lu";
import { CusButton } from "@/components/ui/buttons/CusButton";
import { CusInput } from "@/components/ui/inputs/CusInput";
import { CusPasswordInput } from "@/components/ui/inputs/CusPasswordInput";
import { getApiErrorMessage, getApiErrorStatus } from "@/utils/apiErrorMessage";
import { useLogin } from "../hooks/useApiLogin";

export function LoginForm() {
  const { t } = useTranslation();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextLoginError = login.trim() ? null : t("auth.login.required");
    const nextPasswordError = password ? null : t("auth.password.required");
    setLoginError(nextLoginError);
    setPasswordError(nextPasswordError);
    if (nextLoginError || nextPasswordError) return;

    loginMutation.mutate(
      { login, password },
      {
        onError: (error) => {
          setPasswordError(
            getApiErrorStatus(error) === 401 ? t("auth.invalidCredentials") : getApiErrorMessage(error),
          );
          setPassword("");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <CusInput
        label={t("auth.login.label")}
        placeholder={t("auth.login.placeholder")}
        autoComplete="username"
        autoFocus
        inputSize="lg"
        value={login}
        onChange={(e) => {
          setLogin(e.target.value);
          setLoginError(null);
        }}
        errorText={loginError ?? undefined}
        leftElement={<LuUser size={16} />}
        leftElementWidth="2.5rem"
      />

      <CusPasswordInput
        label={t("auth.password.label")}
        placeholder={t("auth.password.placeholder")}
        inputSize="lg"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setPasswordError(null);
        }}
        errorText={passwordError ?? undefined}
      />

      <CusButton
        type="submit"
        size="xl"
        isLoading={loginMutation.isPending}
        loadingText={t("auth.submitting")}
        rightIcon={<LuLogIn size={18} />}
        style={{ background: "var(--brand-default)", color: "var(--text-on-brand)" }}
      >
        {t("auth.submit")}
      </CusButton>
    </form>
  );
}
