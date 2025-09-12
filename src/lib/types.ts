// src/lib/types.ts
// Mantengo tu NFTListing y agrego los tipos KYC

export interface NFTListing {
  id: string;
  asset: {
    image: string;
    name: string;
    description: string;
    metadata?: {
      image?: string;
      name?: string;
      description?: string;
    };
  };
  currencyValuePerToken: {
    displayValue: string;
    symbol: string;
  };
}

/** ===== KYC types ===== */
export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface KycSubmission {
  id: string;
  name: string;
  email: string | null;
  idType: 'passport' | 'id' | 'driving_license' | 'other';
  idNumber: string;
  // en dev usamos base64 o url
  idImageUrl?: string | null;

  // quién lo envió (wallet) — opcional
  submittedBy?: string | null;

  // metadatos
  createdAt: string; // ISO
  status: KycStatus;

  // opcionales administradores
  notes?: string;
  reviewer?: string;
  reviewedAt?: string;
}

/** ===== Order types ===== */
export interface Order {
  id: string;
  buyer: string;
  listingId?: string;
  chainId: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount?: string;
  currency?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
  txHash?: string;
  priceEUR?: number;
  email?: string;
  collection?: string;
  tokenId?: string;
}
