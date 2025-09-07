// src/app/api/webhooks/thirdweb/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Tipos mínimos
type PaymentSucceededEvent = {
  type: 'payment.succeeded';
  data?: {
    id?: string;
    metadata?: {
      propertyId?: string;
      buyerWallet?: string;
    };
  };
};

type ThirdwebWebhookEvent =
  | PaymentSucceededEvent
  | { type: string; data?: unknown };

// Type guard para estrechar el tipo de forma segura (sin any)
function isPaymentSucceededEvent(
  ev: ThirdwebWebhookEvent,
): ev is PaymentSucceededEvent {
  return ev?.type === 'payment.succeeded';
}

export async function POST(req: NextRequest) {
  try {
    const event = (await req.json()) as ThirdwebWebhookEvent;

    if (isPaymentSucceededEvent(event)) {
      const data = event.data ?? {};

      const paymentId = typeof data.id === 'string' ? data.id : '';

      const md =
        typeof data.metadata === 'object' && data.metadata
          ? (data.metadata as { propertyId?: string; buyerWallet?: string })
          : {};

      const propertyId = typeof md.propertyId === 'string' ? md.propertyId : '';
      const buyerWallet =
        typeof md.buyerWallet === 'string' ? md.buyerWallet : '';

      // Usa las variables (evita no-used-vars)
      console.log('[thirdweb webhook] payment.succeeded', {
        paymentId,
        propertyId,
        buyerWallet,
      });

      // 1) Idempotencia con paymentId (si ya procesado → return ok)
      // 2) Ejecuta on-chain: await transferOrMint({ propertyId, to: buyerWallet });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ignored: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
