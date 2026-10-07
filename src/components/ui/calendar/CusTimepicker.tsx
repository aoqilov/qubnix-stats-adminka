import { useTranslation } from "react-i18next";
import { Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { LuClock, LuX } from "react-icons/lu";
import { CusDialog } from "@/components/ui/dialog/CusDialog";
import { CusButton } from "@/components/ui/buttons/CusButton";

// ── Helpers ───────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, "0");

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const MINUTES_STEP5 = Array.from({ length: 12 }, (_, i) => i * 5);
const SECS = Array.from({ length: 60 }, (_, i) => i);

const ITEM_H = 32;
const VISIBLE = 5;
const COL_H = ITEM_H * VISIBLE;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

const MODAL_ITEM_H = 40;
const MODAL_COL_H = MODAL_ITEM_H * VISIBLE;
const MODAL_PAD = MODAL_ITEM_H * Math.floor(VISIBLE / 2);

function parseTime(v: string) {
  const [h = "0", m = "0", s = "0"] = v.split(":");
  return { h: +h, m: +m, s: +s };
}

function formatTime(
  h: number,
  m: number,
  s: number,
  fmt: "HH:mm" | "HH:mm:ss",
) {
  return fmt === "HH:mm:ss"
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(h)}:${pad(m)}`;
}

// ── TimeColumn ────────────────────────────────────────────────────────────────

interface ColProps {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
}

function TimeColumn({ items, selected, onSelect }: ColProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = selected * ITEM_H;
    }
  }, [selected]);

  return (
    <div
      ref={ref}
      style={{
        height: COL_H,
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        scrollbarWidth: "none",
      }}
    >
      {/* top padding so first item can center */}
      <div style={{ height: PAD, flexShrink: 0 }} />

      {items.map((n) => {
        const isSelected = selected === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: ITEM_H,
              width: "100%",
              scrollSnapAlign: "center",
              background: "transparent",
              color: isSelected ? "var(--color-blue)" : "var(--text-muted)",
              fontWeight: isSelected ? 700 : 400,
              fontSize: 13,
              fontVariantNumeric: "tabular-nums",
              borderRadius: 6,
              cursor: "pointer",
              transition: "color 0.1s",
              border: "none",
              outline: "none",
            }}
          >
            {pad(n)}
          </button>
        );
      })}

      {/* bottom padding */}
      <div style={{ height: PAD, flexShrink: 0 }} />
    </div>
  );
}

// ── ModalTimeColumn — "modal" variant uchun, tanlangan qiymat to'liq pill fon bilan ──

interface ModalColProps extends ColProps {
  /** Berilsa, shu qaytargan `true` qiymatlar bosib bo'lmaydigan (kulrang) holatda ko'rsatiladi. */
  isDisabled?: (n: number) => boolean;
}

function ModalTimeColumn({ items, selected, onSelect, isDisabled }: ModalColProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const index = items.indexOf(selected);
      ref.current.scrollTop = Math.max(index, 0) * MODAL_ITEM_H;
    }
  }, [selected, items]);

  return (
    <div
      ref={ref}
      className="rounded-input bg-surface-secondary"
      style={{
        height: MODAL_COL_H,
        flex: "none",
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        scrollbarWidth: "none",
      }}
    >
      <div style={{ height: MODAL_PAD, flexShrink: 0 }} />

      {items.map((n) => {
        const isSelected = selected === n;
        const disabled = isDisabled?.(n) ?? false;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onSelect(n)}
            className="flex items-center justify-center font-semibold"
            style={{
              height: MODAL_ITEM_H,
              width: "100%",
              scrollSnapAlign: "center",
              background: isSelected ? "var(--brand-default)" : "transparent",
              color: disabled
                ? "var(--text-disabled)"
                : isSelected
                  ? "var(--text-on-brand)"
                  : "var(--text-primary)",
              fontSize: 16,
              fontVariantNumeric: "tabular-nums",
              borderRadius: 10,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
              transition: "background 0.15s, color 0.15s",
              border: "none",
              outline: "none",
            }}
          >
            {pad(n)}
          </button>
        );
      })}

      <div style={{ height: MODAL_PAD, flexShrink: 0 }} />
    </div>
  );
}

// ── CusTimepicker ─────────────────────────────────────────────────────────────

interface CusTimepickerProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  format?: "HH:mm" | "HH:mm:ss";
  needConfirm?: boolean;
  clearable?: boolean;
  label?: string;
  inputSize?: "sm" | "md" | "lg";
  /**
   * "dropdown" (standart) — input ostida kichik popover.
   * "modal" — CusDialog orqali to'liq ekranga yaqin, katta raqam +
   * SOAT/DAQIQA ustunlari + "TASDIQLASH" tugmasi bilan ochiladi.
   */
  variant?: "dropdown" | "modal";
  /** Faqat variant="modal" uchun — dialog headeridagi matn. */
  modalTitle?: string;
  /**
   * Faqat variant="modal" uchun — "HH:mm". Berilsa, shu vaqtdan oldingi
   * soat/daqiqalar tanlab bo'lmaydigan holatda ko'rsatiladi (masalan bugungi
   * kun uchun — allaqachon o'tib ketgan vaqtni tanlab bo'lmasin).
   */
  minTime?: string;
}

const SIZE: Record<string, { py: number; fontSize: number; height: number }> = {
  sm: { py: 6, fontSize: 13, height: 32 },
  md: { py: 8, fontSize: 14, height: 38 },
  lg: { py: 10, fontSize: 15, height: 44 },
};

function snapToStep(n: number, step: number): number {
  return (Math.round(n / step) * step) % 60;
}

export function CusTimepicker({
  value,
  onChange,
  placeholder,
  disabled,
  format = "HH:mm",
  needConfirm = false,
  clearable = true,
  label,
  inputSize = "md",
  variant = "dropdown",
  modalTitle,
  minTime,
}: CusTimepickerProps) {
  const { t } = useTranslation();
  const minuteStep = variant === "modal" ? 5 : 1;
  const resolvedPlaceholder = placeholder ?? t("ui.timepicker.placeholder");
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState(value ?? "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = value ? parseTime(value) : null;
  const [tempH, setTempH] = useState(parsed?.h ?? 0);
  const [tempM, setTempM] = useState(snapToStep(parsed?.m ?? 0, minuteStep));
  const [tempS, setTempS] = useState(parsed?.s ?? 0);

  // Sync display when value prop changes from outside
  useEffect(() => {
    setInputText(value ?? "");
    if (value) {
      const p = parseTime(value);
      setTempH(p.h);
      setTempM(snapToStep(p.m, minuteStep));
      setTempS(p.s);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // "modal" variant + minTime — dialog ochilganda joriy tanlov minTime'dan
  // oldin bo'lsa, minTime'ning o'ziga ko'taramiz (o'tib ketgan vaqt ochilishi bilan ko'rinmasin).
  useEffect(() => {
    if (!open || variant !== "modal" || !minTime) return;
    const [minH, minM] = minTime.split(":").map(Number);
    if (tempH < minH || (tempH === minH && tempM < minM)) {
      setTempH(minH);
      setTempM(snapToStep(minM, minuteStep));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, minTime]);

  function isHourDisabled(h: number): boolean {
    if (!minTime) return false;
    const [minH] = minTime.split(":").map(Number);
    return h < minH;
  }

  function isMinuteDisabled(m: number): boolean {
    if (!minTime) return false;
    const [minH, minM] = minTime.split(":").map(Number);
    return tempH === minH && m < minM;
  }

  function applyChange(h: number, m: number, s: number) {
    const str = formatTime(h, m, s, format);
    onChange?.(str);
    setInputText(str);
  }

  function handleColChange(col: "h" | "m" | "s", v: number) {
    const next = { h: tempH, m: tempM, s: tempS, [col]: v };
    setTempH(next.h);
    setTempM(next.m);
    setTempS(next.s);
    if (!needConfirm && variant !== "modal") applyChange(next.h, next.m, next.s);
  }

  function handleConfirm() {
    applyChange(tempH, tempM, tempS);
    setOpen(false);
  }

  // Auto-insert colons while typing: "1430" → "14:30"
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value;

    // Strip non-digit/colon chars
    raw = raw.replace(/[^\d:]/g, "");

    // Auto-insert first colon after 2 digits
    const digits = raw.replace(/:/g, "");
    if (format === "HH:mm:ss") {
      if (digits.length <= 2) raw = digits;
      else if (digits.length <= 4)
        raw = `${digits.slice(0, 2)}:${digits.slice(2)}`;
      else
        raw = `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
    } else {
      if (digits.length <= 2) raw = digits;
      else raw = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }

    setInputText(raw);

    // Sync dropdown columns in real-time if format matches
    const fullLen = format === "HH:mm:ss" ? 8 : 5;
    if (raw.length === fullLen) {
      const p = parseTime(raw);
      const hValid = p.h >= 0 && p.h <= 23;
      const mValid = p.m >= 0 && p.m <= 59;
      const sValid = p.s >= 0 && p.s <= 59;
      if (hValid && mValid && sValid) {
        setTempH(p.h);
        setTempM(p.m);
        setTempS(p.s);
        if (!needConfirm) onChange?.(raw);
      }
    }
  }

  // Validate on blur — revert if invalid
  function handleInputBlur() {
    const fullLen = format === "HH:mm:ss" ? 8 : 5;
    const p = parseTime(inputText);
    const valid =
      inputText.length === fullLen &&
      p.h >= 0 &&
      p.h <= 23 &&
      p.m >= 0 &&
      p.m <= 59 &&
      p.s >= 0 &&
      p.s <= 59;

    if (valid) {
      const str = formatTime(p.h, p.m, p.s, format);
      onChange?.(str);
      setInputText(str);
      setTempH(p.h);
      setTempM(p.m);
      setTempS(p.s);
    } else {
      // revert to last valid value
      setInputText(value ?? "");
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.("");
    setInputText("");
    setTempH(0);
    setTempM(0);
    setTempS(0);
    inputRef.current?.focus();
  }

  const withSeconds = format === "HH:mm:ss";
  const colCount = withSeconds ? 3 : 2;
  const sz = SIZE[inputSize];
  const hasFocus = open;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      {label && (
        <Text fontSize="sm" fontWeight="medium" mb="2" color="var(--text-3)">
          {label}
        </Text>
      )}

      {/* ── Trigger (wrapper div + inner input) ── */}
      <div
        style={{
          width: "100%",
          height: sz.height,
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingLeft: 10,
          paddingRight: 10,
          fontSize: sz.fontSize,
          background: "var(--bg-input)",
          border: `1px solid ${hasFocus ? "var(--color-blue)" : "var(--border-input)"}`,
          borderRadius: 8,
          boxShadow: hasFocus ? "0 0 0 1px var(--color-blue)" : "none",
          opacity: disabled ? 0.5 : 1,
          transition: "border-color 0.15s, box-shadow 0.15s",
          cursor: disabled ? "not-allowed" : "text",
        }}
        onClick={() => {
          if (disabled) return;
          if (variant === "modal") setOpen(true);
          else inputRef.current?.focus();
        }}
      >
        <LuClock
          size={14}
          style={{
            color: "var(--text-muted)",
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={() => !disabled && setOpen((p) => !p)}
        />
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          readOnly={variant === "modal"}
          value={inputText}
          placeholder={resolvedPlaceholder}
          maxLength={format === "HH:mm:ss" ? 8 : 5}
          onChange={variant === "modal" ? undefined : handleInputChange}
          onFocus={() => {
            // "modal" variantda dialog yopilganda fokus shu inputga qaytadi —
            // agar shu yerda ham setOpen(true) chaqirilsa, dialog darhol qayta ochilib qoladi.
            if (!disabled && variant !== "modal") setOpen(true);
          }}
          onBlur={variant === "modal" ? undefined : handleInputBlur}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: sz.fontSize,
            color: inputText ? "var(--text-default)" : "var(--text-dim)",
            fontVariantNumeric: "tabular-nums",
            cursor: disabled ? "not-allowed" : "text",
            minWidth: 0,
          }}
        />
        {clearable && inputText && (
          <span
            onMouseDown={handleClear}
            style={{
              display: "flex",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 2,
              flexShrink: 0,
            }}
          >
            <LuX size={12} />
          </span>
        )}
      </div>

      {/* ── Dropdown ── */}
      {variant === "dropdown" && open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 100,
            background: "var(--bg-second)",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "var(--shadow-dropdown)",
            overflow: "hidden",
            minWidth: withSeconds ? 210 : 150,
          }}
        >
          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${colCount}, 1fr)`,
              padding: "8px 0 4px",
              borderBottom: "1px solid var(--border-default)",
            }}
          >
            {[
              t("ui.timepicker.hoursShort"),
              t("ui.timepicker.minutesShort"),
              ...(withSeconds ? [t("ui.timepicker.secondsShort")] : []),
            ].map((h) => (
              <p
                key={h}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {h}
              </p>
            ))}
          </div>

          {/* Columns */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${colCount}, 1fr)`,
              }}
            >
              <TimeColumn
                items={HOURS}
                selected={tempH}
                onSelect={(v) => handleColChange("h", v)}
              />
              <TimeColumn
                items={MINUTES}
                selected={tempM}
                onSelect={(v) => handleColChange("m", v)}
              />
              {withSeconds && (
                <TimeColumn
                  items={SECS}
                  selected={tempS}
                  onSelect={(v) => handleColChange("s", v)}
                />
              )}
            </div>
          </div>

          {/* Footer — needConfirm */}
          {needConfirm && (
            <div
              style={{
                borderTop: "1px solid var(--border-default)",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-default)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatTime(tempH, tempM, tempS, format)}
              </span>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  background: "var(--color-blue)",
                  color: "var(--text-on-accent)",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t("ui.timepicker.ok")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Modal — CusDialog'ning o'zi (rangi/tuzilmasi o'zgartirilmagan) ── */}
      {variant === "modal" && (
        <CusDialog
          open={open}
          onClose={() => setOpen(false)}
          title={modalTitle ?? t("ui.timepicker.pickTime")}
          centered
          size="xs"
          footer={
            <CusButton
              className="w-full"
              onClick={handleConfirm}
              style={{ background: "var(--brand-default)", color: "var(--text-on-brand)" }}
            >
              {t("common.actions.confirm")}
            </CusButton>
          }
        >
          <div className="flex flex-col items-center gap-4">
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "var(--brand-default)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatTime(tempH, tempM, tempS, format)}
            </span>
            <div className="flex w-full gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                  {t("ui.timepicker.hours")}
                </p>
                <ModalTimeColumn
                  items={HOURS}
                  selected={tempH}
                  onSelect={(v) => handleColChange("h", v)}
                  isDisabled={isHourDisabled}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                  {t("ui.timepicker.minutes")}
                </p>
                <ModalTimeColumn
                  items={MINUTES_STEP5}
                  selected={tempM}
                  onSelect={(v) => handleColChange("m", v)}
                  isDisabled={isMinuteDisabled}
                />
              </div>
              {withSeconds && (
                <div className="flex flex-1 flex-col gap-2">
                  <p className="text-center text-xs font-semibold uppercase tracking-wide text-secondary">
                    {t("ui.timepicker.seconds")}
                  </p>
                  <ModalTimeColumn
                    items={SECS}
                    selected={tempS}
                    onSelect={(v) => handleColChange("s", v)}
                  />
                </div>
              )}
            </div>
          </div>
        </CusDialog>
      )}
    </div>
  );
}

export default CusTimepicker;

// ── Ishlatish ─────────────────────────────────────────────────────────────────

// const [time, setTime] = useState("");
//
// <CusTimepicker
//   label="Вақт"
//   value={time}
//   onChange={setTime}
//   needConfirm
// />
//
// // Sekundlar bilan:
// <CusTimepicker
//   format="HH:mm:ss"
//   value={time}
//   onChange={setTime}
// />
