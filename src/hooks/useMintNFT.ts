// src/hooks/useMintNFT.ts
import { useState } from 'react';
import { useSendTransaction } from 'thirdweb/react';
import { mintTo } from 'thirdweb/extensions/erc721';
import { nftCollectionContract } from '@/lib/contracts';
import type { Attribute } from '@/components/NFT/NFTAttributeInputs';

interface MintNFTParams {
  name: string;
  description: string;
  image: File;
  attributes: Attribute[];
  to: string;
}

export function useMintNFT() {
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const { mutate: sendTx, data, isPending, error } = useSendTransaction();

  async function mint({
    name,
    description,
    image,
    attributes,
    to,
  }: MintNFTParams) {
    const tx = mintTo({
      contract: nftCollectionContract,
      to,
      nft: { name, description, image, attributes },
    });
    sendTx(tx, {
      onSuccess: (result) => {
        // Asume mint devuelve el tokenId minteado (adaptar según resultado real)
        setMintedTokenId(result?.tokenId ?? null);
      },
    });
  }

  return { mint, mintedTokenId, isPending, error, data };
}
