// src/modules/tokenization/property-manager.ts
import {
  PropertyMetadata,
  PropertyToken,
  PropertyInvestment,
  VotingProposal,
  DividendInfo,
} from './types';
import { PropertyTokenizer } from './property-tokenizer';

export class PropertyManager {
  private tokenizer?: PropertyTokenizer;
  private properties: Map<string, PropertyMetadata> = new Map();
  private investments: Map<string, PropertyInvestment[]> = new Map();

  constructor(tokenizer?: PropertyTokenizer) {
    this.tokenizer = tokenizer;
  }

  setTokenizer(tokenizer: PropertyTokenizer) {
    this.tokenizer = tokenizer;
  }

  /**
   * Register a new property for tokenization
   */
  async registerProperty(property: PropertyMetadata): Promise<string> {
    try {
      // Validate property data
      this.validateProperty(property);

      // Store property information
      this.properties.set(property.id, property);

      // Save to backend
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property),
      });

      return property.id;
    } catch (error) {
      console.error('Failed to register property:', error);
      throw error;
    }
  }

  /**
   * Tokenize a property (create NFT contract and mint tokens)
   */
  async tokenizeProperty(
    propertyId: string,
    ownerAddress: string,
  ): Promise<{ contractAddress: string; tokenId?: string }> {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not initialized');
    }

    try {
      const property = this.properties.get(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      // Note: This method needs an Account object and contract address
      // For now, we'll return a placeholder
      // In a real implementation, you'd need proper account management
      
      return {
        contractAddress: '0x...',
        tokenId: '0',
      };
    } catch (error) {
  /**
   * Tokenize a property (create NFT contract and mint tokens)
   */
  async tokenizeProperty(
    propertyId: string,
    ownerAddress: string,
  ): Promise<{ contractAddress: string; tokenId?: string }> {
    if (!this.tokenizer) {
      throw new Error('Tokenizer not initialized');
    }

    try {
      const property = this.properties.get(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      // Note: This method needs an Account object and contract address
      // For now, we'll return a placeholder
      // In a real implementation, you'd need proper account management
      
      return {
        contractAddress: '0x...',
        tokenId: '0',
      };
    } catch (error) {
      console.error('Failed to tokenize property:', error);
      throw error;
    }
  }

  /**
   * Create fractional ownership for a property
   */
  async createFractionalOwnership(
    propertyId: string,
    totalShares: number,
    pricePerShare: number,
    ownerAddress: string,
  ): Promise<string> {
    const property = this.properties.get(propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Update property config for fractional ownership
    property.tokenization.tokenType = 'ERC1155';
    property.tokenization.supply = totalShares;
    property.tokenization.fractional = true;
    property.tokenization.minInvestment = pricePerShare;

    const result = await this.tokenizer.createFractionalOwnership(
      property,
      totalShares,
      pricePerShare,
    );

    if (!result.success || !result.contractAddress) {
      throw new Error(result.error || 'Fractional ownership creation failed');
    }

    return result.contractAddress;
  }

  /**
   * Invest in a fractional property
   */
  async investInProperty(
    propertyId: string,
    contractAddress: string,
    investorAddress: string,
    shareAmount: number,
    paymentAmount: number,
    currency: string,
  ): Promise<PropertyInvestment> {
    try {
      const property = this.properties.get(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      // Mint tokens to investor
      const mintResult = await this.tokenizer.mintPropertyTokens(
        contractAddress,
        investorAddress,
        property,
        shareAmount,
      );

      if (!mintResult.success) {
        throw new Error(mintResult.error || 'Investment failed');
      }

      // Create investment record
      const investment: PropertyInvestment = {
        id: `${propertyId}-${investorAddress}-${Date.now()}`,
        investorAddress,
        propertyId,
        tokenContract: contractAddress,
        tokenAmount: shareAmount,
        investmentAmount: paymentAmount,
        currency,
        investedAt: new Date().toISOString(),
        currentValue: paymentAmount,
        roi: 0,
        status: 'active',
        exitHistory: [],
      };

      // Store investment
      const userInvestments = this.investments.get(investorAddress) || [];
      userInvestments.push(investment);
      this.investments.set(investorAddress, userInvestments);

      // Save to backend
      await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(investment),
      });

      return investment;
    } catch (error) {
      console.error('Investment failed:', error);
      throw error;
    }
  }

  /**
   * Create a governance proposal
   */
  async createProposal(
    propertyId: string,
    contractAddress: string,
    creator: string,
    proposal: Omit<
      VotingProposal,
      'id' | 'createdAt' | 'status' | 'votes' | 'currentQuorum'
    >,
  ): Promise<string> {
    try {
      const proposalId = `${propertyId}-${Date.now()}`;

      const fullProposal: VotingProposal = {
        ...proposal,
        id: proposalId,
        creator,
        createdAt: new Date().toISOString(),
        status: 'active',
        votes: [],
        currentQuorum: 0,
      };

      // Store proposal
      await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullProposal),
      });

      return proposalId;
    } catch (error) {
      console.error('Proposal creation failed:', error);
      throw error;
    }
  }

  /**
   * Vote on a proposal
   */
  async voteOnProposal(
    proposalId: string,
    voterAddress: string,
    choice: 'yes' | 'no' | 'abstain',
    votingPower: number,
    reason?: string,
  ): Promise<boolean> {
    try {
      const vote = {
        voter: voterAddress,
        choice,
        weight: votingPower,
        timestamp: new Date().toISOString(),
        reason,
      };

      await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vote),
      });

      return true;
    } catch (error) {
      console.error('Voting failed:', error);
      return false;
    }
  }

  /**
   * Distribute dividends to token holders
   */
  async distributeDividends(
    contractAddress: string,
    totalAmount: number,
    currency: string,
  ): Promise<boolean> {
    try {
      // Get all token holders
      const holders = await this.getTokenHolders(contractAddress);

      // Calculate dividend per token
      const totalSupply = holders.reduce(
        (sum, holder) => sum + holder.balance,
        0,
      );

      for (const holder of holders) {
        const dividendAmount = (holder.balance / totalSupply) * totalAmount;

        // Record dividend payment
        await fetch('/api/dividends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contractAddress,
            recipient: holder.address,
            amount: dividendAmount,
            currency,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      return true;
    } catch (error) {
      console.error('Dividend distribution failed:', error);
      return false;
    }
  }

  /**
   * Get property performance metrics
   */
  async getPropertyMetrics(propertyId: string): Promise<{
    totalInvestment: number;
    currentValue: number;
    roi: number;
    dividendsDistributed: number;
    holderCount: number;
    liquidityScore: number;
  }> {
    try {
      const response = await fetch(`/api/properties/${propertyId}/metrics`);
      const metrics = await response.json();

      return {
        totalInvestment: metrics.totalInvestment || 0,
        currentValue: metrics.currentValue || 0,
        roi: metrics.roi || 0,
        dividendsDistributed: metrics.dividendsDistributed || 0,
        holderCount: metrics.holderCount || 0,
        liquidityScore: metrics.liquidityScore || 0,
      };
    } catch (error) {
      console.error('Failed to get property metrics:', error);
      return {
        totalInvestment: 0,
        currentValue: 0,
        roi: 0,
        dividendsDistributed: 0,
        holderCount: 0,
        liquidityScore: 0,
      };
    }
  }

  /**
   * Get user's property investments
   */
  async getUserInvestments(userAddress: string): Promise<PropertyInvestment[]> {
    try {
      const response = await fetch(`/api/users/${userAddress}/investments`);
      const investments = await response.json();

      return investments;
    } catch (error) {
      console.error('Failed to get user investments:', error);
      return [];
    }
  }

  /**
   * Update property valuation
   */
  async updatePropertyValuation(
    propertyId: string,
    newValuation: number,
    currency: string,
    method: 'comparative' | 'income' | 'cost' | 'ai',
    appraisedBy?: string,
  ): Promise<boolean> {
    try {
      const property = this.properties.get(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      property.valuation = {
        ...property.valuation,
        currentValue: newValuation,
        currency,
        lastAppraisal: new Date().toISOString(),
        valuationMethod: method,
        appraisedBy,
      };

      this.properties.set(propertyId, property);

      // Update backend
      await fetch(`/api/properties/${propertyId}/valuation`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valuation: property.valuation,
        }),
      });

      return true;
    } catch (error) {
      console.error('Valuation update failed:', error);
      return false;
    }
  }

  // Private helper methods

  private validateProperty(property: PropertyMetadata): void {
    if (!property.id || !property.name) {
      throw new Error('Property must have ID and name');
    }

    if (!property.location.address || !property.location.city) {
      throw new Error('Property must have valid location');
    }

    if (property.valuation.currentValue <= 0) {
      throw new Error('Property must have valid valuation');
    }

    if (property.tokenization.supply <= 0) {
      throw new Error('Token supply must be greater than 0');
    }
  }

  private async getTokenHolders(contractAddress: string): Promise<
    Array<{
      address: string;
      balance: number;
    }>
  > {
    try {
      const response = await fetch(`/api/contracts/${contractAddress}/holders`);
      const holders = await response.json();

      return holders;
    } catch (error) {
      console.error('Failed to get token holders:', error);
      return [];
    }
  }
}
