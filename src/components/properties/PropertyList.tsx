'use client';
import React from 'react';
import Link from 'next/link';
import { NFTProvider, NFTMedia, NFTName, NFTDescription } from 'thirdweb/react';
import { useDirectListings } from '@/lib/thirdweb/hooks/useListings';
import { Card, CardContent } from '@/components/ui/card';
import { nftCollectionContract } from '@/lib/contracts';

// Loader visual (skeleton/shimmer)
function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl shadow-md bg-white dark:bg-zinc-900 border h-[380px] flex flex-col">
      <div className="h-60 w-full bg-gray-200 dark:bg-zinc-700 rounded-t-2xl mb-2" />
      <div className="flex-1 flex flex-col p-4 gap-2">
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-zinc-700 rounded mb-1" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded mb-2" />
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-zinc-700 rounded mt-auto" />
      </div>
    </div>
  );
}

export default function PropertyList() {
  const { listings, isLoading, error } = useDirectListings();

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="py-16 text-center text-red-500 text-lg">
        <svg
          className="mx-auto mb-3 opacity-30"
          width="54"
          height="54"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm0 17a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm0-9a1 1 0 0 0-1 1V13a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1Zm0 6a1.25 1.25 0 1 0 .001-2.501A1.25 1.25 0 0 0 12 16Z"
          />
        </svg>
        Error cargando propiedades: {error.message}
      </div>
    );

  if (!listings || listings.length === 0) {
    return (
      <div className="py-16 text-center text-xl text-muted-foreground">
        <svg
          className="mx-auto mb-3 opacity-20"
          width="70"
          height="70"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M5 21v-2h14v2Zm2-4V5q0-.825.588-1.412T9 3h6q.825 0 1.413.588T17 5v12Zm2-2h6V5h-6Z"
          />
        </svg>
        No hay propiedades listadas actualmente.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      {listings.map((listing) => (
        <NFTProvider
          contract={nftCollectionContract}
          tokenId={listing.tokenId}
          key={String(listing.id)}
        >
          <Card className="rounded-2xl shadow-md bg-white dark:bg-zinc-900 border hover:scale-105 transition-transform overflow-hidden cursor-pointer h-[420px] flex flex-col">
            <div className="w-full h-52 bg-card dark:bg-zinc-900 relative">
              <NFTMedia className="w-full h-full object-cover rounded-t-2xl bg-card dark:bg-zinc-900" />
            </div>
            <CardContent className="p-4 flex flex-col gap-2 flex-1 min-h-[160px]">
              <div className="flex-1">
                <NFTName className="text-lg font-bold truncate text-foreground block mb-2" />
                <NFTDescription className="text-xs text-muted-foreground line-clamp-2 block mb-3" />
              </div>

              <div className="mt-auto pt-3">
                <p className="mb-4 font-medium text-indigo-600 dark:text-indigo-300">
                  <span className="text-lg font-bold">
                    {listing.currencyValuePerToken?.displayValue || 'N/A'}{' '}
                    {listing.currencyValuePerToken?.symbol || 'ETH'}
                  </span>
                </p>
                <Link
                  href={`/marketplace/detalles_propiedad/${listing.id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 w-full text-center text-base inline-block shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  👁️ Ver detalles
                </Link>
              </div>
            </CardContent>
          </Card>
        </NFTProvider>
      ))}
    </div>
  );
}
