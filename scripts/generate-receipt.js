/**
 * scripts/generate-receipt.js
 * Node script que lee JSON por stdin: { order: {...}, baseUrl: "http://..." }
 * y genera public/receipts/<safeId>.pdf
 * Devuelve por stdout un JSON: { publicPath, url }
 *
 * Uso (interno desde route.ts): se lanza con `node scripts/generate-receipt.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const fontkit = require('fontkit');

async function main() {
  // Leer stdin (blocking)
  const input = fs.readFileSync(0, 'utf8');
  let data;
  try {
    data = JSON.parse(input || '{}');
  } catch (err) {
    console.error('Invalid JSON on stdin:', err && err.message);
    process.exit(2);
  }
  const order = data.order || {};
  const baseUrl = data.baseUrl;

  const receiptsDir = path.join(process.cwd(), 'public', 'receipts');
  fs.mkdirSync(receiptsDir, { recursive: true });

  const safeId = String(order.id ?? 'order').replace(/[^a-zA-Z0-9_\-]/g, '_');
  const outFile = path.join(receiptsDir, `${safeId}.pdf`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  // attach fontkit to pdfkit (internally used)

  doc._fontkit = fontkit;

  // Try register Roboto from public/fonts if available
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  const regularPath = path.join(fontsDir, 'Roboto-Regular.ttf');
  const boldPath = path.join(fontsDir, 'Roboto-Bold.ttf');

  try {
    if (fs.existsSync(regularPath)) {
      const regularData = fs.readFileSync(regularPath);
      doc.registerFont('Regular', regularData);
    }
  } catch (err) {
    console.warn(
      'No se pudo registrar Roboto-Regular.ttf:',
      err && err.message,
    );
  }

  try {
    if (fs.existsSync(boldPath)) {
      const boldData = fs.readFileSync(boldPath);
      doc.registerFont('Bold', boldData);
    }
  } catch (err) {
    console.warn('No se pudo registrar Roboto-Bold.ttf:', err && err.message);
  }

  // Stream to file
  const stream = fs.createWriteStream(outFile);
  doc.pipe(stream);

  // Content (similar a tu generateReceiptPDF)
  const fmtEUR = (v) => {
    if (v == null) return '';
    try {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }).format(v);
    } catch {
      return `€${typeof v === 'number' ? v.toFixed(2) : String(v)}`;
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

  try {
    doc.font('Bold');
  } catch {}
  doc.text('Detalles', { underline: true }).moveDown(0.5);
  try {
    doc.font('Regular');
  } catch {}
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

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const publicPath = `/receipts/${safeId}.pdf`;
  const url = baseUrl ? new URL(publicPath, baseUrl).toString() : undefined;

  // devolver meta por stdout (JSON)
  process.stdout.write(JSON.stringify({ publicPath, url }));
}

main().catch((err) => {
  console.error(
    'ERROR script generate-receipt:',
    err && (err.stack || err.message || err),
  );
  process.exit(1);
});
