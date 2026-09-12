import { Link } from 'react-router-dom';
import { StatusBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/Progress';
import { truncateAddress, formatTokenAmount, calcVestedPercent } from '../../utils/format';
import { formatDate, formatDuration, getVestingStatus } from '../../utils/time';
import type { VestingSchedule } from '../../types/vesting';

interface VestingCardProps {
  scheduleId: bigint;
  schedule: VestingSchedule;
  tokenSymbol?: string;
  tokenDecimals?: number;
  /** Show revoke button (admin view) */
  onRevoke?: (scheduleId: bigint) => void;
  isRevoking?: boolean;
}

/**
 * Card displaying a summary of a single vesting schedule.
 * Used in My Vestings and Admin Panel lists.
 */
export function VestingCard({
  scheduleId,
  schedule,
  tokenSymbol = '???',
  tokenDecimals = 18,
  onRevoke,
  isRevoking = false,
}: VestingCardProps) {
  const status = getVestingStatus(
    schedule.startTime,
    schedule.cliffDuration,
    schedule.vestingDuration,
    schedule.revoked,
    schedule.totalAmount,
    schedule.releasedAmount
  );

  const vestedPct = calcVestedPercent(schedule.totalAmount, schedule.releasedAmount);

  return (
    <div className="glass-card p-5 glass-card-hover animate-slide-up">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">#{scheduleId.toString()}</span>
            <StatusBadge status={status} />
            {schedule.revocable && (
              <span className="badge bg-white/5 text-gray-500 border border-white/10 text-xs">
                Revocable
              </span>
            )}
          </div>
          <p className="text-white font-semibold text-sm">
            {formatTokenAmount(schedule.totalAmount, tokenDecimals)} {tokenSymbol}
          </p>
        </div>
        <Link
          to={`/vesting/${scheduleId}`}
          className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1 transition-colors"
        >
          Details
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Progress */}
      <ProgressBar value={vestedPct} height={6} className="mb-4" />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-500 mb-0.5">Beneficiary</p>
          <p className="font-mono text-gray-300">{truncateAddress(schedule.beneficiary)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Start Date</p>
          <p className="text-gray-300">{formatDate(schedule.startTime)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Cliff</p>
          <p className="text-gray-300">{formatDuration(schedule.cliffDuration)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Duration</p>
          <p className="text-gray-300">{formatDuration(schedule.vestingDuration)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Released</p>
          <p className="text-success-400 font-medium">
            {formatTokenAmount(schedule.releasedAmount, tokenDecimals)} {tokenSymbol}
          </p>
        </div>
        <div>
          <p className="text-gray-500 mb-0.5">Remaining</p>
          <p className="text-gray-300">
            {formatTokenAmount(schedule.totalAmount - schedule.releasedAmount, tokenDecimals)} {tokenSymbol}
          </p>
        </div>
      </div>

      {/* Admin revoke button */}
      {onRevoke && !schedule.revoked && status !== 'completed' && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            onClick={() => onRevoke(scheduleId)}
            disabled={isRevoking}
            className="btn-danger text-xs py-1.5 px-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRevoking ? 'Revoking...' : 'Revoke Schedule'}
          </button>
        </div>
      )}
    </div>
  );
}
