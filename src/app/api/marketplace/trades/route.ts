// src/app/api/marketplace/trades/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock trades data
const mockTrades: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');
    const userId = searchParams.get('userId');

    let filteredTrades = [...mockTrades];

    if (listingId) {
      filteredTrades = filteredTrades.filter(
        (trade) => trade.listingId === listingId,
      );
    }

    if (userId) {
      filteredTrades = filteredTrades.filter(
        (trade) => trade.buyer === userId || trade.seller === userId,
      );
    }

    return NextResponse.json(filteredTrades);
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tradeData = await request.json();

    // Validate required fields
    if (
      !tradeData.listingId ||
      !tradeData.buyer ||
      !tradeData.seller ||
      !tradeData.price
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create new trade
    const newTrade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...tradeData,
      timestamp: new Date().toISOString(),
      status: 'pending',
      txHash: '',
      fees: {
        platformFee: tradeData.totalValue * 0.025,
        royaltyFee: tradeData.totalValue * 0.01,
        gasFee: 5,
        processingFee: 0,
        total: tradeData.totalValue * 0.035 + 5,
      },
      settlement: {
        releaseConditions: ['payment_confirmed', 'ownership_transferred'],
        requiredSignatures: [tradeData.buyer, tradeData.seller],
        completedSignatures: [],
      },
    };

    // Add to mock data
    mockTrades.push(newTrade);

    return NextResponse.json(newTrade, { status: 201 });
  } catch (error) {
    console.error('Error creating trade:', error);
    return NextResponse.json(
      { error: 'Failed to create trade' },
      { status: 500 },
    );
  }
}
