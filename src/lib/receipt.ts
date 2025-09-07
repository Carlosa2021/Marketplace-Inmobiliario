// src/lib/receipt.ts
import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { join } from 'path';

// Tipos locales para los módulos importados dinámicamente
type FontkitModule = typeof import('fontkit');

export type Order = {
  id: string | number;
  buyer?: string;
  email?: string;
  chainId?: number;
  collection?: string;
  listingId?: string | number;
  tokenId?: string | number;
  priceEUR?: number;
  txHash?: string;
  createdAt?: number;
  status?: string;
};

export async function generateReceiptPDF(
  order: Order,
  opts: { baseUrl?: string } = {},
) {
  const receiptsDir = join(process.cwd(), 'public', 'receipts');
  const safeId = String(order.id).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const outFile = join(receiptsDir, `${safeId}.pdf`);
  await mkdir(receiptsDir, { recursive: true });

  // --- imports dinámicos ---
  const pdfkitMod = await import('pdfkit');
  const PDFDocumentClass = pdfkitMod.default ?? pdfkitMod;

  const fontkitMod = (await import('fontkit')) as unknown as FontkitModule & {
    default?: FontkitModule['default'];
  };
  const fontkit = (fontkitMod.default ??
    fontkitMod) as FontkitModule['default'];

  // Crear documento PDF
  const doc = new PDFDocumentClass({ size: 'A4', margin: 50 });
  // Adjuntar fontkit (pdfkit usa internamente _fontkit)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any)._fontkit = fontkit;

  // Buscar carpeta de fuentes: prefer 'public/fonts', fallback 'public/font'
  const c1 = join(process.cwd(), 'public', 'fonts');
  const c2 = join(process.cwd(), 'public', 'font');
  let fontsDir = c1;
  try {
    await access(c1);
  } catch {
    try {
      await access(c2);
      fontsDir = c2;
    } catch {
      // no hay carpeta de fonts; dejaremos fontsDir = c1 para que el readFile falle si no existen
      fontsDir = c1;
    }
  }

  const regularPath = join(fontsDir, 'Roboto-Regular.ttf');
  const boldPath = join(fontsDir, 'Roboto-Bold.ttf');

  // Buffer collector para devolver el PDF en memoria
  const chunks: Buffer[] = [];
  const pdfDone = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (b: unknown) => {
      if (b instanceof Buffer) chunks.push(b);
      else if (typeof b === 'string') chunks.push(Buffer.from(b));
    });
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: unknown) => reject(err));
  });

  // Registrar fuentes: si no existen, lanzar error explícito con mensaje claro
  let regularData: Buffer;
  try {
    regularData = await readFile(regularPath);
  } catch (err: unknown) {
    const msg = (err as Error).message ?? String(err);
    throw new Error(
      `No se pudo leer la fuente regular en: ${regularPath} — error: ${msg}`,
    );
  }
  doc.registerFont('Regular', regularData);

  try {
    const boldData = await readFile(boldPath);
    doc.registerFont('Bold', boldData);
  } catch (err: unknown) {
    // negrita opcional: logueamos el warning en server y seguimos sin lanzar
    console.warn(
      `Fuente negrita opcional no encontrada en ${boldPath}: ${
        (err as Error).message ?? String(err)
      }`,
    );
  }

  doc.font('Regular');

  // ===== contenido del PDF =====
  const fmtEUR = (value?: number) => {
    if (value == null) return '';
    try {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `€${typeof value === 'number' ? value.toFixed(2) : String(value)}`;
    }
  };

  doc.fontSize(18).text('Recibo de compra', { align: 'right' }).moveDown(0.5);

  doc
    .fontSize(10)
    .text(`Pedido: ${safeId}`)
    .text(
      `Fecha: ${new Date(order.createdAt ?? Date.now()).toLocaleString(
        'es-ES',
      )}`,
    );

  doc.moveDown(0.5);
  doc
    .moveTo(50, doc.y)
    .lineTo(545, doc.y)
    .strokeColor('#e5e7eb')
    .stroke()
    .moveDown(0.5);

  const buyer = order.buyer ?? '';
  const collection = order.collection ?? '';
  const tokenId = order.tokenId != null ? String(order.tokenId) : '';
  const listingId = order.listingId != null ? String(order.listingId) : '';
  const chainId = order.chainId ?? 137;
  const txHash = order.txHash ?? '';
  const fiatLabel = fmtEUR(order.priceEUR);

  doc.fontSize(12);
  try {
    doc.font('Bold');
  } catch {
    // si no hay la fuente bold registrada, ignoramos
  }
  doc.text('Detalles', { underline: true }).moveDown(0.5);
  try {
    doc.font('Regular');
  } catch {
    // ignore
  }
  doc.fontSize(10);

  if (buyer) doc.text(`Comprador (wallet): ${buyer}`);
  if (order.email) doc.text(`Email: ${order.email}`);
  if (collection) doc.text(`Colección: ${collection}`);
  if (tokenId) doc.text(`Token ID: ${tokenId}`);
  if (listingId) doc.text(`Listing: ${listingId}`);
  if (fiatLabel) doc.text(`Importe: ${fiatLabel}`);

  if (txHash) {
    const ex =
      chainId === 1 ? 'https://etherscan.io' : 'https://polygonscan.com';
    doc.text(`Tx Hash: ${txHash}`);
    doc.fillColor('#2563eb').text(`${ex}/tx/${txHash}`, {
      link: `${ex}/tx/${txHash}`,
      underline: true,
    });
    doc.fillColor('black');
  }

  doc.moveDown(1);
  doc
    .fontSize(10)
    .text(
      'Gracias por su compra. Este documento es un comprobante de pago. ' +
        'La propiedad digital (NFT) ha sido asignada a la dirección indicada tras confirmación onchain.',
      { align: 'left' },
    );

  doc.moveDown(1);
  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .text('ChainX — Marketplace Inmobiliario Web3', { align: 'right' })
    .fillColor('black');

  doc.end();

  const pdf = await pdfDone;
  await writeFile(outFile, pdf);

  const publicPath = `/receipts/${safeId}.pdf`;
  const url = opts.baseUrl
    ? new URL(publicPath, opts.baseUrl).toString()
    : undefined;
  return { publicPath, url };
}
