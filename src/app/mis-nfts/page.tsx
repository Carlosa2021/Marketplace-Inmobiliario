'use client';

import { useActiveAccount } from 'thirdweb/react';
import { getOwnedNFTs } from 'thirdweb/extensions/erc721';
import { useEffect, useState } from 'react';
import {
  NFTProvider,
  NFTMedia,
  NFTName,
  NFTDescription,
  CreateDirectListingButton,
} from 'thirdweb/react';
import { Card, CardContent } from '@/components/ui/card';
import { marketplaceContract, nftCollectionContract } from '@/lib/contracts';
import { polygon } from 'thirdweb/chains';
import { client } from '@/lib/thirdweb/client-browser';

// Loader elegante mientras carga
function NFTCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white dark:bg-zinc-900 shadow-md h-[375px] flex flex-col">
      <div className="bg-gray-200 dark:bg-zinc-700 h-56 w-full rounded-t-2xl mb-2" />
      <div className="px-4 flex-1 flex flex-col gap-2">
        <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-2/3 mt-2" />
        <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
        <div className="h-9 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mt-auto mb-4" />
      </div>
    </div>
  );
}

interface OwnedNFT {
  id: bigint;
}

export default function MisNFTsPage() {
  const account = useActiveAccount();
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingPrices, setListingPrices] = useState<Record<string, string>>(
    {},
  );
  const [listed, setListed] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!account?.address) {
        setNfts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const nfts721 = await getOwnedNFTs({
          contract: nftCollectionContract,
          owner: account.address,
        });
        setNfts(nfts721);
      } catch {
        setNfts([]);
      }
      setLoading(false);
    };
    fetchNFTs();
  }, [account?.address]);

  const handlePriceChange = (tokenId: bigint, value: string) => {
    // Permite solo números decimales positivos hasta 6 decimales
    if (!/^\d*\.?\d{0,6}$/.test(value) && value !== '') return;
    setListingPrices((prev) => ({
      ...prev,
      [tokenId.toString()]: value,
    }));
    setError(undefined);
  };

  function validatePrice(val: string): boolean {
    return !!val && !isNaN(Number(val)) && Number(val) > 0;
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Mis Inmuebles (NFTs)</h1>
      {loading ? (
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4 mt-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <NFTCardSkeleton key={i} />
          ))}
        </div>
      ) : nfts.length === 0 ? (
        <div className="mt-16 text-center text-xl font-semibold text-muted-foreground">
          <svg
            className="mx-auto mb-3 opacity-30"
            width="54"
            height="54"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M21.57 20.29 17 15.72V5a1 1 0 0 0-1-1H8A1 1 0 0 0 7 5v10.72l-4.57 4.57a1 1 0 1 0 1.41 1.41L6 19.41V21a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.59l2.16 2.16a1 1 0 1 0 1.41-1.41ZM9 19V6h6v13ZM8 17.17l-1.17-1.17L12 11.83l5.17 5.17L16 17.17V5H8Z"
            />
          </svg>
          No tienes inmuebles asociados a esta wallet.
          <br />
          <span className="text-base font-normal">
            (Conecta la wallet correcta y en la red Polygon)
          </span>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
          {nfts.map((nft) => {
            const tokenIdStr = nft.id.toString();
            const isListed = !!listed[tokenIdStr];
            return (
              <NFTProvider
                contract={nftCollectionContract}
                tokenId={nft.id}
                key={tokenIdStr}
              >
                <Card
                  className={`rounded-2xl shadow-md bg-card dark:bg-zinc-900 transition-transform cursor-pointer overflow-hidden h-[375px] flex flex-col`}
                >
                  <div className="w-full h-60 bg-card dark:bg-zinc-900">
                    <NFTMedia className="w-full h-full object-cover rounded-t-2xl bg-card dark:bg-zinc-900" />
                  </div>
                  <CardContent className="p-4 flex flex-col gap-2 flex-1">
                    <NFTName className="text-lg font-bold truncate text-foreground" />
                    <NFTDescription className="text-xs text-muted-foreground line-clamp-2" />
                    <input
                      type="number"
                      min="0"
                      step="0.000001"
                      placeholder="Precio en POL"
                      value={listingPrices[tokenIdStr] ?? ''}
                      onChange={(e) =>
                        handlePriceChange(nft.id, e.target.value)
                      }
                      disabled={isListed}
                      className="mt-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    />
                    {error && (
                      <div className="text-xs text-red-500">{error}</div>
                    )}
                    <CreateDirectListingButton
                      contractAddress={marketplaceContract.address}
                      assetContractAddress={nftCollectionContract.address}
                      tokenId={nft.id}
                      chain={polygon}
                      client={client}
                      pricePerToken={listingPrices[tokenIdStr] ?? undefined}
                      quantity={1n}
                      onTransactionConfirmed={() => {
                        setListed((prev) => ({ ...prev, [tokenIdStr]: true }));
                        setTimeout(
                          () =>
                            setListed((prev) => ({
                              ...prev,
                              [tokenIdStr]: false,
                            })),
                          3500,
                        );
                      }}
                      onError={(err) =>
                        setError('Error al listar: ' + err.message)
                      }
                      disabled={
                        !validatePrice(listingPrices[tokenIdStr] ?? '') ||
                        isListed
                      }
                      className="bg-green-600 text-white mt-3 px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isListed ? '¡Listada!' : 'Listar en Marketplace'}
                    </CreateDirectListingButton>
                    {isListed && (
                      <div className="text-green-700 dark:text-green-300 text-xs font-bold mt-2 animate-fade-in">
                        Listada con éxito en el marketplace.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </NFTProvider>
            );
          })}
        </div>
      )}
    </div>
  );
}
