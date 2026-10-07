import { Button, Spinner } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";
import type React from "react";

type ButtonVariant =
  | "solid"
  | "subtle"
  | "surface"
  | "outline"
  | "ghost"
  | "plain";
type ButtonSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type ColorPalette =
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "teal"
  | "blue"
  | "cyan"
  | "purple"
  | "pink";
type SpinnerPlacement = "start" | "end";

interface AppButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorPalette?: ColorPalette;
  rounded?: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  loadingText?: string;
  spinnerPlacement?: SpinnerPlacement;
  customSpinner?: ReactNode;
  onClick?: () => void;
  asChild?: boolean;
  /** "submit" — forma ichida Enter bosilganda ham yuborilsin. Default: "button". */
  type?: "button" | "submit";
}

export const CusButton = forwardRef<HTMLButtonElement, AppButtonProps>(function CusButton(
  {
    variant = "solid",
    size = "md",
    colorPalette = "blue",
    rounded,
    className,
    style,
    children,
    leftIcon,
    rightIcon,
    isLoading = false,
    isDisabled = false,
    loadingText,
    spinnerPlacement = "start",
    customSpinner,
    onClick,
    asChild,
    type = "button",
  },
  ref
) {
  return (
    <Button
      ref={ref}
      type={type}
      variant={variant}
      size={size}
      colorPalette={colorPalette}
      rounded={rounded}
      className={className}
      style={style}
      loading={isLoading}
      disabled={isDisabled || isLoading}
      loadingText={loadingText}
      spinnerPlacement={spinnerPlacement}
      spinner={
        customSpinner ?? <Spinner size="sm" color={`${colorPalette}.500`} />
      }
      onClick={onClick}
      asChild={asChild}
    >
      {leftIcon && !isLoading && leftIcon}
      {children}
      {rightIcon && !isLoading && rightIcon}
    </Button>
  );
});

// export default function Page() {
//   return (
//     <>
//       {/* Oddiy */}
//       <CusButton>Click me</CusButton>

//       {/* Icon bilan */}
//       <CusButton leftIcon={<LuPlus />}>
//         Add
//       </CusButton>

//       {/* Loading */}
//       <CusButton isLoading loadingText="Saving...">
//         Save
//       </CusButton>

//       {/* Variant */}
//       <CusButton variant="outline" colorPalette="red">
//         Delete
//       </CusButton>
//     </>
//   )
// }
