'use client';
import { useEffect, useState } from 'react';
import { getAllListings } from 'thirdweb/extensions/marketplace';
import { marketplaceContract, nftCollectionContract } from '@/lib/contracts';
import { NFTCard } from '@/components/ui/NFTCard';
import type { DirectListing } from 'thirdweb/extensions/marketplace';

// Loader visual para cards
function NFTCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden p-4 min-h-[330px] flex flex-col">
      <div className="bg-gray-200 dark:bg-zinc-700 h-48 w-full rounded mb-5" />
      <div className="h-6 bg-gray-200 dark:bg-zinc-700 w-2/3 rounded mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-zinc-700 w-1/2 rounded mb-3" />
      <div className="h-8 bg-gray-200 dark:bg-zinc-800 w-full rounded mt-auto" />
    </div>
  );
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<DirectListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [sort, setSort] = useState<'recent' | 'low-high' | 'high-low'>(
    'recent',
  );

  useEffect(() => {
    const loadListings = async () => {
      try {
        const data = await getAllListings({
          contract: marketplaceContract,
          start: 0,
          count: 50n,
        });
        setListings(data as DirectListing[]);
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadListings();
  }, []);

  // Filtro y orden robusto
  const filteredListings = listings
    .filter(
      (l) =>
        (l.asset?.metadata?.name?.toLowerCase() ?? '').includes(
          search.toLowerCase(),
        ) ||
        (l.asset?.metadata?.description?.toLowerCase() ?? '').includes(
          search.toLowerCase(),
        ),
    )
    .sort((a, b) => {
      if (sort === 'low-high') {
        return (
          Number(a.currencyValuePerToken.value) -
          Number(b.currencyValuePerToken.value)
        );
      } else if (sort === 'high-low') {
        return (
          Number(b.currencyValuePerToken.value) -
          Number(a.currencyValuePerToken.value)
        );
      }
      return Number(b.startTimeInSeconds) - Number(a.startTimeInSeconds);
    });

  return (
    <div className="flex flex-col bg-background text-foreground min-h-screen">
      <section className="relative bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-extrabold mb-2 drop-shadow">
          Marketplace Inmobiliario Web3
        </h1>
        <p className="text-xl opacity-80 mb-2">
          Explora, invierte y tokeniza propiedades onchain al instante
        </p>
        <span className="inline-block bg-white/20 rounded px-4 py-2 mt-6 font-bold text-lg">
          {loading
            ? 'Cargando listados...'
            : filteredListings.length === 1
            ? '1 inmueble disponible'
            : `${filteredListings.length} inmuebles disponibles`}
        </span>
      </section>

      <section className="max-w-7xl mx-auto mt-10 px-4 flex flex-col md:flex-row items-center gap-6">
        <input
          type="text"
          value={search}
          placeholder="Buscar NFT por nombre o descripción"
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-full px-5 py-3 text-lg w-full md:w-96 bg-zinc-50 dark:bg-zinc-800"
        />
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as 'recent' | 'low-high' | 'high-low')
          }
          className="border rounded-full px-5 py-3 text-lg bg-zinc-50 dark:bg-zinc-800"
        >
          <option value="recent">Agregados recientemente</option>
          <option value="low-high">Precio: de menor a mayor</option>
          <option value="high-low">Precio: de mayor a menor</option>
        </select>
      </section>

      <section id="listings" className="max-w-7xl mx-auto mt-8 px-4 py-12">
        <h2 className="text-3xl font-bold mb-10 text-center text-zinc-800 dark:text-zinc-100">
          Inmuebles Web3
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <NFTCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center mt-20 text-xl text-gray-500">
            <svg
              className="mx-auto mb-3 opacity-20"
              width="80"
              height="80"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M5 21v-2h14v2Zm2-4V5q0-.825.588-1.412T9 3h6q.825 0 1.413.588T17 5v12Zm2-2h6V5h-6Z"
              />
            </svg>
            No se encontraron propiedades con esos filtros.
            <div className="mt-2 text-sm opacity-80">
              Prueba con otros términos.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredListings.map((listing) => (
              <NFTCard
                key={listing.id.toString()}
                listingId={Number(listing.id)}
                tokenId={Number(listing.tokenId)}
                contract={nftCollectionContract}
                price={`${listing.currencyValuePerToken.displayValue} ${listing.currencyValuePerToken.symbol}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
