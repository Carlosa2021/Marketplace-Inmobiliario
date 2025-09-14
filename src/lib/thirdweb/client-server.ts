// src/lib/thirdweb/client-server.ts
import { createThirdwebClient } from 'thirdweb';
import { privateKeyToAccount } from 'thirdweb/wallets';

export const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY as string,
});

// lee la private key del .env (sin NEXT_PUBLIC_)
const rawKey =
  process.env.ADMIN_PRIVATE_KEY ??
  process.env.THIRDWEB_ADMIN_PK ??
  process.env.THIRDWEB_PRIVATE_KEY ??
  '';

// normaliza: añade 0x si no lo tiene, solo si rawKey no está vacío
const hexKey =
  rawKey && !rawKey.startsWith('0x')
    ? `0x${rawKey}`
    : (rawKey as `0x${string}`);

export const adminAccount =
  rawKey && rawKey.length >= 64
    ? privateKeyToAccount({
        client,
        privateKey: hexKey,
      })
    : undefined;

export function requireAdmin() {
  if (!adminAccount) {
    throw new Error('Missing ADMIN_PRIVATE_KEY');
  }
  return adminAccount;
}
