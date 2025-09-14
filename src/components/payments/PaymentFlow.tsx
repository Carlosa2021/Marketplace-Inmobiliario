// src/components/payments/PaymentFlow.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  usePayments,
  useConversion,
} from '@/modules/payments/payment-provider';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PaymentMethod } from '@/modules/payments/types';

interface PaymentFlowProps {
  propertyId: string;
  propertyName: string;
  shareAmount: number;
  pricePerShare: number;
  currency: string;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

export function PaymentFlow({
  propertyId,
  propertyName,
  shareAmount,
  pricePerShare,
  currency,
  onSuccess,
  onCancel,
}: PaymentFlowProps) {
  const { createPayment, isLoading, error, clearError } = usePayments();
  const { getQuote, convert } = useConversion();

  const [currentStep, setCurrentStep] = useState<
    'method' | 'conversion' | 'payment' | 'confirmation'
  >('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [conversionQuote, setConversionQuote] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const totalAmount = shareAmount * pricePerShare;

  // Handle payment method selection
  const handleMethodSelect = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    clearError();

    // Check if currency conversion is needed
    if (method.type === 'crypto' && currency !== method.symbol) {
      const quote = await getQuote(currency, method.symbol, totalAmount);
      if (quote) {
        setConversionQuote(quote);
        setCurrentStep('conversion');
      } else {
        setCurrentStep('payment');
      }
    } else if (
      method.type === 'fiat' &&
      currency !== (method as any).currency
    ) {
      const quote = await getQuote(
        currency,
        (method as any).currency,
        totalAmount,
      );
      if (quote) {
        setConversionQuote(quote);
        setCurrentStep('conversion');
      } else {
        setCurrentStep('payment');
      }
    } else {
      setCurrentStep('payment');
    }
  };

  // Handle currency conversion
  const handleConversion = async () => {
    if (!selectedMethod || !conversionQuote) return;

    try {
      const success = await convert(
        currency,
        selectedMethod.type === 'crypto'
          ? selectedMethod.symbol
          : (selectedMethod as any).currency,
        totalAmount,
      );

      if (success) {
        setCurrentStep('payment');
      }
    } catch (err) {
      console.error('Conversion failed:', err);
    }
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedMethod) return;

    try {
      const payment = await createPayment(
        propertyId,
        conversionQuote?.toAmount || totalAmount,
        selectedMethod.type === 'crypto'
          ? selectedMethod.symbol
          : (selectedMethod as any).currency,
        selectedMethod,
      );

      setPaymentId(payment.id);
      setCurrentStep('confirmation');

      if (onSuccess) {
        onSuccess(payment.id);
      }
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Investment Summary
        </h3>
        <div className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
          <p>
            <strong>Property:</strong> {propertyName}
          </p>
          <p>
            <strong>Shares:</strong> {shareAmount.toLocaleString()}
          </p>
          <p>
            <strong>Price per Share:</strong> {currency}{' '}
            {pricePerShare.toFixed(2)}
          </p>
          <p>
            <strong>Total Investment:</strong> {currency}{' '}
            {totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <PaymentMethodSelector
        amount={totalAmount}
        currency={currency}
        onMethodSelect={handleMethodSelect}
        selectedMethod={selectedMethod || undefined}
      />

      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => selectedMethod && setCurrentStep('payment')}
          disabled={!selectedMethod}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedMethod
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderConversion = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Currency Conversion Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          We need to convert your {currency} to {selectedMethod?.symbol} for
          this payment
        </p>
      </div>

      {conversionQuote && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">You pay:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {currency} {conversionQuote.fromAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              You receive:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedMethod?.symbol} {conversionQuote.toAmount.toFixed(6)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              Exchange rate:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              1 {currency} = {conversionQuote.rate.toFixed(6)}{' '}
              {selectedMethod?.symbol}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">
              Conversion fee:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {currency} {conversionQuote.fees.total.toFixed(2)}
            </span>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Rate valid until:{' '}
            {new Date(conversionQuote.validUntil).toLocaleTimeString()}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => setCurrentStep('method')}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleConversion}
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Converting...' : 'Convert & Continue'}
        </button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Complete Your Payment
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Click the button below to proceed with your {selectedMethod?.name}{' '}
          payment
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Payment Method:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedMethod?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Amount:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedMethod?.symbol}{' '}
              {(conversionQuote?.toAmount || totalAmount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Processing Time:
            </span>
            <span className="text-gray-900 dark:text-white">
              {selectedMethod?.processingTime}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="text-red-700 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() =>
            setCurrentStep(conversionQuote ? 'conversion' : 'method')
          }
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={processPayment}
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isLoading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Payment Initiated Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Your payment is being processed. You'll receive a confirmation once
          it's complete.
        </p>
      </div>

      {paymentId && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Payment ID:
          </p>
          <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
            {paymentId}
          </p>
        </div>
      )}

      <button
        onClick={() => {
          setCurrentStep('method');
          setSelectedMethod(null);
          setConversionQuote(null);
          setPaymentId(null);
          clearError();
        }}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Make Another Payment
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[
            { key: 'method', label: 'Method' },
            { key: 'conversion', label: 'Conversion' },
            { key: 'payment', label: 'Payment' },
            { key: 'confirmation', label: 'Complete' },
          ].map((step, index) => (
            <React.Fragment key={step.key}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step.key
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : index <
                      [
                        'method',
                        'conversion',
                        'payment',
                        'confirmation',
                      ].indexOf(currentStep)
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                {index <
                ['method', 'conversion', 'payment', 'confirmation'].indexOf(
                  currentStep,
                ) ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < 3 && (
                <div
                  className={`h-0.5 w-12 ${
                    index <
                    ['method', 'conversion', 'payment', 'confirmation'].indexOf(
                      currentStep,
                    )
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-center mt-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Step{' '}
            {['method', 'conversion', 'payment', 'confirmation'].indexOf(
              currentStep,
            ) + 1}{' '}
            of 4
          </span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'method' && renderMethodSelection()}
      {currentStep === 'conversion' && renderConversion()}
      {currentStep === 'payment' && renderPayment()}
      {currentStep === 'confirmation' && renderConfirmation()}
    </div>
  );
}
