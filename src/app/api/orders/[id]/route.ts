// src/app/api/orders/[id]/route.ts
import { NextRequest } from 'next/server';
import { getOrder } from '@/lib/orders';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const order = await getOrder(params.id);
  if (!order) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(order), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
