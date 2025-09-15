'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveAccount } from 'thirdweb/react';
import PropertyList from '@/components/properties/PropertyList';
import Link from 'next/link';

export default function MarketplacePage() {
  const account = useActiveAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-2000" />

        <div className="relative container mx-auto px-4 py-16 max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-6 shadow-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Marketplace Inmobiliario Web3
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              El Futuro de la
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Propiedad Digital
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Descubre, compra y vende propiedades tokenizadas en blockchain.
              <br className="hidden md:block" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                Seguridad, transparencia y liquidez sin precedentes.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-[1px] rounded-2xl">
                <button className="bg-white dark:bg-slate-900 px-8 py-4 rounded-2xl font-bold text-lg text-indigo-600 dark:text-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 shadow-xl">
                  🚀 Explorar Propiedades
                </button>
              </div>

              <Link
                href="/crear-nft"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                🏗️ Crear Propiedad NFT
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection Banner */}
      {!account && (
        <div className="container mx-auto px-4 -mt-8 mb-8 max-w-4xl">
          <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 p-[1px] rounded-2xl shadow-2xl">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Conecta tu Wallet
                </h3>
              </div>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Para explorar todas las propiedades disponibles y realizar
                transacciones, conecta tu wallet usando el botón en la barra de
                navegación superior.
              </p>

              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 px-6 py-3 rounded-xl">
                  <p className="text-amber-800 dark:text-amber-200 font-medium">
                    ⚡ Solo toma unos segundos y es completamente seguro
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected User Actions */}
      {account && (
        <div className="container mx-auto px-4 mb-8 max-w-6xl">
          <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 p-[1px] rounded-2xl shadow-2xl">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  🎉 ¡Wallet Conectada!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Dirección:{' '}
                  <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/crear-nft"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
                >
                  🏗️ Crear Propiedad NFT
                </Link>
                <Link
                  href="/mis-nfts"
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
                >
                  📋 Mis Propiedades
                </Link>
                <Link
                  href="/marketplace/demo"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
                >
                  🎯 Demo Interactivo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Properties Section */}
      <div className="container mx-auto px-4 mb-16 max-w-7xl">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🏠 Propiedades Disponibles
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {account
                  ? 'Explora el catálogo completo de propiedades tokenizadas'
                  : 'Conecta tu wallet para ver precios y detalles completos'}
              </p>
            </div>

            {account && (
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.floor(Math.random() * 50) + 10} Propiedades
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Disponibles ahora
                </div>
              </div>
            )}
          </div>

          <PropertyList />
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 mb-16 max-w-7xl">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ¿Por qué elegir nuestro Marketplace?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tecnología blockchain para revolucionar el mercado inmobiliario
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🔒</span>
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Seguridad Total
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Todas las transacciones son inmutables y verificables en la
                blockchain de Polygon
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">⚡</span>
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Transacciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Compra y vende propiedades en minutos, sin intermediarios
                tradicionales
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl text-white">🌍</span>
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">
                Acceso Global
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                Propiedades de todo el mundo disponibles para inversionistas
                internacionales
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
