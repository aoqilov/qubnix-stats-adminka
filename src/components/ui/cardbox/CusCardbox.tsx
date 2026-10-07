import type { HTMLAttributes, ReactNode } from "react";

interface CusCardboxProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CusCardbox({
  children,
  className = "",
  ...props
}: CusCardboxProps) {
  return (
    <div
      className={`border border-[var(--border-default)] bg-[var(--bg-second)] p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
