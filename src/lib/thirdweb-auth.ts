// src/lib/thirdweb-auth.ts
export const runtime = 'nodejs';

import { createThirdwebClient } from 'thirdweb';
import { createAuth } from 'thirdweb/auth';
import { privateKeyToAccount } from 'thirdweb/wallets';

const domain = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const privateKey = process.env.THIRDWEB_PRIVATE_KEY || '';
const secretKey = process.env.THIRDWEB_SECRET_KEY || '';

if (!privateKey || !secretKey) {
  console.warn(
    '[thirdweb-auth] WARNING: THIRDWEB_PRIVATE_KEY or THIRDWEB_SECRET_KEY not set. Auth may fail.',
  );
}

const client = createThirdwebClient({
  secretKey,
});

const adminAccount = privateKeyToAccount({ client, privateKey });

const auth = createAuth({
  domain,
  client,
  adminAccount,
});

export default auth;
