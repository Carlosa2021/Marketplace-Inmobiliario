// src/app/api/kyc/upload/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type ThirdwebUploadResult = {
  url?: string;
  src?: string;
  ipfs?: string;
  IpfsHash?: string;
  [k: string]: unknown;
};

function extractUrlFromResult(res: unknown): string | null {
  if (typeof res === 'string') return res;
  if (res && typeof res === 'object') {
    const r = res as Record<string, unknown>;
    if (typeof r.url === 'string') return r.url;
    if (typeof r.src === 'string') return r.src;
    if (typeof r.ipfs === 'string') return r.ipfs;
    if (typeof r.IpfsHash === 'string') {
      // convert ipfs hash to gateway URL if you want:
      return `ipfs://${r.IpfsHash}`;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'no-file' },
        { status: 400 },
      );
    }

    // Security: size limit double-check
    const MAX_BYTES = 5 * 1024 * 1024;
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'file-too-large' },
        { status: 400 },
      );
    }
    const buffer = Buffer.from(arrayBuffer);

    // Option toggle: use thirdweb storage or a custom S3 flow
    const useThirdweb =
      Boolean(process.env.THIRDWEB_KEY) &&
      process.env.USE_THIRDWEB_STORAGE === '1';

    if (useThirdweb) {
      // dynamic import so dev environment without package doesn't crash
      const mod = await import('@thirdweb-dev/storage').catch((e) => {
        console.error('failed to import @thirdweb-dev/storage', e);
        return null;
      });
      if (!mod || !mod.ThirdwebStorage) {
        console.error('ThirdwebStorage is not available');
        return NextResponse.json(
          { ok: false, error: 'thirdweb-not-available' },
          { status: 500 },
        );
      }

      const ThirdwebStorage = (mod as any).ThirdwebStorage;
      const storage = new ThirdwebStorage({
        secretKey: process.env.THIRDWEB_KEY,
      });

      // prefer uploadRaw; fallback to upload (path) if available
      let result: unknown = null;
      if (typeof storage.uploadRaw === 'function') {
        result = await storage.uploadRaw(buffer);
      } else if (typeof storage.upload === 'function') {
        // write tmp file and call upload(path)
        const fs = await import('fs');
        const os = await import('os');
        const path = await import('path');
        const tmp = path.join(os.tmpdir(), `kyc-${Date.now()}`);
        fs.writeFileSync(tmp, buffer);
        try {
          result = await storage.upload(tmp);
        } finally {
          try {
            fs.unlinkSync(tmp);
          } catch {}
        }
      } else {
        return NextResponse.json(
          { ok: false, error: 'no-upload-method' },
          { status: 500 },
        );
      }

      const url = extractUrlFromResult(result);
      if (!url) {
        console.error('no url returned from thirdweb upload', result);
        return NextResponse.json(
          { ok: false, error: 'no-url' },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true, url });
    } else {
      // S3 flow (recommended for KYC); example with AWS SDK v3
      if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
        return NextResponse.json(
          { ok: false, error: 's3-not-configured' },
          { status: 500 },
        );
      }
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const s3 = new S3Client({ region: process.env.AWS_REGION });
      const key = `kyc/${Date.now()}-${Math.random().toString(36).slice(2)}-${
        file.name
      }`;
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type || 'application/octet-stream',
          ACL: 'private', // bucket should be private
          ServerSideEncryption: 'AES256',
        }),
      );
      // store key (not public url). Here we return a signed URL? better: return key and server will generate presigned URL for admin.
      return NextResponse.json({ ok: true, key });
    }
  } catch (err) {
    console.error('kyc upload error', err);
    return NextResponse.json(
      { ok: false, error: 'server-error' },
      { status: 500 },
    );
  }
}
