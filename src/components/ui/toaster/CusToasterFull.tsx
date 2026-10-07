import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useCallback } from "react";
import { LuCircleCheck, LuCircleX, LuX, LuPrinter } from "react-icons/lu";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToasterItem {
  id: number;
  message: string;
  type: "success" | "error";
  autoClose: boolean;
  loadingDuration?: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToasterFull() {
  const [items, setItems] = useState<ToasterItem[]>([]);
  const counter = useRef(0);

  const show = useCallback(
    (
      message: string,
      type: ToasterItem["type"] = "success",
      autoClose = true,
      loadingDuration = 0,
    ) => {
      const id = ++counter.current;
      setItems((prev) => [...prev, { id, message, type, autoClose, loadingDuration }]);
      if (autoClose) {
        setTimeout(
          () => setItems((prev) => prev.filter((t) => t.id !== id)),
          loadingDuration + 2000,
        );
      }
    },
    [],
  );

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { items, show, remove };
}

// ─── UI ───────────────────────────────────────────────────────────────────────

interface Props {
  items: ToasterItem[];
  onRemove: (id: number) => void;
}

export function CusToasterFull({ items, onRemove }: Props) {
  const toast = items[items.length - 1] ?? null;
  if (!toast) return null;
  return <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />;
}

function ToastCard({
  toast,
  onRemove,
}: {
  toast: ToasterItem;
  onRemove: (id: number) => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"loading" | "done">(
    toast.loadingDuration ? "loading" : "done",
  );

  useEffect(() => {
    if (!toast.loadingDuration) return;
    const timer = setTimeout(() => setPhase("done"), toast.loadingDuration);
    return () => clearTimeout(timer);
  }, [toast.loadingDuration]);

  const isLoading = phase === "loading";
  const isSuccess = toast.type === "success";
  const accent = isSuccess ? "var(--color-green)" : "var(--color-red)";
  const accentSoft = isSuccess ? "var(--color-green-soft)" : "var(--color-red-soft)";
  const accentBorder = isSuccess ? "var(--color-green-border)" : "var(--color-red-border)";
  const accentText = isSuccess ? "var(--color-green-text)" : "var(--color-red-text)";

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        style={{ background: "var(--overlay-backdrop)", backdropFilter: "blur(3px)" }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="relative rounded-2xl border flex flex-col items-center gap-5 px-8 py-8 w-full"
          style={{
            maxWidth: 360,
            background: "var(--bg-second)",
            borderColor: isLoading ? "var(--border-default)" : accentBorder,
            boxShadow: "var(--shadow-modal)",
            animation: "cusToastIn 0.18s cubic-bezier(.2,.8,.4,1)",
          }}
        >
          {/* X */}
          <button
            onClick={() => onRemove(toast.id)}
            className="absolute top-3.5 right-3.5 flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ color: "var(--text-muted)", background: "var(--bg-hover)" }}
          >
            <LuX size={14} />
          </button>

          {isLoading ? (
            /* ── Loading phase ── */
            <>
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: "var(--bg-hover)" }}
              >
                <LuPrinter size={36} style={{ color: "var(--text-muted)" }} />
              </div>

              {/* Spinner ring */}
              <div style={{ position: "relative", width: 40, height: 40 }}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  style={{ animation: "cusSpinRing 0.9s linear infinite" }}
                >
                  <circle
                    cx="20" cy="20" r="16"
                    fill="none"
                    stroke="var(--border-2)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="20" cy="20" r="16"
                    fill="none"
                    stroke="var(--color-blue)"
                    strokeWidth="3"
                    strokeDasharray="30 70"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p
                className="text-sm font-semibold text-center"
                style={{ color: "var(--text-muted)" }}
              >
                {t("ui.toaster.printing")}
              </p>

              <ProgressBar
                key="loader"
                accent="var(--color-blue)"
                duration={toast.loadingDuration ?? 3000}
              />
            </>
          ) : (
            /* ── Success / Error phase ── */
            <>
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: accentSoft }}
              >
                {isSuccess ? (
                  <LuCircleCheck size={40} style={{ color: accent }} />
                ) : (
                  <LuCircleX size={40} style={{ color: accent }} />
                )}
              </div>

              <p
                className="text-base font-semibold text-center leading-snug"
                style={{ color: "var(--text-default)" }}
              >
                {toast.message}
              </p>

              {toast.autoClose ? (
                <ProgressBar key="done" accent={accent} duration={2000} />
              ) : (
                <button
                  onClick={() => onRemove(toast.id)}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
                  style={{
                    background: accentSoft,
                    color: accentText,
                    border: `1px solid ${accentBorder}`,
                  }}
                >
                  {t("common.actions.close")}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes cusToastIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cusSpinRing {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ accent, duration }: { accent: string; duration: number }) {
  const [width, setWidth] = useState(100);
  const rafRef = useRef<number>(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    function tick() {
      const pct = Math.max(
        0,
        100 - ((Date.now() - startRef.current) / duration) * 100,
      );
      setWidth(pct);
      if (pct > 0) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height: 3, background: "var(--bg-hover)" }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: accent,
          transition: "width 0.05s linear",
        }}
      />
    </div>
  );
}
