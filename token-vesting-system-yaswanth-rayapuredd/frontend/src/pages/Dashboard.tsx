import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { StatsCard } from '../components/vesting/StatsCard';
import { VestingCard } from '../components/vesting/VestingCard';
import { PageSpinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  useTotalSchedules,
  useMyBeneficiarySchedules,
  useMyCreatedSchedules,
  useVestingSchedule,
  useTokenInfo,
} from '../hooks/useVesting';
import { ADDRESSES } from '../constants/addresses';

/** Mini schedule card that fetches its own data */
function RecentScheduleItem({ scheduleId }: { scheduleId: bigint }) {
  const { data: schedule, isLoading } = useVestingSchedule(scheduleId);
  const { symbol, decimals } = useTokenInfo(schedule?.token);

  if (isLoading || !schedule) return (
    <div className="shimmer h-40 rounded-xl" />
  );

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
 * Dashboard page — shows global stats, quick links, and recent vestings.
 */
export default function Dashboard() {
  const { isConnected } = useAccount();
  const { data: totalSchedules, isLoading: loadingTotal } = useTotalSchedules();
  const { data: myBeneficiary, isLoading: loadingBenef } = useMyBeneficiarySchedules();
  const { data: myCreated, isLoading: loadingCreated } = useMyCreatedSchedules();

  const contractDeployed = !!ADDRESSES.TOKEN_VESTING_ADDRESS;

  // Show 3 most recent schedules (last 3 IDs)
  const recentIds: bigint[] = [];
  if (totalSchedules && totalSchedules > 0n) {
    const max = totalSchedules;
    for (let i = max; i > max - 3n && i > 0n; i--) {
      recentIds.push(i);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero section */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
          Live on SCAI Mainnet
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
          Token <span className="gradient-text">Vesting</span> DApp
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Create trustless ERC-20 token vesting schedules with cliff periods and linear unlocking — fully on-chain.
        </p>
        {!isConnected && (
          <div className="mt-6 flex justify-center">
            <ConnectButton label="Connect Wallet to Get Started" />
          </div>
        )}
      </div>

      {/* Contract not deployed warning */}
      {!contractDeployed && (
        <div className="glass-card p-4 border-warning-500/30 bg-warning-500/5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-warning-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-warning-400 font-medium text-sm">Contract Not Deployed</p>
              <p className="text-gray-400 text-xs mt-0.5">
                Deploy the contract and add the address to{' '}
                <code className="font-mono bg-white/5 px-1 rounded">frontend/src/constants/addresses.ts</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Schedules"
          value={loadingTotal ? '...' : (totalSchedules ?? 0n).toString()}
          subtitle="On-chain vesting schedules"
          color="purple"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="My Vestings"
          value={loadingBenef ? '...' : (myBeneficiary?.length ?? 0).toString()}
          subtitle="Where you are beneficiary"
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <StatsCard
          title="Created By Me"
          value={loadingCreated ? '...' : (myCreated?.length ?? 0).toString()}
          subtitle="Schedules you funded"
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        <StatsCard
          title="Network"
          value="SCAI"
          subtitle="Chain ID: 34"
          color="orange"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="flex items-center gap-4 p-5 glass-card-hover">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center text-primary-400 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Create Vesting Schedule</p>
              <p className="text-gray-400 text-xs mt-0.5">Lock tokens with cliff + linear vesting</p>
            </div>
            <Link to="/create">
              <Button size="sm">Create</Button>
            </Link>
          </Card>

          <Card className="flex items-center gap-4 p-5 glass-card-hover">
            <div className="w-12 h-12 rounded-2xl bg-success-500/15 flex items-center justify-center text-success-400 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">My Vestings</p>
              <p className="text-gray-400 text-xs mt-0.5">View and claim your vested tokens</p>
            </div>
            <Link to="/my-vestings">
              <Button size="sm" variant="secondary">View</Button>
            </Link>
          </Card>
        </div>
      )}

      {/* Recent Schedules */}
      {recentIds.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-xl">Recent Schedules</h2>
            <Link to="/my-vestings" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentIds.map((id) => (
              <RecentScheduleItem key={id.toString()} scheduleId={id} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {contractDeployed && totalSchedules === 0n && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">No vesting schedules yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create the first vesting schedule on SCAI Mainnet</p>
          <Link to="/create">
            <Button>Create First Schedule</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
