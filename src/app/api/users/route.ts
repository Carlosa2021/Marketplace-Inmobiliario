// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WalletUser } from '@/modules/wallets/types';

export const runtime = 'nodejs';

// In-memory storage for demo (replace with database)
const users = new Map<string, WalletUser>();

export async function POST(req: NextRequest) {
  try {
    const userData: WalletUser = await req.json();

    // Validate required fields
    if (!userData.address || !userData.id) {
      return NextResponse.json(
        { error: 'Address and ID are required' },
        { status: 400 },
      );
    }

    // Check if user already exists
    if (users.has(userData.address)) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 },
      );
    }

    // Store user
    users.set(userData.address, userData);

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const allUsers = Array.from(users.values());
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
