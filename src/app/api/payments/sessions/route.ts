// src/app/api/payments/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentSession } from '@/modules/payments/types';

// In-memory storage (replace with your database)
const paymentSessions: PaymentSession[] = [];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const paymentRequestId = url.searchParams.get('paymentRequestId');
    const status = url.searchParams.get('status');

    let filteredSessions = paymentSessions;

    if (paymentRequestId) {
      filteredSessions = filteredSessions.filter(
        (session) => session.paymentRequestId === paymentRequestId,
      );
    }

    if (status) {
      filteredSessions = filteredSessions.filter(
        (session) => session.status === status,
      );
    }

    return NextResponse.json({
      success: true,
      sessions: filteredSessions,
      total: filteredSessions.length,
    });
  } catch (error) {
    console.error('Error fetching payment sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment sessions' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const paymentSession: PaymentSession = await request.json();

    // Validate required fields
    if (!paymentSession.paymentRequestId || !paymentSession.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Store payment session
    paymentSessions.push(paymentSession);

    return NextResponse.json({
      success: true,
      session: paymentSession,
      message: 'Payment session created successfully',
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment session' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, webhookData } = await request.json();

    const sessionIndex = paymentSessions.findIndex(
      (session) => session.id === id,
    );

    if (sessionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Payment session not found' },
        { status: 404 },
      );
    }

    // Update payment session
    paymentSessions[sessionIndex] = {
      ...paymentSessions[sessionIndex],
      status,
      webhookData: webhookData
        ? { ...paymentSessions[sessionIndex].webhookData, ...webhookData }
        : paymentSessions[sessionIndex].webhookData,
    };

    return NextResponse.json({
      success: true,
      session: paymentSessions[sessionIndex],
      message: 'Payment session updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment session' },
      { status: 500 },
    );
  }
}
