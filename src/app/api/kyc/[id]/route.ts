// src/app/api/kyc/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { getKycById, updateKycSubmission } from '@/lib/kyc-store';

const ActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await req.json();
    const { action, notes } = ActionSchema.parse(payload);

    const existing = getKycById(params.id);
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: 'Not found' },
        { status: 404 },
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const updated = updateKycSubmission(params.id, {
      status,
      notes: notes ?? existing.notes,
      // reviewer: you can set admin user here if you have auth
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: err.errors },
        { status: 400 },
      );
    }
    console.error('kyc PATCH', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
