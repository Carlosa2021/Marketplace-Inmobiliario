// src/app/api/whitelist/check/route.ts
import { NextRequest } from 'next/server';
import { wlHas } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get('listingId') || '';
    const address = (searchParams.get('address') || '').toLowerCase();
    if (!listingId || !address) {
      return Response.json(
        { error: 'listingId y address requeridos' },
        { status: 400 },
      );
    }
    const allowed = await wlHas(listingId, address);
    return Response.json({ allowed });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
