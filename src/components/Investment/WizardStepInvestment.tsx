// src/components/Investment/WizardStepInvestment.tsx
import { useState } from 'react';
import { useFiatOnramp } from '@/hooks/useFiatOnramp';
import { useTokenSwap } from '@/hooks/useTokenSwap';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { useWalletBalance } from '@/hooks/useWalletBalance';

// USDC Polygon: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

export default function WizardStepInvestment({ listingPrice, onBuySuccess }) {
  const user = useActiveAccount();
  const { buyCrypto } = useFiatOnramp();
  const { swap } = useTokenSwap();
  const { balance, isLoading, refetch } = useWalletBalance(
    user?.address,
    USDC_ADDRESS,
  );
  const { mutateAsync: sendTx, isPending } = useSendTransaction();
  const [swapping, setSwapping] = useState(false);

  // Helper para amounts USDC (6 decimales)
  const required = Number(listingPrice) || 0;
  const available = Number(balance);

  async function handleFiat() {
    await buyCrypto({ tokenAddress: USDC_ADDRESS, fiatAmount: required });
    refetch();
  }

  async function handleSwap() {
    setSwapping(true);
    // Como ejemplo: cambiar native token a USDC
    // 1 MATIC = 1000000000000000000 (18 decimales)
    // 1 USDC = 1000000 (6 decimales)
    const amount = required * 1_000_000;
    const tx = await swap({
      tokenIn: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      tokenOut: USDC_ADDRESS,
      amount,
    });
    await sendTx(tx);
    setSwapping(false);
    refetch();
  }

  async function handleBuy() {
    // Aquí colocas la función que ejecuta la compra real en el marketplace:
    // Ejemplo: await buyFromListing({ ... })
    onBuySuccess?.();
  }

  if (!user) return <div>Conecta tu wallet para invertir.</div>;

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg max-w-md mx-auto mt-10">
      <h2 className="font-bold text-2xl mb-4">
        Paso 2: Selecciona el fondeo para invertir
      </h2>
      {isLoading ? (
        <div>Cargando balance...</div>
      ) : available < required ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            <strong>
              No tienes USDC suficiente para invertir ({balance} USDC &lt;{' '}
              {listingPrice} USDC).
            </strong>
          </p>
          <div className="flex gap-2">
            <button onClick={handleFiat} className="btn btn-primary">
              Comprar USDC con tarjeta/fiat
            </button>
            <button
              onClick={handleSwap}
              disabled={swapping}
              className="btn btn-secondary"
            >
              Convertir cripto a USDC {swapping && '(procesando...'}
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Tras fondear, refresca para continuar.
          </p>
        </div>
      ) : (
        <button
          onClick={handleBuy}
          disabled={isPending}
          className="btn btn-success w-full py-3 text-lg"
        >
          Comprar activo por {listingPrice} USDC
        </button>
      )}
      <div className="mt-4 text-xs text-gray-500">
        Puedes recargar o swapear tu saldo USDC sin salir del wizard.
      </div>
    </div>
  );
}
