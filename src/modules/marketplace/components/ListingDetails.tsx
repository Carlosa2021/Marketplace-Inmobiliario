// src/modules/marketplace/components/ListingDetails.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../marketplace-provider';
import { MarketplaceListing, Bid } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Share2,
  Clock,
  Users,
  TrendingUp,
  MapPin,
  Home,
  Calendar,
  DollarSign,
  Gavel,
  ShoppingCart,
  LineChart,
  Info,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';

interface ListingDetailsProps {
  listing: MarketplaceListing;
  onClose: () => void;
}

export function ListingDetails({ listing, onClose }: ListingDetailsProps) {
  const {
    state,
    placeBid,
    buyNow,
    makeOffer,
    getMarketAnalytics,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'bids' | 'analytics' | 'history'
  >('overview');
  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentPrice = state.priceUpdates[listing.id] || listing.price.amount;
  const bidsCount = state.bidsCount[listing.id] || 0;
  const isWatched = isInWatchlist(listing.id);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const analyticsData = await getMarketAnalytics(listing.tokenId);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!bidAmount) return;

    try {
      await placeBid(listing.id, {
        listingId: listing.id,
        bidder: 'current_user', // Replace with actual user ID
        amount: parseFloat(bidAmount),
        currency: listing.price.currency,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        status: 'active',
      });

      setBidAmount('');
      setShowBidModal(false);
    } catch (error) {
      console.error('Failed to place bid:', error);
    }
  };

  const handleBuyNow = async () => {
    try {
      await buyNow(listing.id, quantity);
    } catch (error) {
      console.error('Failed to buy now:', error);
    }
  };

  const handleMakeOffer = async () => {
    if (!offerAmount) return;

    try {
      await makeOffer(listing.id, {
        listingId: listing.id,
        offeror: 'current_user',
        amount: parseFloat(offerAmount),
        currency: listing.price.currency,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending',
      });

      setOfferAmount('');
      setShowOfferModal(false);
    } catch (error) {
      console.error('Failed to make offer:', error);
    }
  };

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

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getListingStatus = () => {
    if (listing.status === 'sold')
      return { label: 'Vendida', color: 'bg-green-100 text-green-800' };
    if (listing.status === 'expired')
      return { label: 'Expirada', color: 'bg-red-100 text-red-800' };
    if (listing.listingType === 'auction' && listing.auction) {
      const isEnded = new Date() > new Date(listing.auction.endTime);
      if (isEnded)
        return {
          label: 'Subasta Finalizada',
          color: 'bg-orange-100 text-orange-800',
        };
      return { label: 'Subasta Activa', color: 'bg-blue-100 text-blue-800' };
    }
    return { label: 'Disponible', color: 'bg-green-100 text-green-800' };
  };

  const status = getListingStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {listing.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location}
              </div>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                isWatched
                  ? removeFromWatchlist(listing.id)
                  : addToWatchlist(listing.id)
              }
            >
              <Heart
                className={`h-4 w-4 ${
                  isWatched ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Image Gallery */}
          <div className="lg:w-1/2 p-6">
            <div className="space-y-4">
              <img
                src={listing.images[0] || '/images/fondo.png'}
                alt={listing.title}
                className="w-full h-80 object-cover rounded-lg"
              />

              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${listing.title} ${index + 2}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Resumen', icon: Info },
                  { id: 'bids', label: 'Ofertas', icon: Gavel },
                  { id: 'analytics', label: 'Análisis', icon: LineChart },
                  { id: 'history', label: 'Historial', icon: Calendar },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <OverviewTab listing={listing} currentPrice={currentPrice} />
              )}

              {activeTab === 'bids' && (
                <BidsTab
                  listing={listing}
                  bidsCount={bidsCount}
                  onPlaceBid={() => setShowBidModal(true)}
                  onMakeOffer={() => setShowOfferModal(true)}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsTab
                  listing={listing}
                  analytics={analytics}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'history' && <HistoryTab listing={listing} />}
            </div>

            {/* Action Bar */}
            <div className="border-t p-6">
              <ActionBar
                listing={listing}
                currentPrice={currentPrice}
                quantity={quantity}
                setQuantity={setQuantity}
                onBuyNow={handleBuyNow}
                onPlaceBid={() => setShowBidModal(true)}
                onMakeOffer={() => setShowOfferModal(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <BidModal
          listing={listing}
          bidAmount={bidAmount}
          setBidAmount={setBidAmount}
          onPlaceBid={handlePlaceBid}
          onClose={() => setShowBidModal(false)}
        />
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <OfferModal
          listing={listing}
          offerAmount={offerAmount}
          setOfferAmount={setOfferAmount}
          onMakeOffer={handleMakeOffer}
          onClose={() => setShowOfferModal(false)}
        />
      )}
    </div>
  );
}

// Tab Components
function OverviewTab({
  listing,
  currentPrice,
}: {
  listing: MarketplaceListing;
  currentPrice: number;
}) {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'ETH' ? 'EUR' : currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Price Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Información de Precio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Precio Actual</p>
              <p className="text-2xl font-bold">
                {formatPrice(currentPrice, listing.price.currency)}
              </p>
            </div>

            {listing.listingType === 'fractional_sale' &&
              listing.fractional && (
                <div>
                  <p className="text-sm text-gray-600">
                    Precio por Participación
                  </p>
                  <p className="text-xl font-semibold">
                    {formatPrice(
                      listing.fractional.sharePrice,
                      listing.price.currency,
                    )}
                  </p>
                </div>
              )}

            {listing.listingType === 'auction' && listing.auction && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Precio de Salida</p>
                  <p className="text-lg font-semibold">
                    {formatPrice(
                      listing.auction.startPrice,
                      listing.price.currency,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precio de Reserva</p>
                  <p className="text-lg font-semibold">
                    {listing.auction.reservePrice
                      ? formatPrice(
                          listing.auction.reservePrice,
                          listing.price.currency,
                        )
                      : 'Sin reserva'}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Detalles de la Propiedad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">{listing.description}</p>

            {listing.metadata && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {Object.entries(listing.metadata).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </p>
                    <p className="font-medium">{value?.toString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fractional Info */}
      {listing.listingType === 'fractional_sale' && listing.fractional && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Venta Fraccionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Participaciones Totales</p>
                <p className="text-lg font-semibold">
                  {listing.fractional.totalShares}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Disponibles</p>
                <p className="text-lg font-semibold">
                  {listing.fractional.availableShares}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Compra Mínima</p>
                <p className="text-lg font-semibold">
                  {listing.fractional.minPurchase}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Compra Máxima</p>
                <p className="text-lg font-semibold">
                  {listing.fractional.maxPurchase || 'Sin límite'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BidsTab({
  listing,
  bidsCount,
  onPlaceBid,
  onMakeOffer,
}: {
  listing: MarketplaceListing;
  bidsCount: number;
  onPlaceBid: () => void;
  onMakeOffer: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ofertas ({bidsCount})</h3>
        <div className="space-x-2">
          {listing.listingType === 'auction' ? (
            <Button onClick={onPlaceBid}>
              <Gavel className="h-4 w-4 mr-2" />
              Hacer Oferta
            </Button>
          ) : (
            <Button variant="outline" onClick={onMakeOffer}>
              Hacer Oferta
            </Button>
          )}
        </div>
      </div>

      {/* Auction Timer */}
      {listing.listingType === 'auction' && listing.auction && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Tiempo Restante</span>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {/* {formatTimeRemaining(listing.auction.endTime)} */}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bids List */}
      <div className="space-y-3">
        {[...Array(bidsCount || 0)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Usuario {index + 1}</p>
                  <p className="text-sm text-gray-600">
                    Hace {Math.floor(Math.random() * 60)} minutos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    €
                    {(
                      listing.price.amount *
                      (1 + index * 0.1)
                    ).toLocaleString()}
                  </p>
                  {index === 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      Oferta más alta
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {bidsCount === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Gavel className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay ofertas aún</p>
            <p className="text-sm">¡Sé el primero en hacer una oferta!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab({
  listing,
  analytics,
  isLoading,
}: {
  listing: MarketplaceListing;
  analytics: any;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Rendimiento 30d</p>
              <p className="text-lg font-semibold text-green-600">+5.2%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Volatilidad</p>
              <p className="text-lg font-semibold">12.5%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Volumen 24h</p>
              <p className="text-lg font-semibold">€125,000</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cap. de Mercado</p>
              <p className="text-lg font-semibold">€2.5M</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Precio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de precio (implementar con librería de gráficos)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryTab({ listing }: { listing: MarketplaceListing }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historial de Transacciones</h3>

      <div className="space-y-3">
        {[
          {
            type: 'listing',
            date: listing.createdAt,
            description: 'Propiedad listada',
          },
          {
            type: 'view',
            date: new Date().toISOString(),
            description: 'Primeras vistas',
          },
        ].map((event, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">{event.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ActionBar({
  listing,
  currentPrice,
  quantity,
  setQuantity,
  onBuyNow,
  onPlaceBid,
  onMakeOffer,
}: {
  listing: MarketplaceListing;
  currentPrice: number;
  quantity: number;
  setQuantity: (quantity: number) => void;
  onBuyNow: () => void;
  onPlaceBid: () => void;
  onMakeOffer: () => void;
}) {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'ETH' ? 'EUR' : currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPrice = currentPrice * quantity;

  if (listing.status !== 'active') {
    return (
      <div className="text-center py-4">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-gray-600">Esta propiedad ya no está disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector for Fractional Sales */}
      {listing.listingType === 'fractional_sale' && listing.fractional && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad de Participaciones
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= listing.fractional.minPurchase}
            >
              -
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min={listing.fractional.minPurchase}
              max={
                listing.fractional.maxPurchase ||
                listing.fractional.availableShares
              }
              className="w-20 text-center"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              disabled={
                quantity >=
                (listing.fractional.maxPurchase ||
                  listing.fractional.availableShares)
              }
            >
              +
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Min: {listing.fractional.minPurchase}, Max:{' '}
            {listing.fractional.maxPurchase || 'Sin límite'}
          </p>
        </div>
      )}

      {/* Price Display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Precio Total</p>
          <p className="text-2xl font-bold">
            {formatPrice(totalPrice, listing.price.currency)}
          </p>
        </div>

        {listing.listingType === 'auction' && listing.auction && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Oferta Actual</p>
            <p className="text-lg font-semibold">
              {formatPrice(
                listing.auction.currentBid || listing.auction.startPrice,
                listing.price.currency,
              )}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {listing.listingType === 'auction' ? (
          <>
            <Button onClick={onPlaceBid} className="flex-1">
              <Gavel className="h-4 w-4 mr-2" />
              Hacer Oferta
            </Button>
            <Button variant="outline" onClick={onMakeOffer}>
              Ofertar
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onBuyNow} className="flex-1">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Comprar Ahora
            </Button>
            <Button variant="outline" onClick={onMakeOffer}>
              Hacer Oferta
            </Button>
          </>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900">Transacción Segura</p>
          <p className="text-blue-700">
            Todas las transacciones están protegidas por smart contracts y
            garantía de devolución.
          </p>
        </div>
      </div>
    </div>
  );
}

// Modal Components
function BidModal({
  listing,
  bidAmount,
  setBidAmount,
  onPlaceBid,
  onClose,
}: {
  listing: MarketplaceListing;
  bidAmount: string;
  setBidAmount: (amount: string) => void;
  onPlaceBid: () => void;
  onClose: () => void;
}) {
  const minBid =
    listing.listingType === 'auction' && listing.auction
      ? listing.auction.currentBid + listing.auction.bidIncrement
      : listing.price.amount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Hacer Oferta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de la Oferta
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Mínimo: €${minBid.toLocaleString()}`}
                className="pl-10"
                min={minBid}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={onPlaceBid}
              className="flex-1"
              disabled={!bidAmount || parseFloat(bidAmount) < minBid}
            >
              Confirmar Oferta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OfferModal({
  listing,
  offerAmount,
  setOfferAmount,
  onMakeOffer,
  onClose,
}: {
  listing: MarketplaceListing;
  offerAmount: string;
  setOfferAmount: (amount: string) => void;
  onMakeOffer: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hacer Oferta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de la Oferta
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Ingrese su oferta"
                className="pl-10"
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              Tu oferta será válida por 7 días. El vendedor puede aceptarla,
              rechazarla o hacer una contraoferta.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={onMakeOffer}
              className="flex-1"
              disabled={!offerAmount || parseFloat(offerAmount) <= 0}
            >
              Enviar Oferta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
