import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { scaiMainnet } from './constants/chains';

/** WalletConnect Project ID from https://cloud.walletconnect.com */
const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '45828494bf9d888dfb4e95caab7eb5fb';

/**
 * Wagmi + RainbowKit configuration using getDefaultConfig (v2 API).
 * - Supports SCAI Mainnet (Chain ID 34)
 * - MetaMask and WalletConnect connectors auto-included by RainbowKit
 * - Provider order in main.tsx: WagmiProvider → QueryClientProvider → RainbowKitProvider
 */
export const wagmiConfig = getDefaultConfig({
  appName: 'Token Vesting DApp',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [scaiMainnet],
  transports: {
    [scaiMainnet.id]: http('https://mainnet-rpc.scai.network'),
  },
  ssr: false,
});
