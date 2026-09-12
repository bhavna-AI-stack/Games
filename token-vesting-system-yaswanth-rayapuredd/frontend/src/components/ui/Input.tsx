import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

/**
 * Styled dark-theme input field with optional label, error message, hint, and prefix/suffix slots.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
              {prefix}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              input-field
              ${prefix ? 'pl-10' : ''}
              ${suffix ? 'pr-10' : ''}
              ${error ? 'border-danger-500 focus:border-danger-400 focus:ring-danger-500/50' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 text-gray-400 pointer-events-none flex items-center">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-danger-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
