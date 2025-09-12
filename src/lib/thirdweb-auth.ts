// src/lib/thirdweb-auth.ts
export const runtime = 'nodejs';

import { createThirdwebClient } from 'thirdweb';
import { createAuth } from 'thirdweb/auth';
import { privateKeyToAccount } from 'thirdweb/wallets';

const domain = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const privateKey = process.env.THIRDWEB_PRIVATE_KEY || '';
const secretKey = process.env.THIRDWEB_SECRET_KEY || '';

// Validar formato de clave privada
const isValidPrivateKey = (key: string): boolean => {
  if (!key) return false;
  // Eliminar 0x si existe
  const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
  // Verificar que sea exactamente 64 caracteres hexadecimales
  return /^[a-fA-F0-9]{64}$/.test(cleanKey);
};

if (!privateKey || !secretKey) {
  console.warn(
    '[thirdweb-auth] WARNING: THIRDWEB_PRIVATE_KEY or THIRDWEB_SECRET_KEY not set. Auth may fail.',
  );
}

if (privateKey && !isValidPrivateKey(privateKey)) {
  console.error(
    '[thirdweb-auth] ERROR: THIRDWEB_PRIVATE_KEY format is invalid. Expected 64-character hex string.',
  );
}

// Asegurar que la clave privada no tenga prefijo 0x
const cleanPrivateKey = privateKey.startsWith('0x')
  ? privateKey.slice(2)
  : privateKey;

const client = createThirdwebClient({
  secretKey,
});

// Solo crear adminAccount si tenemos una clave privada válida
let adminAccount;
let auth;

if (cleanPrivateKey && isValidPrivateKey(privateKey)) {
  try {
    adminAccount = privateKeyToAccount({ client, privateKey: cleanPrivateKey });
    auth = createAuth({
      domain,
      client,
      adminAccount,
    });
  } catch (error) {
    console.error('[thirdweb-auth] Error creating admin account:', error);
  }
}

export default auth;
