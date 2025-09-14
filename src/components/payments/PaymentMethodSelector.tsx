// src/components/payments/PaymentMethodSelector.tsx
'use client';

import React, { useState } from 'react';
import { usePaymentMethods } from '@/modules/payments/payment-provider';
import {
  PaymentMethod,
  CryptoPaymentMethod,
  FiatPaymentMethod,
} from '@/modules/payments/types';

interface PaymentMethodSelectorProps {
  amount: number;
  currency: string;
  onMethodSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
}

export function PaymentMethodSelector({
  amount,
  currency,
  onMethodSelect,
  selectedMethod,
}: PaymentMethodSelectorProps) {
  const { methods } = usePaymentMethods();
  const [selectedTab, setSelectedTab] = useState<'crypto' | 'fiat'>('fiat');

  const renderCryptoMethod = (method: CryptoPaymentMethod) => {
    const isSelected = selectedMethod?.id === method.id;
    const estimatedFees = (amount * method.fees.platform) / 100;

    return (
      <div
        key={method.id}
        onClick={() => onMethodSelect(method)}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {method.icon && (
              <img src={method.icon} alt={method.symbol} className="w-8 h-8" />
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {method.name}
              </h3>
              <p className="text-sm text-gray-500">
                {method.symbol} • Chain: {method.chainId}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              ${amount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Fee: ${estimatedFees.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {method.gasless && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                ⚡ Gasless
              </span>
            )}
            <span className="text-gray-500">{method.processingTime}</span>
          </div>

          <span
            className={`px-2 py-1 rounded-full ${
              method.enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {method.enabled ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
    );
  };

  const renderFiatMethod = (method: FiatPaymentMethod) => {
    const isSelected = selectedMethod?.id === method.id;
    const estimatedFees =
      (amount * method.fees.platform) / 100 + (method.fees.processing || 0);

    return (
      <div
        key={method.id}
        onClick={() => onMethodSelect(method)}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {method.icon && (
              <img src={method.icon} alt={method.symbol} className="w-8 h-8" />
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {method.name}
              </h3>
              <p className="text-sm text-gray-500">
                {method.currency} • via {method.processor}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {method.currency} {amount.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              Fee: {method.currency} {estimatedFees.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-gray-500">{method.processingTime}</span>

          <span
            className={`px-2 py-1 rounded-full ${
              method.enabled
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {method.enabled ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Supported: {method.countrySupport.slice(0, 3).join(', ')}
          {method.countrySupport.length > 3 &&
            ` +${method.countrySupport.length - 3} more`}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Select Payment Method
      </h2>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Choose how you'd like to pay for your investment of {currency}{' '}
        {amount.toFixed(2)}
      </p>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setSelectedTab('fiat')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'fiat'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Fiat Currency
        </button>
        <button
          onClick={() => setSelectedTab('crypto')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            selectedTab === 'crypto'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Cryptocurrency
        </button>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        {selectedTab === 'fiat' && (
          <>
            {methods.fiat.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No fiat payment methods available</p>
                <p className="text-sm">
                  Please contact support if you need assistance
                </p>
              </div>
            ) : (
              methods.fiat.map(renderFiatMethod)
            )}
          </>
        )}

        {selectedTab === 'crypto' && (
          <>
            {methods.crypto.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No crypto payment methods available</p>
                <p className="text-sm">
                  Please connect your wallet to see available options
                </p>
              </div>
            ) : (
              methods.crypto.map(renderCryptoMethod)
            )}
          </>
        )}
      </div>

      {/* Payment Summary */}
      {selectedMethod && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Payment Summary
          </h3>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Amount:</span>
              <span className="text-gray-900 dark:text-white">
                {currency} {amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                Platform Fee ({selectedMethod.fees.platform}%):
              </span>
              <span className="text-gray-900 dark:text-white">
                {currency}{' '}
                {((amount * selectedMethod.fees.platform) / 100).toFixed(2)}
              </span>
            </div>

            {selectedMethod.fees.processing && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Processing Fee:
                </span>
                <span className="text-gray-900 dark:text-white">
                  {currency} {selectedMethod.fees.processing.toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-600 pt-1 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">
                  {currency} {(amount + selectedMethod.fees.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            <p>Method: {selectedMethod.name}</p>
            <p>Processing Time: {selectedMethod.processingTime}</p>
          </div>
        </div>
      )}
    </div>
  );
}
