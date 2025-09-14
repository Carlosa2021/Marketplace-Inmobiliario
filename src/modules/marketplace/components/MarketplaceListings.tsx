// src/modules/marketplace/components/MarketplaceListings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../marketplace-provider';
import { MarketplaceListing } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  SortAsc,
  Heart,
  Eye,
  Clock,
  TrendingUp,
  MapPin,
  Home,
  DollarSign,
  Users,
} from 'lucide-react';
import {
  formatPrice,
  formatTimeRemaining,
  getListingTypeColor,
  getListingTypeLabel,
  calculateCurrentPrice,
  formatPropertyDetails,
  isAuctionActive,
} from '../utils';

export function MarketplaceListings() {
  const {
    state,
    getFilteredListings,
    searchListings,
    setSortBy,
    setFilter,
    selectListing,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  } = useMarketplace();

  const [showFilters, setShowFilters] = useState(false);
  const filteredListings = getFilteredListings();

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'ETH' ? 'EUR' : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Finalizada';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'auction':
        return 'bg-orange-100 text-orange-800';
      case 'fixed_price':
        return 'bg-green-100 text-green-800';
      case 'fractional_sale':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'auction':
        return 'Subasta';
      case 'fixed_price':
        return 'Precio Fijo';
      case 'fractional_sale':
        return 'Venta Fraccionada';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600">
            Descubre y invierte en propiedades inmobiliarias tokenizadas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            {state.onlineUsers} usuarios en línea
          </Badge>
          <Badge variant="outline">
            {filteredListings.length} propiedades disponibles
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar propiedades..."
                value={state.searchQuery}
                onChange={(e) => searchListings(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <select
              value={state.sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Más Recientes</option>
              <option value="price">Precio</option>
              <option value="popular">Populares</option>
              <option value="ending_soon">Finalizando Pronto</option>
            </select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Precio
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={state.filterBy.priceRange[0]}
                      onChange={(e) =>
                        setFilter({
                          priceRange: [
                            Number(e.target.value),
                            state.filterBy.priceRange[1],
                          ],
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={state.filterBy.priceRange[1]}
                      onChange={(e) =>
                        setFilter({
                          priceRange: [
                            state.filterBy.priceRange[0],
                            Number(e.target.value),
                          ],
                        })
                      }
                    />
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Propiedad
                  </label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const selected = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      );
                      setFilter({ propertyType: selected });
                    }}
                  >
                    <option value="residential">Residencial</option>
                    <option value="commercial">Comercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="retail">Retail</option>
                    <option value="office">Oficinas</option>
                  </select>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Venta
                  </label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const selected = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      );
                      setFilter({ listingType: selected });
                    }}
                  >
                    <option value="fixed_price">Precio Fijo</option>
                    <option value="auction">Subasta</option>
                    <option value="fractional_sale">Venta Fraccionada</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const selected = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      );
                      setFilter({ location: selected });
                    }}
                  >
                    <option value="Madrid">Madrid</option>
                    <option value="Barcelona">Barcelona</option>
                    <option value="Valencia">Valencia</option>
                    <option value="Sevilla">Sevilla</option>
                    <option value="Bilbao">Bilbao</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured Listings */}
      {state.featuredListings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Propiedades Destacadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.featuredListings.slice(0, 3).map((listing) => (
              <FeaturedListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {state.isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onAddToWatchlist={addToWatchlist}
                onRemoveFromWatchlist={removeFromWatchlist}
                isInWatchlist={isInWatchlist(listing.id)}
                onSelect={selectListing}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay propiedades
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron propiedades que coincidan con tus criterios de
                búsqueda.
              </p>
              <Button
                className="mt-6"
                onClick={() => {
                  searchListings('');
                  setFilter({
                    priceRange: [0, 10000000],
                    location: [],
                    propertyType: [],
                    listingType: [],
                  });
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface ListingCardProps {
  listing: MarketplaceListing;
  onAddToWatchlist: (id: string) => void;
  onRemoveFromWatchlist: (id: string) => void;
  isInWatchlist: boolean;
  onSelect: (listing: MarketplaceListing) => void;
}

function ListingCard({
  listing,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
  onSelect,
}: ListingCardProps) {
  const { state } = useMarketplace();
  const currentPrice = state.priceUpdates[listing.id] || listing.price.amount;
  const bidsCount = state.bidsCount[listing.id] || 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={listing.images[0] || '/images/fondo.png'}
            alt={listing.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3">
            <Badge className={getListingTypeColor(listing.listingType)}>
              {getListingTypeLabel(listing.listingType)}
            </Badge>
          </div>

          {/* Watchlist Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              if (isInWatchlist) {
                onRemoveFromWatchlist(listing.id);
              } else {
                onAddToWatchlist(listing.id);
              }
            }}
          >
            <Heart
              className={`h-4 w-4 ${
                isInWatchlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </Button>

          {/* Auction Timer */}
          {listing.listingType === 'auction' && listing.auction && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeRemaining(listing.auction.endTime)}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4" onClick={() => onSelect(listing)}>
        <div className="space-y-3">
          {/* Title and Location */}
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {listing.title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {listing.location}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(currentPrice, listing.price.currency)}
              </p>
              {listing.listingType === 'fractional_sale' &&
                listing.fractional && (
                  <p className="text-xs text-gray-500">
                    por {listing.fractional.sharePrice} / participación
                  </p>
                )}
            </div>

            {listing.listingType === 'auction' && bidsCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {bidsCount} ofertas
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.metadata?.views || 0} vistas
            </div>

            {listing.listingType === 'fractional_sale' &&
              listing.fractional && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {listing.fractional.totalShares -
                    listing.fractional.availableShares}{' '}
                  / {listing.fractional.totalShares}
                </div>
              )}

            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {listing.metadata?.appreciationRate || 0}%
            </div>
          </div>

          {/* Action Button */}
          <Button
            className="w-full mt-3"
            variant={listing.listingType === 'auction' ? 'outline' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(listing);
            }}
          >
            {listing.listingType === 'auction'
              ? 'Hacer Oferta'
              : 'Comprar Ahora'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FeaturedListingCard({ listing }: { listing: MarketplaceListing }) {
  const { selectListing } = useMarketplace();

  return (
    <Card
      className="relative overflow-hidden cursor-pointer group"
      onClick={() => selectListing(listing)}
    >
      <div className="relative h-64">
        <img
          src={listing.images[0] || '/images/fondo.png'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <Badge className="bg-yellow-500 text-yellow-900 mb-2">
            Destacada
          </Badge>
          <h3 className="text-xl font-bold mb-1">{listing.title}</h3>
          <div className="flex items-center text-sm mb-2">
            <MapPin className="h-3 w-3 mr-1" />
            {listing.location}
          </div>
          <p className="text-lg font-semibold">
            {new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 0,
            }).format(listing.price.amount)}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Badge component (if not available in UI library)
function Badge({
  children,
  className,
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}) {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700'
      : 'bg-gray-100 text-gray-800';

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}
