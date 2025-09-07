// src/types/pdfkit.d.ts
import { Writable } from 'stream';

declare module 'pdfkit' {
  export interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    [k: string]: unknown;
  }

  export default class PDFDocument extends Writable {
    constructor(options?: PDFDocumentOptions);
    registerFont(name: string, src: string | Buffer): void;
    font(nameOrBuffer: string | Buffer): this;
    fontSize(size: number): this;
    text(text: string, options?: Record<string, unknown>): this;
    moveDown(n?: number): this;
    fillColor(color: string): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    strokeColor(color: string): this;
    stroke(): this;
    end(): void;
    on(event: 'data' | 'end' | 'error', cb: (payload?: unknown) => void): this;
    static PDFFont: { dataPath?: string };
    // runtime-internal (no 'any' to satisfy eslint): usamos tipo genérico
    _fontkit?: { [k: string]: unknown } | ((...args: unknown[]) => unknown);
  }
}
