// src/app/marketplace/detalles_propiedad/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import {
  useReadContract,
  NFTProvider,
  NFTMedia,
  NFTName,
  NFTDescription,
} from 'thirdweb/react';
import { useState, useEffect } from 'react';
import { nftCollectionContract, marketplaceContract } from '@/lib/contracts';
import { BuyModal } from '@/components/ui/BuyModal';

// Interfaces
interface Listing {
  listingId: bigint;
  tokenId: bigint;
  quantity: bigint;
  pricePerToken: bigint;
  startTimestamp: bigint;
  endTimestamp: bigint;
  listingCreator: string;
  assetContract: string;
  currency: string;
  tokenType: number;
  status: number;
  reserved: boolean;
}

interface NFTMetadata {
  [key: string]: unknown;
  name?: string;
  description?: string;
  image?: string;
  ubicacion?: string;
  habitaciones?: string | number;
  superficie?: string | number;
}

function PropertyDetailSkeleton() {
  return (
    <div className="animate-pulse grid md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden p-6 min-h-[380px]">
      <div className="w-full h-96 md:h-full bg-gray-200 dark:bg-zinc-700 rounded-xl" />
      <div className="space-y-6">
        <div className="h-9 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
        <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-700 rounded" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-700 rounded" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded w-1/2" />
      </div>
    </div>
  );
}

function PropertyAttributes({ metadata }: { metadata: NFTMetadata | null }) {
  if (!metadata) return null;
  const main = [
    { key: 'ubicacion', label: 'Ubicación', icon: '🏠' },
    { key: 'habitaciones', label: 'Habitaciones', icon: '🛏️' },
    { key: 'superficie', label: 'Superficie (m²)', icon: '📐' },
  ];
  const extra = Object.entries(metadata).filter(
    ([key]) =>
      ![
        'name',
        'description',
        'image',
        'ubicacion',
        'habitaciones',
        'superficie',
      ].includes(key),
  );
  return (
    <div className="mb-4">
      <div className="flex gap-2 flex-wrap mb-3">
        {main.map((attr) => {
          const value = metadata[attr.key as keyof NFTMetadata];
          if (typeof value === 'string' || typeof value === 'number') {
            return (
              <span
                key={attr.key}
                className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold"
              >
                {attr.icon} {attr.label}: {value}
              </span>
            );
          }
          return null;
        })}
      </div>
      {extra.length > 0 && (
        <table className="min-w-[200px] border bg-white/80 dark:bg-zinc-900/70 rounded-lg text-sm mb-4">
          <tbody>
            {extra.map(([key, value]) => (
              <tr key={key} className="border-b last:border-b-0">
                <td className="px-2 py-1 capitalize text-zinc-500">{key}</td>
                <td className="px-2 py-1">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PurchaseFeedback({ txHash }: { txHash?: string }) {
  if (!txHash) return null;
  return (
    <div className="bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-200 px-4 py-3 mt-6 rounded text-center font-semibold shadow-inner">
      ¡Compra realizada con éxito!
      <br />
      <a
        href={'https://polygonscan.com/tx/' + txHash}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-indigo-700 dark:text-indigo-200"
      >
        Ver transacción en Polygonscan
      </a>
    </div>
  );
}

export default function PropertyPage() {
  // Params
  const params = useParams() as Record<string, string | string[] | undefined>;
  const idParam = params.id;
  const stringId = Array.isArray(idParam) ? idParam[0] : idParam;

  let listingId: bigint | undefined = undefined;
  try {
    listingId = stringId ? BigInt(stringId) : undefined;
  } catch {
    listingId = undefined;
  }

  // Leer listing
  const method =
    'function getListing(uint256 _listingId) view returns ((uint256 listingId, uint256 tokenId, uint256 quantity, uint256 pricePerToken, uint128 startTimestamp, uint128 endTimestamp, address listingCreator, address assetContract, address currency, uint8 tokenType, uint8 status, bool reserved) listing)';
  const { data: listingRaw, isLoading } = useReadContract({
    contract: marketplaceContract,
    method,
    params: listingId !== undefined ? [listingId] : [0n],
  });

  function isListing(obj: unknown): obj is Listing {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'listingId' in obj &&
      'tokenId' in obj &&
      'pricePerToken' in obj
    );
  }
  const validListing = isListing(listingRaw);
  const listing: Listing | undefined = validListing
    ? (listingRaw as Listing)
    : undefined;

  const tokenId: bigint | undefined = listing?.tokenId;
  const pricePerToken: bigint | undefined = listing?.pricePerToken;
  const status: number | undefined = listing?.status;

  // TokenURI -> metadata
  const { data: tokenUriRaw } = useReadContract({
    contract: nftCollectionContract,
    method: 'tokenURI',
    params: [tokenId ?? 0n],
  });
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);

  useEffect(() => {
    if (!tokenUriRaw) {
      setMetadata(null);
      return;
    }
    const uri = String(tokenUriRaw).startsWith('ipfs://')
      ? String(tokenUriRaw).replace('ipfs://', 'https://ipfs.io/ipfs/')
      : String(tokenUriRaw);

    // Timeout para evitar que se quede cargando indefinidamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    fetch(uri, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (typeof data === 'object' && data !== null) {
          setMetadata(data as NFTMetadata);
        } else {
          setMetadata(null);
        }
      })
      .catch((error) => {
        console.warn('Error loading NFT metadata:', error);
        setMetadata(null);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  }, [tokenUriRaw]);

  // UI estado compra
  const [showBuy, setShowBuy] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  // Validaciones
  if (!stringId || listingId === undefined)
    return <p>Propiedad no encontrada.</p>;
  if (isLoading) return <PropertyDetailSkeleton />;
  if (!validListing || !listing) return <p>Propiedad no encontrada.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <NFTProvider contract={nftCollectionContract} tokenId={tokenId!}>
        <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden">
          {/* Imagen */}
          <div className="w-full h-96 md:h-full relative">
            <NFTMedia className="w-full h-full object-cover rounded-xl" />
          </div>

          {/* Contenido */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">
                <NFTName />
              </h1>
              <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                <NFTDescription />
              </p>
              <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-4">
                Precio: {pricePerToken ? Number(pricePerToken) / 1e18 : '--'}{' '}
                POL
              </p>

              {/* Atributos destacados */}
              <PropertyAttributes metadata={metadata} />
            </div>

            {status === 1 ? (
              <>
                <button
                  onClick={() => setShowBuy(true)}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition shadow font-bold text-lg w-full"
                >
                  Comprar ahora
                </button>
                <PurchaseFeedback txHash={txHash} />
              </>
            ) : (
              <p className="text-lg text-gray-400 mt-4 font-semibold">
                Propiedad no disponible para comprar.
                <br />
                Si el propietario la vuelve a listar, aparecerá aquí.
              </p>
            )}
          </div>
        </div>
      </NFTProvider>

      {/* Modal de compra (cripto/fiat) */}
      {showBuy && (
        <BuyModal
          open={showBuy}
          onClose={() => setShowBuy(false)}
          listingId={listingId}
          contractAddress={
            listing?.assetContract ??
            '0x35108cf18a2b1058036b95cb6B2A4257022ABD2e'
          }
          priceEUR={250000} // <— ejemplo: precio en EUR si quieres habilitar “Tarjeta”
          title="Completa tu compra"
          subtitle="Selecciona método de pago"
          onCryptoSuccess={(hash) => setTxHash(hash)}
        />
      )}
    </div>
  );
}
