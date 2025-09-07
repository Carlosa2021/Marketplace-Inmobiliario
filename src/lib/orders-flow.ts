// src/lib/orders-flow.ts
import { Order } from './types';
import { getOrderById, upsertOrder } from './orders';

/**
 * Marca una orden como pagada y añade txHash / chainId
 */
export async function markOrderPaid(
  orderId: string,
  txHash: string,
  chainId?: number,
) {
  const order = getOrderById(orderId);
  if (!order) throw new Error('Order not found');
  const updated: Order = {
    ...order,
    txHash,
    chainId: chainId ?? order.chainId ?? 137,
  };
  upsertOrder(updated);
  return updated;
}

/**
 * Crea una orden simple con id autogenerado si hace falta
 */
export async function createOrder(
  orderPartial: Partial<Order>,
): Promise<Order> {
  const id = orderPartial.id ?? `manual-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);
  const order: Order = {
    id,
    createdAt: orderPartial.createdAt ?? now,
    buyer: orderPartial.buyer ?? '0x0000000000000000000000000000000000000000',
    priceEUR: orderPartial.priceEUR,
    email: orderPartial.email,
    collection: orderPartial.collection,
    tokenId: orderPartial.tokenId,
    listingId: orderPartial.listingId,
    chainId: orderPartial.chainId ?? 137,
    ...orderPartial,
  };
  upsertOrder(order);
  return order;
}
