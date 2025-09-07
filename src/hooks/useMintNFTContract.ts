// src/hooks/useMintNFTContract.ts
import { useState } from 'react';
import { useSendTransaction } from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';
import { nftCollection } from '@/lib/contracts';

export function useMintNFTContract() {
  const {
    mutateAsync: sendTransaction,
    isPending,
    error,
    data,
  } = useSendTransaction();
  const [minted, setMinted] = useState(false);

  async function mint({ to, uri }: { to: string; uri: string }) {
    const tx = prepareContractCall({
      contract: nftCollection,
      method: 'function mintTo(address to, string uri)',
      params: [to, uri],
    });
    await sendTransaction(tx);
    setMinted(true);
  }

  return { mint, minted, isPending, error, data };
}
