// src/app/api/debug-env/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const privateKey = process.env.THIRDWEB_PRIVATE_KEY;
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  
  return NextResponse.json({
    hasPrivateKey: !!privateKey,
    privateKeyLength: privateKey?.length || 0,
    privateKeyFirst10: privateKey?.substring(0, 10) || 'N/A',
    privateKeyLast10: privateKey?.substring(-10) || 'N/A',
    hasSecretKey: !!secretKey,
    secretKeyLength: secretKey?.length || 0,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('THIRDWEB') || key.includes('ADMIN')
    ),
  });
}