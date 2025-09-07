'use client';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useFiatOnramp } from '@/hooks/useFiatOnramp';

export function BuyWithFiatButton({
  propertyId,
  priceEUR,
}: {
  propertyId: string;
  priceEUR: number;
}) {
  const [loading, setLoading] = useState(false);
  const account = useActiveAccount();
  const { createCheckout } = useFiatOnramp();

  const onClick = async () => {
    try {
      setLoading(true);
      const buyerWallet = account?.address || '';
      const { checkoutUrl } = await createCheckout({
        propertyId,
        buyerWallet,
        amountFiat: priceEUR,
        currencyFiat: 'EUR',
      });
      window.location.href = checkoutUrl;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-70 w-full"
      aria-busy={loading}
    >
      {loading ? 'Creando checkout...' : `Pagar con tarjeta (${priceEUR} €)`}
    </button>
  );
}
