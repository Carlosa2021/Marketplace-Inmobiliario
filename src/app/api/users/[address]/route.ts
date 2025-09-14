// src/app/api/users/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WalletUser } from '@/modules/wallets/types';

export const runtime = 'nodejs';

// In-memory storage for demo (replace with database)
const users = new Map<string, WalletUser>();

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } },
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 },
      );
    }

    const user = users.get(address);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update last login
    user.metadata.lastLoginAt = new Date().toISOString();
    users.set(address, user);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { address: string } },
) {
  try {
    const { address } = params;
    const updates = await req.json();

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 },
      );
    }

    const user = users.get(address);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user data
    const updatedUser = { ...user, ...updates };
    users.set(address, updatedUser);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { address: string } },
) {
  try {
    const { address } = params;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 },
      );
    }

    if (!users.has(address)) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    users.delete(address);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
