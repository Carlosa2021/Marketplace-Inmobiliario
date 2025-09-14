// src/modules/marketplace/types.ts
export interface MarketplaceListing {
  id: string;
  propertyId: string;
  contractAddress: string;
  tokenId: string;
  seller: string;
  listingType: 'fixed_price' | 'auction' | 'fractional_sale' | 'buyout_offer';
  status: 'active' | 'sold' | 'cancelled' | 'expired' | 'pending';

  // Basic Info
  title: string;
  description: string;
  location: string;
  images: string[];

  // Property Details
  category: string;
  propertyType: string;

  // Pricing
  price: {
    amount: number;
    currency: string;
    pricePerShare?: number;
  };

  // Fractional details
  fractional?: {
    totalShares: number;
    availableShares: number;
    minPurchase: number;
    maxPurchase?: number;
    reservePrice?: number;
    sharePrice: number;
  };

  // Auction details
  auction?: {
    startPrice: number;
    reservePrice?: number;
    currentBid: number;
    bidCount: number;
    highestBidder?: string;
    startTime: string;
    endTime: string;
    bidIncrement: number;
    extendOnBid: boolean; // extend auction if bid in last minutes
  };

  // Timing
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;

  // Additional info
  metadata: ListingMetadata;
  verification: ListingVerification;
  liquidity: LiquidityInfo;
}

export interface ListingMetadata {
  title: string;
  description: string;
  highlights: string[];
  images: string[];
  documents: string[];
  propertyType: string;
  location: {
    address: string;
    city: string;
    country: string;
  };
  roi?: {
    projected: number;
    historical?: number;
  };
  rental?: {
    monthlyIncome: number;
    occupancyRate: number;
    tenantInfo?: TenantInfo;
  };
  // Additional properties for components
  views?: number;
  appreciationRate?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  yearBuilt?: number;
}

export interface TenantInfo {
  leaseEnd: string;
  monthlyRent: number;
  deposit: number;
  tenant: string;
  creditScore?: number;
}

export interface ListingVerification {
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  legalCheck: boolean;
  titleCheck: boolean;
  valuationCheck: boolean;
  documents: VerificationDocument[];
}

export interface VerificationDocument {
  type:
    | 'deed'
    | 'title'
    | 'appraisal'
    | 'legal_opinion'
    | 'insurance'
    | 'other';
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  notes?: string;
}

export interface LiquidityInfo {
  score: number; // 0-100
  volume24h: number;
  volume7d: number;
  volume30d: number;
  tradingPairs: TradingPair[];
  marketDepth: MarketDepth;
}

export interface TradingPair {
  baseToken: string;
  quoteToken: string;
  volume24h: number;
  price: number;
  change24h: number;
}

export interface MarketDepth {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  totalBidVolume: number;
  totalAskVolume: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  user?: string;
}

export interface Bid {
  id: string;
  listingId: string;
  bidder: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: 'active' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
  expiresAt: string;
  metadata?: {
    financing?: FinancingOffer;
    conditions?: string[];
  };
}

export interface FinancingOffer {
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  approved: boolean;
  lender?: string;
}

export interface Trade {
  id: string;
  listingId: string;
  buyer: string;
  seller: string;
  price: number;
  currency: string;
  quantity: number;
  totalValue: number;
  fees: TradeFees;
  timestamp: string;
  txHash: string;
  status: 'pending' | 'completed' | 'failed' | 'disputed';
  settlement: TradeSettlement;
}

export interface TradeFees {
  platformFee: number;
  royaltyFee: number;
  gasFee: number;
  processingFee: number;
  total: number;
}

export interface TradeSettlement {
  escrowAddress?: string;
  releaseConditions: string[];
  requiredSignatures: string[];
  completedSignatures: string[];
  settlementDate?: string;
  disputeResolution?: DisputeInfo;
}

export interface DisputeInfo {
  id: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  arbitrator?: string;
  evidence: Evidence[];
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Evidence {
  type: 'document' | 'image' | 'video' | 'text';
  content: string;
  uploadedBy: string;
  timestamp: string;
  verified: boolean;
}

export interface MarketplaceOffer {
  id: string;
  listingId: string;
  offerer: string;
  offerType: 'buy' | 'partial_buy' | 'trade' | 'lease_to_own';

  // Financial terms
  price: {
    amount: number;
    currency: string;
    breakdown?: PriceBreakdown;
  };

  // Quantity (for fractional)
  quantity?: number;
  percentage?: number;

  // Conditions
  conditions: OfferCondition[];
  financing?: FinancingOffer;

  // Timing
  expiresAt: string;
  contingencyPeriod?: number; // days
  closingDate?: string;

  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  response?: OfferResponse;

  createdAt: string;
  updatedAt: string;
}

export interface PriceBreakdown {
  basePrice: number;
  inspectionCredit?: number;
  closingCosts?: number;
  repairs?: number;
  earnestMoney: number;
  total: number;
}

export interface OfferCondition {
  type: 'inspection' | 'financing' | 'appraisal' | 'legal' | 'custom';
  description: string;
  deadline?: string;
  satisfied: boolean;
  waived: boolean;
}

export interface OfferResponse {
  type: 'accept' | 'reject' | 'counter';
  message?: string;
  counterOffer?: Partial<MarketplaceOffer>;
  respondedAt: string;
}

export interface MarketAnalytics {
  // Price analytics
  priceHistory: PricePoint[];
  volatility: number;
  performance: PerformanceMetrics;

  // Volume analytics
  volumeHistory: VolumePoint[];
  liquidityScore: number;
  marketCap: number;

  // Trading analytics
  tradingActivity: TradingActivity;
  holders: HolderDistribution;

  // Market comparison
  comparables: ComparableProperty[];
  marketTrends: MarketTrend[];
}

export interface PricePoint {
  timestamp: string;
  price: number;
  volume: number;
  source: 'trade' | 'appraisal' | 'estimate';
}

export interface VolumePoint {
  timestamp: string;
  volume: number;
  trades: number;
  averageSize: number;
}

export interface PerformanceMetrics {
  return1d: number;
  return7d: number;
  return30d: number;
  return1y: number;
  volatility30d: number;
  sharpeRatio?: number;
  maxDrawdown: number;
}

export interface TradingActivity {
  trades24h: number;
  volume24h: number;
  activeTraders: number;
  averageTradeSize: number;
  bidAskSpread: number;
}

export interface HolderDistribution {
  totalHolders: number;
  top10Percentage: number;
  whaleCount: number; // holders with >5% of supply
  institutionalPercentage: number;
  retailPercentage: number;
}

export interface ComparableProperty {
  propertyId: string;
  name: string;
  price: number;
  pricePerSqft: number;
  location: string;
  similarity: number; // 0-1
  lastSaleDate: string;
}

export interface MarketTrend {
  category: string;
  trend: 'up' | 'down' | 'stable';
  strength: number; // 0-1
  timeframe: string;
  indicators: TrendIndicator[];
}

export interface TrendIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export interface LiquidityPool {
  id: string;
  propertyToken: string;
  pairedToken: string; // USDC, ETH, etc.
  totalLiquidity: number;
  volume24h: number;
  apr: number;
  providers: number;
  fee: number;
  rewards?: RewardProgram;
}

export interface RewardProgram {
  tokenRewards: string[];
  apy: number;
  duration: number;
  totalRewards: number;
  claimedRewards: number;
}

export interface MarketMaker {
  id: string;
  address: string;
  name: string;
  reputation: number;
  volume30d: number;
  spread: number;
  uptime: number;
  pairs: string[];
  incentives?: MarketMakerIncentive[];
}

export interface MarketMakerIncentive {
  type: 'volume' | 'spread' | 'uptime';
  reward: number;
  currency: string;
  requirements: any;
}

// API Response Types
export interface MarketplaceListingsResponse {
  success: boolean;
  listings?: MarketplaceListing[];
  total?: number;
  page?: number;
  limit?: number;
  filters?: MarketplaceFilters;
  error?: string;
}

export interface MarketplaceFilters {
  priceRange?: [number, number];
  location?: string;
  propertyType?: string;
  listingType?: string;
  minRoi?: number;
  maxRoi?: number;
  verified?: boolean;
  sortBy?: 'price' | 'roi' | 'volume' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateListingResponse {
  success: boolean;
  listing?: MarketplaceListing;
  error?: string;
}

export interface PlaceBidResponse {
  success: boolean;
  bid?: Bid;
  newHighestBid?: boolean;
  auctionExtended?: boolean;
  error?: string;
}

export interface ExecuteTradeResponse {
  success: boolean;
  trade?: Trade;
  txHash?: string;
  escrowAddress?: string;
  error?: string;
}
