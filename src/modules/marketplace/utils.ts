// src/modules/marketplace/utils.ts

export function formatPrice(amount: number, currency: string): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  return `${amount.toLocaleString()} ${currency}`;
}

export function formatTimeRemaining(endTime: string): string {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Finalizada';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function getListingTypeColor(listingType: string): string {
  switch (listingType) {
    case 'fixed_price':
      return 'bg-blue-100 text-blue-800';
    case 'auction':
      return 'bg-red-100 text-red-800';
    case 'fractional_sale':
      return 'bg-green-100 text-green-800';
    case 'buyout_offer':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getListingTypeLabel(listingType: string): string {
  switch (listingType) {
    case 'fixed_price':
      return 'Precio Fijo';
    case 'auction':
      return 'Subasta';
    case 'fractional_sale':
      return 'Venta Fraccionada';
    case 'buyout_offer':
      return 'Oferta de Compra';
    default:
      return listingType;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'sold':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'sold':
      return 'Vendido';
    case 'cancelled':
      return 'Cancelado';
    case 'expired':
      return 'Expirado';
    case 'pending':
      return 'Pendiente';
    default:
      return status;
  }
}

export function calculateCurrentPrice(listing: any): number {
  if (listing.listingType === 'auction' && listing.auction) {
    return listing.auction.currentBid || listing.auction.startPrice;
  }
  return listing.price.amount;
}

export function isAuctionActive(listing: any): boolean {
  if (listing.listingType !== 'auction' || !listing.auction) {
    return false;
  }

  const now = new Date();
  const endTime = new Date(listing.auction.endTime);
  return now < endTime && listing.status === 'active';
}

export function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatPropertyDetails(metadata: any): string {
  const details = [];

  if (metadata?.bedrooms) {
    details.push(`${metadata.bedrooms} hab`);
  }

  if (metadata?.bathrooms) {
    details.push(`${metadata.bathrooms} baños`);
  }

  if (metadata?.sqft) {
    details.push(`${metadata.sqft} m²`);
  }

  return details.join(' • ');
}

export function calculateROI(price: number, monthlyIncome: number): number {
  if (!monthlyIncome || price === 0) return 0;
  const annualIncome = monthlyIncome * 12;
  return (annualIncome / price) * 100;
}

export function validateListingData(listing: any): boolean {
  const required = ['title', 'description', 'location', 'price', 'seller'];
  return required.every((field) => listing[field] && listing[field] !== '');
}
