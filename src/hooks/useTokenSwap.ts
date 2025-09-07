import { PrepareTokenSwap } from 'thirdweb';
import { polygon } from 'thirdweb/chains';

export function useTokenSwap() {
  async function swap({
    tokenIn,
    tokenOut,
    amount,
  }: {
    tokenIn: string;
    tokenOut: string;
    amount: number; // en unidades base: ej, 1000000 para 1 USDC (decimals 6)
  }) {
    const tx = await PrepareTokenSwap({
      operation: 'sell',
      token_in: tokenIn,
      token_out: tokenOut,
      amount,
      destination_chain_id: polygon.chain_id,
    });
    // Luego llama useSendTransaction para firmar/ejecutar
    return tx;
  }
  return { swap };
}
