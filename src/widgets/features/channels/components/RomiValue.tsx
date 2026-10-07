import { LuArrowDownRight, LuArrowUpRight } from "react-icons/lu";
import { useFormatters } from "@/utils/format";

/** ROMI: belgi + strelka + rang (foyda — yashil, zarar — qizil); rang yolg'iz ma'no tashimaydi. */
export function RomiValue({ value }: { value: number | null }) {
  const fmt = useFormatters();
  if (value === null) return <span className="text-secondary">—</span>;
  const positive = value >= 0;
  const Icon = positive ? LuArrowUpRight : LuArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-semibold tabular-nums ${positive ? "text-success-strong" : "text-error-strong"}`}
    >
      <Icon size={13} aria-hidden />
      {fmt.signedPercent(value)}
    </span>
  );
}
