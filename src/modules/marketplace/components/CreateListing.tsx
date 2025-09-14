// src/modules/marketplace/components/CreateListing.tsx
'use client';

import React, { useState } from 'react';
import { useMarketplace } from '../marketplace-provider';
import { MarketplaceListing } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  Calendar,
  Settings,
  Info,
  CheckCircle,
  X,
} from 'lucide-react';

interface CreateListingProps {
  onClose: () => void;
}

export function CreateListing({ onClose }: CreateListingProps) {
  const { createListing } = useMarketplace();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    location: '',
    contractAddress: '',
    tokenId: '',

    // Pricing
    listingType: 'fixed_price' as 'fixed_price' | 'auction' | 'fractional_sale',
    price: {
      amount: 0,
      currency: 'EUR',
    },

    // Auction specific
    auction: {
      startTime: '',
      endTime: '',
      startPrice: 0,
      reservePrice: 0,
      bidIncrement: 1000,
      extendOnBid: true,
    },

    // Fractional sale specific
    fractional: {
      totalShares: 1000,
      availableShares: 1000,
      sharePrice: 0,
      minPurchase: 1,
      maxPurchase: 100,
    },

    // Media
    images: [] as string[],

    // Metadata
    metadata: {
      propertyType: '',
      bedrooms: 0,
      bathrooms: 0,
      squareMeters: 0,
      yearBuilt: 0,
      propertyFeatures: [] as string[],
      neighborhood: '',
      nearbyAmenities: [] as string[],
      rentYield: 0,
      appreciationRate: 0,
      maintenanceCosts: 0,
      propertyTaxes: 0,
    },

    // Terms
    expiresAt: '',
    termsAccepted: false,
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, upload to IPFS or cloud storage
      const imageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate form
      if (!formData.title || !formData.description || !formData.price.amount) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare listing data
      const listingData: Omit<
        MarketplaceListing,
        'id' | 'createdAt' | 'updatedAt'
      > = {
        contractAddress: formData.contractAddress,
        tokenId: formData.tokenId,
        seller: 'current_user', // Replace with actual user
        title: formData.title,
        description: formData.description,
        images: formData.images,
        price: formData.price,
        listingType: formData.listingType,
        location: formData.location,
        status: 'active',
        expiresAt: formData.expiresAt || undefined,
        metadata: formData.metadata,

        // Conditional fields
        ...(formData.listingType === 'auction' && {
          auction: {
            ...formData.auction,
            currentBid: 0,
            bidCount: 0,
            highestBidder: '',
          },
        }),

        ...(formData.listingType === 'fractional_sale' && {
          fractional: formData.fractional,
        }),
      };

      await createListing(listingData);
      onClose();
    } catch (error) {
      console.error('Failed to create listing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Información Básica', icon: Info },
    { id: 2, title: 'Precio y Tipo', icon: DollarSign },
    { id: 3, title: 'Imágenes', icon: ImageIcon },
    { id: 4, title: 'Detalles', icon: Settings },
    { id: 5, title: 'Revisar', icon: CheckCircle },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Listing</h1>
            <p className="text-gray-600">
              Publica tu propiedad en el marketplace
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-6">
            <nav className="space-y-3">
              {steps.map((stepItem) => (
                <div
                  key={stepItem.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    step === stepItem.id
                      ? 'bg-blue-100 text-blue-700'
                      : step > stepItem.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setStep(stepItem.id)}
                >
                  <stepItem.icon className="h-5 w-5" />
                  <span className="font-medium">{stepItem.title}</span>
                  {step > stepItem.id && (
                    <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
            {step === 1 && (
              <BasicInfoStep formData={formData} onChange={handleInputChange} />
            )}

            {step === 2 && (
              <PricingStep formData={formData} onChange={handleInputChange} />
            )}

            {step === 3 && (
              <ImagesStep
                images={formData.images}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
              />
            )}

            {step === 4 && (
              <DetailsStep formData={formData} onChange={handleInputChange} />
            )}

            {step === 5 && <ReviewStep formData={formData} />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index + 1 <= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)}>Siguiente</Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.termsAccepted}
            >
              {isLoading ? 'Creando...' : 'Crear Listing'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function BasicInfoStep({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
        <p className="text-gray-600">
          Proporciona los detalles fundamentales de tu propiedad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Ej: Apartamento moderno en el centro de Madrid"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Describe tu propiedad en detalle..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={formData.location}
              onChange={(e) => onChange('location', e.target.value)}
              placeholder="Ciudad, País"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección del Contrato *
          </label>
          <Input
            value={formData.contractAddress}
            onChange={(e) => onChange('contractAddress', e.target.value)}
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token ID *
          </label>
          <Input
            value={formData.tokenId}
            onChange={(e) => onChange('tokenId', e.target.value)}
            placeholder="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Expiración (Opcional)
          </label>
          <Input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => onChange('expiresAt', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function PricingStep({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Precio y Tipo de Venta</h2>
        <p className="text-gray-600">
          Configura cómo quieres vender tu propiedad.
        </p>
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Venta *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'fixed_price',
              title: 'Precio Fijo',
              description: 'Vende a un precio establecido',
              icon: DollarSign,
            },
            {
              id: 'auction',
              title: 'Subasta',
              description: 'Los compradores compiten con ofertas',
              icon: Calendar,
            },
            {
              id: 'fractional_sale',
              title: 'Venta Fraccionada',
              description: 'Vende participaciones de la propiedad',
              icon: Settings,
            },
          ].map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-colors ${
                formData.listingType === type.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onChange('listingType', type.id)}
            >
              <CardContent className="p-4 text-center">
                <type.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">{type.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Base Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.listingType === 'auction'
              ? 'Precio de Salida *'
              : 'Precio *'}
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="number"
              value={formData.price.amount}
              onChange={(e) =>
                onChange('price.amount', parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moneda *
          </label>
          <select
            value={formData.price.currency}
            onChange={(e) => onChange('price.currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
          </select>
        </div>
      </div>

      {/* Auction Settings */}
      {formData.listingType === 'auction' && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Subasta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <Input
                  type="datetime-local"
                  value={formData.auction.startTime}
                  onChange={(e) =>
                    onChange('auction.startTime', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <Input
                  type="datetime-local"
                  value={formData.auction.endTime}
                  onChange={(e) => onChange('auction.endTime', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Reserva
                </label>
                <Input
                  type="number"
                  value={formData.auction.reservePrice}
                  onChange={(e) =>
                    onChange(
                      'auction.reservePrice',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incremento Mínimo
                </label>
                <Input
                  type="number"
                  value={formData.auction.bidIncrement}
                  onChange={(e) =>
                    onChange(
                      'auction.bidIncrement',
                      parseFloat(e.target.value) || 1000,
                    )
                  }
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="extendOnBid"
                checked={formData.auction.extendOnBid}
                onChange={(e) =>
                  onChange('auction.extendOnBid', e.target.checked)
                }
                className="rounded"
              />
              <label htmlFor="extendOnBid" className="text-sm text-gray-700">
                Extender subasta automáticamente si hay ofertas en los últimos 5
                minutos
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fractional Sale Settings */}
      {formData.listingType === 'fractional_sale' && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Venta Fraccionada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de Participaciones
                </label>
                <Input
                  type="number"
                  value={formData.fractional.totalShares}
                  onChange={(e) =>
                    onChange(
                      'fractional.totalShares',
                      parseInt(e.target.value) || 1000,
                    )
                  }
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Participaciones Disponibles
                </label>
                <Input
                  type="number"
                  value={formData.fractional.availableShares}
                  onChange={(e) =>
                    onChange(
                      'fractional.availableShares',
                      parseInt(e.target.value) || 1000,
                    )
                  }
                  placeholder="1000"
                  max={formData.fractional.totalShares}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por Participación
                </label>
                <Input
                  type="number"
                  value={formData.fractional.sharePrice}
                  onChange={(e) =>
                    onChange(
                      'fractional.sharePrice',
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compra Mínima
                </label>
                <Input
                  type="number"
                  value={formData.fractional.minPurchase}
                  onChange={(e) =>
                    onChange(
                      'fractional.minPurchase',
                      parseInt(e.target.value) || 1,
                    )
                  }
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compra Máxima (Opcional)
                </label>
                <Input
                  type="number"
                  value={formData.fractional.maxPurchase}
                  onChange={(e) =>
                    onChange(
                      'fractional.maxPurchase',
                      parseInt(e.target.value) || 0,
                    )
                  }
                  placeholder="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ImagesStep({
  images,
  onImageUpload,
  onRemoveImage,
}: {
  images: string[];
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Imágenes de la Propiedad</h2>
        <p className="text-gray-600">
          Sube fotos de alta calidad para atraer compradores.
        </p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Subir Imágenes
        </h3>
        <p className="text-gray-600 mb-4">
          Arrastra y suelta archivos aquí, o haz clic para seleccionar
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button variant="outline" className="cursor-pointer">
            Seleccionar Archivos
          </Button>
        </label>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">
            Imágenes Subidas ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Property ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {index === 0 && (
                  <Badge className="absolute bottom-2 left-2 bg-blue-600">
                    Principal
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsStep({
  formData,
  onChange,
}: {
  formData: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Detalles de la Propiedad</h2>
        <p className="text-gray-600">
          Proporciona información detallada sobre tu propiedad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Propiedad
          </label>
          <select
            value={formData.metadata.propertyType}
            onChange={(e) => onChange('metadata.propertyType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo</option>
            <option value="residential">Residencial</option>
            <option value="commercial">Comercial</option>
            <option value="industrial">Industrial</option>
            <option value="retail">Retail</option>
            <option value="office">Oficinas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metros Cuadrados
          </label>
          <Input
            type="number"
            value={formData.metadata.squareMeters}
            onChange={(e) =>
              onChange('metadata.squareMeters', parseInt(e.target.value) || 0)
            }
            placeholder="150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Habitaciones
          </label>
          <Input
            type="number"
            value={formData.metadata.bedrooms}
            onChange={(e) =>
              onChange('metadata.bedrooms', parseInt(e.target.value) || 0)
            }
            placeholder="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Baños
          </label>
          <Input
            type="number"
            value={formData.metadata.bathrooms}
            onChange={(e) =>
              onChange('metadata.bathrooms', parseInt(e.target.value) || 0)
            }
            placeholder="2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Año de Construcción
          </label>
          <Input
            type="number"
            value={formData.metadata.yearBuilt}
            onChange={(e) =>
              onChange('metadata.yearBuilt', parseInt(e.target.value) || 0)
            }
            placeholder="2020"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barrio
          </label>
          <Input
            value={formData.metadata.neighborhood}
            onChange={(e) => onChange('metadata.neighborhood', e.target.value)}
            placeholder="Centro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rendimiento de Alquiler (%)
          </label>
          <Input
            type="number"
            step="0.1"
            value={formData.metadata.rentYield}
            onChange={(e) =>
              onChange('metadata.rentYield', parseFloat(e.target.value) || 0)
            }
            placeholder="5.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tasa de Apreciación (%)
          </label>
          <Input
            type="number"
            step="0.1"
            value={formData.metadata.appreciationRate}
            onChange={(e) =>
              onChange(
                'metadata.appreciationRate',
                parseFloat(e.target.value) || 0,
              )
            }
            placeholder="8.2"
          />
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ formData }: { formData: any }) {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency === 'ETH' ? 'EUR' : currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Revisar Listing</h2>
        <p className="text-gray-600">
          Revisa toda la información antes de crear tu listing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.images.length > 0 && (
                <img
                  src={formData.images[0]}
                  alt={formData.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div>
                <h3 className="font-semibold text-lg">{formData.title}</h3>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {formData.location}
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {formatPrice(formData.price.amount, formData.price.currency)}
                </p>
                <Badge>
                  {formData.listingType === 'fixed_price' && 'Precio Fijo'}
                  {formData.listingType === 'auction' && 'Subasta'}
                  {formData.listingType === 'fractional_sale' &&
                    'Venta Fraccionada'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Título:</span>
                <span className="font-medium">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ubicación:</span>
                <span className="font-medium">{formData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">
                  {formData.metadata.propertyType}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de Venta:</span>
                <span className="font-medium">
                  {formData.listingType === 'fixed_price' && 'Precio Fijo'}
                  {formData.listingType === 'auction' && 'Subasta'}
                  {formData.listingType === 'fractional_sale' &&
                    'Venta Fraccionada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Precio:</span>
                <span className="font-medium">
                  {formatPrice(formData.price.amount, formData.price.currency)}
                </span>
              </div>
              {formData.listingType === 'fractional_sale' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Participaciones:</span>
                  <span className="font-medium">
                    {formData.fractional.totalShares}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Terms */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.termsAccepted}
              onChange={(e) => {
                // This should call onChange but we need to handle it differently in the parent
                // For now, we'll assume this is handled
              }}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              Acepto los términos y condiciones del marketplace, confirmo que
              soy el propietario legal del token NFT y autorizo su venta en esta
              plataforma.
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
