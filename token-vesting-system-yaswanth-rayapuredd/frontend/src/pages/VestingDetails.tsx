import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { VestingProgress } from '../components/vesting/VestingProgress';
import { PageSpinner } from '../components/ui/Spinner';
import { useVestingSchedule, useComputeReleasable, useReleaseTokens, useTokenInfo } from '../hooks/useVesting';
import { truncateAddress, formatTokenAmount } from '../utils/format';
import { formatDateTime, formatDuration, getVestingStatus } from '../utils/time';
import { SCAI_EXPLORER } from '../constants/addresses';

/**
 * Vesting Details page — full schedule information with live releasable amount and release button.
 * Route: /vesting/:id
 */
export default function VestingDetails() {
  const { id } = useParams<{ id: string }>();
  const { address } = useAccount();

  const scheduleId = id ? BigInt(id) : undefined;

  const { data: schedule, isLoading, refetch } = useVestingSchedule(scheduleId);
  const { data: releasable, isLoading: loadingReleasable } = useComputeReleasable(scheduleId);
  const { writeRelease, isPending, isConfirming, isSuccess, error, hash } = useReleaseTokens();
  const { symbol, decimals } = useTokenInfo(schedule?.token);

  if (isLoading) return <PageSpinner message="Loading vesting details..." />;
  if (!schedule || !scheduleId) {
    return (
      <Card className="text-center py-16 max-w-md mx-auto">
        <p className="text-white font-semibold mb-2">Schedule Not Found</p>
        <p className="text-gray-400 text-sm mb-6">No vesting schedule with ID #{id}</p>
        <Link to="/my-vestings"><Button>Back to My Vestings</Button></Link>
      </Card>
    );
  }

  const tokenDecimals = decimals ?? 18;
  const tokenSymbol = symbol ?? '???';
  const isBeneficiary = address?.toLowerCase() === schedule.beneficiary.toLowerCase();

  const status = getVestingStatus(
    schedule.startTime, schedule.cliffDuration, schedule.vestingDuration,
    schedule.revoked, schedule.totalAmount, schedule.releasedAmount
  );

  const canRelease = isBeneficiary && !schedule.revoked && (releasable ?? 0n) > 0n;

  const handleRelease = () => {
    writeRelease(scheduleId);
  };

  if (isSuccess) refetch();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back navigation */}
      <div className="flex items-center gap-2">
        <Link to="/my-vestings" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          My Vestings
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-gray-300 text-sm">Schedule #{scheduleId.toString()}</span>
      </div>

      {/* Header card */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {formatTokenAmount(schedule.totalAmount, tokenDecimals)} {tokenSymbol}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-gray-400 text-sm">Vesting Schedule #{scheduleId.toString()}</p>
          </div>
          {schedule.revocable && (
            <span className="badge bg-warning-500/10 text-warning-400 border border-warning-500/20 text-xs">
              Revocable
            </span>
          )}
        </div>

        {/* Vesting progress section */}
        <VestingProgress
          schedule={schedule}
          releasableAmount={releasable}
          tokenSymbol={tokenSymbol}
          tokenDecimals={tokenDecimals}
        />

        {/* Release button */}
        {isBeneficiary && !schedule.revoked && (
          <div className="mt-6 pt-6 border-t border-white/5">
            {isSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-success-500/10 border border-success-500/20 text-success-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tokens released successfully!
                {hash && (
                  <a
                    href={`${SCAI_EXPLORER}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline ml-1 hover:text-success-300"
                  >
                    View on explorer
                  </a>
                )}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">
                Error: {(error as any)?.shortMessage ?? error.message}
              </div>
            )}
            <Button
              fullWidth
              size="lg"
              onClick={handleRelease}
              loading={isPending || isConfirming}
              disabled={!canRelease}
            >
              {isConfirming
                ? 'Confirming Release...'
                : loadingReleasable
                ? 'Checking...'
                : canRelease
                ? `Release ${formatTokenAmount(releasable!, tokenDecimals)} ${tokenSymbol}`
                : status === 'cliff'
                ? 'In Cliff Period — Not Yet Releasable'
                : status === 'completed'
                ? 'All Tokens Released'
                : 'Nothing to Release'}
            </Button>
          </div>
        )}

        {!isBeneficiary && (
          <p className="mt-4 text-center text-xs text-gray-500">
            Only the beneficiary ({truncateAddress(schedule.beneficiary)}) can release tokens
          </p>
        )}
      </Card>

      {/* Schedule details card */}
      <Card>
        <CardHeader
          title="Schedule Details"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <div className="space-y-3">
          {[
            { label: 'Token',           value: <a href={`${SCAI_EXPLORER}/address/${schedule.token}`} target="_blank" rel="noopener noreferrer" className="font-mono text-primary-400 hover:text-primary-300 text-xs">{schedule.token}</a> },
            { label: 'Beneficiary',     value: <span className="font-mono text-xs text-gray-300">{schedule.beneficiary}</span> },
            { label: 'Creator',         value: <span className="font-mono text-xs text-gray-300">{schedule.creator}</span> },
            { label: 'Start Time',      value: formatDateTime(schedule.startTime) },
            { label: 'Cliff Duration',  value: formatDuration(schedule.cliffDuration) },
            { label: 'Total Duration',  value: formatDuration(schedule.vestingDuration) },
            { label: 'Revocable',       value: schedule.revocable ? '✓ Yes' : '✗ No' },
            { label: 'Status',          value: <StatusBadge status={status} /> },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
              <span className="text-xs text-gray-400 font-medium">{label}</span>
              <div className="text-sm text-gray-200 text-right max-w-xs">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
