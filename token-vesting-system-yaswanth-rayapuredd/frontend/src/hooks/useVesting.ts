import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { TOKEN_VESTING_ABI, ERC20_ABI } from '../contracts/abi';
import { ADDRESSES } from '../constants/addresses';
import type { VestingSchedule } from '../types/vesting';

const CONTRACT_ADDRESS = ADDRESSES.TOKEN_VESTING_ADDRESS;

/**
 * Hook to read total number of vesting schedules (for Dashboard stats).
 */
export function useTotalSchedules() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TOKEN_VESTING_ABI,
    functionName: 'getTotalSchedules',
    query: { enabled: !!CONTRACT_ADDRESS },
  });
}

/**
 * Hook to fetch all schedule IDs where the connected wallet is the beneficiary.
 */
export function useMyBeneficiarySchedules() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TOKEN_VESTING_ABI,
    functionName: 'getSchedulesByBeneficiary',
    args: address ? [address] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && !!address },
  });
}

/**
 * Hook to fetch all schedule IDs created by the connected wallet.
 */
export function useMyCreatedSchedules() {
  const { address } = useAccount();
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TOKEN_VESTING_ABI,
    functionName: 'getSchedulesByCreator',
    args: address ? [address] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && !!address },
  });
}

/**
 * Hook to fetch a single vesting schedule by ID.
 * @param scheduleId - The on-chain schedule ID
 */
export function useVestingSchedule(scheduleId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TOKEN_VESTING_ABI,
    functionName: 'getVestingSchedule',
    args: scheduleId !== undefined ? [scheduleId] : undefined,
    query: { enabled: !!CONTRACT_ADDRESS && scheduleId !== undefined },
  }) as { data: VestingSchedule | undefined; isLoading: boolean; error: Error | null; refetch: () => void };
}

/**
 * Hook to compute releasable tokens for a schedule (live, from contract).
 * @param scheduleId - The schedule ID
 */
export function useComputeReleasable(scheduleId: bigint | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: TOKEN_VESTING_ABI,
    functionName: 'computeReleasable',
    args: scheduleId !== undefined ? [scheduleId] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESS && scheduleId !== undefined,
      refetchInterval: 15_000, // refresh every 15 seconds
    },
  });
}

/**
 * Hook to release vested tokens for a schedule.
 * Returns writeRelease(), isPending, isSuccess, and the tx hash.
 */
export function useReleaseTokens() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const writeRelease = (scheduleId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: TOKEN_VESTING_ABI,
      functionName: 'release',
      args: [scheduleId],
    });
  };

  return { writeRelease, hash, isPending, isConfirming, isSuccess, error };
}

/**
 * Hook to revoke a vesting schedule (owner only).
 */
export function useRevokeSchedule() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const writeRevoke = (scheduleId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: TOKEN_VESTING_ABI,
      functionName: 'revoke',
      args: [scheduleId],
    });
  };

  return { writeRevoke, hash, isPending, isConfirming, isSuccess, error };
}

/**
 * Hook to create a new vesting schedule.
 */
export function useCreateVesting() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const writeCreateVesting = (params: {
    token: `0x${string}`;
    beneficiary: `0x${string}`;
    totalAmount: bigint;
    startTime: bigint;
    cliffDuration: bigint;
    vestingDuration: bigint;
    revocable: boolean;
  }) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: TOKEN_VESTING_ABI,
      functionName: 'createVesting',
      args: [
        params.token,
        params.beneficiary,
        params.totalAmount,
        params.startTime,
        params.cliffDuration,
        params.vestingDuration,
        params.revocable,
      ],
    });
  };

  return { writeCreateVesting, hash, isPending, isConfirming, isSuccess, error };
}

/**
 * Hook to get token info (symbol, decimals) for any ERC-20 address.
 */
export function useTokenInfo(tokenAddress: `0x${string}` | undefined) {
  const symbol = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: { enabled: !!tokenAddress },
  });
  const decimals = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: !!tokenAddress },
  });
  return { symbol: symbol.data, decimals: decimals.data, isLoading: symbol.isLoading || decimals.isLoading };
}
