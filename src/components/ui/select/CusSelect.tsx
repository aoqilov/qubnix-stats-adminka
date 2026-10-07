// components/CusSelect.tsx
import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";
import {
  Select,
  useListCollection,
  Portal,
  type SelectValueChangeDetails,
} from "@chakra-ui/react";
import { LuChevronDown, LuX } from "react-icons/lu";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SelectOption<T extends string | number = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

interface BaseProps<T extends string | number> {
  options: SelectOption<T>[];
  placeholder?: string;
  label?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "outline" | "subtle" | "ghost";
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
  clearable?: boolean;
  name?: string;
  closeOnSelect?: boolean;
  itemIconCheck?: React.ReactNode;
  itemIconSize?: number | string;
}

interface SingleProps<T extends string | number> extends BaseProps<T> {
  multiple?: false;
  value?: T;
  onChange?: (value: T) => void;
}

interface MultipleProps<T extends string | number> extends BaseProps<T> {
  multiple: true;
  value?: T[];
  onChange?: (value: T[]) => void;
}

type CusSelectProps<T extends string | number> =
  | SingleProps<T>
  | MultipleProps<T>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Chakra useListCollection faqat string qabul qiladi
// Shuning uchun number → string konversiya qilamiz, qaytishda parse qilamiz

const toStr = (v: string | number): string => String(v);

const fromStr = <T extends string | number>(
  v: string,
  sample: T, // original tipni bilish uchun
): T => (typeof sample === "number" ? Number(v) : v) as T;

// ─── Component ───────────────────────────────────────────────────────────────

const CusSelect = <T extends string | number>(props: CusSelectProps<T>) => {
  const { t } = useTranslation();
  const {
    options,
    placeholder = t("ui.select.placeholder"),
    label,
    size = "md",
    variant = "outline",
    disabled,
    invalid,
    readOnly,
    required,
    clearable = false,
    name,
    closeOnSelect,
    multiple,
    value,
    onChange,
    itemIconCheck,
    itemIconSize,
  } = props;

  const mappedItems = useMemo(
    () => options.map((opt) => ({ ...opt, value: toStr(opt.value) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.map((o) => toStr(o.value)).join(",")],
  );

  const { collection, set } = useListCollection({
    initialItems: mappedItems,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  });

  // options asinxron o'zgarganda (masalan, API dan yuklanganda) collection yangilansin
  useEffect(() => {
    set(mappedItems);
  }, [mappedItems]);

  // value → string[] (Chakra uchun)
  const normalizedValue =
    value === undefined
      ? undefined
      : multiple
        ? (value as T[]).map(toStr)
        : [toStr(value as T)];

  // Chakra string[] qaytaradi → T[] ga parse qilamiz
  const handleValueChange = (
    details: SelectValueChangeDetails<{ label: string; value: string }>,
  ) => {
    if (!onChange) return;

    // Tip aniqlashtirish uchun sample olish
    const sample = options[0]?.value;

    if (multiple) {
      const parsed = details.value.map((v) => fromStr(v, sample ?? (0 as T)));
      (onChange as (v: T[]) => void)(parsed);
    } else {
      const raw = details.value[0] ?? "";
      (onChange as (v: T) => void)(fromStr(raw, sample ?? ("" as T)));
    }
  };

  return (
    <Select.Root
      collection={collection}
      size={size}
      variant={variant}
      multiple={multiple}
      value={normalizedValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      invalid={invalid}
      readOnly={readOnly}
      required={required}
      name={name}
      closeOnSelect={multiple ? false : (closeOnSelect ?? true)}
      lazyMount
      unmountOnExit
    >
      <Select.HiddenSelect />

      {label && <Select.Label color="var(--text-4)">{label}</Select.Label>}

      <Select.Control>
        <Select.Trigger
          bg="var(--bg-input)"
          borderColor="var(--border-default)"
          color="var(--text-default)"
          _hover={{ bg: "var(--bg-hover)", borderColor: "var(--border-2)" }}
        >
          <Select.ValueText
            placeholder={placeholder}
            color="var(--text-default)"
            css={{
              "&[data-placeholder-shown]": { color: "var(--text-muted)" },
            }}
          />
        </Select.Trigger>

        <Select.IndicatorGroup>
          {clearable && (
            <Select.ClearTrigger
              color="var(--text-muted)"
              _hover={{ color: "var(--text-default)" }}
              asChild
            >
              <LuX />
            </Select.ClearTrigger>
          )}
          <Select.Indicator color="var(--text-muted)">
            <LuChevronDown />
          </Select.Indicator>
        </Select.IndicatorGroup>
      </Select.Control>

      <Portal>
        <Select.Positioner>
          <Select.Content
            bg="var(--bg-second)"
            borderColor="var(--border-default)"
            color="var(--text-default)"
          >
            {options.map((opt) => (
              <Select.Item
                key={toStr(opt.value)}
                item={{ ...opt, value: toStr(opt.value) }}
                color="var(--text-default)"
                _highlighted={{
                  bg: "var(--bg-hover)",
                  color: "var(--text-default)",
                }}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator
                  color="var(--text-muted)"
                  fontSize={itemIconSize}
                >
                  {itemIconCheck ?? "✓"}
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
};

export default CusSelect;

// // ✅ string — avvalgidek ishlaydi
// const [lang, setLang] = useState<string>("")

// <CusSelect
//   options={[
//     { label: "Uzbek",   value: "uz" },
//     { label: "English", value: "en" },
//   ]}
//   value={lang}
//   onChange={setLang}   // (value: string) => void
// />

// // ✅ number — ID asosida
// const [userId, setUserId] = useState<number | undefined>()

// <CusSelect
//   options={[
//     { label: "Alice", value: 1 },
//     { label: "Bob",   value: 2 },
//     { label: "Carol", value: 3 },
//   ]}
//   value={userId}
//   onChange={setUserId}   // (value: number) => void
// />

// // ✅ multiple + number
// const [ids, setIds] = useState<number[]>([])

// <CusSelect
//   multiple
//   options={[
//     { label: "React",  value: 10 },
//     { label: "Vue",    value: 20 },
//     { label: "Svelte", value: 30 },
//   ]}
//   value={ids}
//   onChange={setIds}   // (value: number[]) => void
//   clearable
// />
