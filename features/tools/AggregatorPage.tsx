import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { useWalletStore } from '../../stores/walletStore';
import { useYieldPositionStore } from '../../stores/yieldPositionStore';
import { AggregatorRoute, AggregatorRouteStep } from '../../types';
import { 
  ArrowRight, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertTriangle,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

export const AggregatorPage: React.FC = () => {
  const { wallets } = useWalletStore();
  const { yieldPositions } = useYieldPositionStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFromChain, setSelectedFromChain] = useState<string>('all');
  const [selectedToChain, setSelectedToChain] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cost' | 'time' | 'security'>('cost');
  const [routes, setRoutes] = useState<AggregatorRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockRoutes: AggregatorRoute[] = [
    {
      id: '1',
      providerName: '1inch',
      outputAmount: 0.095,
      outputTokenSymbol: 'ETH',
      estimatedCostUSD: 2.50,
      estimatedGasCostUSD: 1.20,
      providerFeeUSD: 0.30,
      estimatedTimeMinutes: 5,
      steps: [
        {
          type: 'Swap',
          protocol: 'Uniswap V3',
          inputTokenSymbol: 'USDC',
          inputAmount: 100,
          outputTokenSymbol: 'ETH',
          outputAmount: 0.095,
          details: 'Swap USDC for ETH on Uniswap V3',
          estimatedTimeMinutes: 3,
          iconName: 'swap'
        },
        {
          type: 'Bridge',
          protocol: 'Hop Protocol',
          fromChain: 'Ethereum',
          toChain: 'Arbitrum',
          details: 'Bridge ETH from Ethereum to Arbitrum',
          estimatedTimeMinutes: 2,
          iconName: 'bridge'
        }
      ],
      tags: ['Cheapest', 'Recommended']
    },
    {
      id: '2',
      providerName: 'ParaSwap',
      outputAmount: 0.094,
      outputTokenSymbol: 'ETH',
      estimatedCostUSD: 3.20,
      estimatedGasCostUSD: 2.10,
      providerFeeUSD: 0.50,
      estimatedTimeMinutes: 8,
      steps: [
        {
          type: 'Swap',
          protocol: 'SushiSwap',
          inputTokenSymbol: 'USDC',
          inputAmount: 100,
          outputTokenSymbol: 'ETH',
          outputAmount: 0.094,
          details: 'Swap USDC for ETH on SushiSwap',
          estimatedTimeMinutes: 5,
          iconName: 'swap'
        },
        {
          type: 'Bridge',
          protocol: 'Across Protocol',
          fromChain: 'Ethereum',
          toChain: 'Arbitrum',
          details: 'Bridge ETH from Ethereum to Arbitrum',
          estimatedTimeMinutes: 3,
          iconName: 'bridge'
        }
      ],
      tags: ['Fastest']
    },
    {
      id: '3',
      providerName: '0x Protocol',
      outputAmount: 0.093,
      outputTokenSymbol: 'ETH',
      estimatedCostUSD: 4.50,
      estimatedGasCostUSD: 3.20,
      providerFeeUSD: 0.80,
      estimatedTimeMinutes: 12,
      steps: [
        {
          type: 'Swap',
          protocol: 'Balancer',
          inputTokenSymbol: 'USDC',
          inputAmount: 100,
          outputTokenSymbol: 'ETH',
          outputAmount: 0.093,
          details: 'Swap USDC for ETH on Balancer',
          estimatedTimeMinutes: 8,
          iconName: 'swap'
        },
        {
          type: 'Bridge',
          protocol: 'Stargate',
          fromChain: 'Ethereum',
          toChain: 'Arbitrum',
          details: 'Bridge ETH from Ethereum to Arbitrum',
          estimatedTimeMinutes: 4,
          iconName: 'bridge'
        }
      ],
      tags: ['Most Secure (Conceptual)']
    }
  ];

  useEffect(() => {
    // Simulate loading routes
    setIsLoading(true);
    setTimeout(() => {
      setRoutes(mockRoutes);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.outputTokenSymbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasFromChain = selectedFromChain === 'all' || 
                        route.steps?.some(step => step.fromChain === selectedFromChain) || false;
    const hasToChain = selectedToChain === 'all' || 
                      route.steps?.some(step => step.toChain === selectedToChain) || false;
    
    return matchesSearch && hasFromChain && hasToChain;
  });

  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    switch (sortBy) {
      case 'cost':
        return a.estimatedCostUSD - b.estimatedCostUSD;
      case 'time':
        return a.estimatedTimeMinutes - b.estimatedTimeMinutes;
      case 'security':
        // Mock security score based on tags
        const aSecurity = a.tags?.includes('Most Secure (Conceptual)') ? 3 : 
                         a.tags?.includes('Recommended') ? 2 : 1;
        const bSecurity = b.tags?.includes('Most Secure (Conceptual)') ? 3 : 
                         b.tags?.includes('Recommended') ? 2 : 1;
        return bSecurity - aSecurity;
      default:
        return 0;
    }
  });

  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Polygon', 'Base', 'BSC', 'Solana', 'Avalanche'];

  const handleCopyRoute = (route: AggregatorRoute) => {
    const routeText = `${route.providerName}: ${route.outputAmount} ${route.outputTokenSymbol} for $${route.estimatedCostUSD}`;
    navigator.clipboard.writeText(routeText);
    addToast('Route copied to clipboard!', 'success');
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Cheapest': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Fastest': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Most Secure (Conceptual)': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Recommended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'Swap': return <TrendingUp size={16} />;
      case 'Bridge': return <ArrowRight size={16} />;
      case 'Gas Top-up': return <Zap size={16} />;
      default: return <ExternalLink size={16} />;
    }
  };

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRight size={24} className="text-accent" />
                Cross-Chain Aggregator
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  leftIcon={<RefreshCw size={16} />}
                >
                  Refresh
                </Button>
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Find the best routes for cross-chain swaps and bridges across multiple protocols.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={selectedFromChain}
                onChange={(e) => setSelectedFromChain(e.target.value)}
                options={[
                  { value: 'all', label: 'From Any Chain' },
                  ...chains.map(chain => ({ value: chain, label: chain }))
                ]}
              />
              
              <Select
                value={selectedToChain}
                onChange={(e) => setSelectedToChain(e.target.value)}
                options={[
                  { value: 'all', label: 'To Any Chain' },
                  ...chains.map(chain => ({ value: chain, label: chain }))
                ]}
              />
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                options={[
                  { value: 'cost', label: 'Sort by Cost' },
                  { value: 'time', label: 'Sort by Time' },
                  { value: 'security', label: 'Sort by Security' }
                ]}
              />
              
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Search size={16} />}
              >
                Find Routes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Routes List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card variant="default" padding="md">
              <CardContent>
                <div className="text-center py-8">
                  <RefreshCw size={48} className="mx-auto animate-spin text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Finding best routes...</p>
                </div>
              </CardContent>
            </Card>
          ) : sortedRoutes.length === 0 ? (
            <Card variant="default" padding="md">
              <CardContent>
                <div className="text-center py-8">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No routes found matching your criteria.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            sortedRoutes.map(route => (
              <Card key={route.id} variant="default" padding="md">
                <CardContent>
                  <div className="space-y-4">
                    {/* Route Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold">{route.providerName}</h4>
                        <div className="flex gap-1">
                          {route.tags?.map(tag => (
                            <span
                              key={tag}
                              className={`px-2 py-1 text-xs rounded-full ${getTagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyRoute(route)}
                          leftIcon={<Copy size={14} />}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<ExternalLink size={14} />}
                        >
                          Execute
                        </Button>
                      </div>
                    </div>

                    {/* Route Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {route.outputAmount} {route.outputTokenSymbol}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Output Amount</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          ${route.estimatedCostUSD}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {route.estimatedTimeMinutes}m
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Est. Time</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          ${route.providerFeeUSD}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Provider Fee</p>
                      </div>
                    </div>

                    {/* Route Steps */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">Route Steps:</h5>
                      <div className="space-y-2">
                        {route.steps?.map((step, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2">
                              {getStepIcon(step.type)}
                              <span className="text-sm font-medium">{step.type}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{step.details}</p>
                              {step.protocol && (
                                <p className="text-xs text-gray-500">via {step.protocol}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {step.estimatedTimeMinutes}m
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cost Breakdown:</h6>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Gas Cost:</span>
                          <span className="font-medium">${route.estimatedGasCostUSD}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Provider Fee:</span>
                          <span className="font-medium">${route.providerFeeUSD}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-medium">${route.estimatedCostUSD}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
