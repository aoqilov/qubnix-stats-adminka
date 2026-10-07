import { Switch, Field } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";
import type React from "react";

// ─── CusSwitch ────────────────────────────────────────────────────────────────

interface CusSwitchProps {
  label?: ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  isRequired?: boolean;
  errorText?: string;
  size?: "xs" | "sm" | "md" | "lg";
  // Direct controlled
  onCheckedChange?: (checked: boolean) => void;
  // react-hook-form
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export const CusSwitch = forwardRef<HTMLInputElement, CusSwitchProps>(
  function CusSwitch(
    {
      label,
      description,
      checked,
      defaultChecked,
      disabled,
      readOnly,
      isRequired,
      errorText,
      size = "md",
      onCheckedChange,
      name,
      value,
      onChange,
      onBlur,
    },
    ref
  ) {
    return (
      <Field.Root
        invalid={!!errorText}
        required={isRequired}
        disabled={disabled}
        readOnly={readOnly}
      >
        <Switch.Root
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          readOnly={readOnly}
          name={name}
          value={value}
          size={size}
          onCheckedChange={({ checked }) => onCheckedChange?.(checked)}
          display="flex"
          alignItems="flex-start"
          gap="2.5"
        >
          <Switch.HiddenInput ref={ref} onChange={onChange} onBlur={onBlur} />

          <Switch.Control
            mt="0.5"
            bg="var(--border-2)"
            _checked={{ bg: "var(--brand-default)" }}
            _focusVisible={{ boxShadow: "0 0 0 3px color-mix(in srgb, var(--brand-default) 19%, transparent)" }}
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
            _invalid={{ bg: "var(--color-red-soft)", outlineColor: "var(--color-red)", outlineWidth: "1px", outlineStyle: "solid" }}
          >
            <Switch.Thumb
              bg="var(--text-on-accent)"
              boxShadow="var(--shadow-sm)"
            />
          </Switch.Control>

          {(label || description) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {label && (
                <Switch.Label
                  style={{
                    color: "var(--text-2)",
                    cursor: disabled ? "not-allowed" : "pointer",
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                  {isRequired && (
                    <span style={{ color: "var(--color-red)", marginLeft: 3 }}>*</span>
                  )}
                </Switch.Label>
              )}
              {description && (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    lineHeight: 1.4,
                  }}
                >
                  {description}
                </span>
              )}
            </div>
          )}
        </Switch.Root>

        {errorText && (
          <Field.ErrorText fontSize="xs" color="var(--color-red)" mt="1">
            {errorText}
          </Field.ErrorText>
        )}
      </Field.Root>
    );
  }
);


// ─── Ishlatish ────────────────────────────────────────────────────────────────

// ✅ Standalone controlled
// const [on, setOn] = useState(false)
// <CusSwitch
//   label="Email xabarnomalar"
//   checked={on}
//   onCheckedChange={setOn}
// />

// ✅ Description + required
// <CusSwitch
//   label="Push xabarnomalar"
//   description="Yangi buyurtmalar kelganda bildirishnoma yuboriladi"
//   isRequired
// />

// ✅ Error holati
// <CusSwitch
//   label="Shartlarga roziman"
//   errorText="Davom etish uchun roziliğingizni bildiring"
// />

// ✅ Hajmlar: xs | sm | md (default) | lg
// <CusSwitch size="lg" label="Katta switch" />

// ✅ react-hook-form
// const { register, formState: { errors } } = useForm()
// <CusSwitch
//   label="Faol holat"
//   isRequired
//   errorText={errors.active?.message}
//   {...register("active")}
// />
