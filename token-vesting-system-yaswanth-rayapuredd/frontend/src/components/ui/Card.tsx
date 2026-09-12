import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

/**
 * Glassmorphism card component — the base container for all content sections.
 */
export function Card({ children, className = '', hover = false, glow = false }: CardProps) {
  return (
    <div
      className={`
        glass-card p-6
        ${hover ? 'glass-card-hover cursor-pointer' : ''}
        ${glow ? 'shadow-glow-sm hover:shadow-glow-md' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

/**
 * Standardized card header with title, optional subtitle, icon, and action slot.
 */
export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center text-primary-400">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
