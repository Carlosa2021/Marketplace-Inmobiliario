// src/app/api/receipts/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { execFile } from 'child_process';
import type { Order } from '@/lib/types';
import { getOrderForUser } from '@/lib/orders';
import { getUserFromRequest } from '@/lib/auth';

async function runGenerateScript(order: Order) {
  return new Promise<{ publicPath?: string; url?: string }>(
    (resolve, reject) => {
      const scriptPath = './scripts/generate-receipt.js';
      const child = execFile(process.execPath, [scriptPath], {
        cwd: process.cwd(),
        maxBuffer: 30 * 1024 * 1024,
      });

      const payload = JSON.stringify({
        order,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      });

      child.stdin?.write(payload);
      child.stdin?.end();

      const stdout: Buffer[] = [];
      const stderr: Buffer[] = [];
      child.stdout?.on('data', (b: Buffer) => stdout.push(Buffer.from(b)));
      child.stderr?.on('data', (b: Buffer) => stderr.push(Buffer.from(b)));

      child.on('error', (err) => reject(err));
      child.on('exit', (code) => {
        const out = Buffer.concat(stdout).toString('utf8').trim();
        const errOut = Buffer.concat(stderr).toString('utf8').trim();
        if (code !== 0) {
          return reject(new Error(`script exited ${code}. stderr: ${errOut}`));
        }
        try {
          const parsed = out ? JSON.parse(out) : {};
          resolve(parsed);
        } catch (e) {
          reject(
            new Error(
              'Invalid JSON from script: ' +
                out +
                ' / err:' +
                (e as Error).message,
            ),
          );
        }
      });
    },
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');
    if (!orderId)
      return NextResponse.json({ error: 'orderId missing' }, { status: 400 });

    const order = await getOrderForUser(orderId, user.address);
    if (!order)
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 },
      );

    const result = await runGenerateScript(order);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Error in receipts route:', err);
    const msg = (err as Error).message ?? String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
