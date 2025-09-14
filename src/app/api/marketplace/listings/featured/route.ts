// src/app/api/marketplace/listings/featured/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock featured listings
const featuredListings = [
  {
    id: 'listing_1',
    propertyId: 'prop_001',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '1',
    seller: '0xabcdef1234567890123456789012345678901234',
    listingType: 'fixed_price',
    status: 'active',
    price: {
      amount: 450000,
      currency: 'EUR',
    },
    metadata: {
      title: 'Apartamento Moderno en Madrid Centro',
      description:
        'Hermoso apartamento de 2 habitaciones en el corazón de Madrid',
      location: 'Madrid, España',
      images: ['/images/fondo1.jpg', '/images/fondo2.jpg'],
      propertyType: 'residential',
      bedrooms: 2,
      bathrooms: 2,
      squareMeters: 85,
      yearBuilt: 2018,
      neighborhood: 'Centro',
      rentYield: 4.5,
      appreciationRate: 8.2,
      views: 156,
    },
    verification: {
      status: 'verified',
      verifiedAt: '2025-09-01T10:00:00Z',
      verifiedBy: 'admin',
      documents: ['property_deed', 'valuation_report'],
    },
    liquidity: {
      volume24h: 125000,
      volume7d: 680000,
      liquidityScore: 0.85,
      marketDepth: 250000,
    },
    createdAt: '2025-09-10T08:30:00Z',
    updatedAt: '2025-09-12T14:20:00Z',
  },
  {
    id: 'listing_3',
    propertyId: 'prop_003',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '3',
    seller: '0x567890123456789012345678901234567890ab',
    listingType: 'fractional_sale',
    status: 'active',
    price: {
      amount: 800000,
      currency: 'EUR',
      pricePerShare: 800,
    },
    fractional: {
      totalShares: 1000,
      availableShares: 650,
      minPurchase: 5,
      maxPurchase: 100,
      reservePrice: 750000,
    },
    metadata: {
      title: 'Edificio Comercial en Valencia',
      description: 'Edificio de oficinas en zona comercial premium',
      location: 'Valencia, España',
      images: ['/images/fondo1.jpg', '/images/fondo2.jpg'],
      propertyType: 'commercial',
      bedrooms: 0,
      bathrooms: 8,
      squareMeters: 450,
      yearBuilt: 2020,
      neighborhood: 'Ciudad de las Ciencias',
      rentYield: 7.8,
      appreciationRate: 12.5,
      views: 89,
    },
    verification: {
      status: 'verified',
      verifiedAt: '2025-09-05T12:00:00Z',
      verifiedBy: 'admin',
      documents: ['property_deed', 'valuation_report', 'rental_agreement'],
    },
    liquidity: {
      volume24h: 280000,
      volume7d: 1250000,
      liquidityScore: 0.92,
      marketDepth: 420000,
    },
    createdAt: '2025-09-05T09:45:00Z',
    updatedAt: '2025-09-12T10:30:00Z',
  },
];

export async function GET() {
  try {
    return NextResponse.json(featuredListings);
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured listings' },
      { status: 500 },
    );
  }
}
