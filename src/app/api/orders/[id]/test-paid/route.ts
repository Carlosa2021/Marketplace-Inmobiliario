// src/app/api/orders/[id]/test-paid/route.ts
import { NextRequest } from 'next/server';
import { markOrderPaid, fulfillAndReceipt } from '@/lib/orders-flow';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { txHash } = await req.json().catch(() => ({ txHash: undefined }));
    await markOrderPaid(params.id, { txHash });
    const final = await fulfillAndReceipt(params.id, { txHash });

    return new Response(JSON.stringify({ ok: true, order: final }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
