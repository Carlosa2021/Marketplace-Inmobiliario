// src/app/api/dev/make-receipt/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { execFile } from 'child_process';

export async function GET() {
  try {
    const order = {
      id: 'test-123',
      createdAt: Date.now(),
      buyer: '0xAAA',
      priceEUR: 123.45,
    };

    const scriptPath = './scripts/generate-receipt.js';

    // Lanza el script Node usando el mismo binario que ejecuta Next
    const child = execFile(process.execPath, [scriptPath], {
      cwd: process.cwd(),
      maxBuffer: 20 * 1024 * 1024,
    });

    const payload = JSON.stringify({
      order,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    });
    child.stdin?.write(payload);
    child.stdin?.end();

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    child.stdout?.on('data', (b: Buffer) => stdoutChunks.push(Buffer.from(b)));
    child.stderr?.on('data', (b: Buffer) => stderrChunks.push(Buffer.from(b)));

    await new Promise<void>((resolve, reject) => {
      child.on('exit', (code) => {
        if (code === 0) return resolve();
        const stderr = Buffer.concat(stderrChunks).toString('utf8');
        return reject(
          new Error(`Child process exited with code ${code}: ${stderr}`),
        );
      });
      child.on('error', (err) => reject(err));
    });

    const stdout = Buffer.concat(stdoutChunks).toString('utf8').trim();
    const result = stdout ? JSON.parse(stdout) : { publicPath: undefined };

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Error generating receipt (route):', err);
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 },
    );
  }
}
