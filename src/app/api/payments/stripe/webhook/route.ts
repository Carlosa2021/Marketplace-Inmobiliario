// src/app/api/payments/stripe/webhook/route.ts
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createOrder, updateOrder, allowAfterPurchase } from '@/lib/orders';
import { fulfillFiatSale } from '@/lib/thirdweb/sales';
import { generateReceiptPDF } from '@/lib/receipt';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get('stripe-signature');
    if (!sig) return new Response('Missing signature', { status: 400 });

    // Body RAW para verificar firma
    const payload = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(`Invalid signature: ${msg}`, { status: 400 });
    }

    // Helper para cumplir + PDF + allowlist
    async function fulfillFlow(meta: Record<string, unknown>) {
      const buyer = meta.buyer as `0x${string}`;
      const chainId = Number(meta.chainId ?? 137);
      const collection = meta.collection as `0x${string}`;
      const listingId = meta.listingId as string | undefined;
      const priceEUR =
        meta.priceEUR !== undefined ? Number(meta.priceEUR) : undefined;

      // 1) Crear pedido (pagado)
      const order = await createOrder({
        buyer,
        chainId,
        collection,
        listingId,
        priceEUR,
        status: 'paid',
        meta,
      });

      // 2) Mint/transfer
      const txHash = await fulfillFiatSale({
        chainId,
        collection,
        to: buyer,
        metadata: {
          name: (meta.name as string) ?? 'Property NFT',
          description:
            (meta.description as string) ?? 'Property tokenized asset',
          image: meta.image as string | undefined,
        },
      });

      // 3) Marcar fulfilled
      const fulfilled = await updateOrder(order.id, {
        status: 'fulfilled',
        txHash,
      });

      // 4) Generar PDF (con URL absoluta opcional si tienes NEXT_PUBLIC_BASE_URL)
      const { publicPath, url } = await generateReceiptPDF(fulfilled, {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      });

      // Guarda SIEMPRE el path público (string servido por Next)
      await updateOrder(order.id, {
        receiptUrl: publicPath,
        meta: { ...(fulfilled.meta ?? {}), receiptUrlAbs: url },
      });

      // 5) Auto-allowlist si aplica
      if (listingId) await allowAfterPurchase(listingId, buyer, chainId);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    // 1) checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata ?? {};
      return await fulfillFlow(meta);
    }

    // 2) payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = pi.metadata ?? {};
      return await fulfillFlow(meta);
    }

    // Otros eventos
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('stripe webhook error:', msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }
}
