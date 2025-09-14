// src/modules/tokenization/tokenization-provider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
// Updated to Thirdweb SDK v5
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { PropertyTokenizer } from './property-tokenizer';
import { PropertyManager } from './property-manager';
import { PropertyMetadata, PropertyInvestment, VotingProposal } from './types';

interface TokenizationContextType {
  // Core services
  tokenizer: PropertyTokenizer | null;
  propertyManager: PropertyManager | null;

  // State
  properties: PropertyMetadata[];
  userInvestments: PropertyInvestment[];
  isLoading: boolean;
  error: string | null;

  // Property management
  registerProperty: (property: PropertyMetadata) => Promise<string>;
  tokenizeProperty: (
    propertyId: string,
    ownerAddress: string,
  ) => Promise<{ contractAddress: string; tokenId?: string }>;
  createFractionalOwnership: (
    propertyId: string,
    totalShares: number,
    pricePerShare: number,
    ownerAddress: string,
  ) => Promise<string>;

  // Investment functions
  investInProperty: (
    propertyId: string,
    contractAddress: string,
    shareAmount: number,
    paymentAmount: number,
  ) => Promise<PropertyInvestment>;
  getUserInvestments: (userAddress: string) => Promise<void>;

  // Property operations
  updatePropertyValuation: (
    propertyId: string,
    newValuation: number,
    currency: string,
    method: 'comparative' | 'income' | 'cost' | 'ai',
  ) => Promise<boolean>;
  getPropertyMetrics: (propertyId: string) => Promise<any>;

  // Governance
  createProposal: (
    propertyId: string,
    contractAddress: string,
    creator: string,
    proposal: any,
  ) => Promise<string>;
  voteOnProposal: (
    proposalId: string,
    voterAddress: string,
    choice: 'yes' | 'no' | 'abstain',
    votingPower: number,
    reason?: string,
  ) => Promise<boolean>;

  // Dividends
  distributeDividends: (
    contractAddress: string,
    totalAmount: number,
    currency: string,
  ) => Promise<boolean>;

  // Utility functions
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const TokenizationContext = createContext<TokenizationContextType | undefined>(
  undefined,
);

interface TokenizationProviderProps {
  children: ReactNode;
}

export function TokenizationProvider({ children }: TokenizationProviderProps) {
  // Thirdweb SDK v5 hooks
  const account = useActiveAccount();
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  });

  // State
  const [tokenizer, setTokenizer] = useState<PropertyTokenizer | null>(null);
  const [propertyManager, setPropertyManager] =
    useState<PropertyManager | null>(null);
  const [properties, setProperties] = useState<PropertyMetadata[]>([]);
  const [userInvestments, setUserInvestments] = useState<PropertyInvestment[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize services when client is ready
  useEffect(() => {
    if (client) {
      const tokenizerInstance = new PropertyTokenizer(
        process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
      );
      const managerInstance = new PropertyManager(tokenizerInstance);

      console.log('Tokenization services initialized with SDK v5');
      setTokenizer(tokenizerInstance);
      setPropertyManager(managerInstance);
    }
  }, [client]); // Load initial data
  useEffect(() => {
    if (propertyManager) {
      loadProperties();
    }
  }, [propertyManager]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/properties');
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (err) {
      setError('Failed to load properties');
    } finally {
      setIsLoading(false);
    }
  };

  const registerProperty = async (
    property: PropertyMetadata,
  ): Promise<string> => {
    if (!propertyManager) {
      throw new Error('Property manager not initialized');
    }

    try {
      setIsLoading(true);
      const propertyId = await propertyManager.registerProperty(property);

      // Refresh properties list
      await loadProperties();

      return propertyId;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to register property';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const tokenizeProperty = async (
    propertyId: string,
    ownerAddress: string,
  ): Promise<{ contractAddress: string; tokenId?: string }> => {
    if (!propertyManager) {
      throw new Error('Property manager not initialized');
    }

    try {
      setIsLoading(true);
      const result = await propertyManager.tokenizeProperty(
        propertyId,
        ownerAddress,
      );

      // Refresh data
      await loadProperties();

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to tokenize property';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createFractionalOwnership = async (
    propertyId: string,
    totalShares: number,
    pricePerShare: number,
    ownerAddress: string,
  ): Promise<string> => {
    if (!propertyManager) {
      throw new Error('Property manager not initialized');
    }

    try {
      setIsLoading(true);
      const contractAddress = await propertyManager.createFractionalOwnership(
        propertyId,
        totalShares,
        pricePerShare,
        ownerAddress,
      );

      // Refresh data
      await loadProperties();

      return contractAddress;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to create fractional ownership';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const investInProperty = async (
    propertyId: string,
    contractAddress: string,
    shareAmount: number,
    paymentAmount: number,
  ): Promise<PropertyInvestment> => {
    if (!propertyManager) {
      throw new Error('Property manager not initialized');
    }

    try {
      setIsLoading(true);
      const investment = await propertyManager.investInProperty(
        propertyId,
        contractAddress,
        'user-address', // This should come from wallet context
        shareAmount,
        paymentAmount,
        'USD',
      );

      return investment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Investment failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInvestments = async (userAddress: string): Promise<void> => {
    if (!propertyManager) {
      return;
    }

    try {
      setIsLoading(true);
      const investments = await propertyManager.getUserInvestments(userAddress);
      setUserInvestments(investments);
    } catch (err) {
      setError('Failed to load investments');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePropertyValuation = async (
    propertyId: string,
    newValuation: number,
    currency: string,
    method: 'comparative' | 'income' | 'cost' | 'ai',
  ): Promise<boolean> => {
    if (!propertyManager) {
      return false;
    }

    try {
      setIsLoading(true);
      const result = await propertyManager.updatePropertyValuation(
        propertyId,
        newValuation,
        currency,
        method,
      );

      if (result) {
        await loadProperties();
      }

      return result;
    } catch (err) {
      setError('Failed to update valuation');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyMetrics = async (propertyId: string) => {
    if (!propertyManager) {
      return null;
    }

    try {
      return await propertyManager.getPropertyMetrics(propertyId);
    } catch (err) {
      setError('Failed to get property metrics');
      return null;
    }
  };

  const createProposal = async (
    propertyId: string,
    contractAddress: string,
    creator: string,
    proposal: any,
  ): Promise<string> => {
    if (!propertyManager) {
      throw new Error('Property manager not initialized');
    }

    try {
      return await propertyManager.createProposal(
        propertyId,
        contractAddress,
        creator,
        proposal,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create proposal';
      setError(message);
      throw err;
    }
  };

  const voteOnProposal = async (
    proposalId: string,
    voterAddress: string,
    choice: 'yes' | 'no' | 'abstain',
    votingPower: number,
    reason?: string,
  ): Promise<boolean> => {
    if (!propertyManager) {
      return false;
    }

    try {
      return await propertyManager.voteOnProposal(
        proposalId,
        voterAddress,
        choice,
        votingPower,
        reason,
      );
    } catch (err) {
      setError('Failed to vote on proposal');
      return false;
    }
  };

  const distributeDividends = async (
    contractAddress: string,
    totalAmount: number,
    currency: string,
  ): Promise<boolean> => {
    if (!propertyManager) {
      return false;
    }

    try {
      return await propertyManager.distributeDividends(
        contractAddress,
        totalAmount,
        currency,
      );
    } catch (err) {
      setError('Failed to distribute dividends');
      return false;
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadProperties();
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: TokenizationContextType = {
    // Core services
    tokenizer,
    propertyManager,

    // State
    properties,
    userInvestments,
    isLoading,
    error,

    // Property management
    registerProperty,
    tokenizeProperty,
    createFractionalOwnership,

    // Investment functions
    investInProperty,
    getUserInvestments,

    // Property operations
    updatePropertyValuation,
    getPropertyMetrics,

    // Governance
    createProposal,
    voteOnProposal,

    // Dividends
    distributeDividends,

    // Utility functions
    refreshData,
    clearError,
  };

  return (
    <TokenizationContext.Provider value={value}>
      {children}
    </TokenizationContext.Provider>
  );
}

export function useTokenization(): TokenizationContextType {
  const context = useContext(TokenizationContext);
  if (context === undefined) {
    throw new Error(
      'useTokenization must be used within a TokenizationProvider',
    );
  }
  return context;
}

// Hook for property-specific operations
export function useProperty(propertyId: string) {
  const { properties, getPropertyMetrics, updatePropertyValuation } =
    useTokenization();

  const property = properties.find((p) => p.id === propertyId);

  const [metrics, setMetrics] = useState<any>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const loadMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const propertyMetrics = await getPropertyMetrics(propertyId);
      setMetrics(propertyMetrics);
    } catch (error) {
      console.error('Failed to load property metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      loadMetrics();
    }
  }, [propertyId]);

  return {
    property,
    metrics,
    isLoadingMetrics,
    updateValuation: updatePropertyValuation,
    refreshMetrics: loadMetrics,
  };
}

// Hook for investment operations
export function useInvestments(userAddress?: string) {
  const { userInvestments, getUserInvestments, investInProperty } =
    useTokenization();

  useEffect(() => {
    if (userAddress) {
      getUserInvestments(userAddress);
    }
  }, [userAddress, getUserInvestments]);

  return {
    investments: userInvestments,
    invest: investInProperty,
    refresh: () => userAddress && getUserInvestments(userAddress),
  };
}
