// src/components/ui/alert.tsx
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  title?: string;
  className?: string;
}

const alertStyles: Record<AlertVariant, string> = {
  info: 'border-ewb-navy-200 bg-ewb-navy-50 text-ewb-navy-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

export function Alert({
  children,
  variant = 'info',
  title,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border p-4',
        alertStyles[variant],
        className,
      )}
    >
      {title != null && (
        <p className="mb-1 font-semibold">{title}</p>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}
