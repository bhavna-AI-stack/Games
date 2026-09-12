import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

const colorMap = {
  purple: {
    icon: 'bg-primary-500/15 text-primary-400',
    glow: 'hover:shadow-glow-sm',
  },
  blue: {
    icon: 'bg-blue-500/15 text-blue-400',
    glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]',
  },
  green: {
    icon: 'bg-success-500/15 text-success-400',
    glow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]',
  },
  orange: {
    icon: 'bg-orange-500/15 text-orange-400',
    glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
  },
};

/**
 * Dashboard stat card showing an icon, large numeric value, and label.
 */
export function StatsCard({ title, value, subtitle, icon, color = 'purple' }: StatsCardProps) {
  const { icon: iconClass, glow } = colorMap[color];
  return (
    <div className={`glass-card p-5 transition-all duration-300 ${glow} hover:-translate-y-1`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconClass}`}>
          {icon}
        </div>
      </div>
      <div className="stat-number text-2xl font-bold">{value}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
