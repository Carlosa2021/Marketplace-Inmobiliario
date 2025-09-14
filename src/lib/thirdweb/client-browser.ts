import { createThirdwebClient } from 'thirdweb';
import { polygon } from 'thirdweb/chains';

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export const chain = polygon; // Puedes cambiar a sepolia, ethereum, etc según necesites
