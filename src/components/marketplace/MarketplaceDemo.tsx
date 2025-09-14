'use client';

import React, { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarketplaceDemoProps {
  className?: string;
}

interface DemoListing {
  id: string;
  title: string;
  price: string;
  location: string;
  type: 'house' | 'apartment' | 'office';
  status: 'active' | 'sold' | 'pending';
}

export function MarketplaceDemo({ className }: MarketplaceDemoProps) {
  const account = useActiveAccount();
  const [demoListings] = useState<DemoListing[]>([
    {
      id: '1',
      title: 'Casa Moderna en Madrid',
      price: '0.5 ETH',
      location: 'Madrid, España',
      type: 'house',
      status: 'active',
    },
    {
      id: '2',
      title: 'Apartamento Centro Barcelona',
      price: '0.3 ETH',
      location: 'Barcelona, España',
      type: 'apartment',
      status: 'active',
    },
    {
      id: '3',
      title: 'Oficina Premium Valencia',
      price: '0.8 ETH',
      location: 'Valencia, España',
      type: 'office',
      status: 'pending',
    },
  ]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCreateDemoListing = async () => {
    setIsCreatingListing(true);
    // Simular creación de listing
    setTimeout(() => {
      console.log('Demo listing created successfully!');
      setIsCreatingListing(false);
    }, 2000);
  };

  const handleSyncWithThirdweb = async () => {
    setIsSyncing(true);
    // Simular sincronización
    setTimeout(() => {
      console.log('Sync completed successfully!');
      setIsSyncing(false);
    }, 1500);
  };

  const handlePlaceBid = async (listingId: string) => {
    console.log(`Placing bid on listing ${listingId}`);
    // Simular puja
  };

  const handleBuyNow = async (listingId: string) => {
    console.log(`Purchasing listing ${listingId}`);
    // Simular compra
  };

  if (!account) {
    return (
      <div
        className={`p-6 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}
      >
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Connect Wallet Required
        </h3>
        <p className="text-yellow-700">
          Please connect your wallet to test the marketplace functionality.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-6 bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Marketplace Demo Simplificado
        </h2>
        <p className="text-gray-600">
          Componente de demostración sin dependencias complejas
        </p>
      </div>

      {/* Demo Controls */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          onClick={handleCreateDemoListing}
          disabled={isCreatingListing}
          variant="default"
        >
          {isCreatingListing ? 'Creating...' : 'Create Demo Listing'}
        </Button>

        <Button
          onClick={handleSyncWithThirdweb}
          disabled={isSyncing}
          variant="outline"
        >
          {isSyncing ? 'Syncing...' : 'Sync with Thirdweb'}
        </Button>
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Connection Status</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Wallet Address:</span>
            <Badge variant="outline">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant="default">Connected</Badge>
          </div>
        </div>
      </div>

      {/* Listings Display */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Active Listings ({demoListings.length})
        </h3>

        {demoListings.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">No listings available</p>
            <p className="text-sm text-gray-400">
              Create a demo listing to test the marketplace functionality.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoListings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{listing.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <Badge
                      variant={
                        listing.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {listing.status}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      {listing.type}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      {listing.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      {listing.location}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleBuyNow(listing.id)}
                    >
                      Buy Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlaceBid(listing.id)}
                    >
                      Place Bid
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Developer Info */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Developer Info</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Componente simplificado sin dependencias complejas</div>
          <div>• Funcionalidad básica de marketplace</div>
          <div>• Integración con Thirdweb SDK</div>
          <div>• Listo para desarrollo adicional</div>
        </div>
      </div>
    </div>
  );
}
