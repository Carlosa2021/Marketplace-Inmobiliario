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
 * Helper: intenta subir base64 a Thirdweb Storage (import dinámico)
 */
async function tryUploadBase64ToThirdweb(
  base64data: string,
): Promise<string | null> {
  if (!process.env.THIRDWEB_KEY) return null;

  try {
    // import dinámico para no romper dev sin la dependencia
    const mod = await import('@thirdweb-dev/storage');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ThirdwebStorage = (mod as any).ThirdwebStorage;
    if (!ThirdwebStorage) return null;

    const storage = new ThirdwebStorage({
      secretKey: process.env.THIRDWEB_KEY,
    });

    // base64 con cabecera: data:<mime>;base64,AAAA...
    const commaIndex = base64data.indexOf(',');
    const meta = commaIndex > -1 ? base64data.slice(0, commaIndex) : '';
    const rawBase64 =
      commaIndex > -1 ? base64data.slice(commaIndex + 1) : base64data;
    const buffer = Buffer.from(rawBase64, 'base64');

    // Si SDK soporta uploadRaw(buffer)
    if (typeof storage.uploadRaw === 'function') {
      const res = await storage.uploadRaw(buffer);
      if (typeof res === 'string') return res;
      // intentar distintas formas de respuesta
      return res?.url ?? res?.src ?? res?.ipfs ?? res?.IpfsHash ?? null;
    }

    // Fallback: escribir archivo temporal y usar upload(path)
    const tmpDir =
      process.platform === 'win32' ? process.env.TEMP || '.' : '/tmp';
    const uniq = `kyc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext = meta.includes('image/png')
      ? '.png'
      : meta.includes('image/jpeg')
      ? '.jpg'
      : meta.includes('pdf')
      ? '.pdf'
      : '';
    const tmpPath = path.join(tmpDir, uniq + ext);
    fs.writeFileSync(tmpPath, buffer);

    try {
      if (typeof storage.upload === 'function') {
        const res = await storage.upload(tmpPath);
        try {
          fs.unlinkSync(tmpPath);
        } catch {
          /* ignore */
        }
        if (typeof res === 'string') return res;
        return res?.url ?? res?.src ?? res?.ipfs ?? res?.IpfsHash ?? null;
      }
    } finally {
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {
        /* ignore */
      }
    }

    return null;
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
