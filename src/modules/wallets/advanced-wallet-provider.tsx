// src/modules/wallets/advanced-wallet-provider.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { createThirdwebClient } from 'thirdweb';
import { useActiveAccount, useConnect } from 'thirdweb/react';
import { polygon, ethereum, base, arbitrum } from 'thirdweb/chains';
import {
  WalletUser,
  WalletConfig,
  SmartWalletSession,
  Permission,
} from './types';
import { inAppWallet, createWallet, Wallet } from 'thirdweb/wallets';
import { useDisconnect } from 'thirdweb/react';

interface AdvancedWalletContextType {
  user: WalletUser | null;
  isConnected: boolean;
  isGasless: boolean;
  sessionKey: string | null;
  connect: (method: 'email' | 'social' | 'wallet') => Promise<void>;
  disconnect: () => Promise<void>;
  enableGasless: () => Promise<void>;
  createSession: (permissions: Permission[]) => Promise<SmartWalletSession>;
  executeGasless: (transaction: unknown) => Promise<string>;
  updatePreferences: (
    preferences: Partial<WalletUser['preferences']>,
  ) => Promise<void>;
}

const AdvancedWalletContext = createContext<AdvancedWalletContextType | null>(
  null,
);

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const supportedChains = [polygon, ethereum, base, arbitrum];

const walletConfig: WalletConfig = {
  supportedChains: supportedChains.map((chain) => chain.id),
  gasless: true,
  socialLogins: ['google', 'apple', 'telegram'],
  customAuth: true,
  sessionKeys: true,
  autoConnect: true,
};

export function AdvancedWalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WalletUser | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [isGasless, setIsGasless] = useState(false);

  const account = useActiveAccount();
  const { connect: thirdwebConnect } = useConnect();
  const { disconnect: thirdwebDisconnect } = useDisconnect();

  const isConnected = !!account;

  // Auto-connect on mount if previously connected
  useEffect(() => {
    if (walletConfig.autoConnect) {
      autoConnectWallet();
    }
  }, []);

  // Load user data when account changes
  useEffect(() => {
    if (account) {
      loadUserData(account.address);
    } else {
      setUser(null);
      setSessionKey(null);
    }
  }, [account]);

  const autoConnectWallet = async () => {
    try {
      const lastWallet = localStorage.getItem('lastWalletType');
      if (lastWallet === 'inApp') {
        const wallet = inAppWallet();
        await thirdwebConnect(wallet);
      }
    } catch (error) {
      console.log('Auto-connect failed:', error);
    }
  };

  const loadUserData = async (address: string) => {
    try {
      // Load from your backend API
      const response = await fetch(`/api/users/${address}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsGasless(userData.preferences?.gasless || false);
      } else {
        // Create new user
        await createNewUser(address);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const createNewUser = async (address: string) => {
    const newUser: WalletUser = {
      id: address,
      address,
      isVerified: false,
      kycStatus: 'pending',
      socialAccounts: {},
      preferences: {
        gasless: true,
        autoSign: false,
        notifications: true,
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginMethod: 'wallet',
      },
    };

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      setUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const connect = async (method: 'email' | 'social' | 'wallet') => {
    try {
      let wallet;

      switch (method) {
        case 'email':
          wallet = inAppWallet({
            auth: {
              options: ['email', 'google', 'apple'],
            },
          });
          localStorage.setItem('lastWalletType', 'inApp');
          break;

        case 'social':
          wallet = inAppWallet({
            auth: {
              options: ['google', 'apple'],
            },
          });
          localStorage.setItem('lastWalletType', 'inApp');
          break;

        case 'wallet':
          wallet = createWallet('io.metamask');
          localStorage.setItem('lastWalletType', 'external');
          break;

        default:
          throw new Error('Invalid connection method');
      }

      await thirdwebConnect(wallet);
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      thirdwebDisconnect();
      setUser(null);
      setSessionKey(null);
      setIsGasless(false);
      localStorage.removeItem('lastWalletType');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const enableGasless = async () => {
    try {
      if (!account) throw new Error('No account connected');

      // Create smart account with gasless transactions
      // This would integrate with Thirdweb's Account Abstraction
      setIsGasless(true);

      if (user) {
        await updatePreferences({ gasless: true });
      }
    } catch (error) {
      console.error('Failed to enable gasless:', error);
      throw error;
    }
  };

  const createSession = async (
    permissions: Permission[],
  ): Promise<SmartWalletSession> => {
    try {
      if (!account) throw new Error('No account connected');

      // Create session key with permissions
      const session: SmartWalletSession = {
        sessionKey: `session_${Date.now()}`,
        permissions,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        maxGasLimit: '1000000',
        allowedContracts: [],
      };

      setSessionKey(session.sessionKey);
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  const executeGasless = async (transaction: unknown): Promise<string> => {
    try {
      if (!isGasless) throw new Error('Gasless not enabled');
      if (!account) throw new Error('No account connected');

      // Execute gasless transaction using session key
      // This would integrate with Thirdweb's Account Abstraction
      console.log('Executing gasless transaction:', transaction);

      return 'transaction_hash_placeholder';
    } catch (error) {
      console.error('Gasless execution failed:', error);
      throw error;
    }
  };

  const updatePreferences = async (
    preferences: Partial<WalletUser['preferences']>,
  ) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedUser = {
        ...user,
        preferences: { ...user.preferences, ...preferences },
      };

      await fetch(`/api/users/${user.address}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedUser.preferences }),
      });

      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  const value: AdvancedWalletContextType = {
    user,
    isConnected,
    isGasless,
    sessionKey,
    connect,
    disconnect,
    enableGasless,
    createSession,
    executeGasless,
    updatePreferences,
  };

  return (
    <AdvancedWalletContext.Provider value={value}>
      {children}
    </AdvancedWalletContext.Provider>
  );
}

export function useAdvancedWallet() {
  const context = useContext(AdvancedWalletContext);
  if (!context) {
    throw new Error(
      'useAdvancedWallet must be used within AdvancedWalletProvider',
    );
  }
  return context;
}

// Advanced Connect Button Component
interface AdvancedConnectButtonProps {
  theme?: 'light' | 'dark';
}

export function AdvancedConnectButton({ theme }: AdvancedConnectButtonProps) {
  const { connect, disconnect, isConnected, user, isGasless } =
    useAdvancedWallet();

  const isDark = theme === 'dark';

  if (isConnected && user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span
            className={`text-sm font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {user.email ||
              `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isGasless && <span className="text-green-500">⚡ Gasless</span>}
            {user.isVerified && (
              <span className="text-blue-500">✓ Verified</span>
            )}
          </div>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => connect('email')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isDark
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        Email
      </button>
      <button
        onClick={() => connect('social')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isDark
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        Social
      </button>
      <button
        onClick={() => connect('wallet')}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isDark
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-purple-500 hover:bg-purple-600 text-white'
        }`}
      >
        Wallet
      </button>
    </div>
  );
}
