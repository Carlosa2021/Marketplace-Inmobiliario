import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  if (!path) {
    return NextResponse.json(
      { error: 'Falta el parámetro "path"' },
      { status: 400 },
    );
  }
  const url = `https://ipfscdn.io/ipfs/${path}`;
  // Sólo usamos clientId (autenticación pública)
  const response = await fetch(url, {
    headers: {
      'x-client-id': process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '',
    },
  });
  if (!response.ok) {
    return NextResponse.json(
      { error: 'No se pudo obtener el archivo IPFS' },
      { status: response.status },
    );
  }
  const blob = await response.blob();
  return new NextResponse(blob, {
    headers: {
      'Content-Type':
        response.headers.get('content-type') || 'application/octet-stream',
    },
  });
}
