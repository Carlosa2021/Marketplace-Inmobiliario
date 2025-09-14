// src/modules/tokenization/types.ts
export interface PropertyMetadata {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  documents: PropertyDocument[];
  valuation: PropertyValuation;
  specifications: PropertySpecs;
  legal: LegalInfo;
  tokenization: TokenizationConfig;
}

export interface PropertyDocument {
  id: string;
  type:
    | 'deed'
    | 'title'
    | 'appraisal'
    | 'insurance'
    | 'tax'
    | 'inspection'
    | 'survey'
    | 'other';
  name: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
}

export interface PropertyValuation {
  currentValue: number;
  currency: string;
  lastAppraisal: string;
  appreciationRate?: number;
  valuationMethod: 'comparative' | 'income' | 'cost' | 'ai';
  appraisedBy?: string;
  nextAppraisal?: string;
}

export interface PropertySpecs {
  type: 'residential' | 'commercial' | 'industrial' | 'land' | 'mixed';
  subtype?: string;
  buildingArea: number;
  lotArea: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  yearBuilt?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  amenities: string[];
  utilities: string[];
}

export interface LegalInfo {
  propertyId: string;
  registry: string;
  zoning: string;
  taxes: {
    annual: number;
    currency: string;
    lastPaid: string;
  };
  liens: PropertyLien[];
  restrictions: string[];
  permits: string[];
}

export interface PropertyLien {
  id: string;
  type: 'mortgage' | 'tax' | 'mechanic' | 'judgment' | 'other';
  amount: number;
  currency: string;
  creditor: string;
  filedDate: string;
  status: 'active' | 'satisfied' | 'disputed';
}

export interface TokenizationConfig {
  tokenType: 'ERC721' | 'ERC1155';
  supply: number;
  minInvestment: number;
  maxInvestment?: number;
  currency: string;
  fractional: boolean;
  transferable: boolean;
  votingRights: boolean;
  dividendRights: boolean;
  liquidityOptions: LiquidityOption[];
  vestingSchedule?: VestingSchedule;
}

export interface LiquidityOption {
  type: 'marketplace' | 'buyback' | 'redemption' | 'exchange';
  enabled: boolean;
  conditions?: string[];
  minimumHolding?: number;
  fees?: number;
}

export interface VestingSchedule {
  type: 'linear' | 'cliff' | 'milestone';
  duration: number; // in months
  cliff?: number; // in months
  milestones?: VestingMilestone[];
}

export interface VestingMilestone {
  condition: string;
  percentage: number;
  reached: boolean;
  date?: string;
}

export interface TokenContract {
  id: string;
  address: string;
  chain: string;
  type: 'ERC721' | 'ERC1155';
  name: string;
  symbol: string;
  propertyId: string;
  totalSupply: number;
  holders: TokenHolder[];
  transactions: TokenTransaction[];
  metadata: ContractMetadata;
  status: 'draft' | 'deployed' | 'active' | 'paused' | 'deprecated';
  deployedAt?: string;
  deployedBy: string;
}

export interface TokenHolder {
  address: string;
  balance: number;
  percentage: number;
  acquiredAt: string;
  vestingStatus?: 'vesting' | 'vested' | 'cliff';
  dividendsEarned: number;
  votingPower: number;
}

export interface TokenTransaction {
  id: string;
  type: 'mint' | 'transfer' | 'burn' | 'dividend' | 'voting';
  from?: string;
  to?: string;
  amount: number;
  timestamp: string;
  txHash: string;
  gasUsed: number;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ContractMetadata {
  version: string;
  compiler: string;
  abi: any[];
  bytecode: string;
  verification: {
    verified: boolean;
    source?: string;
    verifiedAt?: string;
  };
  upgradeable: boolean;
  proxy?: {
    implementation: string;
    admin: string;
  };
}

export interface PropertyToken {
  tokenId: string;
  contractAddress: string;
  propertyId: string;
  owner: string;
  metadata: PropertyMetadata;
  valuation: PropertyValuation;
  shares: number;
  totalShares: number;
  dividends: DividendInfo;
  voting: VotingInfo;
  transferHistory: TransferRecord[];
  status: 'active' | 'locked' | 'disputed' | 'redeemed';
}

export interface DividendInfo {
  totalEarned: number;
  lastDistribution?: string;
  nextDistribution?: string;
  rate: number; // annual percentage
  frequency: 'monthly' | 'quarterly' | 'annually';
  reinvestment: boolean;
}

export interface VotingInfo {
  power: number;
  participatedVotes: string[];
  delegatedTo?: string;
  delegatedFrom: string[];
  proposals: VotingProposal[];
}

export interface VotingProposal {
  id: string;
  title: string;
  description: string;
  type:
    | 'maintenance'
    | 'sale'
    | 'refinancing'
    | 'improvement'
    | 'management'
    | 'other';
  creator: string;
  createdAt: string;
  endDate: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votes: Vote[];
  requiredQuorum: number;
  currentQuorum: number;
}

export interface Vote {
  voter: string;
  choice: 'yes' | 'no' | 'abstain';
  weight: number;
  timestamp: string;
  reason?: string;
}

export interface TransferRecord {
  id: string;
  from: string;
  to: string;
  amount: number;
  price?: number;
  currency?: string;
  timestamp: string;
  txHash: string;
  method: 'direct' | 'marketplace' | 'auction' | 'otc';
  fees: {
    platform: number;
    gas: number;
    total: number;
  };
}

export interface PropertyInvestment {
  id: string;
  investorAddress: string;
  propertyId: string;
  tokenContract: string;
  tokenAmount: number;
  investmentAmount: number;
  currency: string;
  investedAt: string;
  currentValue: number;
  roi: number;
  status: 'active' | 'partial_exit' | 'full_exit';
  exitHistory: ExitRecord[];
}

export interface ExitRecord {
  id: string;
  amount: number;
  price: number;
  timestamp: string;
  method: 'sale' | 'redemption' | 'buyback';
  fees: number;
  txHash: string;
}

// Smart Contract Deployment Configuration
export interface DeploymentConfig {
  network: string;
  contractType: 'ERC721' | 'ERC1155';
  name: string;
  symbol: string;
  baseURI: string;
  owner: string;
  maxSupply?: number;
  mintPrice?: string;
  royaltyBps: number;
  features: ContractFeature[];
  gasSettings: {
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasLimit?: string;
  };
}

export interface ContractFeature {
  name: string;
  enabled: boolean;
  parameters?: Record<string, any>;
}

// API Response Types
export interface TokenizationResponse {
  success: boolean;
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
  estimatedGas?: string;
  totalCost?: string;
}

export interface PropertyListingResponse {
  properties: PropertyMetadata[];
  total: number;
  page: number;
  limit: number;
  filters: PropertyFilters;
}

export interface PropertyFilters {
  location?: string;
  priceRange?: [number, number];
  propertyType?: string;
  tokenType?: 'ERC721' | 'ERC1155';
  minROI?: number;
  maxROI?: number;
  status?: string[];
}
