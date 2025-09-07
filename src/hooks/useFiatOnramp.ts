export function useFiatOnramp() {
  const createCheckout = async (params: {
    propertyId: string;
    buyerWallet: string;
    amountFiat: number;
    currencyFiat?: string;
  }) => {
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'No se pudo crear el checkout');
    return data as { checkoutUrl: string };
  };
  return { createCheckout };
}
