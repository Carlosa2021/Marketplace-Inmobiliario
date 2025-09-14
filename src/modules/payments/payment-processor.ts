// src/modules/payments/payment-processor.ts
import {
  PaymentRequest,
  PaymentSession,
  PaymentMethod,
  CryptoPaymentMethod,
  FiatPaymentMethod,
  PaymentStatus,
  ConversionRate,
  AutomaticConversion,
  CreatePaymentResponse,
} from './types';

export class PaymentProcessor {
  private config: any;
  private conversionRates: Map<string, ConversionRate> = new Map();

  constructor(config: any) {
    this.config = config;
    this.startRateUpdater();
  }

  /**
   * Create a unified payment request that supports both crypto and fiat
   */
  async createPaymentRequest(
    propertyId: string,
    investorAddress: string,
    amount: number,
    currency: string,
    paymentMethod: PaymentMethod,
  ): Promise<CreatePaymentResponse> {
    try {
      const paymentRequest: PaymentRequest = {
        id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        propertyId,
        investorAddress,
        amount,
        currency,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + this.config.paymentExpiration * 60 * 1000,
        ).toISOString(),
        metadata: {
          fees: this.calculateFees(amount, paymentMethod),
          receipts: [],
        },
      };

      // Handle different payment types
      let session: PaymentSession;

      if (paymentMethod.type === 'crypto') {
        session = await this.createCryptoPayment(
          paymentRequest,
          paymentMethod as CryptoPaymentMethod,
        );
      } else {
        session = await this.createFiatPayment(
          paymentRequest,
          paymentMethod as FiatPaymentMethod,
        );
      }

      // Store payment request
      await this.storePaymentRequest(paymentRequest);
      await this.storePaymentSession(session);

      return {
        success: true,
        paymentRequest,
        session,
      };
    } catch (error) {
      console.error('Payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create crypto payment using Thirdweb
   */
  private async createCryptoPayment(
    request: PaymentRequest,
    method: CryptoPaymentMethod,
  ): Promise<PaymentSession> {
    // If gasless is enabled, use Account Abstraction
    if (method.gasless) {
      return this.createGaslessPayment(request, method);
    }

    // Direct token transfer
    const session: PaymentSession = {
      id: `session_${Date.now()}`,
      paymentRequestId: request.id,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/crypto/${request.id}`,
      expiresAt: request.expiresAt,
      status: 'pending',
    };

    return session;
  }

  /**
   * Create gasless crypto payment
   */
  private async createGaslessPayment(
    request: PaymentRequest,
    method: CryptoPaymentMethod,
  ): Promise<PaymentSession> {
    try {
      // Use Thirdweb's gasless infrastructure
      const session: PaymentSession = {
        id: `gasless_${Date.now()}`,
        paymentRequestId: request.id,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/gasless/${request.id}`,
        expiresAt: request.expiresAt,
        status: 'pending',
        webhookData: {
          gasless: true,
          smartWallet: true,
          tokenAddress: method.tokenAddress,
          chainId: method.chainId,
        },
      };

      return session;
    } catch (error) {
      console.error('Gasless payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Create fiat payment using existing infrastructure
   */
  private async createFiatPayment(
    request: PaymentRequest,
    method: FiatPaymentMethod,
  ): Promise<PaymentSession> {
    try {
      // Use your existing Thirdweb fiat payment API
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: request.propertyId,
          buyerWallet: request.investorAddress,
          amountFiat: request.amount,
          currencyFiat: request.currency,
        }),
      });

      const data = await response.json();

      if (!data.checkoutUrl) {
        throw new Error('Failed to create checkout URL');
      }

      const session: PaymentSession = {
        id: `fiat_${Date.now()}`,
        paymentRequestId: request.id,
        checkoutUrl: data.checkoutUrl,
        redirectUrl: data.checkoutUrl,
        expiresAt: request.expiresAt,
        status: 'pending',
        webhookData: {
          processor: method.processor,
          currency: method.currency,
        },
      };

      return session;
    } catch (error) {
      console.error('Fiat payment creation failed:', error);
      throw error;
    }
  }

  /**
   * Process automatic currency conversion
   */
  async convertCurrency(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
    userAddress: string,
  ): Promise<AutomaticConversion> {
    try {
      const rate = await this.getConversionRate(fromCurrency, toCurrency);

      if (!rate) {
        throw new Error(
          `No conversion rate available for ${fromCurrency} to ${toCurrency}`,
        );
      }

      const conversion: AutomaticConversion = {
        id: `conv_${Date.now()}`,
        fromCurrency,
        toCurrency,
        amount,
        rate,
        slippage: this.config.conversionSlippage,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Execute conversion based on currency types
      if (this.isCrypto(fromCurrency) && this.isCrypto(toCurrency)) {
        // Crypto to crypto swap
        await this.executeCryptoSwap(conversion, userAddress);
      } else if (!this.isCrypto(fromCurrency) && this.isCrypto(toCurrency)) {
        // Fiat to crypto (buy crypto with fiat)
        await this.executeFiatToCrypto(conversion, userAddress);
      } else if (this.isCrypto(fromCurrency) && !this.isCrypto(toCurrency)) {
        // Crypto to fiat (sell crypto for fiat)
        await this.executeCryptoToFiat(conversion, userAddress);
      } else {
        // Fiat to fiat (traditional currency exchange)
        await this.executeFiatToFiat(conversion, userAddress);
      }

      await this.storeConversion(conversion);
      return conversion;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      throw error;
    }
  }

  /**
   * Execute crypto to crypto swap using DEX
   */
  private async executeCryptoSwap(
    conversion: AutomaticConversion,
    userAddress: string,
  ): Promise<void> {
    try {
      // Use Thirdweb's swap functionality or integrate with Uniswap
      const swapResult = await this.executeSwap(
        conversion.fromCurrency,
        conversion.toCurrency,
        conversion.amount,
        userAddress,
      );

      conversion.status = 'completed';
      conversion.txHash = swapResult.txHash;
      conversion.completedAt = new Date().toISOString();
    } catch (error) {
      conversion.status = 'failed';
      throw error;
    }
  }

  /**
   * Execute fiat to crypto purchase
   */
  private async executeFiatToCrypto(
    conversion: AutomaticConversion,
    userAddress: string,
  ): Promise<void> {
    try {
      // Use Thirdweb's fiat onramp
      const onrampResult = await this.executeFiatOnramp(
        conversion.fromCurrency,
        conversion.toCurrency,
        conversion.amount,
        userAddress,
      );

      conversion.status = 'completed';
      conversion.txHash = onrampResult.txHash;
      conversion.completedAt = new Date().toISOString();
    } catch (error) {
      conversion.status = 'failed';
      throw error;
    }
  }

  /**
   * Get current conversion rates
   */
  async getConversionRate(
    from: string,
    to: string,
  ): Promise<ConversionRate | null> {
    const key = `${from}_${to}`;

    // Check cache first
    const cached = this.conversionRates.get(key);
    if (cached && new Date(cached.validUntil) > new Date()) {
      return cached;
    }

    // Fetch new rate
    try {
      let rate: number;
      let provider: string;

      if (this.isCrypto(from) || this.isCrypto(to)) {
        // Use crypto price API (CoinGecko, etc.)
        const cryptoRate = await this.fetchCryptoRate(from, to);
        rate = cryptoRate.rate;
        provider = cryptoRate.provider;
      } else {
        // Use fiat exchange rate API
        const fiatRate = await this.fetchFiatRate(from, to);
        rate = fiatRate.rate;
        provider = fiatRate.provider;
      }

      const conversionRate: ConversionRate = {
        from,
        to,
        rate,
        provider,
        timestamp: new Date().toISOString(),
        validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      };

      this.conversionRates.set(key, conversionRate);
      return conversionRate;
    } catch (error) {
      console.error('Failed to fetch conversion rate:', error);
      return null;
    }
  }

  /**
   * Calculate payment fees
   */
  private calculateFees(amount: number, method: PaymentMethod) {
    const platformFee = (amount * this.config.platformFeePercentage) / 100;
    const processingFee = method.fees.processing || 0;
    const gasFee = method.fees.gas || 0;

    return {
      platform: platformFee,
      processing: processingFee,
      gas: gasFee,
      total: platformFee + processingFee + gasFee,
    };
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    metadata?: any,
  ): Promise<boolean> {
    try {
      await fetch(`/api/payments/${paymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, metadata }),
      });

      return true;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      return false;
    }
  }

  /**
   * Generate payment receipt
   */
  async generateReceipt(paymentId: string): Promise<string> {
    try {
      const response = await fetch(`/api/payments/${paymentId}/receipt`, {
        method: 'POST',
      });

      const data = await response.json();
      return data.receiptUrl;
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      throw error;
    }
  }

  // Private helper methods

  private async storePaymentRequest(request: PaymentRequest): Promise<void> {
    await fetch('/api/payments/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  private async storePaymentSession(session: PaymentSession): Promise<void> {
    await fetch('/api/payments/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
  }

  private async storeConversion(
    conversion: AutomaticConversion,
  ): Promise<void> {
    await fetch('/api/payments/conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversion),
    });
  }

  private isCrypto(currency: string): boolean {
    const cryptoCurrencies = ['ETH', 'BTC', 'USDC', 'USDT', 'MATIC', 'DAI'];
    return cryptoCurrencies.includes(currency.toUpperCase());
  }

  private async executeSwap(
    from: string,
    to: string,
    amount: number,
    userAddress: string,
  ): Promise<{ txHash: string }> {
    // Implement DEX swap logic
    return { txHash: '0x...' };
  }

  private async executeFiatOnramp(
    from: string,
    to: string,
    amount: number,
    userAddress: string,
  ): Promise<{ txHash: string }> {
    // Implement fiat onramp logic
    return { txHash: '0x...' };
  }

  private async fetchCryptoRate(
    from: string,
    to: string,
  ): Promise<{ rate: number; provider: string }> {
    // Implement crypto rate fetching
    return { rate: 1, provider: 'coingecko' };
  }

  private async fetchFiatRate(
    from: string,
    to: string,
  ): Promise<{ rate: number; provider: string }> {
    // Implement fiat rate fetching
    return { rate: 1, provider: 'exchangerate-api' };
  }

  private async executeCryptoToFiat(
    conversion: any,
    userAddress: string,
  ): Promise<void> {
    // TODO: Implement crypto to fiat conversion
    console.log(
      'Executing crypto to fiat conversion:',
      conversion,
      userAddress,
    );
  }

  private async executeFiatToFiat(
    conversion: any,
    userAddress: string,
  ): Promise<void> {
    // TODO: Implement fiat to fiat conversion
    console.log('Executing fiat to fiat conversion:', conversion, userAddress);
  }

  private startRateUpdater(): void {
    // Update conversion rates every 5 minutes
    setInterval(() => {
      this.conversionRates.clear();
    }, 5 * 60 * 1000);
  }
}
