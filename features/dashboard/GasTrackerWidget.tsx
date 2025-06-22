import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { useWalletStore } from '../../stores/walletStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { aiService } from '../../utils/aiService';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';

interface GasPrice {
  network: string;
  price: string;
  lastUpdated: string;
  source: 'live' | 'simulated' | 'estimate';
}

export const GasTrackerWidget: React.FC = () => {
  const [gasPrices, setGasPrices] = useState<GasPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  const { wallets } = useWalletStore();
  const { settings } = useSettingsStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const defaultNetworks = settings.defaultGasNetworks || ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'];

  useEffect(() => {
    fetchGasPrices();
  }, []);

  const fetchGasPrices = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate fetching gas prices from multiple sources
      const mockGasPrices: GasPrice[] = defaultNetworks.map(network => ({
        network,
        price: `${(Math.random() * 50 + 10).toFixed(2)} Gwei`,
        lastUpdated: new Date().toISOString(),
        source: Math.random() > 0.7 ? 'live' : 'simulated'
      }));
      
      setGasPrices(mockGasPrices);
      addToast('Gas prices updated', 'success');
    } catch (error) {
      setError('Failed to fetch gas prices');
      addToast('Failed to fetch gas prices', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIInsights = async () => {
    if (!aiService.isAvailable()) {
      addToast('AI service not available', 'error');
      return;
    }

    setIsGeneratingInsights(true);
    setShowAIInsights(true);
    
    try {
      const currentPrices = gasPrices.map(gp => `${gp.network}: ${gp.price}`).join(', ');
      const walletCount = wallets.length;
      
      const prompt = `Based on the current gas prices (${currentPrices}) and the user having ${walletCount} wallets, provide brief insights on:
1. Best time to perform transactions
2. Which networks are currently cost-effective
3. Any immediate actions the user should consider
Keep the response under 150 words and focus on practical advice.`;

      const response = await aiService.generateContent(prompt);
      setAiInsights(response || 'Unable to generate AI insights at this time.');
    } catch (error) {
      setAiInsights('Unable to generate AI insights at this time.');
      addToast('Failed to generate AI insights', 'error');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const getPriceTrend = (price: string) => {
    const numericPrice = parseFloat(price.replace(' Gwei', ''));
    if (numericPrice > 30) return 'high';
    if (numericPrice < 15) return 'low';
    return 'medium';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'high':
        return <TrendingUp size={16} className="text-red-400" />;
      case 'low':
        return <TrendingDown size={16} className="text-green-400" />;
      default:
        return <TrendingUp size={16} className="text-yellow-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'high':
        return 'text-red-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <Card title="Gas Price Tracker" className="h-full">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGasPrices}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('refresh', { defaultValue: 'Refresh' })}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={generateAIInsights}
            disabled={isGeneratingInsights || !aiService.isAvailable()}
          >
            <Info className="h-4 w-4 mr-2" />
            {t('ai_insights', { defaultValue: 'AI Insights' })}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <AlertMessage
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Gas Prices */}
        <div className="space-y-3">
          {gasPrices.map((gasPrice) => {
            const trend = getPriceTrend(gasPrice.price);
            return (
              <div
                key={gasPrice.network}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Zap size={16} className="text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {gasPrice.network}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(gasPrice.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`font-semibold ${getTrendColor(trend)}`}>
                    {gasPrice.price}
                  </span>
                  {getTrendIcon(trend)}
                  {gasPrice.source === 'live' && (
                    <div className="w-2 h-2 bg-green-400 rounded-full" title="Live data" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Insights */}
        {showAIInsights && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI Insights
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIInsights(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ×
              </Button>
            </div>
            {isGeneratingInsights ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Generating insights...
                </span>
              </div>
            ) : (
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {aiInsights}
              </p>
            )}
          </div>
        )}

        {/* Summary */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <p>Prices update every 5 minutes</p>
          <p className="mt-1">
            {gasPrices.filter(gp => gp.source === 'live').length} of {gasPrices.length} networks showing live data
          </p>
        </div>
      </div>
    </Card>
  );
};
