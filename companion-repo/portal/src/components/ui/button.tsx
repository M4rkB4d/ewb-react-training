// src/components/ui/button.tsx
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-ewb-purple text-white hover:bg-ewb-purple-700 focus-visible:ring-ewb-purple',
  secondary:
    'bg-ewb-navy text-white hover:bg-ewb-navy-700 focus-visible:ring-ewb-navy',
  outline:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-ewb-purple',
  ghost:
    'text-gray-700 hover:bg-gray-100 focus-visible:ring-ewb-purple',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled === true || isLoading}
      className={cn(
        // Base styles — always applied
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        // Variant and size
        variantStyles[variant],
        sizeStyles[size],
        // Consumer overrides
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
