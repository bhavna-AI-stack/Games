import { ProgressBar } from '../ui/Progress';
import { formatTokenAmount, computeReleasableOffchain } from '../../utils/format';
import { formatDate, formatDuration, getVestingStatus, timeUntilEnd } from '../../utils/time';
import { StatusBadge } from '../ui/Badge';
import type { VestingSchedule } from '../../types/vesting';

interface VestingProgressProps {
  schedule: VestingSchedule;
  releasableAmount?: bigint;
  tokenSymbol?: string;
  tokenDecimals?: number;
}

/**
 * Detailed vesting progress panel used on the VestingDetails page.
 * Shows cliff, start, and end markers on a visual timeline.
 */
export function VestingProgress({
  schedule,
  releasableAmount,
  tokenSymbol = '???',
  tokenDecimals = 18,
}: VestingProgressProps) {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const vestingEnd = schedule.startTime + schedule.vestingDuration;
  const cliffEnd = schedule.startTime + schedule.cliffDuration;

  const status = getVestingStatus(
    schedule.startTime,
    schedule.cliffDuration,
    schedule.vestingDuration,
    schedule.revoked,
    schedule.totalAmount,
    schedule.releasedAmount
  );

  // Overall percent of time elapsed in vesting
  const totalSecs = Number(schedule.vestingDuration);
  const elapsed = Math.max(0, Number(now - schedule.startTime));
  const timePercent = Math.min(100, (elapsed / totalSecs) * 100);

  // Token release percent
  const releasePercent =
    schedule.totalAmount > 0n
      ? Math.min(100, Number((schedule.releasedAmount * 100n) / schedule.totalAmount))
      : 0;

  return (
    <div className="space-y-6">
      {/* Status row */}
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        <span className="text-xs text-gray-400">{timeUntilEnd(schedule.startTime, schedule.vestingDuration)}</span>
      </div>

      {/* Timeline visualization */}
      <div className="relative">
        <ProgressBar value={timePercent} showLabel={false} height={12} />
        {/* Cliff marker */}
        {schedule.cliffDuration > 0n && (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${(Number(schedule.cliffDuration) / Number(schedule.vestingDuration)) * 100}%`,
            }}
          >
            <div className="h-full w-0.5 bg-warning-400/60" />
            <span className="absolute -top-5 -translate-x-1/2 text-xs text-warning-400 whitespace-nowrap">
              Cliff
            </span>
          </div>
        )}
      </div>

      {/* Date markers */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Start: {formatDate(schedule.startTime)}</span>
        {schedule.cliffDuration > 0n && (
          <span className="text-warning-400/70">Cliff: {formatDate(cliffEnd)}</span>
        )}
        <span>End: {formatDate(vestingEnd)}</span>
      </div>

      {/* Token amounts grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 !rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Total Locked</p>
          <p className="text-lg font-bold text-white">
            {formatTokenAmount(schedule.totalAmount, tokenDecimals)}
          </p>
          <p className="text-xs text-gray-500">{tokenSymbol}</p>
        </div>
        <div className="glass-card p-4 !rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Released</p>
          <p className="text-lg font-bold text-success-400">
            {formatTokenAmount(schedule.releasedAmount, tokenDecimals)}
          </p>
          <p className="text-xs text-gray-500">{tokenSymbol} ({releasePercent.toFixed(1)}%)</p>
        </div>
        <div className="glass-card p-4 !rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Releasable Now</p>
          <p className="text-lg font-bold text-primary-400">
            {formatTokenAmount(releasableAmount ?? 0n, tokenDecimals)}
          </p>
          <p className="text-xs text-gray-500">{tokenSymbol}</p>
        </div>
        <div className="glass-card p-4 !rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Cliff Period</p>
          <p className="text-lg font-bold text-white">
            {formatDuration(schedule.cliffDuration)}
          </p>
          <p className="text-xs text-gray-500">then linear</p>
        </div>
      </div>
    </div>
  );
}
