import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccount } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useCreateVesting } from '../hooks/useVesting';
import { useApproveToken, useTokenAllowance } from '../hooks/useTokenApproval';
import { useTokenInfo } from '../hooks/useVesting';
import { daysToSeconds } from '../utils/time';
import { ADDRESSES } from '../constants/addresses';

// ─── Zod validation schema ────────────────────────────────────
const schema = z.object({
  tokenAddress:       z.string().trim().refine(isAddress, { message: 'Invalid ERC-20 token address' }),
  beneficiaryAddress: z.string().trim().refine(isAddress, { message: 'Invalid beneficiary address' }),
  totalAmount:        z.string().min(1, 'Required').refine((v) => !isNaN(+v) && +v > 0, 'Must be > 0'),
  startDate:          z.string().min(1, 'Required'),
  cliffDays:          z.coerce.number().min(0, 'Min 0').max(3650, 'Max 10 years'),
  vestingDays:        z.coerce.number().min(1, 'Min 1 day').max(3650, 'Max 10 years'),
  revocable:          z.boolean(),
}).refine((d) => d.cliffDays <= d.vestingDays, {
  message: 'Cliff period cannot exceed vesting duration',
  path: ['cliffDays'],
});

type FormValues = z.infer<typeof schema>;

// ─── Step indicator ───────────────────────────────────────────
function StepBadge({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-white' : done ? 'text-success-400' : 'text-gray-500'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all
        ${done ? 'bg-success-500/20 border-success-500' : active ? 'bg-primary-500/20 border-primary-500' : 'bg-white/5 border-white/10'}`}
      >
        {done ? '✓' : step}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

/**
 * Create Vesting page.
 * Two-step flow: (1) Approve token → (2) Create vesting schedule.
 */
export default function CreateVesting() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: new Date().toISOString().split('T')[0],
      cliffDays: 30,
      vestingDays: 365,
      revocable: false,
    },
  });

  const watchedToken = (watch('tokenAddress') || '').trim() as `0x${string}` | undefined;
  const watchedAmount = (watch('totalAmount') || '').trim();

  const { symbol, decimals } = useTokenInfo(
    isAddress(watchedToken ?? '') ? (watchedToken as `0x${string}`) : undefined
  );
  const tokenDecimals = decimals ?? 18;
  const tokenSymbol = symbol ?? 'Tokens';

  // Allowance check
  const { data: allowance } = useTokenAllowance(
    isAddress(watchedToken ?? '') ? (watchedToken as `0x${string}`) : undefined,
    address
  );

  const requiredAmount =
    watchedAmount && !isNaN(+watchedAmount) && +watchedAmount > 0
      ? parseUnits(watchedAmount, tokenDecimals)
      : 0n;

  const isApproved = allowance !== undefined && allowance >= requiredAmount && requiredAmount > 0n;

  // Hooks
  const { approveToken, isPending: approving, isConfirming: approveConfirming, isSuccess: approveSuccess, error: errorApprove } = useApproveToken();
  const { writeCreateVesting, isPending: creating, isConfirming: createConfirming, isSuccess: createSuccess, error: errorCreate } = useCreateVesting();

  // After approval confirmed, move to step 2
  if (approveSuccess && step === 1) setStep(2);
  if (createSuccess) {
    setTimeout(() => navigate('/my-vestings'), 1500);
  }

  const handleApprove = () => {
    if (!watchedToken || !watchedAmount) return;
    approveToken(watchedToken as `0x${string}`, watchedAmount, tokenDecimals);
  };

  const onSubmit = (data: FormValues) => {
    const startTimestamp = BigInt(Math.floor(new Date(data.startDate).getTime() / 1000));
    writeCreateVesting({
      token:           data.tokenAddress as `0x${string}`,
      beneficiary:     data.beneficiaryAddress as `0x${string}`,
      totalAmount:     parseUnits(data.totalAmount, tokenDecimals),
      startTime:       startTimestamp,
      cliffDuration:   daysToSeconds(data.cliffDays),
      vestingDuration: daysToSeconds(data.vestingDays),
      revocable:       data.revocable,
    });
  };

  if (!isConnected) {
    return (
      <Card className="text-center py-16 max-w-md mx-auto">
        <p className="text-gray-400 mb-4">Connect your wallet to create a vesting schedule</p>
      </Card>
    );
  }

  if (!ADDRESSES.TOKEN_VESTING_ADDRESS) {
    return (
      <Card className="text-center py-16 max-w-md mx-auto">
        <p className="text-warning-400 font-medium">Contract not deployed yet</p>
        <p className="text-gray-400 text-sm mt-2">Deploy the contract first and update addresses.ts</p>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="section-title text-2xl mb-1">Create Vesting Schedule</h1>
        <p className="text-gray-400 text-sm">Lock ERC-20 tokens with a cliff period and linear unlocking</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-6 p-4 glass-card">
        <StepBadge step={1} label="Approve Token" active={step === 1 && !isApproved} done={isApproved || step === 2} />
        <div className="flex-1 h-px bg-white/10" />
        <StepBadge step={2} label="Create Schedule" active={step === 2 || isApproved} done={createSuccess} />
      </div>

      {/* Main form */}
      <Card>
        <CardHeader
          title={step === 1 ? 'Schedule Details' : 'Review & Create'}
          subtitle={step === 1 ? 'Fill in vesting parameters' : 'Confirm and create on-chain'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Token Address */}
          <div>
            <Input
              label="ERC-20 Token Address"
              placeholder="0x..."
              hint={symbol ? `Token detected: ${symbol}` : 'Enter the ERC-20 contract address to vest'}
              error={errors.tokenAddress?.message}
              {...register('tokenAddress')}
            />
          </div>

          {/* Beneficiary */}
          <Input
            label="Beneficiary Address"
            placeholder="0x... (who receives the tokens)"
            error={errors.beneficiaryAddress?.message}
            hint="The wallet address that will be able to claim vested tokens"
            {...register('beneficiaryAddress')}
          />

          {/* Amount */}
          <Input
            label={`Total Amount ${symbol ? `(${symbol})` : ''}`}
            type="number"
            step="any"
            placeholder="e.g. 1000"
            hint="You must have approved at least this amount to the contract"
            error={errors.totalAmount?.message}
            suffix={symbol ? <span className="text-xs font-mono text-primary-400">{symbol}</span> : undefined}
            {...register('totalAmount')}
          />

          {/* Start Date */}
          <Input
            label="Start Date"
            type="date"
            error={errors.startDate?.message}
            hint="When the vesting period begins (can be a future date)"
            {...register('startDate')}
          />

          {/* Cliff & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Cliff Period (days)"
              type="number"
              placeholder="30"
              hint="No tokens release before this"
              error={errors.cliffDays?.message}
              {...register('cliffDays')}
            />
            <Input
              label="Vesting Duration (days)"
              type="number"
              placeholder="365"
              hint="Total linear vesting period"
              error={errors.vestingDays?.message}
              {...register('vestingDays')}
            />
          </div>

          {/* Revocable toggle */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/8">
            <input
              type="checkbox"
              id="revocable"
              className="mt-0.5 w-4 h-4 accent-primary-500 cursor-pointer"
              {...register('revocable')}
            />
            <div>
              <label htmlFor="revocable" className="text-sm font-medium text-white cursor-pointer">
                Revocable
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Allow the contract owner to cancel this schedule and return unvested tokens to you
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-3">
            {/* Display Errors */}
            {(errorApprove || errorCreate) && (
              <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs break-all">
                Error: {((errorApprove || errorCreate) as any)?.shortMessage ?? (errorApprove || errorCreate)?.message}
              </div>
            )}

            {/* Step 1: Approve */}
            {!isApproved && (
              <Button
                type="button"
                fullWidth
                loading={approving || approveConfirming}
                onClick={handleApprove}
                disabled={!watchedToken || !watchedAmount || requiredAmount === 0n}
              >
                {approveConfirming ? 'Confirming Approval...' : 'Step 1 – Approve Token Transfer'}
              </Button>
            )}

            {/* Step 2: Create */}
            <Button
              type="submit"
              fullWidth
              loading={creating || createConfirming}
              disabled={!isApproved}
              variant={isApproved ? 'primary' : 'secondary'}
            >
              {createSuccess
                ? '✓ Schedule Created! Redirecting...'
                : createConfirming
                ? 'Confirming...'
                : 'Step 2 – Create Vesting Schedule'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Info box */}
      <div className="glass-card p-4 border-primary-500/10 bg-primary-500/5">
        <p className="text-primary-400 text-xs font-medium mb-2">How it works</p>
        <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
          <li>Approve the vesting contract to spend your tokens (one-time per token)</li>
          <li>Create the vesting schedule — tokens are locked in the contract</li>
          <li>The beneficiary can call Release after the cliff period</li>
          <li>Tokens unlock linearly from cliff end to vesting end</li>
        </ol>
      </div>
    </div>
  );
}
