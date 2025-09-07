// src/lib/thirdweb/sales.ts
import { getContract, sendTransaction } from 'thirdweb';
import { mintTo } from 'thirdweb/extensions/erc721';
import { adminAccount } from '@/lib/thirdweb/client-server';
import { client } from '@/lib/thirdweb/client-server';
import { defineChain } from 'thirdweb';

type FulfillParams = {
  chainId: number;
  collection: `0x${string}`;
  to: `0x${string}`;
  // O minteas metadata nuevo:
  metadata?: { name: string; description?: string; image?: string };
  // O transfieres un token existente:
  tokenIdToTransfer?: string | number | bigint;
};

export async function fulfillFiatSale({
  chainId,
  collection,
  to,
  metadata,
  tokenIdToTransfer,
}: FulfillParams) {
  const chain = defineChain({ id: chainId });
  const contract = getContract({ client, chain, address: collection });

  if (!adminAccount) throw new Error('Missing admin account');

  if (tokenIdToTransfer !== undefined) {
    // Si ya tienes inventario minteado a la admin, aquí harías un safeTransferFrom
    // Ejemplo (si tienes extensión erc721 transfer):
    // const tx = await transfer({ contract, to, tokenId: BigInt(tokenIdToTransfer) });
    // En many setups, lo más práctico es mintear directo al comprador:
    throw new Error(
      'Implementa transferencia específica si quieres mover inventario existente',
    );
  } else {
    // Mint directo al comprador
    const prepared = await mintTo({
      contract,
      to,
      nft: metadata ?? { name: 'Property NFT' },
    });
    const receipt = await sendTransaction({
      transaction: prepared,
      account: adminAccount,
    });
    return receipt.transactionHash as string;
  }
}
