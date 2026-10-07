import { Field, Textarea } from "@chakra-ui/react";
import { forwardRef } from "react";
import type React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CusTextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  // Label & validation
  label?: string;
  isRequired?: boolean;
  errorText?: string;
  helperText?: string;

  // Chakra size & variant
  inputSize?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "subtle" | "flushed";

  // Autoresize — kontent ko'paysa balandlik o'sadi
  autoresize?: boolean;
  // Maksimal balandlik (autoresize bilan birga): masalan "5lh" (5 qator)
  maxH?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CusTextArea = forwardRef<HTMLTextAreaElement, CusTextAreaProps>(
  function CusTextArea(
    {
      label,
      isRequired,
      errorText,
      helperText,
      inputSize = "md",
      variant = "outline",
      autoresize = false,
      maxH,
      ...textareaProps
    },
    ref
  ) {
    return (
      <Field.Root invalid={!!errorText} required={isRequired} width="100%">
        {label && (
          <Field.Label
            fontSize="sm"
            fontWeight="medium"
            mb="1"
            color="var(--text-3)"
          >
            {label}
            <Field.RequiredIndicator color="var(--color-red)" ml="0.5" />
          </Field.Label>
        )}

        <Textarea
          ref={ref}
          size={inputSize}
          variant={variant}
          autoresize={autoresize}
          maxH={maxH}
          bg="var(--bg-input)"
          borderColor="var(--border-input)"
          color="var(--text-default)"
          _placeholder={{ color: "var(--text-dim)" }}
          _hover={{ borderColor: "var(--border-2)" }}
          _focus={{ borderColor: "var(--color-blue)", boxShadow: "0 0 0 1px var(--color-blue)" }}
          _invalid={{ borderColor: "var(--color-red)", boxShadow: "0 0 0 1px var(--color-red)" }}
          _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
          {...textareaProps}
        />

        {errorText && (
          <Field.ErrorText fontSize="xs" color="var(--color-red)" mt="1">
            {errorText}
          </Field.ErrorText>
        )}

        {helperText && !errorText && (
          <Field.HelperText fontSize="xs" color="var(--text-muted)" mt="1">
            {helperText}
          </Field.HelperText>
        )}
      </Field.Root>
    );
  }
);


// ─── Ishlatish ────────────────────────────────────────────────────────────────

// ✅ Oddiy
// <CusTextArea label="Izoh" placeholder="Matn kiriting..." />

// ✅ Autoresize — kontent ko'paysa o'sadi, maxH bilan cheklash
// <CusTextArea
//   label="Tavsif"
//   autoresize
//   maxH="10lh"
//   placeholder="Yozing..."
// />

// ✅ Qator soni belgilangan
// <CusTextArea label="Xabar" rows={5} placeholder="..." />

// ✅ Required + error
// <CusTextArea
//   label="Tavsif"
//   isRequired
//   errorText="Bu maydon to'ldirilishi shart"
//   placeholder="..."
// />

// ✅ Helper text
// <CusTextArea
//   label="Bio"
//   helperText="Maksimal 300 ta belgi"
//   placeholder="O'zingiz haqingizda..."
// />

// ✅ Variantlar: outline (default) | subtle | flushed
// <CusTextArea variant="subtle" label="subtle" placeholder="..." />
// <CusTextArea variant="flushed" label="flushed" placeholder="..." />

// ✅ react-hook-form
// const { register, formState: { errors } } = useForm()
// <CusTextArea
//   label="Izoh"
//   isRequired
//   errorText={errors.comment?.message}
//   placeholder="Izohingizni yozing..."
//   {...register("comment")}
// />
