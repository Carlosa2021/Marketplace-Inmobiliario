// src/app/api/investments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PropertyInvestment } from '@/modules/tokenization/types';

// In-memory storage (replace with your database)
const investments: PropertyInvestment[] = [];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const investorAddress = url.searchParams.get('investor');
    const propertyId = url.searchParams.get('property');
    const status = url.searchParams.get('status');

    let filteredInvestments = investments;

    if (investorAddress) {
      filteredInvestments = filteredInvestments.filter(
        (inv) =>
          inv.investorAddress.toLowerCase() === investorAddress.toLowerCase(),
      );
    }

    if (propertyId) {
      filteredInvestments = filteredInvestments.filter(
        (inv) => inv.propertyId === propertyId,
      );
    }

    if (status) {
      filteredInvestments = filteredInvestments.filter(
        (inv) => inv.status === status,
      );
    }

    return NextResponse.json({
      success: true,
      investments: filteredInvestments,
      total: filteredInvestments.length,
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investments' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const investment: PropertyInvestment = await request.json();

    // Validate required fields
    if (
      !investment.investorAddress ||
      !investment.propertyId ||
      !investment.tokenContract
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Calculate current value and ROI
    const currentValue = investment.investmentAmount; // This would be calculated based on current token price
    const roi =
      ((currentValue - investment.investmentAmount) /
        investment.investmentAmount) *
      100;

    const investmentWithCalculations: PropertyInvestment = {
      ...investment,
      currentValue,
      roi,
      investedAt: new Date().toISOString(),
    };

    investments.push(investmentWithCalculations);

    return NextResponse.json({
      success: true,
      investment: investmentWithCalculations,
      message: 'Investment recorded successfully',
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record investment' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, updates } = await request.json();

    const investmentIndex = investments.findIndex((inv) => inv.id === id);

    if (investmentIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Investment not found' },
        { status: 404 },
      );
    }

    investments[investmentIndex] = {
      ...investments[investmentIndex],
      ...updates,
    };

    return NextResponse.json({
      success: true,
      investment: investments[investmentIndex],
      message: 'Investment updated successfully',
    });
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update investment' },
      { status: 500 },
    );
  }
}
