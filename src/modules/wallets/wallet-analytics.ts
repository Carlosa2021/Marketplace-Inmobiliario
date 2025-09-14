// src/modules/wallets/wallet-analytics.ts
import { WalletAnalytics, WalletUser } from './types';

export class WalletAnalyticsService {
  private static instance: WalletAnalyticsService;
  private analytics: Map<string, WalletAnalytics> = new Map();

  static getInstance(): WalletAnalyticsService {
    if (!this.instance) {
      this.instance = new WalletAnalyticsService();
    }
    return this.instance;
  }

  async trackTransaction(
    userId: string,
    chainId: number,
    gasUsed: string,
    value: string,
  ): Promise<void> {
    try {
      const current = this.analytics.get(userId) || {
        userId,
        totalTransactions: 0,
        totalVolume: '0',
        averageGasUsed: '0',
        chainUsage: {},
        lastActivity: new Date().toISOString(),
      };

      // Update analytics
      current.totalTransactions += 1;
      current.totalVolume = (
        BigInt(current.totalVolume) + BigInt(value)
      ).toString();
      current.chainUsage[chainId] = (current.chainUsage[chainId] || 0) + 1;
      current.lastActivity = new Date().toISOString();

      // Calculate average gas
      const totalGas =
        BigInt(current.averageGasUsed) * BigInt(current.totalTransactions - 1) +
        BigInt(gasUsed);
      current.averageGasUsed = (
        totalGas / BigInt(current.totalTransactions)
      ).toString();

      this.analytics.set(userId, current);

      // Persist to backend
      await this.saveAnalytics(userId, current);
    } catch (error) {
      console.error('Error tracking transaction:', error);
    }
  }

  async getUserAnalytics(userId: string): Promise<WalletAnalytics | null> {
    try {
      // Check cache first
      if (this.analytics.has(userId)) {
        return this.analytics.get(userId)!;
      }

      // Load from backend
      const response = await fetch(`/api/analytics/wallet/${userId}`);
      if (response.ok) {
        const analytics = await response.json();
        this.analytics.set(userId, analytics);
        return analytics;
      }

      return null;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  async getTopUsers(limit: number = 10): Promise<WalletAnalytics[]> {
    try {
      const response = await fetch(`/api/analytics/wallet/top?limit=${limit}`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error getting top users:', error);
      return [];
    }
  }

  async getChainDistribution(): Promise<Record<number, number>> {
    try {
      const response = await fetch('/api/analytics/wallet/chains');
      if (response.ok) {
        return await response.json();
      }
      return {};
    } catch (error) {
      console.error('Error getting chain distribution:', error);
      return {};
    }
  }

  private async saveAnalytics(
    userId: string,
    analytics: WalletAnalytics,
  ): Promise<void> {
    try {
      await fetch(`/api/analytics/wallet/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analytics),
      });
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  // Gas optimization insights
  async getGasOptimizationSuggestions(userId: string): Promise<string[]> {
    const analytics = await this.getUserAnalytics(userId);
    if (!analytics) return [];

    const suggestions: string[] = [];

    // High gas usage
    if (BigInt(analytics.averageGasUsed) > BigInt('500000')) {
      suggestions.push('Consider batching transactions to reduce gas costs');
      suggestions.push('Enable gasless transactions for better UX');
    }

    // Chain optimization
    const mostUsedChain = Object.entries(analytics.chainUsage).sort(
      ([, a], [, b]) => b - a,
    )[0];

    if (
      mostUsedChain &&
      analytics.chainUsage[Number(mostUsedChain[0])] >
        analytics.totalTransactions * 0.8
    ) {
      if (Number(mostUsedChain[0]) === 1) {
        // Ethereum
        suggestions.push(
          'Consider using L2 chains like Polygon or Arbitrum for lower fees',
        );
      }
    }

    return suggestions;
  }

  // User behavior insights
  async getUserBehaviorInsights(userId: string): Promise<{
    frequency: 'high' | 'medium' | 'low';
    preferredChains: number[];
    averageTransactionValue: string;
    gasEfficiency: 'excellent' | 'good' | 'needs-improvement';
  }> {
    const analytics = await this.getUserAnalytics(userId);
    if (!analytics) {
      return {
        frequency: 'low',
        preferredChains: [],
        averageTransactionValue: '0',
        gasEfficiency: 'needs-improvement',
      };
    }

    // Calculate frequency (transactions per day since last activity)
    const daysSinceLastActivity = Math.max(
      1,
      (Date.now() - new Date(analytics.lastActivity).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const transactionsPerDay =
      analytics.totalTransactions / daysSinceLastActivity;

    const frequency =
      transactionsPerDay > 5
        ? 'high'
        : transactionsPerDay > 1
        ? 'medium'
        : 'low';

    // Preferred chains (sorted by usage)
    const preferredChains = Object.entries(analytics.chainUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([chainId]) => Number(chainId));

    // Average transaction value
    const averageTransactionValue =
      analytics.totalTransactions > 0
        ? (
            BigInt(analytics.totalVolume) / BigInt(analytics.totalTransactions)
          ).toString()
        : '0';

    // Gas efficiency
    const avgGas = BigInt(analytics.averageGasUsed);
    const gasEfficiency =
      avgGas < BigInt('200000')
        ? 'excellent'
        : avgGas < BigInt('500000')
        ? 'good'
        : 'needs-improvement';

    return {
      frequency,
      preferredChains,
      averageTransactionValue,
      gasEfficiency,
    };
  }
}
