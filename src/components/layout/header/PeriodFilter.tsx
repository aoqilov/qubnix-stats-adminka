import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import type { DateValue } from "@ark-ui/react/date-picker";
import { parseDate } from "@internationalized/date";
import { usePeriodStore } from "@/store/period.store";
import { usePeriod } from "@/hooks/usePeriod";
import { PERIOD_PRESETS, type DateRange, type PeriodPreset } from "@/utils/period";
import { todayApiDate } from "@/utils/apiDate";
import { CusSegment } from "@/components/ui/segment/CusSegment";
import { CusSwitch } from "@/components/ui/inputs/CusSwitch";
import { CusCalendarMultiple } from "@/components/ui/calendar/CusCalendarMultiple";

function toApiDateValue(value: DateValue): string {
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

function toDateValues(range: DateRange): DateValue[] {
  return [parseDate(range.from), parseDate(range.to)];
}

/** Header'dagi global davr filtri: tayyor davrlar, ixtiyoriy oraliq va oldingi davr bilan solishtirish. */
export function PeriodFilter() {
  const { t } = useTranslation();
  const preset = usePeriodStore((s) => s.preset);
  const setPreset = usePeriodStore((s) => s.setPreset);
  const setCustomRange = usePeriodStore((s) => s.setCustomRange);
  const compare = usePeriodStore((s) => s.compare);
  const setCompare = usePeriodStore((s) => s.setCompare);
  const { current } = usePeriod();

  // Oraliq tanlanayotganda birinchi sana bosilgach qiymat bitta bo'ladi — store'ga faqat
  // ikkala chet tanlangach yoziladi, oraliq holati shu yerda turadi.
  const [draft, setDraft] = useState<DateValue[]>(() => toDateValues(current));
  useEffect(() => {
    setDraft(toDateValues(current));
  }, [current]);

  const items = PERIOD_PRESETS.map((id) => ({ id, label: t(`layout.period.presets.${id}`) }));

  return (
    <div className="flex items-center gap-4">
      <CusSegment
        items={items}
        value={preset}
        onValueChange={(value) => {
          const next = value as PeriodPreset;
          // "Период" — joriy davrdan boshlanadi, keyin kalendarda o'zgartiriladi.
          if (next === "custom") setCustomRange(current);
          else setPreset(next);
        }}
        size="sm"
        layout="inline"
        accent="var(--brand-default)"
      />

      {preset === "custom" && (
        <div className="w-[240px] flex-none">
          <CusCalendarMultiple
            value={draft}
            max={parseDate(todayApiDate())}
            onValueChange={({ value }) => {
              setDraft(value);
              if (value.length === 2) {
                setCustomRange({ from: toApiDateValue(value[0]), to: toApiDateValue(value[1]) });
              }
            }}
          />
        </div>
      )}

      {/* Field.Root kengligi 100% — o'ramasiz u butun qatorni egallab, keyingi qatorga tushardi. */}
      <div className="flex-none">
        <CusSwitch
          size="sm"
          label={t("layout.period.compare")}
          checked={compare}
          onCheckedChange={setCompare}
        />
      </div>
    </div>
  );
}
