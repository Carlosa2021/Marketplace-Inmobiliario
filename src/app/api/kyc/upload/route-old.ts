// src/app/api/kyc/upload/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Type definition for ThirdwebStorage module
interface ThirdwebStorageModule {
  ThirdwebStorage: new (config: { secretKey: string }) => {
    uploadRaw?: (buffer: Buffer) => Promise<unknown>;
    upload?: (path: string) => Promise<unknown>;
  };
}

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
      Boolean(process.env.THIRDWEB_SECRET_KEY) &&
      process.env.USE_THIRDWEB_STORAGE === '1';

    if (useThirdweb) {
      // Updated to Thirdweb SDK v5
      try {
        const { upload } = await import('thirdweb/storage');
        const { createThirdwebClient } = await import('thirdweb');

        const client = createThirdwebClient({
          secretKey: process.env.THIRDWEB_SECRET_KEY!,
        });

        // Convert buffer to File for SDK v5
        const uploadFile = new File([arrayBuffer], file.name || 'document', {
          type: file.type,
        });
        const uris = await upload({ client, files: [uploadFile] });

        if (uris[0]) {
          return NextResponse.json({
            ok: true,
            url: uris[0],
            provider: 'thirdweb-v5',
          });
        }

        return NextResponse.json(
          { ok: false, error: 'no-upload-method' },
          { status: 500 },
        );
      } catch (error) {
        console.error('Thirdweb SDK v5 upload failed:', error);
        return NextResponse.json(
          { ok: false, error: 'thirdweb-upload-failed' },
          { status: 500 },
        );
      }
    } else {
      // S3 flow (recommended for KYC); example with AWS SDK v3
      if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
        return NextResponse.json(
          { ok: false, error: 's3-not-configured' },
          { status: 500 },
        );
      }
      // TODO: Install @aws-sdk/client-s3 to enable S3 uploads
      /*
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
      */

      // Placeholder response while S3 is not configured
      return NextResponse.json(
        { ok: false, error: 's3-not-available' },
        { status: 501 },
      );
    }
  } catch (err) {
    console.error('kyc upload error', err);
    return NextResponse.json(
      { ok: false, error: 'server-error' },
      { status: 500 },
    );
  }
}
