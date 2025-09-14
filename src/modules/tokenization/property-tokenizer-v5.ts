// src/modules/tokenization/property-tokenizer-v5.ts
// Updated version for Thirdweb SDK v5
import { createThirdwebClient } from 'thirdweb';
import { getContract } from 'thirdweb';
import { mintTo } from 'thirdweb/extensions/erc721';
import { upload } from 'thirdweb/storage';
import { Account } from 'thirdweb/wallets';
import { defineChain } from 'thirdweb/chains';
import { prepareContractCall, sendTransaction } from 'thirdweb';
import {
  PropertyMetadata,
  TokenContract,
  DeploymentConfig,
  TokenizationResponse,
  PropertyToken,
} from './types';

// Define Polygon chain for SDK v5
const polygon = defineChain(137);

export class PropertyTokenizerV5 {
  private client;

  constructor(clientId: string) {
    this.client = createThirdwebClient({
      clientId,
    });
  }

  /**
   * Upload metadata to IPFS using Thirdweb Storage v5
   */
  async uploadMetadata(metadata: PropertyMetadata): Promise<string> {
    try {
      const files = [
        new File([JSON.stringify(metadata, null, 2)], 'metadata.json', {
          type: 'application/json',
        }),
      ];

      const uris = await upload({
        client: this.client,
        files,
      });

      return uris[0];
    } catch (error) {
      console.error('Failed to upload metadata:', error);
      throw error;
    }
  }

  /**
   * Upload images to IPFS
   */
  async uploadImages(imageFiles: File[]): Promise<string[]> {
    try {
      const uris = await upload({
        client: this.client,
        files: imageFiles,
      });

      return uris;
    } catch (error) {
      console.error('Failed to upload images:', error);
      throw error;
    }
  }

  /**
   * Mint a property NFT using SDK v5
   */
  async mintPropertyNFT(
    contractAddress: string,
    account: Account,
    to: string,
    metadataUri: string,
  ): Promise<string> {
    try {
      const contract = getContract({
        client: this.client,
        chain: polygon,
        address: contractAddress,
      });

      const transaction = mintTo({
        contract,
        to,
        nft: {
          metadata: metadataUri,
        },
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      return result.transactionHash;
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  }

  /**
   * Create a new property token with simplified approach
   */
  async createPropertyToken(
    metadata: PropertyMetadata,
    account: Account,
    contractAddress: string,
  ): Promise<PropertyToken> {
    try {
      // 1. Upload metadata to IPFS
      const metadataUri = await this.uploadMetadata(metadata);

      // 2. Mint NFT
      const txHash = await this.mintPropertyNFT(
        contractAddress,
        account,
        account.address,
        metadataUri,
      );

      // 3. Create PropertyToken object
      const propertyToken: PropertyToken = {
        id: `property_${Date.now()}`,
        propertyId: metadata.id,
        contractAddress,
        tokenId: '0', // Would need to get from transaction receipt
        tokenStandard: 'ERC721',
        owner: account.address,
        metadata,
        issuanceDate: new Date().toISOString(),
        totalSupply: 1,
        currentPrice: metadata.valuationDetails.currentValue,
        priceHistory: [
          {
            date: new Date().toISOString(),
            price: metadata.valuationDetails.currentValue,
            currency: 'USD',
            source: 'initial_valuation',
          },
        ],
        financials: {
          totalInvestment: metadata.valuationDetails.currentValue,
          currentValue: metadata.valuationDetails.currentValue,
          totalReturns: 0,
          roi: 0,
          monthlyIncome: metadata.rentalInfo?.expectedMonthlyRent || 0,
          expenses: [],
          distributions: [],
        },
        compliance: {
          kycVerified: false,
          accreditationRequired: metadata.legalInfo.accreditationRequired,
          jurisdiction: metadata.location.country,
          regulatoryApprovals: [],
        },
        governance: {
          votingRights: true,
          proposalRights: false,
          governanceToken: null,
        },
        liquidity: {
          tradeable: false,
          marketMaker: null,
          liquidityScore: 0,
          volume24h: 0,
        },
        fractional: {
          isFractional: false,
          totalShares: 1,
          availableShares: 0,
          sharePrice: metadata.valuationDetails.currentValue,
          minInvestment: metadata.valuationDetails.currentValue,
          shareholders: [
            {
              address: account.address,
              shares: 1,
              percentage: 100,
              investmentDate: new Date().toISOString(),
              vestingSchedule: null,
            },
          ],
        },
        voting: {
          power: 1,
          participatedVotes: [],
          proposals: [],
          delegatedFrom: [],
        },
        transferHistory: [],
        status: 'active',
        txHash,
        metadataUri,
      };

      return propertyToken;
    } catch (error) {
      console.error('Failed to create property token:', error);
      throw error;
    }
  }

  /**
   * Get property token details
   */
  async getPropertyToken(
    contractAddress: string,
    tokenId: string,
  ): Promise<PropertyToken | null> {
    try {
      // This would require additional contract interactions to fetch full data
      // For now, return a basic structure
      console.log('Getting property token:', contractAddress, tokenId);
      return null;
    } catch (error) {
      console.error('Failed to get property token:', error);
      return null;
    }
  }

  /**
   * Transfer property token
   */
  async transferToken(
    contractAddress: string,
    tokenId: string,
    from: string,
    to: string,
    account: Account,
  ): Promise<string> {
    try {
      const contract = getContract({
        client: this.client,
        chain: polygon,
        address: contractAddress,
      });

      // Use standard ERC721 transfer
      const transaction = prepareContractCall({
        contract,
        method:
          'function transferFrom(address from, address to, uint256 tokenId)',
        params: [from, to, BigInt(tokenId)],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      return result.transactionHash;
    } catch (error) {
      console.error('Failed to transfer token:', error);
      throw error;
    }
  }

  /**
   * Batch operations for efficiency
   */
  async batchMint(
    contractAddress: string,
    account: Account,
    recipients: string[],
    metadataUris: string[],
  ): Promise<string[]> {
    const txHashes: string[] = [];

    for (let i = 0; i < recipients.length; i++) {
      try {
        const txHash = await this.mintPropertyNFT(
          contractAddress,
          account,
          recipients[i],
          metadataUris[i],
        );
        txHashes.push(txHash);
      } catch (error) {
        console.error(`Failed to mint NFT ${i}:`, error);
        txHashes.push('');
      }
    }

    return txHashes;
  }
}
