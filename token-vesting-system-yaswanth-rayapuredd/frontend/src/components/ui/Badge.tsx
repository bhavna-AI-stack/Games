import type { VestingStatus } from '../../types/vesting';

interface BadgeProps {
  status: VestingStatus;
  className?: string;
}

const statusConfig: Record<VestingStatus, { label: string; classes: string; dot: string }> = {
  cliff: {
    label: 'Cliff Period',
    classes: 'bg-warning-500/15 text-warning-400 border border-warning-500/20',
    dot: 'bg-warning-400',
  },
  vesting: {
    label: 'Vesting',
    classes: 'bg-primary-500/15 text-primary-400 border border-primary-500/20',
    dot: 'bg-primary-400 animate-pulse',
  },
  completed: {
    label: 'Completed',
    classes: 'bg-success-500/15 text-success-400 border border-success-500/20',
    dot: 'bg-success-400',
  },
  revoked: {
    label: 'Revoked',
    classes: 'bg-danger-500/15 text-danger-400 border border-danger-500/20',
    dot: 'bg-danger-400',
  },
};

/**
 * Status badge for vesting schedules. Shows a colored dot and label.
 */
export function StatusBadge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`badge ${config.classes} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

interface GenericBadgeProps {
  children: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  className?: string;
}

const colorClasses = {
  purple: 'bg-primary-500/15 text-primary-400 border border-primary-500/20',
  blue:   'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  green:  'bg-success-500/15 text-success-400 border border-success-500/20',
  yellow: 'bg-warning-500/15 text-warning-400 border border-warning-500/20',
  red:    'bg-danger-500/15 text-danger-400 border border-danger-500/20',
  gray:   'bg-white/5 text-gray-400 border border-white/10',
};

/**
 * Generic badge for arbitrary labels.
 */
export function Badge({ children, color = 'gray', className = '' }: GenericBadgeProps) {
  return (
    <span className={`badge ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
}
