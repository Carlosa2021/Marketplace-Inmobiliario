// src/hooks/useWalletBalance.ts
import { useEffect, useState } from 'react';
import { WalletBalance } from 'thirdweb'; // thirdweb SDK v5

export function useWalletBalance(
  address: string | undefined,
  tokenAddress: string,
) {
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  async function fetch() {
    if (!address) return;
    setIsLoading(true);
    const result = await WalletBalance({
      owner_address: address,
      token_address: tokenAddress,
      page: 0,
    });
    const bal = result?.token_balances?.[0]?.formatted_balance || '0';
    setBalance(bal);
    setIsLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [address, tokenAddress]);

  return { balance, isLoading, refetch: fetch };
}
