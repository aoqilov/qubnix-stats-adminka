import { Dialog, CloseButton } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { KEYBOARD_AWARE_POSITIONER } from "@/utils/keyboardInset";

type DialogSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

interface CusDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  closeOnBackdrop?: boolean;
  /**
   * true bo'lsa mobilda ham (lg'dan tor ekranda) pastdan chiqadigan
   * full-screen bottom-sheet emas, har doim markazda `size` o'lchamida
   * ko'rsatiladi — qisqa xabar/tasdiqlash dialoglari uchun.
   */
  centered?: boolean;
  /**
   * true bo'lsa dialog eni/bo'yi `size` o'lchamiga emas, ichidagi contentning
   * o'ziga moslab avtomatik hisoblanadi (masalan rasm preview — dialog rasm
   * qanchalik katta/kichik bo'lsa, shunga moslashadi). `centered`ni talab qiladi.
   */
  fitContent?: boolean;
}

export function CusDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  centered = false,
  fitContent = false,
}: CusDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => !open && onClose()}
      placement={centered ? "center" : { lgDown: "bottom", lg: "center" }}
      size={centered ? size : { lgDown: "full", lg: size }}
      closeOnInteractOutside={closeOnBackdrop}
      closeOnEscape
      lazyMount
      unmountOnExit
    >
      <Dialog.Backdrop bg="var(--overlay-backdrop)" backdropFilter="blur(2px)" />

      <Dialog.Positioner px={centered ? "4" : undefined} style={KEYBOARD_AWARE_POSITIONER}>
        <Dialog.Content
          bg="var(--bg-second)"
          borderColor="var(--border-default)"
          borderWidth="1px"
          borderRadius={centered ? "16px" : { lgDown: "16px 16px 0 0", lg: "16px" }}
          boxShadow="var(--shadow-modal)"
          color="var(--text-default)"
          display="flex"
          flexDirection="column"
          // dvh emas, % — positioner klaviatura ochilganda qisqaradi, dialog ham u bilan qisqarib
          // footer klaviatura ustida qoladi. Mobil bottom-sheet to'liq balandlikda (recipe'dagi
          // `full` minH: 100dvh o'rniga).
          maxH={centered ? "85%" : { lgDown: "100%", lg: "85%" }}
          minW={centered ? undefined : { lg: "760px" }}
          minH={centered ? undefined : { lgDown: "100%", lg: "min(500px, 100%)" }}
          style={
            fitContent
              ? { width: "fit-content", maxWidth: "90vw", maxHeight: "90%" }
              : undefined
          }
        >
          {/* Drag handle — faqat bottom-sheet (centered=false) mobil holatida */}
          {!centered && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "10px",
              paddingBottom: "2px",
            }}
            className="desktop:hidden"
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 9999,
                background: "var(--border-2)",
              }}
            />
          </div>
          )}

          {/* Header */}
          {(title || description) && (
            <Dialog.Header
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              borderBottomWidth="1px"
              borderColor="var(--border-default)"
              px="6"
              py="4"
              pr="12"
            >
              {title && (
                <Dialog.Title
                  fontSize="base"
                  fontWeight="semibold"
                  color="var(--text-default)"
                >
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description
                  fontSize="sm"
                  color="var(--text-muted)"
                  mt="0.5"
                >
                  {description}
                </Dialog.Description>
              )}
            </Dialog.Header>
          )}

          {/* Close button */}
          <Dialog.CloseTrigger asChild position="absolute" top="3.5" right="4">
            <CloseButton
              size="sm"
              color="var(--text-muted)"
              _hover={{ bg: "var(--bg-hover)", color: "var(--text-default)" }}
            />
          </Dialog.CloseTrigger>

          {/* Body */}
          <Dialog.Body
            px="6"
            py="5"
            color="var(--text-2)"
            flex="1"
            overflowY="auto"
          >
            {children}
          </Dialog.Body>

          {/* Footer */}
          {footer && (
            <Dialog.Footer
              borderTopWidth="1px"
              borderColor="var(--border-default)"
              px="6"
              py="4"
              gap="2"
            >
              {footer}
            </Dialog.Footer>
          )}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

// ─── Ishlatish misoli ─────────────────────────────────────────────────────────
//
// const [open, setOpen] = useState(false)
//
// <CusDialog
//   open={open}
//   onClose={() => setOpen(false)}
//   title="Xodimni o'chirish"
//   description="Bu amalni ortga qaytarib bo'lmaydi."
//   size="sm"
//   footer={
//     <>
//       <Dialog.ActionTrigger asChild>
//         <CusButton variant="outline">Bekor qilish</CusButton>
//       </Dialog.ActionTrigger>
//       <CusButton colorPalette="red" onClick={handleDelete}>
//         O'chirish
//       </CusButton>
//     </>
//   }
// >
//   <p>Hasan Hasanov uchun ma'lumotlar o'chiriladi.</p>
// </CusDialog>
