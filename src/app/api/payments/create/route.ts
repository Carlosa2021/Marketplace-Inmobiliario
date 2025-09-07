// src/app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // usamos secretKey, mejor runtime Node

type CreatePaymentBody = {
  propertyId: string;
  buyerWallet: string;
  amountFiat: number;
  currencyFiat?: string;
};

const requireEnv = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CreatePaymentBody>;

    // Validación mínima
    if (
      !body?.propertyId ||
      !body?.buyerWallet ||
      typeof body?.amountFiat !== 'number'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid payload: propertyId, buyerWallet, amountFiat are required',
        },
        { status: 400 },
      );
    }

    const { propertyId, buyerWallet, amountFiat } = body;
    const currencyFiat = body.currencyFiat ?? 'EUR';

    const secret = requireEnv('THIRDWEB_SECRET_KEY');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const res = await fetch('https://api.thirdweb.com/v1/payments/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        amount: { value: amountFiat, currency: currencyFiat },
        out: {
          chain: 'polygon',
          token: 'USDC',
          recipient: buyerWallet,
        },
        ui: { title: 'Compra de inmueble', description: `ID ${propertyId}` },
        return_url: `${appUrl}/marketplace?payment=success&pid=${propertyId}`,
        cancel_url: `${appUrl}/marketplace?payment=cancelled&pid=${propertyId}`,
        metadata: { propertyId, buyerWallet },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: 500 });
    }

    const data: { url?: string; checkout_url?: string; link?: string } =
      await res.json();

    return NextResponse.json({
      checkoutUrl: data.url ?? data.checkout_url ?? data.link ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
