import type { ReactNode } from "react";

interface CusPageTitleProps {
  title: ReactNode;
  /** Eski, kulrang tavsif (mobil profil). Desktop sahifalar `subtitle` ishlatadi. */
  description?: string;
  /** Sarlavha ostidagi brend rangli qator (sana, hisoblagich, ish maydoni nomi). */
  subtitle?: ReactNode;
  /** O'ng chetdagi slot (tugma, sana va h.k.). */
  action?: ReactNode;
  className?: string;
}

export function CusPageTitle({ title, description, subtitle, action, className = "mb-4" }: CusPageTitleProps) {
  return (
    <header className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h1 className="font-condensed text-3xl font-semibold leading-none text-primary">{title}</h1>
        {subtitle && (
          <div className="mt-1.5 min-h-5 truncate text-sm font-semibold text-brand">{subtitle}</div>
        )}
        {description && (
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
