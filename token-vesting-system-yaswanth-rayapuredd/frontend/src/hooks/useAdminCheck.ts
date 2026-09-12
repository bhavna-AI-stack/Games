import { useReadContract, useAccount } from 'wagmi';
import { TOKEN_VESTING_ABI } from '../contracts/abi';
import { ADDRESSES } from '../constants/addresses';

/**
 * Hook to check if the connected wallet is the owner of the TokenVesting contract.
 * Used to show/hide the Admin Panel and revoke buttons.
 *
 * @returns { isOwner, isLoading, ownerAddress }
 */
export function useAdminCheck() {
  const { address } = useAccount();

  const { data: ownerAddress, isLoading } = useReadContract({
    address: ADDRESSES.TOKEN_VESTING_ADDRESS,
    abi: TOKEN_VESTING_ABI,
    functionName: 'owner',
    query: { enabled: !!ADDRESSES.TOKEN_VESTING_ADDRESS },
  });

  const isOwner =
    !!address &&
    !!ownerAddress &&
    address.toLowerCase() === (ownerAddress as string).toLowerCase();

  return { isOwner, isLoading, ownerAddress };
}
