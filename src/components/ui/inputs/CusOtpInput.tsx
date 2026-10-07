import { useEffect, useRef } from "react";
import type React from "react";

interface CusOtpInputProps {
  /** Kataklar soni (default 6). */
  length?: number;
  value: string;
  onChange: (value: string) => void;
  /** Barcha kataklar to'lganda chaqiriladi. */
  onComplete?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const onlyDigits = (raw: string) => raw.replace(/\D/g, "");

export function CusOtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  invalid = false,
  disabled = false,
  autoFocus = false,
  className = "",
}: CusOtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const focusAt = (index: number) => {
    const target = inputsRef.current[Math.max(0, Math.min(index, length - 1))];
    target?.focus();
    target?.select();
  };

  const emit = (next: string) => {
    const trimmed = next.slice(0, length);
    onChange(trimmed);
    if (trimmed.length === length) onComplete?.(trimmed);
  };

  /** `index` pozitsiyadan boshlab raqamlarni joylaydi (bitta belgi ham, paste ham). */
  const writeFrom = (index: number, digits: string) => {
    const chars = value.padEnd(length, " ").split("");
    for (let i = 0; i < digits.length && index + i < length; i += 1) {
      chars[index + i] = digits[i];
    }
    // Bo'sh kataklar orada joy egallab qolmasligi uchun probellarni tashlaymiz.
    emit(chars.join("").replace(/ /g, ""));
    focusAt(index + digits.length);
  };

  const handleChange = (index: number, raw: string) => {
    const digits = onlyDigits(raw);
    if (!digits) {
      // Katak tozalandi
      const chars = value.split("");
      chars[index] = "";
      emit(chars.join(""));
      return;
    }
    writeFrom(index, digits);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        const chars = value.split("");
        chars[index] = "";
        emit(chars.join(""));
        focusAt(index);
      } else if (index > 0) {
        const chars = value.split("");
        chars[index - 1] = "";
        emit(chars.join(""));
        focusAt(index - 1);
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent) => {
    const digits = onlyDigits(e.clipboardData.getData("text"));
    if (!digits) return;
    e.preventDefault();
    writeFrom(index, digits);
  };

  return (
    <div className={`flex justify-between gap-2 ${className}`}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          disabled={disabled}
          value={value[index] ?? ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-full min-w-0 rounded-lg border text-center text-lg font-semibold",
            "bg-[var(--bg-input)] text-[var(--text-default)] outline-none transition",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid
              ? "border-red-500 focus:border-red-500 focus:shadow-[0_0_0_1px_#ef4444]"
              : "border-[var(--border-input)] focus:border-[var(--accent)] focus:shadow-[0_0_0_1px_var(--accent)]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// Ishlatish:
// const [code, setCode] = useState("");
// <CusOtpInput value={code} onChange={setCode} onComplete={verify} invalid={!!error} />
