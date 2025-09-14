// src/components/tokenization/PropertyRegistrationForm.tsx
'use client';

import React, { useState } from 'react';
import { useTokenization } from '@/modules/tokenization/tokenization-provider';
import { PropertyMetadata } from '@/modules/tokenization/types';

export function PropertyRegistrationForm() {
  const { registerProperty, isLoading } = useTokenization();

  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    description: '',

    // Location
    address: '',
    city: '',
    state: '',
    country: '',

    // Specifications
    type: 'residential' as const,
    buildingArea: 0,
    lotArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: 0,
    condition: 'good' as const,

    // Valuation
    currentValue: 0,
    currency: 'USD',

    // Tokenization
    tokenType: 'ERC721' as const,
    supply: 1,
    fractional: false,
    votingRights: false,
    dividendRights: false,
  });

  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create property metadata
      const propertyMetadata: PropertyMetadata = {
        id: `prop_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
        images: [], // Would upload images to IPFS
        documents: [], // Would upload documents to IPFS
        valuation: {
          currentValue: formData.currentValue,
          currency: formData.currency,
          lastAppraisal: new Date().toISOString(),
          valuationMethod: 'comparative',
        },
        specifications: {
          type: formData.type,
          buildingArea: formData.buildingArea,
          lotArea: formData.lotArea,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          yearBuilt: formData.yearBuilt,
          condition: formData.condition,
          amenities: [],
          utilities: [],
        },
        legal: {
          propertyId: `prop_${Date.now()}`,
          registry: '',
          zoning: '',
          taxes: {
            annual: 0,
            currency: formData.currency,
            lastPaid: new Date().toISOString(),
          },
          liens: [],
          restrictions: [],
          permits: [],
        },
        tokenization: {
          tokenType: formData.tokenType,
          supply: formData.supply,
          minInvestment: formData.currentValue / formData.supply,
          currency: formData.currency,
          fractional: formData.fractional,
          transferable: true,
          votingRights: formData.votingRights,
          dividendRights: formData.dividendRights,
          liquidityOptions: [],
        },
      };

      const propertyId = await registerProperty(propertyMetadata);

      alert(`Property registered successfully! ID: ${propertyId}`);

      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: '',
        type: 'residential',
        buildingArea: 0,
        lotArea: 0,
        bedrooms: 0,
        bathrooms: 0,
        yearBuilt: 0,
        condition: 'good',
        currentValue: 0,
        currency: 'USD',
        tokenType: 'ERC721',
        supply: 1,
        fractional: false,
        votingRights: false,
        dividendRights: false,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register property');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Register New Property
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Property Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                placeholder="Luxury Downtown Apartment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Property Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="land">Land</option>
                <option value="mixed">Mixed Use</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              placeholder="Detailed description of the property..."
            />
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                placeholder="New York"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                placeholder="NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                placeholder="United States"
              />
            </div>
          </div>
        </section>

        {/* Property Specifications */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Property Specifications
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Building Area (sqft)
              </label>
              <input
                type="number"
                name="buildingArea"
                value={formData.buildingArea}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Lot Area (sqft)
              </label>
              <input
                type="number"
                name="lotArea"
                value={formData.lotArea}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>
        </section>

        {/* Valuation */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Valuation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Value
              </label>
              <input
                type="number"
                name="currentValue"
                value={formData.currentValue}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
                placeholder="500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ETH">ETH</option>
                <option value="MATIC">MATIC</option>
              </select>
            </div>
          </div>
        </section>

        {/* Tokenization Settings */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Tokenization Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Token Type
              </label>
              <select
                name="tokenType"
                value={formData.tokenType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="ERC721">ERC-721 (Unique Ownership)</option>
                <option value="ERC1155">ERC-1155 (Fractional Ownership)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Token Supply
              </label>
              <input
                type="number"
                name="supply"
                value={formData.supply}
                onChange={handleInputChange}
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="fractional"
                checked={formData.fractional}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">
                Enable Fractional Ownership
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="votingRights"
                checked={formData.votingRights}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">Enable Voting Rights</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="dividendRights"
                checked={formData.dividendRights}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">
                Enable Dividend Distribution
              </span>
            </label>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Registering...' : 'Register Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
