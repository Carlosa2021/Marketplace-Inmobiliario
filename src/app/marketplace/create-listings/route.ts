import { NextRequest } from 'next/server';
import { getContract, toUnits, sendTransaction } from 'thirdweb';
import { polygon } from 'thirdweb/chains';
import { createListing } from 'thirdweb/extensions/marketplace';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { client } from '@/lib/thirdweb/client-server'; // usa secretKey en server
import { TOKENS } from '@/lib/addresses';

export const runtime = 'nodejs';

type Body = {
  marketplace: string; // address del marketplace v3
  assetContract: string; // address de tu colección ERC721
  tokenId: string | number; // id del NFT
  priceUSD: string; // ej. "1000" -> 1000 USDC (6 decimales)
  quantity?: number; // por defecto 1
  seconds?: number; // duración (por defecto 30 días)
};

export async function POST(req: NextRequest) {
  try {
    // Verificar si las variables de entorno están configuradas
    const adminPk =
      process.env.THIRDWEB_ADMIN_PK ||
      process.env.ADMIN_PRIVATE_KEY ||
      process.env.THIRDWEB_PRIVATE_KEY;
    if (!adminPk) {
      return new Response(
        JSON.stringify({
          error:
            'Marketplace listing creation requires admin private key configuration',
          hint: 'Set THIRDWEB_ADMIN_PK or ADMIN_PRIVATE_KEY in environment variables',
        }),
        { status: 501, headers: { 'content-type': 'application/json' } },
      );
    }

    const {
      marketplace,
      assetContract,
      tokenId,
      priceUSD,
      quantity = 1,
      seconds = 30 * 24 * 3600,
    } = (await req.json()) as Body;

    const account = privateKeyToAccount({
      client,
      privateKey: adminPk,
    });

    const contract = getContract({
      client,
      chain: polygon,
      address: marketplace,
    });

    // USDC (Polygon) => 6 decimales -> string
    const pricePerToken = toUnits(priceUSD, 6).toString();

    // Timestamps como Date (no bigint)
    const startDate = new Date(); // ahora
    const endDate = new Date(Date.now() + seconds * 1000);

    // 1) preparamos la transacción
    const preparedTx = await createListing({
      contract,
      assetContractAddress: assetContract,
      tokenId: BigInt(tokenId),
      pricePerToken, // string
      currencyContractAddress: TOKENS.USDC_POLYGON, // 👈 corrección
      quantity: BigInt(quantity),
      startTimestamp: startDate, // Date
      endTimestamp: endDate, // Date
    });

    // 2) la firmamos y enviamos con la cuenta admin
    const receipt = await sendTransaction({
      transaction: preparedTx,
      account,
    });

    return new Response(
      JSON.stringify({ ok: true, txHash: receipt.transactionHash }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
