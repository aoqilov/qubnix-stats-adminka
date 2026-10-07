import { Popover } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";

interface CusPopoverProps {
  trigger: ReactNode | ((open: boolean) => ReactNode);
  children: ReactNode | ((close: () => void) => ReactNode);
  placement?: "bottom" | "bottom-end" | "bottom-start" | "top" | "top-end" | "top-start" | "left" | "right";
  width?: number | string;
}

export function CusPopover({
  trigger,
  children,
  placement = "bottom-end",
  width = 200,
}: CusPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root
      positioning={{ placement }}
      lazyMount
      unmountOnExit
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Popover.Trigger asChild>
        {typeof trigger === "function" ? trigger(open) : trigger}
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          style={{
            width,
            background: "var(--bg-second)",
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            boxShadow: "var(--shadow-dropdown)",
            padding: 0,
            outline: "none",
          }}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
