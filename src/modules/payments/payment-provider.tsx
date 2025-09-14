// src/modules/payments/payment-provider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
// NOTE: Temporarily disabled due to @thirdweb-dev/react migration
// import { useAddress } from '@thirdweb-dev/react';
import { useActiveAccount } from 'thirdweb/react';
import { PaymentProcessor } from './payment-processor';
import {
  PaymentRequest,
  PaymentMethod,
  CryptoPaymentMethod,
  FiatPaymentMethod,
  PaymentAnalytics,
  ConversionRate,
  PaymentConfiguration,
} from './types';

interface PaymentContextType {
  // Core services
  processor: PaymentProcessor | null;

  // State
  availablePaymentMethods: {
    crypto: CryptoPaymentMethod[];
    fiat: FiatPaymentMethod[];
  };
  paymentHistory: PaymentRequest[];
  analytics: PaymentAnalytics | null;
  conversionRates: Map<string, ConversionRate>;
  isLoading: boolean;
  error: string | null;

  // Payment operations
  createPayment: (
    propertyId: string,
    amount: number,
    currency: string,
    method: PaymentMethod,
  ) => Promise<PaymentRequest>;
  processPayment: (paymentId: string) => Promise<boolean>;
  cancelPayment: (paymentId: string) => Promise<boolean>;
  refundPayment: (paymentId: string, reason: string) => Promise<boolean>;

  // Conversion operations
  convertCurrency: (
    from: string,
    to: string,
    amount: number,
  ) => Promise<boolean>;
  getConversionQuote: (
    from: string,
    to: string,
    amount: number,
  ) => Promise<any>;

  // Analytics
  getUserAnalytics: () => Promise<void>;
  getPaymentHistory: () => Promise<void>;

  // Configuration
  updatePaymentMethods: () => Promise<void>;
  getConfiguration: () => PaymentConfiguration;

  // Utility
  refreshData: () => Promise<void>;
  clearError: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export function PaymentProvider({ children }: PaymentProviderProps) {
  // Wallet connection
  const account = useActiveAccount();
  const address = account?.address;

  // Core services
  const [processor, setProcessor] = useState<PaymentProcessor | null>(null);

  // State
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<{
    crypto: CryptoPaymentMethod[];
    fiat: FiatPaymentMethod[];
  }>({
    crypto: [],
    fiat: [],
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentRequest[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [conversionRates, setConversionRates] = useState<
    Map<string, ConversionRate>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration
  const configuration: PaymentConfiguration = {
    supportedChains: [1, 137, 8453, 42161], // Ethereum, Polygon, Base, Arbitrum
    supportedTokens: [],
    gaslessEnabled: true,
    gaslessTokens: ['USDC', 'USDT', 'DAI'],
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    supportedCountries: ['US', 'CA', 'GB', 'DE', 'FR', 'AU'],
    fiatProcessors: [],
    platformFeePercentage: 2.5,
    conversionSlippage: 0.5,
    paymentExpiration: 30,
    automaticConversion: true,
    maxPaymentAmount: 1000000,
    minPaymentAmount: 10,
    dailyLimit: 50000,
    monthlyLimit: 500000,
    requireKYC: true,
  };

  // Initialize processor
  useEffect(() => {
    const processorInstance = new PaymentProcessor(configuration);
    setProcessor(processorInstance);
  }, []);

  // Load initial data
  useEffect(() => {
    if (processor && address) {
      loadInitialData();
    }
  }, [processor, address]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        updatePaymentMethods(),
        getUserAnalytics(),
        getPaymentHistory(),
      ]);
    } catch (err) {
      setError('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const createPayment = async (
    propertyId: string,
    amount: number,
    currency: string,
    method: PaymentMethod,
  ): Promise<PaymentRequest> => {
    if (!processor || !address) {
      throw new Error(
        'Payment processor not initialized or wallet not connected',
      );
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await processor.createPaymentRequest(
        propertyId,
        address,
        amount,
        currency,
        method,
      );

      if (!result.success || !result.paymentRequest) {
        throw new Error(result.error || 'Payment creation failed');
      }

      // Update payment history
      setPaymentHistory((prev) => [result.paymentRequest!, ...prev]);

      // Redirect to payment session if needed
      if (result.session?.checkoutUrl) {
        window.open(result.session.checkoutUrl, '_blank');
      } else if (result.session?.redirectUrl) {
        window.location.href = result.session.redirectUrl;
      }

      return result.paymentRequest;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Payment creation failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (paymentId: string): Promise<boolean> => {
    if (!processor) {
      throw new Error('Payment processor not initialized');
    }

    try {
      setIsLoading(true);
      const success = await processor.updatePaymentStatus(
        paymentId,
        'processing',
      );

      if (success) {
        // Update local state
        setPaymentHistory((prev) =>
          prev.map((payment) =>
            payment.id === paymentId
              ? { ...payment, status: 'processing' }
              : payment,
          ),
        );
      }

      return success;
    } catch (err) {
      setError('Failed to process payment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelPayment = async (paymentId: string): Promise<boolean> => {
    if (!processor) {
      return false;
    }

    try {
      setIsLoading(true);
      const success = await processor.updatePaymentStatus(
        paymentId,
        'cancelled',
      );

      if (success) {
        setPaymentHistory((prev) =>
          prev.map((payment) =>
            payment.id === paymentId
              ? { ...payment, status: 'cancelled' }
              : payment,
          ),
        );
      }

      return success;
    } catch (err) {
      setError('Failed to cancel payment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refundPayment = async (
    paymentId: string,
    reason: string,
  ): Promise<boolean> => {
    if (!processor) {
      return false;
    }

    try {
      setIsLoading(true);

      // Call refund API
      const response = await fetch(`/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Refund request failed');
      }

      const success = await processor.updatePaymentStatus(
        paymentId,
        'refunded',
      );

      if (success) {
        setPaymentHistory((prev) =>
          prev.map((payment) =>
            payment.id === paymentId
              ? { ...payment, status: 'refunded' }
              : payment,
          ),
        );
      }

      return success;
    } catch (err) {
      setError('Failed to process refund');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const convertCurrency = async (
    from: string,
    to: string,
    amount: number,
  ): Promise<boolean> => {
    if (!processor || !address) {
      return false;
    }

    try {
      setIsLoading(true);
      const conversion = await processor.convertCurrency(
        from,
        to,
        amount,
        address,
      );

      // Update conversion rates
      const rate = await processor.getConversionRate(from, to);
      if (rate) {
        setConversionRates((prev) => new Map(prev.set(`${from}_${to}`, rate)));
      }

      return conversion.status === 'completed';
    } catch (err) {
      setError('Currency conversion failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getConversionQuote = async (
    from: string,
    to: string,
    amount: number,
  ) => {
    if (!processor) {
      return null;
    }

    try {
      const rate = await processor.getConversionRate(from, to);
      if (!rate) {
        return null;
      }

      const convertedAmount = amount * rate.rate;
      const fees = processor['calculateFees'](amount, {
        fees: { platform: 2.5, total: 2.5 },
      } as PaymentMethod);

      return {
        fromAmount: amount,
        toAmount: convertedAmount,
        rate: rate.rate,
        fees,
        estimatedTime: '2-5 minutes',
        validUntil: rate.validUntil,
      };
    } catch (err) {
      setError('Failed to get conversion quote');
      return null;
    }
  };

  const getUserAnalytics = async (): Promise<void> => {
    if (!address) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/analytics/${address}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const getPaymentHistory = async (): Promise<void> => {
    if (!address) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/history/${address}`);
      const data = await response.json();

      if (data.success) {
        setPaymentHistory(data.payments);
      }
    } catch (err) {
      console.error('Failed to load payment history:', err);
    }
  };

  const updatePaymentMethods = async (): Promise<void> => {
    try {
      const response = await fetch('/api/payments/methods');
      const data = await response.json();

      if (data.success) {
        setAvailablePaymentMethods(data.methods);
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    }
  };

  const getConfiguration = (): PaymentConfiguration => {
    return configuration;
  };

  const refreshData = async (): Promise<void> => {
    await loadInitialData();
  };

  const clearError = (): void => {
    setError(null);
  };

  const value: PaymentContextType = {
    // Core services
    processor,

    // State
    availablePaymentMethods,
    paymentHistory,
    analytics,
    conversionRates,
    isLoading,
    error,

    // Payment operations
    createPayment,
    processPayment,
    cancelPayment,
    refundPayment,

    // Conversion operations
    convertCurrency,
    getConversionQuote,

    // Analytics
    getUserAnalytics,
    getPaymentHistory,

    // Configuration
    updatePaymentMethods,
    getConfiguration,

    // Utility
    refreshData,
    clearError,
  };

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

export function usePayments(): PaymentContextType {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
}

// Specialized hooks

export function usePaymentMethods() {
  const { availablePaymentMethods, updatePaymentMethods } = usePayments();

  return {
    methods: availablePaymentMethods,
    refresh: updatePaymentMethods,
  };
}

export function usePaymentHistory(limit?: number) {
  const { paymentHistory, getPaymentHistory } = usePayments();

  const limitedHistory = limit
    ? paymentHistory.slice(0, limit)
    : paymentHistory;

  return {
    payments: limitedHistory,
    refresh: getPaymentHistory,
  };
}

export function useConversion() {
  const { convertCurrency, getConversionQuote, conversionRates } =
    usePayments();

  return {
    convert: convertCurrency,
    getQuote: getConversionQuote,
    rates: conversionRates,
  };
}
