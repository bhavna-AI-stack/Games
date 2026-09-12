import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { VestingCard } from '../components/vesting/VestingCard';
import { PageSpinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  useMyBeneficiarySchedules,
  useVestingSchedule,
  useTokenInfo,
} from '../hooks/useVesting';

/** Fetches and renders a single vesting card for the My Vestings list */
function BeneficiaryVestingItem({ scheduleId }: { scheduleId: bigint }) {
  const { data: schedule, isLoading } = useVestingSchedule(scheduleId);
  const { symbol, decimals } = useTokenInfo(schedule?.token);

  if (isLoading) return <div className="shimmer h-52 rounded-2xl" />;
  if (!schedule) return null;

  return (
    <VestingCard
      scheduleId={scheduleId}
      schedule={schedule}
      tokenSymbol={symbol ?? '???'}
      tokenDecimals={decimals ?? 18}
    />
  );
}

/**
 * My Vestings page — shows all vesting schedules where connected wallet is beneficiary.
 */
export default function MyVestings() {
  const { isConnected } = useAccount();
  const { data: scheduleIds, isLoading } = useMyBeneficiarySchedules();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-white font-semibold text-xl mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 text-sm mb-6">Connect your wallet to view your vesting schedules</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">My Vestings</h1>
          <p className="text-gray-400 text-sm mt-1">
            Schedules where you are the beneficiary
            {scheduleIds && (
              <span className="ml-2 badge bg-primary-500/15 text-primary-400 border border-primary-500/20">
                {scheduleIds.length} schedule{scheduleIds.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <Link to="/create">
          <Button size="sm">+ Create New</Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && <PageSpinner message="Loading your vesting schedules..." />}

      {/* Empty state */}
      {!isLoading && scheduleIds && scheduleIds.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">No vesting schedules found</h3>
          <p className="text-gray-400 text-sm mb-6">
            You don't have any active vesting schedules. Ask someone to create one for you, or create one yourself.
          </p>
          <Link to="/create">
            <Button>Create Vesting Schedule</Button>
          </Link>
        </Card>
      )}

      {/* Schedule grid */}
      {!isLoading && scheduleIds && scheduleIds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...scheduleIds].reverse().map((id) => (
            <BeneficiaryVestingItem key={id.toString()} scheduleId={id} />
          ))}
        </div>
      )}
    </div>
  );
}
