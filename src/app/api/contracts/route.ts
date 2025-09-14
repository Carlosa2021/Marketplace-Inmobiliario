// src/app/api/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TokenContract } from '@/modules/tokenization/types';

// In-memory storage (replace with your database)
const contracts: TokenContract[] = [];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const chain = url.searchParams.get('chain');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const propertyId = url.searchParams.get('property');

    let filteredContracts = contracts;

    if (chain) {
      filteredContracts = filteredContracts.filter((c) => c.chain === chain);
    }

    if (type) {
      filteredContracts = filteredContracts.filter((c) => c.type === type);
    }

    if (status) {
      filteredContracts = filteredContracts.filter((c) => c.status === status);
    }

    if (propertyId) {
      filteredContracts = filteredContracts.filter(
        (c) => c.propertyId === propertyId,
      );
    }

    return NextResponse.json({
      success: true,
      contracts: filteredContracts,
      total: filteredContracts.length,
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contracts' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contract: TokenContract = await request.json();

    // Validate required fields
    if (!contract.address || !contract.name || !contract.symbol) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Check if contract already exists
    const existingContract = contracts.find(
      (c) => c.address === contract.address,
    );
    if (existingContract) {
      return NextResponse.json(
        { success: false, error: 'Contract already exists' },
        { status: 409 },
      );
    }

    contracts.push(contract);

    return NextResponse.json({
      success: true,
      contract,
      message: 'Contract registered successfully',
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register contract' },
      { status: 500 },
    );
  }
}
