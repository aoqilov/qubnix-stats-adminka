import { useTranslation } from "react-i18next";
import { Dialog, CloseButton } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";
import { CusButton } from "@/components/ui/buttons/CusButton";

interface CusDialogDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export default function CusDialogDelete({
  open,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: CusDialogDeleteProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("ui.dialogDelete.titleShort");
  const resolvedDescription = description ?? t("ui.dialogDelete.description");
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => !open && onClose()}
      placement="center"
      size="sm"
      closeOnInteractOutside
      closeOnEscape
      lazyMount
      unmountOnExit
    >
      <Dialog.Backdrop bg="var(--overlay-backdrop)" backdropFilter="blur(2px)" />

      <Dialog.Positioner>
        <Dialog.Content
          bg="var(--bg-second)"
          borderColor="var(--border-default)"
          borderWidth="1px"
          borderRadius="16px"
          boxShadow="var(--shadow-modal)"
          color="var(--text-default)"
          maxW="400px"
          w="90vw"
        >
          {/* Close button */}
          <Dialog.CloseTrigger asChild position="absolute" top="3" right="3">
            <CloseButton
              size="sm"
              color="var(--text-muted)"
              _hover={{ bg: "var(--bg-hover)", color: "var(--text-default)" }}
            />
          </Dialog.CloseTrigger>

          {/* Body */}
          <Dialog.Body px="6" pt="6" pb="5">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--color-red-soft)",
                  border: "1px solid var(--color-red-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LuTriangleAlert size={22} style={{ color: "var(--color-red)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text-default)", marginBottom: 6 }}>
                  {resolvedTitle}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {resolvedDescription}
                </p>
              </div>
            </div>
          </Dialog.Body>

          {/* Footer */}
          <Dialog.Footer
            borderTopWidth="1px"
            borderColor="var(--border-default)"
            px="6"
            py="4"
            gap="2"
            justifyContent="flex-end"
          >
            <Dialog.ActionTrigger asChild>
              <CusButton variant="outline" size="sm" isDisabled={isLoading}>
                {t("common.actions.cancel")}
              </CusButton>
            </Dialog.ActionTrigger>
            <CusButton
              size="sm"
              variant="solid"
              colorPalette="red"
              isDisabled={isLoading}
              isLoading={isLoading}
              loadingText={t("ui.dialogDelete.deleting")}
              onClick={onConfirm}
            >
              {t("common.actions.delete")}
            </CusButton>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
