import { defineChain } from 'viem';

/**
 * SCAI Mainnet chain definition for use with Wagmi v2 and RainbowKit.
 * Chain ID: 34
 * @see https://securechain.ai
 */
export const scaiMainnet = defineChain({
  id: 34,
  name: 'SCAI Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'SCAI',
    symbol: 'SCAI',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.scai.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'SecureChain Explorer',
      url: 'https://explorer.securechain.ai',
    },
  },
  testnet: false,
});
