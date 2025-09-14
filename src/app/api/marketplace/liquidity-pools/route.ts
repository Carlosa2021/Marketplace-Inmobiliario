// src/app/api/marketplace/liquidity-pools/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Mock liquidity pools data
const mockPools = [
  {
    id: 'pool_prop001_usdc',
    propertyToken: 'PROP001',
    pairedToken: 'USDC',
    totalLiquidity: 1250000,
    volume24h: 85000,
    volume7d: 520000,
    apr: 12.5,
    providers: 23,
    fee: 0.003,
    priceImpact: 0.02,
    token0Reserve: 625000,
    token1Reserve: 625000,
    lpTokenSupply: 1250000,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-12T14:20:00Z',
  },
  {
    id: 'pool_prop002_eth',
    propertyToken: 'PROP002',
    pairedToken: 'ETH',
    totalLiquidity: 890000,
    volume24h: 52000,
    volume7d: 310000,
    apr: 15.8,
    providers: 18,
    fee: 0.0025,
    priceImpact: 0.03,
    token0Reserve: 445000,
    token1Reserve: 445000,
    lpTokenSupply: 890000,
    createdAt: '2025-09-05T09:30:00Z',
    updatedAt: '2025-09-12T11:45:00Z',
  },
];

export async function GET() {
  try {
    return NextResponse.json(mockPools);
  } catch (error) {
    console.error('Error fetching liquidity pools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liquidity pools' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const poolData = await request.json();

    // Validate required fields
    if (
      !poolData.propertyToken ||
      !poolData.pairedToken ||
      !poolData.initialLiquidity
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Create new pool
    const newPool = {
      id: `pool_${poolData.propertyToken.toLowerCase()}_${poolData.pairedToken.toLowerCase()}`,
      ...poolData,
      totalLiquidity: poolData.initialLiquidity,
      volume24h: 0,
      volume7d: 0,
      apr: 0,
      providers: 1,
      priceImpact: 0,
      token0Reserve: poolData.initialLiquidity / 2,
      token1Reserve: poolData.initialLiquidity / 2,
      lpTokenSupply: poolData.initialLiquidity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock data
    mockPools.push(newPool);

    return NextResponse.json(newPool, { status: 201 });
  } catch (error) {
    console.error('Error creating liquidity pool:', error);
    return NextResponse.json(
      { error: 'Failed to create liquidity pool' },
      { status: 500 },
    );
  }
}
