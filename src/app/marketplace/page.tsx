'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveAccount } from 'thirdweb/react';
import PropertyList from '@/components/properties/PropertyList';
import Link from 'next/link';

export default function MarketplacePage() {
  const account = useActiveAccount();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🏠 Marketplace Inmobiliario
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Descubre y compra propiedades tokenizadas en la blockchain
        </p>
      </div>

      {/* Wallet Connection Section - Ya está en el Navbar */}
      {!account && (
        <div className="text-center mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
            🔗 Conecta tu Wallet
          </h3>
          <p className="text-amber-700 dark:text-amber-300">
            Usa el botón de conexión en la parte superior para ver las
            propiedades disponibles
          </p>
        </div>
      )}

      {/* Marketplace Actions */}
      {account && (
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/crear-nft"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            🏗️ Crear Propiedad NFT
          </Link>
          <Link
            href="/mis-nfts"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            📋 Mis Propiedades
          </Link>
          <Link
            href="/marketplace/demo"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            🎯 Demo Interactivo
          </Link>
        </div>
      )}

      {/* Properties Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Propiedades Disponibles
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {account
              ? 'Explora y compra'
              : 'Conecta tu wallet para ver precios'}
          </div>
        </div>

        <PropertyList />
      </div>

      {/* Info Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-indigo-600">🔒 Seguro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Todas las transacciones son verificadas en blockchain
            </p>
          </CardContent>
        </Card>

        <Card className="text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-600">⚡ Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Compra y vende propiedades de forma instantánea
            </p>
          </CardContent>
        </Card>

        <Card className="text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-600">🌍 Global</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Accede a propiedades de todo el mundo desde cualquier lugar
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
