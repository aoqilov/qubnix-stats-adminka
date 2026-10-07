import { Checkbox, Field } from "@chakra-ui/react";
import { createContext, useContext, forwardRef, type ReactNode } from "react";
import type React from "react";

// ─── Group Context ────────────────────────────────────────────────────────────

interface GroupCtx {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

const CheckboxGroupContext = createContext<GroupCtx | null>(null);

// ─── CusCheckbox ──────────────────────────────────────────────────────────────

interface CusCheckboxProps {
  label?: ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  isRequired?: boolean;
  errorText?: string;
  size?: "sm" | "md" | "lg";
  // Group ichida ishlash uchun value shart
  value?: string;
  // Standalone uchun
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
}

export const CusCheckbox = forwardRef<HTMLInputElement, CusCheckboxProps>(
  function CusCheckbox(
    {
      label,
      description,
      isRequired,
      errorText,
      checked,
      defaultChecked,
      indeterminate,
      disabled,
      size = "md",
      value,
      name,
      onChange,
      onBlur,
    },
    ref
  ) {
    const group = useContext(CheckboxGroupContext);

    // Group ichida bo'lsa — group state'dan o'qi
    const inGroup = !!group && value !== undefined;
    const resolvedChecked = inGroup
      ? group.value.includes(value!)
      : checked;
    const resolvedDisabled = disabled || (inGroup ? group.disabled : false);

    const isControlled = checked !== undefined;

    const handleGroupToggle = () => {
      if (!group || value === undefined) return;
      const next = group.value.includes(value)
        ? group.value.filter((v) => v !== value)
        : [...group.value, value];
      group.onChange(next);
    };

    const handleControlledChange = () => {
      if (onChange) {
        onChange({ target: { checked: !resolvedChecked } } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    return (
      <Field.Root
        invalid={!!errorText}
        required={isRequired}
        disabled={resolvedDisabled}
      >
        <Checkbox.Root
          checked={indeterminate ? "indeterminate" : resolvedChecked}
          defaultChecked={!inGroup ? defaultChecked : undefined}
          disabled={resolvedDisabled}
          name={name}
          value={value}
          size={size}
          onCheckedChange={
            inGroup
              ? handleGroupToggle
              : isControlled
                ? handleControlledChange
                : undefined
          }
        >
          <Checkbox.HiddenInput
            ref={ref}
            onChange={inGroup || isControlled ? undefined : onChange}
            onBlur={onBlur}
          />

          <Checkbox.Control
            borderColor="var(--border-input)"
            borderWidth="1.5px"
            borderRadius="5px"
            bg="var(--bg-input)"
            _hover={{ borderColor: "var(--color-blue)" }}
            _checked={{ bg: "var(--color-blue)", borderColor: "var(--color-blue)", color: "var(--text-on-accent)" }}
            _indeterminate={{ bg: "var(--color-blue)", borderColor: "var(--color-blue)", color: "var(--text-on-accent)" }}
            _focusVisible={{ boxShadow: "0 0 0 3px var(--focus-ring-blue)" }}
            _invalid={{ borderColor: "var(--color-red)" }}
            _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
          >
            <Checkbox.Indicator />
          </Checkbox.Control>

          {(label || description) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {label && (
                <Checkbox.Label
                  style={{
                    color: "var(--text-2)",
                    cursor: resolvedDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  {label}
                  {isRequired && (
                    <span style={{ color: "var(--color-red)", marginLeft: 3 }}>*</span>
                  )}
                </Checkbox.Label>
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
        </Checkbox.Root>

        {errorText && (
          <Field.ErrorText fontSize="xs" color="var(--color-red)" mt="1">
            {errorText}
          </Field.ErrorText>
        )}
      </Field.Root>
    );
  }
);

// ─── CusCheckboxGroup ─────────────────────────────────────────────────────────

interface CusCheckboxGroupProps {
  // Controlled
  value?: string[];
  onChange?: (value: string[]) => void;
  // UI
  label?: string;
  errorText?: string;
  isRequired?: boolean;
  disabled?: boolean;
  direction?: "row" | "column";
  gap?: number | string;
  children: ReactNode;
}

export function CusCheckboxGroup({
  value = [],
  onChange = () => {},
  label,
  errorText,
  isRequired,
  disabled,
  direction = "column",
  gap = 12,
  children,
}: CusCheckboxGroupProps) {
  return (
    <CheckboxGroupContext.Provider value={{ value, onChange, disabled }}>
      <Field.Root invalid={!!errorText} required={isRequired}>
        {label && (
          <Field.Label
            fontSize="sm"
            fontWeight="medium"
            color="var(--text-3)"
            mb="2"
          >
            {label}
            <Field.RequiredIndicator color="var(--color-red)" ml="0.5" />
          </Field.Label>
        )}

        <div style={{ display: "flex", flexDirection: direction, gap, flexWrap: "wrap" }}>
          {children}
        </div>

        {errorText && (
          <Field.ErrorText fontSize="xs" color="var(--color-red)" mt="1">
            {errorText}
          </Field.ErrorText>
        )}
      </Field.Root>
    </CheckboxGroupContext.Provider>
  );
}


// ─── Ishlatish ────────────────────────────────────────────────────────────────

// ✅ Standalone — o'z state'i bilan
// const [checked, setChecked] = useState(false)
// <CusCheckbox
//   label="Shartlarga roziman"
//   checked={checked}
//   onChange={e => setChecked(e.target.checked)}
// />

// ✅ Group — bitta state massiv bilan boshqariladi
// const [selected, setSelected] = useState<string[]>([])
//
// <CusCheckboxGroup value={selected} onChange={setSelected} label="Kategoriyalar">
//   <CusCheckbox label="Ekstremal" value="thrill" />
//   <CusCheckbox label="Oilaviy"   value="family" />
//   <CusCheckbox label="Bolalar"   value="kids"   />
// </CusCheckboxGroup>
//
// console.log(selected) // ['thrill', 'kids']

// ✅ react-hook-form (standalone)
// <CusCheckbox
//   label="Shartlarga roziman"
//   isRequired
//   errorText={errors.terms?.message}
//   {...register("terms")}
// />
