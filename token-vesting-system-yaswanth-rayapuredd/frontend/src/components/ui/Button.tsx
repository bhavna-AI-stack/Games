import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-500 hover:shadow-glow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
  secondary:
    'bg-transparent border border-primary-500/40 text-primary-400 hover:border-primary-400 hover:bg-primary-500/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
  danger:
    'bg-danger-600 text-white hover:bg-danger-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs rounded-lg',
  md: 'px-6 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3 text-base rounded-xl',
};

/**
 * Versatile button component with variant, size, loading state, and icon support.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
