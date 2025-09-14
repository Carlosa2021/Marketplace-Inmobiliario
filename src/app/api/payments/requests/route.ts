// src/app/api/payments/requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentRequest } from '@/modules/payments/types';

// In-memory storage (replace with your database)
const paymentRequests: PaymentRequest[] = [];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userAddress = url.searchParams.get('user');
    const propertyId = url.searchParams.get('property');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredRequests = paymentRequests;

    if (userAddress) {
      filteredRequests = filteredRequests.filter(
        (req) =>
          req.investorAddress.toLowerCase() === userAddress.toLowerCase(),
      );
    }

    if (propertyId) {
      filteredRequests = filteredRequests.filter(
        (req) => req.propertyId === propertyId,
      );
    }

    if (status) {
      filteredRequests = filteredRequests.filter(
        (req) => req.status === status,
      );
    }

    // Sort by creation date (newest first)
    filteredRequests.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Apply limit
    const limitedRequests = filteredRequests.slice(0, limit);

    return NextResponse.json({
      success: true,
      requests: limitedRequests,
      total: filteredRequests.length,
    });
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment requests' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const paymentRequest: PaymentRequest = await request.json();

    // Validate required fields
    if (
      !paymentRequest.propertyId ||
      !paymentRequest.investorAddress ||
      !paymentRequest.amount
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Add timestamps if not provided
    if (!paymentRequest.createdAt) {
      paymentRequest.createdAt = new Date().toISOString();
    }

    if (!paymentRequest.expiresAt) {
      // Default 30 minutes expiration
      paymentRequest.expiresAt = new Date(
        Date.now() + 30 * 60 * 1000,
      ).toISOString();
    }

    // Store payment request
    paymentRequests.push(paymentRequest);

    return NextResponse.json({
      success: true,
      request: paymentRequest,
      message: 'Payment request created successfully',
    });
  } catch (error) {
    console.error('Error creating payment request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment request' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, metadata } = await request.json();

    const requestIndex = paymentRequests.findIndex((req) => req.id === id);

    if (requestIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Payment request not found' },
        { status: 404 },
      );
    }

    // Update payment request
    paymentRequests[requestIndex] = {
      ...paymentRequests[requestIndex],
      status,
      metadata: metadata
        ? { ...paymentRequests[requestIndex].metadata, ...metadata }
        : paymentRequests[requestIndex].metadata,
    };

    return NextResponse.json({
      success: true,
      request: paymentRequests[requestIndex],
      message: 'Payment request updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment request' },
      { status: 500 },
    );
  }
}
