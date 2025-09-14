// src/app/api/marketplace/listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Mock data - In production, this would connect to your database
const mockListings: any[] = [
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
    id: 'listing_2',
    propertyId: 'prop_002',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '2',
    seller: '0xdef123456789012345678901234567890abcdef',
    listingType: 'auction',
    status: 'active',
    price: {
      amount: 320000,
      currency: 'EUR',
    },
    auction: {
      startPrice: 280000,
      reservePrice: 300000,
      currentBid: 315000,
      bidCount: 8,
      highestBidder: '0x789012345678901234567890123456789012',
      startTime: '2025-09-10T09:00:00Z',
      endTime: '2025-09-15T18:00:00Z',
      bidIncrement: 5000,
      extendOnBid: true,
    },
    metadata: {
      title: 'Casa Familiar en Barcelona',
      description: 'Casa de 3 habitaciones con jardín en zona residencial',
      location: 'Barcelona, España',
      images: ['/images/fondo3.png', '/images/fondo4.jpg'],
      propertyType: 'residential',
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      yearBuilt: 2015,
      neighborhood: 'Eixample',
      rentYield: 5.2,
      appreciationRate: 6.8,
      views: 203,
    },
    verification: {
      status: 'verified',
      verifiedAt: '2025-09-08T15:30:00Z',
      verifiedBy: 'admin',
      documents: ['property_deed', 'valuation_report', 'building_permit'],
    },
    liquidity: {
      volume24h: 95000,
      volume7d: 520000,
      liquidityScore: 0.78,
      marketDepth: 180000,
    },
    createdAt: '2025-09-08T11:15:00Z',
    updatedAt: '2025-09-12T16:45:00Z',
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const featured = searchParams.get('featured');

    let filteredListings = [...mockListings];

    // Apply filters
    if (status) {
      filteredListings = filteredListings.filter(
        (listing) => listing.status === status,
      );
    }

    if (type) {
      filteredListings = filteredListings.filter(
        (listing) => listing.listingType === type,
      );
    }

    if (location) {
      filteredListings = filteredListings.filter((listing) =>
        listing.metadata.location
          .toLowerCase()
          .includes(location.toLowerCase()),
      );
    }

    if (featured === 'true') {
      // Return featured listings (e.g., highest volume or verified)
      filteredListings = filteredListings
        .filter((listing) => listing.liquidity.liquidityScore > 0.8)
        .slice(0, 3);
    }

    return NextResponse.json(filteredListings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const listingData = await request.json();

    // Validate required fields
    if (
      !listingData.contractAddress ||
      !listingData.tokenId ||
      !listingData.metadata?.title
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create new listing
    const newListing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...listingData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verification: {
        status: 'pending',
        verifiedAt: null,
        verifiedBy: null,
        documents: [],
      },
      liquidity: {
        volume24h: 0,
        volume7d: 0,
        liquidityScore: 0,
        marketDepth: 0,
      },
    };

    // Add to mock data
    mockListings.push(newListing);

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 },
    );
  }
}
