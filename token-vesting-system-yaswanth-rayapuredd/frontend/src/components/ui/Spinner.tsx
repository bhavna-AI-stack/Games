type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, { outer: string; inner: string }> = {
  sm: { outer: 'w-4 h-4', inner: 'border-2' },
  md: { outer: 'w-6 h-6', inner: 'border-2' },
  lg: { outer: 'w-10 h-10', inner: 'border-3' },
};

interface SpinnerProps {
  size?: Size;
  className?: string;
}

/**
 * Loading spinner with primary color gradient ring.
 */
export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const { outer, inner } = sizeMap[size];
  return (
    <div
      className={`${outer} ${inner} rounded-full border-transparent border-t-primary-400 animate-spin ${className}`}
      style={{ borderWidth: size === 'lg' ? 3 : 2 }}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Full-page centered loading overlay.
 */
export function PageSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <Spinner size="lg" />
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
    </div>
  );
}
