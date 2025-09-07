// src/lib/thirdweb/client-server.ts
import { createThirdwebClient } from 'thirdweb';
import { privateKeyToAccount } from 'thirdweb/wallets';

export const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY as string,
});

// lee la private key del .env (sin NEXT_PUBLIC_)
const rawKey = process.env.ADMIN_PRIVATE_KEY ?? '';

// normaliza: añade 0x si no lo tiene
const hexKey = (
  rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`
) as `0x${string}`;

export const adminAccount = rawKey
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
