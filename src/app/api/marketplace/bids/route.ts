// src/app/api/marketplace/bids/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock bids data
const mockBids: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const userId = searchParams.get('userId');

    let filteredBids = [...mockBids];

    if (listingId) {
      filteredBids = filteredBids.filter((bid) => bid.listingId === listingId);
    }

    if (userId) {
      filteredBids = filteredBids.filter((bid) => bid.bidder === userId);
    }

    return NextResponse.json(filteredBids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bidData = await request.json();

    // Validate required fields
    if (!bidData.listingId || !bidData.bidder || !bidData.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create new bid
    const newBid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...bidData,
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    // Add to mock data
    mockBids.push(newBid);

    return NextResponse.json(newBid, { status: 201 });
  } catch (error) {
    console.error('Error creating bid:', error);
    return NextResponse.json(
      { error: 'Failed to create bid' },
      { status: 500 },
    );
  }
}
