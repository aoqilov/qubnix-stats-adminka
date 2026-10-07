import { useTranslation } from "react-i18next";
import { useIntlLocale } from "@/i18n/useIntlLocale";
import { useState } from "react";
import { DatePicker, Field } from "@chakra-ui/react";
import type { DateValue } from "@ark-ui/react/date-picker";
import { parseDate } from "@internationalized/date";
import { LuCalendar, LuRotateCcw } from "react-icons/lu";

type ColorPalette =
  | "blue" | "green" | "red" | "orange" | "purple"
  | "yellow" | "cyan" | "teal" | "pink" | "gray";

export interface CusCalendarMultipleProps {
  label?: string;
  placeholder?: string;
  errorText?: string;
  isRequired?: boolean;
  colorPalette?: ColorPalette;
  value?: DateValue[];
  defaultValue?: DateValue[];
  onValueChange?: (details: { value: DateValue[]; valueAsString: string[] }) => void;
  min?: DateValue;
  max?: DateValue;
  isDateUnavailable?: (date: DateValue, locale: string) => boolean;
  locale?: string;
  timeZone?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onClear?: () => void;
}

const inputStyle = (disabled?: boolean) => ({
  flex: 1,
  minWidth: 0,
  height: 38,
  paddingLeft: 10,
  paddingRight: 4,
  background: "transparent",
  border: "none",
  outline: "none",
  color: "var(--text-default)",
  fontSize: 13,
  opacity: disabled ? 0.5 : 1,
  cursor: disabled ? "not-allowed" : "text",
});

export function CusCalendarMultiple({
  label,
  placeholder,
  errorText,
  isRequired,
  colorPalette = "blue",
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  isDateUnavailable,
  locale,
  timeZone,
  disabled,
  readOnly,
  onClear,
}: CusCalendarMultipleProps) {
  const { t } = useTranslation();
  const intlLocale = useIntlLocale();
  const resolvedLocale = locale ?? intlLocale;
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const hasError = !!errorText;
  const borderColor = hasError ? "var(--color-red)" : focused ? "var(--color-blue)" : "var(--border-default)";
  const boxShadow = hasError
    ? "0 0 0 1px var(--color-red)"
    : focused
    ? "0 0 0 1px var(--color-blue)"
    : "none";

  const fmt = (v: DateValue) =>
    `${String(v.day).padStart(2, "0")}.${String(v.month).padStart(2, "0")}.${v.year}`;

  const parse = (v: string) => {
    const [d, m, y] = v.split(".");
    if (!d || !m || y?.length !== 4) return undefined;
    try {
      return parseDate(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    } catch {
      return undefined;
    }
  };

  return (
    <Field.Root invalid={hasError} required={isRequired} width="100%">
      {label && (
        <Field.Label fontSize="sm" fontWeight="medium" mb="1" color="var(--text-3)">
          {label}
          <Field.RequiredIndicator color="var(--color-red)" ml="0.5" />
        </Field.Label>
      )}

      <DatePicker.Root
        selectionMode="range"
        numOfMonths={2}
        open={open}
        onOpenChange={({ open: o }) => setOpen(o)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        min={min}
        max={max}
        isDateUnavailable={isDateUnavailable}
        colorPalette={colorPalette}
        locale={resolvedLocale}
        timeZone={timeZone}
        disabled={disabled}
        readOnly={readOnly}
        format={fmt}
        parse={parse}
        width="100%"
      >
        <DatePicker.Control
          onClick={() => { if (!open) setOpen(true); }}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: 320,
            height: 40,
            background: "var(--bg-input)",
            border: `1px solid ${borderColor}`,
            borderRadius: 8,
            boxShadow,
            transition: "border-color 0.15s, box-shadow 0.15s",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <DatePicker.Input
            index={0}
            placeholder={placeholder ?? t("ui.calendar.rangeFrom")}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={inputStyle(disabled)}
          />
          <span style={{ color: "var(--text-dim)", fontSize: 12, flexShrink: 0 }}>—</span>
          <DatePicker.Input
            index={1}
            placeholder={t("ui.calendar.rangeTo")}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={inputStyle(disabled)}
          />
          {onClear && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: "100%",
                flexShrink: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-dim)",
              }}
            >
              <LuRotateCcw size={13} />
            </button>
          )}
          <DatePicker.Trigger
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: "100%",
              flexShrink: 0,
              background: "transparent",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              color: "var(--text-muted)",
            }}
          >
            <LuCalendar size={15} />
          </DatePicker.Trigger>
        </DatePicker.Control>

        <DatePicker.Positioner>
          <DatePicker.Content
            style={{
              background: "var(--bg-second)",
              border: "1px solid var(--border-default)",
              borderRadius: 12,
              padding: 12,
              boxShadow: "var(--shadow-dropdown)",
            }}
          >
            <DatePicker.View view="day">
              <DatePicker.Header />
              <div style={{ display: "flex", gap: 16 }}>
                <DatePicker.DayTable />
                <DatePicker.DayTable offset={1} />
              </div>
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Header />
              <DatePicker.MonthTable />
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Header />
              <DatePicker.YearTable />
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </DatePicker.Root>

      {errorText && (
        <Field.ErrorText fontSize="xs" color="var(--color-red)" mt="1">
          {errorText}
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
