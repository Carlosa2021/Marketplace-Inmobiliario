// src/modules/wallets/types.ts
export interface WalletUser {
  id: string;
  address: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  socialAccounts: {
    google?: string;
    apple?: string;
    telegram?: string;
  };
  preferences: {
    gasless: boolean;
    autoSign: boolean;
    notifications: boolean;
  };
  metadata: {
    createdAt: string;
    lastLoginAt: string;
    loginMethod: 'email' | 'social' | 'wallet';
  };
}

export interface WalletConfig {
  supportedChains: number[];
  gasless: boolean;
  socialLogins: string[];
  customAuth: boolean;
  sessionKeys: boolean;
  autoConnect: boolean;
}

export interface SmartWalletSession {
  sessionKey: string;
  permissions: Permission[];
  expiresAt: number;
  maxGasLimit: string;
  allowedContracts: string[];
}

export interface Permission {
  target: string; // contract address
  selector: string; // function selector
  maxValuePerUse: string;
  validAfter: number;
  validUntil: number;
}

export interface WalletAnalytics {
  userId: string;
  totalTransactions: number;
  totalVolume: string;
  averageGasUsed: string;
  chainUsage: Record<number, number>;
  lastActivity: string;
}
