// src/lib/orders.ts
import fs from 'fs';
import path from 'path';
import { Order } from './types';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json');

/**
 * Lee el JSON de disk y lo parsea a Order[]
 */
function readAllOrdersFromDisk(): Order[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data as Order[];
    }
    // si en tu proyecto el JSON exporta un objeto, adapta aquí
    return [];
  } catch (err) {
    console.error(
      'readAllOrdersFromDisk error',
      err instanceof Error ? err.stack ?? err.message : err,
    );
    // Devolvemos [] porque la función devuelve Order[].
    // Alternativa: throw err;  <-- si quieres que el que llama maneje el error.
    return [];
  }
}

/**
 * Guarda las órdenes (solo para dev / ejemplo).
 * NOTA: en producción usar DB.
 */
function writeAllOrdersToDisk(orders: Order[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(orders, null, 2), 'utf8');
}

/**
 * Obtiene una orden por id (sin lanzar).
 */
export function getOrderById(id: string): Order | undefined {
  if (!id) return undefined;
  const all = readAllOrdersFromDisk();
  return all.find((o) => String(o.id) === String(id));
}

/**
 * Obtiene la orden asegurando que el address (user) coincide — por seguridad.
 * Si no pasas userAddress simplemente devuelve la orden (útil para admin/testing).
 */
export function getOrderForUser(
  id: string,
  userAddress?: string,
): Order | undefined {
  const order = getOrderById(id);
  if (!order) return undefined;
  if (!userAddress) return order;
  // comparar mayúsc/minúsc según tus necesidades
  return String(order.buyer).toLowerCase() === String(userAddress).toLowerCase()
    ? order
    : undefined;
}

/**
 * Lista todas las orders (simple).
 */
export function listOrders(): Order[] {
  return readAllOrdersFromDisk();
}

/**
 * Crea o actualiza una orden (dev). Devuelve la orden resultante.
 */
export function upsertOrder(order: Order): Order {
  const all = readAllOrdersFromDisk();
  const idx = all.findIndex((o) => String(o.id) === String(order.id));
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...order };
  } else {
    all.push(order);
  }
  writeAllOrdersToDisk(all);
  return order;
}
