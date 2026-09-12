import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { Card, CardHeader } from '../components/ui/Card';
import { VestingCard } from '../components/vesting/VestingCard';
import { PageSpinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { useAdminCheck } from '../hooks/useAdminCheck';
import { useMyCreatedSchedules, useVestingSchedule, useRevokeSchedule, useTokenInfo } from '../hooks/useVesting';
import { truncateAddress } from '../utils/format';
import { ADDRESSES, SCAI_EXPLORER } from '../constants/addresses';

/** Admin vesting card wrapper with revoke functionality */
function AdminVestingItem({ scheduleId }: { scheduleId: bigint }) {
  const { data: schedule, isLoading, refetch } = useVestingSchedule(scheduleId);
  const { symbol, decimals } = useTokenInfo(schedule?.token);
  const { writeRevoke, isPending, isConfirming, isSuccess, error } = useRevokeSchedule();

  if (isLoading) return <div className="shimmer h-52 rounded-2xl" />;
  if (!schedule) return null;

  if (isSuccess) refetch();

  const handleRevoke = (id: bigint) => {
    if (window.confirm(`Revoke schedule #${id}? This will return unvested tokens to the creator.`)) {
      writeRevoke(id);
    }
  };

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-danger-400 text-xs px-1">
          Revoke error: {(error as any)?.shortMessage ?? error.message}
        </p>
      )}
      {isSuccess && (
        <p className="text-success-400 text-xs px-1">✓ Schedule revoked successfully</p>
      )}
      <VestingCard
        scheduleId={scheduleId}
        schedule={schedule}
        tokenSymbol={symbol ?? '???'}
        tokenDecimals={decimals ?? 18}
        onRevoke={handleRevoke}
        isRevoking={isPending || isConfirming}
      />
    </div>
  );
}

/**
 * Admin Panel — accessible only to the contract owner.
 * Shows all schedules created by the connected wallet with revoke capability.
 */
export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const { isOwner, isLoading: checkingOwner, ownerAddress } = useAdminCheck();
  const { data: createdIds, isLoading: loadingIds } = useMyCreatedSchedules();

  if (!isConnected) {
    return (
      <Card className="text-center py-16 max-w-md mx-auto animate-fade-in">
        <p className="text-gray-400 text-sm mb-4">Connect your wallet to access the Admin Panel</p>
      </Card>
    );
  }

  if (!ADDRESSES.TOKEN_VESTING_ADDRESS) {
    return (
      <Card className="text-center py-16 max-w-md mx-auto animate-fade-in">
        <p className="text-warning-400 font-medium">Contract not deployed</p>
      </Card>
    );
  }

  if (checkingOwner) return <PageSpinner message="Checking permissions..." />;

  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-white font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm mb-2">
            Admin Panel is restricted to the contract owner.
          </p>
          <p className="text-gray-500 text-xs mb-6">
            Owner: {ownerAddress ? truncateAddress(ownerAddress as string, 10, 6) : '...'}
          </p>
          <Link to="/"><Button variant="secondary">Back to Dashboard</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="section-title text-2xl">Admin Panel</h1>
          <span className="badge bg-accent-500/15 text-accent-400 border border-accent-500/20">Owner</span>
        </div>
        <p className="text-gray-400 text-sm">
          Manage vesting schedules created by your wallet
        </p>
      </div>

      {/* Contract info */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-400 mb-1">Contract Address</p>
            <a
              href={`${SCAI_EXPLORER}/address/${ADDRESSES.TOKEN_VESTING_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary-400 hover:text-primary-300 transition-colors break-all"
            >
              {ADDRESSES.TOKEN_VESTING_ADDRESS}
            </a>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Your Address (Owner)</p>
            <p className="font-mono text-gray-300 break-all">{address}</p>
          </div>
        </div>
      </Card>

      {/* Loading */}
      {loadingIds && <PageSpinner message="Loading schedules..." />}

      {/* Empty */}
      {!loadingIds && createdIds && createdIds.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-sm mb-4">You haven't created any vesting schedules yet</p>
          <Link to="/create"><Button>Create Schedule</Button></Link>
        </Card>
      )}

      {/* Schedule grid */}
      {!loadingIds && createdIds && createdIds.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <CardHeader
              title="Created Schedules"
              subtitle={`${createdIds.length} schedule${createdIds.length !== 1 ? 's' : ''} created by you`}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
          </div>

          {/* Revoke warning */}
          <div className="mb-4 p-3 rounded-xl bg-danger-500/5 border border-danger-500/15 text-xs text-danger-400">
            ⚠️ Revoking a schedule is irreversible. Vested tokens will be sent to the beneficiary; unvested tokens return to you.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...createdIds].reverse().map((id) => (
              <AdminVestingItem key={id.toString()} scheduleId={id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
