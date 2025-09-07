// src/lib/kyc-store.ts
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { KycSubmission } from './types';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'kyc.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

function safeReadFile(): unknown {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('kyc-store: error leyendo fichero', err);
    return [];
  }
}

/** read all */
export function readAllKyc(): KycSubmission[] {
  const data = safeReadFile();
  if (Array.isArray(data)) return data as KycSubmission[];
  return [];
}

/** write all (atomic) */
export function writeAllKyc(list: KycSubmission[]) {
  try {
    ensureDataFile();
    const tmp = DATA_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
    fs.renameSync(tmp, DATA_PATH);
  } catch (err) {
    console.error('kyc-store: error escribiendo fichero', err);
    throw err;
  }
}

/** Añade una nueva solicitud KYC (dev environment). Devuelve la nueva entrada */
export function addKycSubmission(
  payload: Omit<KycSubmission, 'id' | 'createdAt' | 'status'>,
) {
  const list = readAllKyc();
  const newItem: KycSubmission = {
    ...payload,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  list.unshift(newItem);
  writeAllKyc(list);
  return newItem;
}

/** Obtener por id */
export function getKycById(id: string): KycSubmission | undefined {
  const list = readAllKyc();
  return list.find((i) => i.id === id);
}

/** Actualiza (status, notes, etc). Retorna la entrada actualizada o undefined */
export function updateKycSubmission(
  id: string,
  updates: Partial<Pick<KycSubmission, 'status' | 'notes' | 'idImageUrl'>> & {
    reviewer?: string | undefined;
  },
) {
  const list = readAllKyc();
  const idx = list.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;

  const item = list[idx];
  const now = new Date().toISOString();
  const newItem: KycSubmission = {
    ...item,
    ...updates,
    reviewedAt:
      updates.status && updates.status !== item.status ? now : item.reviewedAt,
    reviewer: updates.reviewer ?? item.reviewer,
  } as KycSubmission;

  list[idx] = newItem;
  writeAllKyc(list);
  return newItem;
}
