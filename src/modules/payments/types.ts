// src/modules/payments/types.ts
export interface PaymentMethod {
  id: string;
  type: 'crypto' | 'fiat';
  name: string;
  symbol: string;
  icon?: string;
  enabled: boolean;
  fees: PaymentFees;
  processingTime: string;
  supported_chains?: string[];
}

export interface PaymentFees {
  platform: number; // percentage
  gas?: number; // for crypto
  processing?: number; // for fiat (fixed amount)
  total: number;
}

export interface CryptoPaymentMethod extends PaymentMethod {
  type: 'crypto';
  tokenAddress?: string;
  chainId: number;
  decimals: number;
  minAmount: number;
  maxAmount: number;
  gasless: boolean;
}

export interface FiatPaymentMethod extends PaymentMethod {
  type: 'fiat';
  currency: string;
  countrySupport: string[];
  minAmount: number;
  maxAmount: number;
  processor: 'stripe' | 'thirdweb' | 'other';
}

export interface PaymentRequest {
  id: string;
  propertyId: string;
  investorAddress: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  expiresAt: string;
  metadata: PaymentMetadata;
}

export interface PaymentMetadata {
  propertyName?: string;
  tokenAmount?: number;
  sharePercentage?: number;
  pricePerToken?: number;
  conversionRate?: number;
  originalCurrency?: string;
  finalCurrency?: string;
  fees: PaymentFees;
  receipts: PaymentReceipt[];
}

export interface PaymentReceipt {
  id: string;
  type: 'payment' | 'refund' | 'fee';
  amount: number;
  currency: string;
  txHash?: string;
  paymentId?: string;
  createdAt: string;
  pdfUrl?: string;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'expired';

export interface PaymentSession {
  id: string;
  paymentRequestId: string;
  checkoutUrl?: string;
  redirectUrl?: string;
  webhookData?: any;
  expiresAt: string;
  status: PaymentStatus;
}

export interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  provider: string;
  timestamp: string;
  validUntil: string;
}

export interface PaymentConfiguration {
  // Crypto settings
  supportedChains: number[];
  supportedTokens: CryptoPaymentMethod[];
  gaslessEnabled: boolean;
  gaslessTokens: string[];

  // Fiat settings
  supportedCurrencies: string[];
  supportedCountries: string[];
  fiatProcessors: FiatPaymentMethod[];

  // General settings
  platformFeePercentage: number;
  conversionSlippage: number;
  paymentExpiration: number; // minutes
  automaticConversion: boolean;

  // Security
  maxPaymentAmount: number;
  minPaymentAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  requireKYC: boolean;
}

export interface PaymentAnalytics {
  userId: string;
  totalPaid: number;
  totalRefunded: number;
  successfulPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
  preferredPaymentMethod: string;
  preferredCurrency: string;
  monthlyVolume: number;
  paymentHistory: PaymentHistoryEntry[];
}

export interface PaymentHistoryEntry {
  paymentId: string;
  propertyId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  date: string;
  fees: number;
  conversionData?: {
    originalAmount: number;
    originalCurrency: string;
    finalAmount: number;
    finalCurrency: string;
    rate: number;
  };
}

export interface AutomaticConversion {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rate: ConversionRate;
  slippage: number;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentWebhook {
  id: string;
  paymentId: string;
  provider: string;
  event: string;
  data: any;
  processed: boolean;
  processedAt?: string;
  retryCount: number;
  error?: string;
}

export interface LiquidityPool {
  id: string;
  tokenA: string;
  tokenB: string;
  reserve0: string;
  reserve1: string;
  price: number;
  volume24h: number;
  feeTier: number;
  chainId: number;
}

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  priceImpact: number;
  minimumReceived: string;
  route: SwapRoute[];
  estimatedGas: string;
  validUntil: number;
}

export interface SwapRoute {
  protocol: string;
  poolAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  fee: number;
}

export interface PaymentFlow {
  id: string;
  steps: PaymentStep[];
  currentStep: number;
  status: PaymentStatus;
  metadata: any;
}

export interface PaymentStep {
  id: string;
  name: string;
  description: string;
  type: 'user_action' | 'system_process' | 'blockchain_tx' | 'external_api';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  data?: any;
  estimatedTime?: number;
  actualTime?: number;
  error?: string;
}

// API Response Types
export interface CreatePaymentResponse {
  success: boolean;
  paymentRequest?: PaymentRequest;
  session?: PaymentSession;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment?: PaymentRequest;
  session?: PaymentSession;
  analytics?: PaymentAnalytics;
  error?: string;
}

export interface ConversionQuoteResponse {
  success: boolean;
  quote?: {
    fromAmount: number;
    toAmount: number;
    rate: number;
    fees: PaymentFees;
    estimatedTime: string;
    validUntil: string;
  };
  error?: string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  methods?: {
    crypto: CryptoPaymentMethod[];
    fiat: FiatPaymentMethod[];
  };
  error?: string;
}
