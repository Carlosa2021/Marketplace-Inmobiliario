// src/app/api/marketplace/offers/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock offers data
const mockOffers: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const userId = searchParams.get('userId');

    let filteredOffers = [...mockOffers];

    if (listingId) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.listingId === listingId,
      );
    }

    if (userId) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.offeror === userId,
      );
    }

    return NextResponse.json(filteredOffers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const offerData = await request.json();

    // Validate required fields
    if (!offerData.listingId || !offerData.offeror || !offerData.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create new offer
    const newOffer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...offerData,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Add to mock data
    mockOffers.push(newOffer);

    return NextResponse.json(newOffer, { status: 201 });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 },
    );
  }
}
