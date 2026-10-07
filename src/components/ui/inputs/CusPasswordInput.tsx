import { useTranslation } from "react-i18next";
import { forwardRef, useState } from "react";
import type React from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { CusInput } from "./CusInput";

type CusPasswordInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof CusInput>,
  "type" | "rightElement" | "clearable"
>;

/** `CusInput` + parolni ko'rsatish/yashirish tugmasi. Qolgan barcha prop'lar CusInput'niki. */
export const CusPasswordInput = forwardRef<HTMLInputElement, CusPasswordInputProps>(
  function CusPasswordInput(props, ref) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const toggleLabel = visible ? t("ui.passwordInput.hide") : t("ui.passwordInput.show");

    return (
      <CusInput
        ref={ref}
        autoComplete="current-password"
        {...props}
        type={visible ? "text" : "password"}
        rightElement={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={toggleLabel}
            title={toggleLabel}
            style={{ display: "flex", cursor: "pointer", color: "var(--text-secondary)" }}
          >
            {visible ? <LuEyeOff size={16} /> : <LuEye size={16} />}
          </button>
        }
      />
    );
  },
);

// Ishlatish:
// <CusPasswordInput label="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
