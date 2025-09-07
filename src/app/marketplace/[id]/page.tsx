'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useReadContract,
  useActiveAccount,
  NFTProvider,
  NFTMedia,
  NFTName,
  NFTDescription,
} from 'thirdweb/react';
// 👇 Elimina prepareContractCall porque ya no se usa
// import { prepareContractCall } from 'thirdweb';
import { nftCollectionContract, marketplaceContract } from '@/lib/contracts';
import { Button } from '@/components/ui/button';
// 👇 Corrige la ruta del modal
import { BuyModal } from '@/components/ui/BuyModal';

// Tipos estrictos
interface CurrencyData {
  displayValue: string;
  symbol: string;
  currencyAddress: string;
  totalPriceWei: string | bigint | number;
}
interface Listing {
  id: string | bigint | number;
  tokenId: string | bigint | number;
  currencyValuePerToken: CurrencyData;
}

function toBigIntSafe(value: string | number | bigint): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string') return BigInt(value);
  if (typeof value === 'number') return BigInt(Math.floor(value));
  throw new Error('Invalid value for BigInt conversion');
}

function isValidCurrency(raw: unknown): raw is CurrencyData {
  if (typeof raw !== 'object' || raw === null) return false;
  const c = raw as Record<string, unknown>;
  return (
    typeof c.displayValue === 'string' &&
    typeof c.symbol === 'string' &&
    typeof c.currencyAddress === 'string' &&
    (typeof c.totalPriceWei === 'string' ||
      typeof c.totalPriceWei === 'bigint' ||
      typeof c.totalPriceWei === 'number')
  );
}

function isValidListing(obj: unknown): obj is Listing {
  if (typeof obj !== 'object' || obj === null) return false;
  const l = obj as Record<string, unknown>;
  return (
    (typeof l.id === 'bigint' ||
      typeof l.id === 'string' ||
      typeof l.id === 'number') &&
    (typeof l.tokenId === 'bigint' ||
      typeof l.tokenId === 'string' ||
      typeof l.tokenId === 'number') &&
    isValidCurrency(l.currencyValuePerToken)
  );
}

export default function PropertyPage() {
  const { id } = useParams() as { id?: string };
  const [openModal, setOpenModal] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null); // ← para mostrar el link a Polygonscan

  let listingId: bigint | undefined = undefined;
  try {
    listingId = id ? BigInt(id) : undefined;
  } catch {
    listingId = undefined;
  }

  const account = useActiveAccount();

  const { data: listingRaw, isLoading } = useReadContract({
    contract: marketplaceContract,
    method: 'getListing',
    params: [listingId ?? 0n],
  });

  let listing:
    | {
        id: bigint;
        tokenId: bigint;
        currencyValuePerToken: {
          displayValue: string;
          symbol: string;
          currencyAddress: string;
          totalPriceWei: bigint;
        };
      }
    | undefined = undefined;

  if (isValidListing(listingRaw)) {
    listing = {
      id: toBigIntSafe(listingRaw.id),
      tokenId: toBigIntSafe(listingRaw.tokenId),
      currencyValuePerToken: {
        displayValue: listingRaw.currencyValuePerToken.displayValue,
        symbol: listingRaw.currencyValuePerToken.symbol,
        currencyAddress: listingRaw.currencyValuePerToken.currencyAddress,
        totalPriceWei: toBigIntSafe(
          listingRaw.currencyValuePerToken.totalPriceWei,
        ),
      },
    };
  }

  if (isLoading) return <p className="text-lg">Cargando propiedad...</p>;
  if (!listing)
    return <p className="text-lg text-red-600">Propiedad no encontrada.</p>;

  // Precio EUR para la opción tarjeta (ponlo desde metadata cuando lo tengas)
  const priceEUR =
    Number(process.env.NEXT_PUBLIC_DEFAULT_EUR_PRICE ?? '') || 120000;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <NFTProvider contract={nftCollectionContract} tokenId={listing.tokenId}>
        <div className="rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900">
          <NFTMedia className="w-full h-96 object-cover" />
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-3">
              <NFTName />
            </h1>
            <p className="text-gray-600 mb-4 text-lg">
              <NFTDescription />
            </p>

            <p className="text-xl font-semibold mb-6">
              Precio: {listing.currencyValuePerToken.displayValue}{' '}
              {listing.currencyValuePerToken.symbol}
            </p>

            {/* Un único botón que abre el modal con CRIPTO o TARJETA */}
            <Button
              size="lg"
              disabled={!account}
              onClick={() => setOpenModal(true)}
              className="w-full text-lg bg-indigo-600 hover:bg-pink-500"
            >
              Comprar
            </Button>

            {/* Modal con ambas opciones */}
            <BuyModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              listingId={listing.id}
              priceEUR={priceEUR}
              onCryptoSuccess={(hash: string) => {
                setTxHash(hash);
              }}
            />

            {/* Mensajes / resultado */}
            {txHash && (
              <div className="bg-green-100 rounded px-4 py-2 mt-6 text-green-700 text-center">
                Compra realizada con éxito.
                <br />
                <a
                  className="underline"
                  href={`https://polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver transacción en Polygonscan
                </a>
              </div>
            )}
          </div>
        </div>
      </NFTProvider>
    </div>
  );
}
