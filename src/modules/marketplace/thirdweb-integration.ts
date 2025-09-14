// src/modules/marketplace/thirdweb-integration.ts
import {
  createListing as createThirdwebListing,
  buyFromListing,
  getAllListings,
  getListing,
  cancelListing,
  makeOffer,
  acceptOffer,
} from 'thirdweb/extensions/marketplace';
import { transfer, getOwnedNFTs, ownerOf } from 'thirdweb/extensions/erc721';
import { marketplaceContract, nftCollectionContract } from '@/lib/contracts';
import { prepareContractCall, sendTransaction } from 'thirdweb';
import { Account } from 'thirdweb/wallets';
import type { MarketplaceListing, Trade } from './types';

export class ThirdwebMarketplaceIntegration {
  /**
   * Verify token ownership on-chain
   */
  async verifyOwnership(
    contractAddress: string,
    tokenId: string,
    owner: string,
  ): Promise<boolean> {
    try {
      const tokenOwner = await ownerOf({
        contract: nftCollectionContract,
        tokenId: BigInt(tokenId),
      });

      return tokenOwner.toLowerCase() === owner.toLowerCase();
    } catch (error) {
      console.error('Error verifying ownership:', error);
      return false;
    }
  }

  /**
   * Create a new listing on Thirdweb marketplace
   */
  async createListing(
    listing: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt'>,
    account: Account,
  ): Promise<string> {
    try {
      let listingParams;

      if (listing.listingType === 'fixed_price') {
        // Direct listing for fixed price
        listingParams = {
          assetContractAddress: listing.contractAddress,
          tokenId: BigInt(listing.tokenId),
          pricePerToken: listing.price.amount.toString(),
          currencyContractAddress: '0x0000000000000000000000000000000000000000', // Native token
          quantity: BigInt(1),
          startTimestamp: new Date(),
          endTimestamp: listing.expiresAt
            ? new Date(listing.expiresAt)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
        };
      } else if (listing.listingType === 'auction' && listing.auction) {
        // Auction listing
        listingParams = {
          assetContractAddress: listing.contractAddress,
          tokenId: BigInt(listing.tokenId),
          buyoutPricePerToken:
            listing.auction.reservePrice?.toString() ||
            listing.price.amount.toString(),
          minimumBidAmount: listing.auction.startPrice.toString(),
          currencyContractAddress: '0x0000000000000000000000000000000000000000',
          quantity: BigInt(1),
          startTimestamp: new Date(listing.auction.startTime),
          endTimestamp: new Date(listing.auction.endTime),
        };
      } else {
        throw new Error('Unsupported listing type for Thirdweb integration');
      }

      const transaction = prepareContractCall({
        contract: marketplaceContract,
        method: 'createListing',
        params: [listingParams],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      return result.transactionHash;
    } catch (error) {
      console.error('Error creating listing on Thirdweb:', error);
      throw error;
    }
  }

  /**
   * Execute a purchase on Thirdweb marketplace
   */
  async executePurchase(
    listingId: string,
    quantity: number,
    account: Account,
  ): Promise<string> {
    try {
      const transaction = prepareContractCall({
        contract: marketplaceContract,
        method: 'buyFromListing',
        params: [
          BigInt(listingId),
          account.address,
          BigInt(quantity),
          '0x0000000000000000000000000000000000000000', // Currency
          '0', // Price per token (will be fetched from listing)
        ],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      return result.transactionHash;
    } catch (error) {
      console.error('Error executing purchase on Thirdweb:', error);
      throw error;
    }
  }

  /**
   * Place a bid on an auction
   */
  async placeBid(
    listingId: string,
    bidAmount: string,
    account: Account,
  ): Promise<string> {
    try {
      const transaction = prepareContractCall({
        contract: marketplaceContract,
        method: 'offer',
        params: [
          BigInt(listingId),
          BigInt(1), // quantity
          '0x0000000000000000000000000000000000000000', // currency
          bidAmount,
          BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60), // expires in 24 hours
        ],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      return result.transactionHash;
    } catch (error) {
      console.error('Error placing bid on Thirdweb:', error);
      throw error;
    }
  }

  /**
   * Cancel a listing
   */
  async cancelListing(listingId: string, account: Account): Promise<string> {
    try {
      const transaction = prepareContractCall({
        contract: marketplaceContract,
        method: 'cancelListing',
        params: [BigInt(listingId)],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      return result.transactionHash;
    } catch (error) {
      console.error('Error cancelling listing on Thirdweb:', error);
      throw error;
    }
  }

  /**
   * Get all listings from Thirdweb marketplace
   */
  async getAllListings() {
    try {
      const listings = await getAllListings({
        contract: marketplaceContract,
        start: 0,
        count: 100,
      });

      return listings;
    } catch (error) {
      console.error('Error fetching listings from Thirdweb:', error);
      throw error;
    }
  }

  /**
   * Get a specific listing from Thirdweb marketplace
   */
  async getListing(listingId: string) {
    try {
      const listing = await getListing({
        contract: marketplaceContract,
        listingId: BigInt(listingId),
      });

      return listing;
    } catch (error) {
      console.error('Error fetching listing from Thirdweb:', error);
      throw error;
    }
  }

  /**
   * Transfer NFT ownership
   */
  async transferNFT(
    from: string,
    to: string,
    tokenId: string,
    account: Account,
  ): Promise<string> {
    try {
      const transaction = prepareContractCall({
        contract: nftCollectionContract,
        method: 'transferFrom',
        params: [from, to, BigInt(tokenId)],
      });

      const result = await sendTransaction({
        transaction,
        account,
      });

      return result.transactionHash;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }

  /**
   * Get owned NFTs for a user
   */
  async getOwnedNFTs(ownerAddress: string) {
    try {
      const ownedNFTs = await getOwnedNFTs({
        contract: nftCollectionContract,
        owner: ownerAddress,
      });

      return ownedNFTs;
    } catch (error) {
      console.error('Error fetching owned NFTs:', error);
      throw error;
    }
  }

  /**
   * Convert Thirdweb listing to our MarketplaceListing format
   */
  convertThirdwebListing(thirdwebListing: any): Partial<MarketplaceListing> {
    return {
      id: thirdwebListing.id?.toString(),
      contractAddress: thirdwebListing.assetContractAddress,
      tokenId: thirdwebListing.tokenId?.toString(),
      seller: thirdwebListing.creatorAddress,
      listingType: thirdwebListing.type === 0 ? 'fixed_price' : 'auction',
      status: 'active',
      price: {
        amount: Number(
          thirdwebListing.pricePerToken || thirdwebListing.buyoutPricePerToken,
        ),
        currency: 'ETH',
      },
      createdAt: new Date(
        Number(thirdwebListing.startTimeInSeconds) * 1000,
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(
        Number(thirdwebListing.endTimeInSeconds) * 1000,
      ).toISOString(),
      metadata: {
        title: thirdwebListing.asset?.metadata?.name || 'Unnamed Property',
        description: thirdwebListing.asset?.metadata?.description || '',
        location: 'Unknown',
        images: thirdwebListing.asset?.metadata?.image
          ? [thirdwebListing.asset.metadata.image]
          : [],
        propertyType: 'residential',
        bedrooms: 0,
        bathrooms: 0,
        squareMeters: 0,
        yearBuilt: 0,
        neighborhood: '',
        rentYield: 0,
        appreciationRate: 0,
        views: 0,
      },
      verification: {
        status: 'pending',
        verifiedAt: null,
        verifiedBy: null,
        documents: [],
      },
      liquidity: {
        volume24h: 0,
        volume7d: 0,
        liquidityScore: 0,
        marketDepth: 0,
      },
    };
  }

  /**
   * Sync Thirdweb listings with our local database
   */
  async syncListings(): Promise<Partial<MarketplaceListing>[]> {
    try {
      const thirdwebListings = await this.getAllListings();
      const convertedListings = thirdwebListings.map((listing) =>
        this.convertThirdwebListing(listing),
      );

      return convertedListings;
    } catch (error) {
      console.error('Error syncing listings:', error);
      return [];
    }
  }

  /**
   * Calculate trading fees
   */
  calculateFees(totalValue: number) {
    const platformFee = totalValue * 0.025; // 2.5%
    const royaltyFee = totalValue * 0.01; // 1%
    const gasFee = 5; // Estimated gas fee in USD
    const processingFee = 0;

    return {
      platformFee,
      royaltyFee,
      gasFee,
      processingFee,
      total: platformFee + royaltyFee + gasFee + processingFee,
    };
  }

  /**
   * Get transaction receipt and update trade status
   */
  async waitForTransaction(txHash: string): Promise<any> {
    try {
      // In a real implementation, you would wait for the transaction to be mined
      // and return the receipt. For now, we'll simulate this.

      // You can implement transaction waiting logic here
      // using Thirdweb's transaction monitoring capabilities

      return {
        transactionHash: txHash,
        status: 'success',
        blockNumber: Math.floor(Math.random() * 1000000),
        gasUsed: Math.floor(Math.random() * 100000),
      };
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  }
}
