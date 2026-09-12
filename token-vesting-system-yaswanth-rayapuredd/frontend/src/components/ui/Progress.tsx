interface ProgressBarProps {
  /** Value from 0 to 100 */
  value: number;
  /** Show percentage label */
  showLabel?: boolean;
  /** Height in pixels */
  height?: number;
  className?: string;
}

/**
 * Animated gradient progress bar for vesting completion percentage.
 */
export function ProgressBar({ value, showLabel = true, height = 8, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs font-semibold text-primary-400">{pct.toFixed(1)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: `${height}px`, background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background:
              pct >= 100
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : pct === 0
                ? 'rgba(99,102,241,0.3)'
                : 'linear-gradient(90deg, #6366f1, #a855f7)',
            boxShadow:
              pct > 0 ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
          }}
        />
      </div>
    </div>
  );
}
