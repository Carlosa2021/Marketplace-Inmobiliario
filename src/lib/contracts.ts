import { getContract } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import { client } from './thirdweb/client-browser';

export const nftCollectionContract = getContract({
  client,
  address: '0xEEF1cCD3409d3898B603E524dE7E2Bb8AF94789F', // NFT Collection
  chain: polygon,
});

export const marketplaceContract = getContract({
  client,
  address: '0x35108cf18a2b1058036b95cb6B2A4257022ABD2e', // Marketplace V3
  chain: polygon,
});
