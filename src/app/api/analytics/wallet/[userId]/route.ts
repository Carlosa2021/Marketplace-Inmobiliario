// src/app/api/analytics/wallet/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WalletAnalytics } from '@/modules/wallets/types';

export const runtime = 'nodejs';

// In-memory storage for demo (replace with database)
const analytics = new Map<string, WalletAnalytics>();

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params;

    const userAnalytics = analytics.get(userId);
    if (!userAnalytics) {
      return NextResponse.json(
        { error: 'Analytics not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(userAnalytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = params;
    const analyticsData: WalletAnalytics = await req.json();

    analytics.set(userId, analyticsData);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
