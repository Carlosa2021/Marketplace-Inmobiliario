'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectButton } from 'thirdweb/react';
import { client, chain } from '@/lib/thirdweb/client-browser';
import { useActiveAccount } from 'thirdweb/react';

export default function MarketplaceDemoPage() {
  const account = useActiveAccount();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📋 Marketplace Demo</h1>
        <p className="text-lg text-gray-600">
          Página de demostración del marketplace
        </p>
      </div>

      {!account ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Conecta tu Wallet para ver el Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectButton client={client} chain={chain} theme="light" />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🏠 Propiedad Demo 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Casa en Madrid</p>
              <p className="text-blue-600 font-bold">0.5 ETH</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Ver Detalles
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏢 Propiedad Demo 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Apartamento en Barcelona</p>
              <p className="text-blue-600 font-bold">0.3 ETH</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Ver Detalles
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏘️ Propiedad Demo 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Villa en Valencia</p>
              <p className="text-blue-600 font-bold">1.2 ETH</p>
              <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Ver Detalles
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>ℹ️ Información del Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Esta es una página de demostración que muestra cómo funcionaría el
            marketplace.
          </p>
          <p className="text-green-600 mt-2">
            ✅ Página demo funcionando correctamente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
