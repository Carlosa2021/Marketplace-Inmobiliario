import { rcmd } from '@/lib/redis'; // si no exportaste rcmd, re-exporta o duplica helper
const norm = (a: string) => a.toLowerCase();
const k = (addr: string) => `kyc:${norm(addr)}`; // values: "none" | "pending" | "approved"

export async function kycGet(address: string) {
  const v = await rcmd<string>(['GET', k(address)]);
  return v ?? 'none';
}
export async function kycSet(
  address: string,
  status: 'none' | 'pending' | 'approved',
) {
  await rcmd<number>(['SET', k(address), status]);
  return { ok: true, status };
}
