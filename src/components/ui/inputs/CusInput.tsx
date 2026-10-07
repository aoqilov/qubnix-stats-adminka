import { Field, Input, InputGroup } from "@chakra-ui/react";
import { forwardRef, useRef, useCallback, useEffect, useState, type ReactNode } from "react";
import type React from "react";
import { LuX } from "react-icons/lu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CusInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  // Label & validation
  label?: string;
  isRequired?: boolean;
  errorText?: string;
  helperText?: string;

  // Clear button
  clearable?: boolean;
  onClear?: () => void;

  // Left/right icon or element
  leftElement?: ReactNode;
  rightElement?: ReactNode;

  /**
   * Default'dan kengroq leftElement (masalan "+998" prefiksi) matn ustiga
   * chiqib ketmasligi uchun uning kengligi — "4.5rem" kabi.
   */
  leftElementWidth?: string;

  // Label va yordamchi matn o'lchami (login kabi yirikroq formalar uchun)
  labelFontSize?: string;
  helperFontSize?: string;

  // Chakra size & variant
  inputSize?: "xs" | "sm" | "md" | "lg";
  variant?: "outline" | "subtle" | "flushed";

  // Force focus styles (for custom numpad / readOnly inputs)
  isFocused?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CusInput = forwardRef<HTMLInputElement, CusInputProps>(
  function CusInput(
    {
      label,
      isRequired,
      errorText,
      helperText,
      clearable = false,
      onClear,
      leftElement,
      rightElement,
      leftElementWidth,
      labelFontSize = "sm",
      helperFontSize = "xs",
      inputSize = "md",
      variant = "outline",
      isFocused = false,
      onChange,
      ...inputProps
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Track whether input has a value (for clear button visibility)
    const isControlled = inputProps.value !== undefined;
    const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
      !!inputProps.defaultValue
    );
    const hasValue = isControlled
      ? String(inputProps.value).length > 0
      : uncontrolledHasValue;

    // Sync uncontrolled state when defaultValue changes initially
    useEffect(() => {
      if (!isControlled) {
        setUncontrolledHasValue(!!inputProps.defaultValue);
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Merge external ref (react-hook-form) + internal ref (clear)
    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolledHasValue(e.target.value.length > 0);
      onChange?.(e);
    };

    // Triggers react-hook-form's onChange via native event
    const handleClear = () => {
      const el = inputRef.current;
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      setter?.call(el, "");
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.focus();
      setUncontrolledHasValue(false);
      onClear?.();
    };

    const showClear = clearable && hasValue;

    const endEl = showClear ? (
      <button
        type="button"
        onClick={handleClear}
        style={{ display: "flex", cursor: "pointer", color: "var(--text-muted)" }}
      >
        <LuX size={14} />
      </button>
    ) : rightElement ?? undefined;

    const hasGroup = !!leftElement || !!endEl;

    return (
      <Field.Root invalid={!!errorText} required={isRequired} width="100%">
        {label && (
          <Field.Label
            fontSize={labelFontSize}
            fontWeight="medium"
            mb="1"
            color="var(--text-3)"
          >
            {label}
            <Field.RequiredIndicator color="var(--color-red)" ml="0.5" />
          </Field.Label>
        )}

        {hasGroup ? (
          <InputGroup
            width="100%"
            startElement={leftElement}
            endElement={endEl}
            startElementProps={
              leftElementWidth
                ? { width: leftElementWidth, justifyContent: "flex-start", ps: "3" }
                : undefined
            }
          >
            <Input
              ref={mergedRef}
              size={inputSize}
              variant={variant}
              ps={leftElementWidth}
              onChange={handleChange}
              bg="var(--bg-surface)"
              borderRadius="var(--radius-button)"
              borderColor={isFocused ? "var(--border-focus)" : "var(--border-default)"}
              boxShadow={isFocused ? "0 0 0 1px var(--border-focus)" : undefined}
              color="var(--text-secondary)"
              fontSize="sm"
              fontWeight="medium"
              _placeholder={{ color: "var(--text-disabled)" }}
              _hover={{ borderColor: "var(--border-focus)" }}
              _focus={{ borderColor: "var(--border-focus)", boxShadow: "0 0 0 1px var(--border-focus)" }}
              _invalid={{ borderColor: "var(--status-error-solid)", boxShadow: "0 0 0 1px var(--status-error-solid)" }}
              {...inputProps}
            />
          </InputGroup>
        ) : (
          <Input
            ref={mergedRef}
            size={inputSize}
            variant={variant}
            onChange={handleChange}
            bg="var(--bg-surface)"
            borderRadius="var(--radius-button)"
            borderColor={isFocused ? "var(--border-focus)" : "var(--border-default)"}
            boxShadow={isFocused ? "0 0 0 1px var(--border-focus)" : undefined}
            color="var(--text-secondary)"
            fontSize="sm"
            fontWeight="medium"
            _placeholder={{ color: "var(--text-disabled)" }}
            _hover={{ borderColor: "var(--border-focus)" }}
            _focus={{ borderColor: "var(--border-focus)", boxShadow: "0 0 0 1px var(--border-focus)" }}
            _invalid={{ borderColor: "var(--status-error-solid)", boxShadow: "0 0 0 1px var(--status-error-solid)" }}
            {...inputProps}
          />
        )}

        {errorText && (
          <Field.ErrorText fontSize={helperFontSize} color="var(--color-red)" mt="1">
            {errorText}
          </Field.ErrorText>
        )}

        {helperText && !errorText && (
          <Field.HelperText fontSize={helperFontSize} color="var(--text-muted)" mt="1">
            {helperText}
          </Field.HelperText>
        )}
      </Field.Root>
    );
  }
);


// ─── Ishlatish misoli ─────────────────────────────────────────────────────────

// 1) Oddiy
// <CusInput label="Ism" placeholder="Ismingizni kiriting" />

// 2) Required + error
// <CusInput
//   label="Email"
//   isRequired
//   errorText={errors.email?.message}
//   placeholder="example@mail.com"
//   type="email"
// />

// 3) Clear button
// <CusInput
//   label="Qidiruv"
//   clearable
//   leftElement={<LuSearch size={14} />}
//   placeholder="Qidiring..."
// />

// 4) react-hook-form bilan
// const { register, formState: { errors } } = useForm()
//
// <CusInput
//   label="Parol"
//   isRequired
//   type="password"
//   errorText={errors.password?.message}
//   helperText="Kamida 8 ta belgi"
//   {...register("password")}
// />
