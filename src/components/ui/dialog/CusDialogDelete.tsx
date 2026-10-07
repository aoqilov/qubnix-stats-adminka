import { useTranslation } from "react-i18next";
import { Dialog } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";
import { CusButton } from "@/components/ui/buttons/CusButton";

interface CusDialogDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function CusDialogDelete({
  open,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
}: CusDialogDeleteProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("ui.dialogDelete.title");
  const resolvedDescription = description ?? t("ui.dialogDelete.description");
  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => !open && onClose()}
      placement="center"
      size="sm"
      closeOnInteractOutside={!isLoading}
      closeOnEscape={!isLoading}
      lazyMount
      unmountOnExit
    >
      <Dialog.Backdrop bg="var(--overlay-backdrop)" backdropFilter="blur(2px)" />
      <Dialog.Positioner>
        <Dialog.Content
          bg="var(--bg-second)"
          borderColor="var(--border-default)"
          borderWidth="1px"
          borderRadius="14px"
          boxShadow="var(--shadow-modal)"
          color="var(--text-default)"
          maxW="400px"
          w="90vw"
        >
          <Dialog.Body px="6" py="6">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "var(--color-red-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LuTriangleAlert size={24} color="var(--color-red)" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-default)" }}>
                  {resolvedTitle}
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {resolvedDescription}
                </p>
              </div>
            </div>
          </Dialog.Body>

          <Dialog.Footer
            borderTopWidth="1px"
            borderColor="var(--border-default)"
            px="6"
            py="4"
            gap="2"
            display="flex"
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
