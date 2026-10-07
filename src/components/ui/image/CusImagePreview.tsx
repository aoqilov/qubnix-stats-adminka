import { useEffect, useRef, useState } from "react";
import { Dialog } from "@chakra-ui/react";
import { LuEye, LuX, LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface CusImagePreviewProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  borderRadius?: number | string;
  preview?: boolean;
  /** Berilsa, preview ochilganda shu ro'yxat bo'yicha chapga/o'ngga slayder sifatida siljitish mumkin bo'ladi. `src` shu ro'yxatda bo'lishi kerak. */
  gallery?: string[];
  /** Rasm yuklanmasa — masalan, avatar o'rniga bosh harflarni ko'rsatish uchun. */
  onError?: () => void;
}

const SWIPE_THRESHOLD = 60;

// MobileLayout/CusDrawer'dagi bilan bir xil formula — Telegram (ayniqsa
// fullscreen rejimida) notch/home-indicator maydonini shu CSS o'zgaruvchilar
// orqali beradi; oddiy brauzerda ular yo'q, fallback 0px. Dialog Chakra
// portal orqali <body>ga chiqadi, shuning uchun safe-area'ni bu yerda
// alohida qo'yish kerak.
const SAFE_TOP =
  "calc(var(--tg-safe-area-inset-top, 0px) + var(--tg-content-safe-area-inset-top, 0px))";
const SAFE_BOTTOM =
  "calc(var(--tg-safe-area-inset-bottom, 0px) + var(--tg-content-safe-area-inset-bottom, 0px))";

export function CusImagePreview({
  src,
  alt = "",
  width = "100%",
  height = "100%",
  objectFit = "cover",
  objectPosition = "center",
  borderRadius = 0,
  preview = true,
  gallery,
  onError,
}: CusImagePreviewProps) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);

  const images = gallery && gallery.length > 0 ? gallery : [src];

  const openAt = () => {
    const startIndex = images.indexOf(src);
    setIndex(startIndex === -1 ? 0 : startIndex);
    setDragOffset(0);
    setOpen(true);
  };

  const goTo = (next: number) => {
    setIndex(Math.max(0, Math.min(images.length - 1, next)));
    setDragOffset(0);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    setDragOffset(e.clientX - dragStartX.current);
  };
  const handlePointerUp = () => {
    if (dragStartX.current === null) return;
    if (dragOffset < -SWIPE_THRESHOLD && index < images.length - 1)
      goTo(index + 1);
    else if (dragOffset > SWIPE_THRESHOLD && index > 0) goTo(index - 1);
    else setDragOffset(0);
    dragStartX.current = null;
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && index < images.length - 1) goTo(index + 1);
      if (e.key === "ArrowLeft" && index > 0) goTo(index - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, images.length]);

  return (
    <>
      <div
        style={{
          position: "relative",
          width,
          height,
          borderRadius,
          overflow: "hidden",
          flexShrink: 0,
        }}
        onMouseEnter={() => preview && setHovered(true)}
        onMouseLeave={() => preview && setHovered(false)}
      >
        <img
          src={src}
          alt={alt}
          onError={onError}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            objectPosition,
            display: "block",
          }}
        />

        {/* Hover overlay — faqat preview=true bo'lsa */}
        {preview && (
          <button
            type="button"
            onClick={openAt}
            style={{
              position: "absolute",
              inset: 0,
              border: "none",
              background: "var(--overlay-hover)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.15s",
            }}
          >
            <LuEye size={20} color="var(--text-on-accent)" />
          </button>
        )}
      </div>

      {preview && (
        <Dialog.Root
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          placement="center"
          size="full"
          closeOnInteractOutside
          closeOnEscape
          lazyMount
          unmountOnExit
        >
          <Dialog.Backdrop bg="var(--overlay-backdrop, rgba(0,0,0,0.95))" />
          <Dialog.Positioner>
            <Dialog.Content
              bg="transparent"
              boxShadow="none"
              border="none"
              width="100vw"
              height="100dvh"
              maxW="100vw"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              overflow="hidden"
            >
              <Dialog.CloseTrigger
                asChild
                position="absolute"
                top={`calc(1rem + ${SAFE_TOP})`}
                right="4"
                zIndex="1"
              >
                <button
                  type="button"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-avatar, 9999px)",
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LuX size={18} color="#fff" />
                </button>
              </Dialog.CloseTrigger>

              {images.length > 1 && index > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-avatar, 9999px)",
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                >
                  <LuChevronLeft size={20} color="#fff" />
                </button>
              )}
              {images.length > 1 && index < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-avatar, 9999px)",
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                >
                  <LuChevronRight size={20} color="#fff" />
                </button>
              )}

              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  touchAction: "pan-y",
                  cursor: images.length > 1 ? "grab" : "default",
                  transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))`,
                  transition:
                    dragStartX.current === null
                      ? "transform 0.3s ease"
                      : "none",
                }}
              >
                {images.map((url, i) => (
                  <div
                    key={url + i}
                    style={{
                      flex: "0 0 100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={url}
                      alt={alt}
                      draggable={false}
                      style={{
                        maxWidth: "88vw",
                        maxHeight: "82dvh",
                        borderRadius: 10,
                        objectFit: "contain",
                        userSelect: "none",
                      }}
                    />
                  </div>
                ))}
              </div>

              {images.length > 1 && (
                <span
                  style={{
                    position: "absolute",
                    bottom: `calc(1rem + ${SAFE_BOTTOM})`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#fff",
                    fontSize: "var(--text-caption, 12px)",
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: "var(--radius-chip, 9999px)",
                    padding: "4px 10px",
                  }}
                >
                  {index + 1} / {images.length}
                </span>
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}
    </>
  );
}

// ─── Ishlatish misoli ─────────────────────────────────────────────────────────
//
// <CusImagePreview
//   src={getFileUrl(attraction.main_file)}
//   width={200}
//   height={140}
//   objectFit="cover"
//   objectPosition="top"
//   borderRadius={10}
// />
//
// Galereya (chapga/o'ngga slayder bilan):
// <CusImagePreview src={photo.url} gallery={photos.map((p) => p.url)} width={48} height={48} />
