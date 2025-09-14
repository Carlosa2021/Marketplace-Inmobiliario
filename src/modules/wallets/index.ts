// src/modules/wallets/index.ts
export * from './types';
export * from './advanced-wallet-provider';
export * from './wallet-analytics';

// Re-export commonly used components
export {
  AdvancedWalletProvider,
  useAdvancedWallet,
  AdvancedConnectButton,
} from './advanced-wallet-provider';
export { WalletAnalyticsService } from './wallet-analytics';
