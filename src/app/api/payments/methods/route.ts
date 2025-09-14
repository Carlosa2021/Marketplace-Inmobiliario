// src/app/api/payments/methods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  CryptoPaymentMethod,
  FiatPaymentMethod,
} from '@/modules/payments/types';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // 'crypto', 'fiat', or null for both

    // Crypto payment methods
    const cryptoMethods: CryptoPaymentMethod[] = [
      {
        id: 'usdc_polygon',
        type: 'crypto',
        name: 'USDC',
        symbol: 'USDC',
        icon: '/icons/usdc.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          gas: 0, // gasless
          total: 2.5,
        },
        processingTime: 'Instant',
        tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        chainId: 137,
        decimals: 6,
        minAmount: 10,
        maxAmount: 1000000,
        gasless: true,
        supported_chains: ['polygon'],
      },
      {
        id: 'usdt_polygon',
        type: 'crypto',
        name: 'Tether USD',
        symbol: 'USDT',
        icon: '/icons/usdt.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          gas: 0.5, // small gas fee
          total: 3.0,
        },
        processingTime: '1-2 minutes',
        tokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        chainId: 137,
        decimals: 6,
        minAmount: 10,
        maxAmount: 1000000,
        gasless: false,
        supported_chains: ['polygon'],
      },
      {
        id: 'eth_ethereum',
        type: 'crypto',
        name: 'Ethereum',
        symbol: 'ETH',
        icon: '/icons/eth.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          gas: 15, // higher gas fees on mainnet
          total: 17.5,
        },
        processingTime: '2-5 minutes',
        chainId: 1,
        decimals: 18,
        minAmount: 0.01,
        maxAmount: 1000,
        gasless: false,
        supported_chains: ['ethereum'],
      },
      {
        id: 'matic_polygon',
        type: 'crypto',
        name: 'Polygon',
        symbol: 'MATIC',
        icon: '/icons/matic.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          gas: 0.01,
          total: 2.51,
        },
        processingTime: '1-2 minutes',
        chainId: 137,
        decimals: 18,
        minAmount: 1,
        maxAmount: 100000,
        gasless: false,
        supported_chains: ['polygon'],
      },
    ];

    // Fiat payment methods
    const fiatMethods: FiatPaymentMethod[] = [
      {
        id: 'stripe_card',
        type: 'fiat',
        name: 'Credit/Debit Card',
        symbol: 'CARD',
        icon: '/icons/card.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          processing: 2.9, // Stripe fees
          total: 5.4,
        },
        processingTime: 'Instant',
        currency: 'USD',
        countrySupport: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES'],
        minAmount: 1,
        maxAmount: 50000,
        processor: 'stripe',
      },
      {
        id: 'stripe_bank',
        type: 'fiat',
        name: 'Bank Transfer',
        symbol: 'BANK',
        icon: '/icons/bank.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          processing: 0.8,
          total: 3.3,
        },
        processingTime: '1-3 business days',
        currency: 'USD',
        countrySupport: ['US', 'CA', 'GB', 'AU', 'DE', 'FR'],
        minAmount: 10,
        maxAmount: 100000,
        processor: 'stripe',
      },
      {
        id: 'thirdweb_fiat',
        type: 'fiat',
        name: 'Thirdweb Pay',
        symbol: 'PAY',
        icon: '/icons/thirdweb.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          processing: 3.5,
          total: 6.0,
        },
        processingTime: 'Instant',
        currency: 'EUR',
        countrySupport: [
          'US',
          'CA',
          'GB',
          'AU',
          'DE',
          'FR',
          'IT',
          'ES',
          'NL',
          'BE',
        ],
        minAmount: 5,
        maxAmount: 25000,
        processor: 'thirdweb',
      },
      {
        id: 'apple_pay',
        type: 'fiat',
        name: 'Apple Pay',
        symbol: 'APPLE',
        icon: '/icons/apple-pay.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          processing: 2.9,
          total: 5.4,
        },
        processingTime: 'Instant',
        currency: 'USD',
        countrySupport: ['US', 'CA', 'GB', 'AU', 'FR', 'DE'],
        minAmount: 1,
        maxAmount: 10000,
        processor: 'stripe',
      },
      {
        id: 'google_pay',
        type: 'fiat',
        name: 'Google Pay',
        symbol: 'GOOGLE',
        icon: '/icons/google-pay.svg',
        enabled: true,
        fees: {
          platform: 2.5,
          processing: 2.9,
          total: 5.4,
        },
        processingTime: 'Instant',
        currency: 'USD',
        countrySupport: ['US', 'CA', 'GB', 'AU', 'IN', 'BR'],
        minAmount: 1,
        maxAmount: 10000,
        processor: 'stripe',
      },
    ];

    let response;

    if (type === 'crypto') {
      response = {
        success: true,
        methods: {
          crypto: cryptoMethods,
          fiat: [],
        },
      };
    } else if (type === 'fiat') {
      response = {
        success: true,
        methods: {
          crypto: [],
          fiat: fiatMethods,
        },
      };
    } else {
      response = {
        success: true,
        methods: {
          crypto: cryptoMethods,
          fiat: fiatMethods,
        },
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment methods',
        methods: { crypto: [], fiat: [] },
      },
      { status: 500 },
    );
  }
}
