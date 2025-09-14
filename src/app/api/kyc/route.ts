// src/app/api/kyc/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { readAllKyc, writeAllKyc } from '@/lib/kyc-store';
import type { KycSubmission } from '@/lib/types';
import path from 'path';
import fs from 'fs';

/**
 * Schema de entrada
 */
const KycInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  country: z.string().optional(),
  idType: z.enum(['passport', 'id', 'driving_license', 'other']),
  idNumber: z.string().min(3),
  idImageUrl: z.string().optional().nullable(), // base64 o URL
  submittedBy: z.string().nullable().optional(),
});

/**
 * Helper: intenta subir base64 a Thirdweb Storage SDK v5
 */
async function tryUploadBase64ToThirdweb(
  base64data: string,
): Promise<string | null> {
  if (!process.env.THIRDWEB_SECRET_KEY) return null;

  try {
    // Updated to Thirdweb SDK v5 storage
    const { upload } = await import('thirdweb/storage');
    const { createThirdwebClient } = await import('thirdweb');

    const client = createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });

    // base64 con cabecera: data:<mime>;base64,AAAA...
    const commaIndex = base64data.indexOf(',');
    const meta = commaIndex > -1 ? base64data.slice(0, commaIndex) : '';
    const rawBase64 =
      commaIndex > -1 ? base64data.slice(commaIndex + 1) : base64data;
    const buffer = Buffer.from(rawBase64, 'base64');

    // Determine MIME type from metadata
    let mimeType = 'application/octet-stream';
    if (meta.includes('image/png')) mimeType = 'image/png';
    else if (meta.includes('image/jpeg')) mimeType = 'image/jpeg';
    else if (meta.includes('pdf')) mimeType = 'application/pdf';

    // SDK v5 upload method
    const file = new File([buffer], 'kyc-document', { type: mimeType });
    const uris = await upload({ client, files: [file] });

    return uris[0] || null;
  } catch (err) {
    console.error('Thirdweb upload error', err);
    return null;
  }
}

/**
 * POST -> recibir KYC
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = KycInputSchema.parse(body);

    // si idImageUrl es base64 -> intentar subirlo
    let finalImageUrl: string | null = null;

    if (parsed.idImageUrl && parsed.idImageUrl.startsWith('data:')) {
      const uploadedUrl = await tryUploadBase64ToThirdweb(parsed.idImageUrl);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        // fallback dev: guardamos base64 en DB
        finalImageUrl = parsed.idImageUrl;
      }
    } else {
      finalImageUrl = parsed.idImageUrl ?? null;
    }

    const all = readAllKyc();

    // Si tu tipo KycSubmission NO incluye 'country', mejor añadirlo al tipo.
    // Para no romper compilación si no lo añadiste: usamos as-assertion al final.
    const newEntryObj = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
      name: parsed.name,
      email: parsed.email,
      // sólo añadir country si viene (evita undefined explícito si tu tipo no lo contempla)
      ...(parsed.country ? { country: parsed.country } : {}),
      idType: parsed.idType,
      idNumber: parsed.idNumber,
      idImageUrl: finalImageUrl ?? undefined,
      notes: undefined,
      submittedBy: parsed.submittedBy ?? null,
    };

    // Aserción para que TypeScript acepte la forma final.
    const newEntry = newEntryObj as unknown as KycSubmission;

    all.push(newEntry);
    writeAllKyc(all);

    return NextResponse.json({ ok: true, data: newEntry });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: err.errors },
        { status: 400 },
      );
    }

    console.error('kyc POST error', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}

/** GET -> listar todos (admin only, proteger en prod) */
export async function GET() {
  const all = readAllKyc();
  return NextResponse.json({ ok: true, data: all });
}
