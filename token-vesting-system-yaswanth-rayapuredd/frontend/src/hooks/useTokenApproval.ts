import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ERC20_ABI } from '../contracts/abi';
import { ADDRESSES } from '../constants/addresses';

/**
 * Hook to check the token allowance a user has granted to the vesting contract.
 * @param tokenAddress - ERC-20 token address
 * @param ownerAddress - Wallet address to check allowance for
 */
export function useTokenAllowance(
  tokenAddress: `0x${string}` | undefined,
  ownerAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args:
      ownerAddress && tokenAddress
        ? [ownerAddress, ADDRESSES.TOKEN_VESTING_ADDRESS]
        : undefined,
    query: {
      enabled: !!tokenAddress && !!ownerAddress && !!ADDRESSES.TOKEN_VESTING_ADDRESS,
      refetchInterval: 5_000,
    },
  });
}

/**
 * Hook to approve the vesting contract to spend ERC-20 tokens.
 * Step 1 in the "create vesting" 2-step flow (approve → createVesting).
 */
export function useApproveToken() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  /**
   * Approves the TokenVesting contract to spend `amount` of `token`.
   * @param tokenAddress - ERC-20 token contract address
   * @param amount - Human-readable amount (e.g. "1000")
   * @param decimals - Token decimals
   */
  const approveToken = (
    tokenAddress: `0x${string}`,
    amount: string,
    decimals: number
  ) => {
    const rawAmount = parseUnits(amount, decimals);
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ADDRESSES.TOKEN_VESTING_ADDRESS, rawAmount],
    });
  };

  return { approveToken, hash, isPending, isConfirming, isSuccess, error };
}

/**
 * Returns true if the allowance is sufficient for the given amount.
 * @param allowance - Current allowance (bigint)
 * @param requiredAmount - Required amount in base units (bigint)
 */
export function isAllowanceSufficient(
  allowance: bigint | undefined,
  requiredAmount: bigint
): boolean {
  if (allowance === undefined) return false;
  return allowance >= requiredAmount;
}
