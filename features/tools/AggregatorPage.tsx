import React, { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { Input } from '../../design-system/components/Input';
import { Route as RouteIconLucide, Repeat, ArrowRightLeft, Zap, Loader2, Info, ShieldCheck, Lock, Shuffle } from 'lucide-react';
import { BLOCKCHAIN_OPTIONS } from '../../constants';
import { AggregatorRoute, AggregatorRouteStep } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { formatCurrency } from '../../utils/formatting';

const MOCK_TOKENS_PER_CHAIN: Record<string, {value: string, label: string}[]> = {
    'Ethereum': [{value: 'ETH', label: 'ETH'}, {value: 'USDC', label: 'USDC'}, {value: 'WETH', label: 'WETH'}, {value: 'ARB', label: 'ARB (Bridged)'}],
    'Solana': [{value: 'SOL', label: 'SOL'}, {value: 'USDC', label: 'USDC (SPL)'}, {value: 'BONK', label: 'BONK'}],
    'Arbitrum': [{value: 'ETH', label: 'ETH (Native)'}, {value: 'ARB', label: 'ARB'}, {value: 'USDC.e', label: 'USDC.e'}],
    'Polygon': [{value: 'MATIC', label: 'MATIC'}, {value: 'USDC', label: 'USDC (PoS)'}, {value: 'WETH', label: 'WETH (PoS)'}],
    'BNB Chain': [{value: 'BNB', label: 'BNB'}, {value: 'USDT', label: 'USDT'}],
    'Avalanche': [{value: 'AVAX', label: 'AVAX'}, {value: 'USDC', label: 'USDC.e'}],
    'Optimism': [{value: 'OP', label: 'OP'}, {value: 'ETH', label: 'ETH (Native)'}],
    'Base': [{value: 'ETH', label: 'ETH (Native)'}],
    'Other': [{value: 'OTHER_TOKEN', label: 'Other Token'}]
};

const generateMockSteps = (fromChain: string, fromToken: string, toChain: string, toToken: string, amount: number): AggregatorRouteStep[] => {
    const steps: AggregatorRouteStep[] = [];
    const nativeGasTokens: Record<string, string> = {
        'Ethereum': 'ETH', 'Solana': 'SOL', 'Arbitrum': 'ETH', 'Polygon': 'MATIC',
        'BNB Chain': 'BNB', 'Avalanche': 'AVAX', 'Optimism': 'ETH', 'Base': 'ETH'
    };
    const fromNative = nativeGasTokens[fromChain] || 'NATIVE';
    const toNative = nativeGasTokens[toChain] || 'NATIVE';

    const swapProtocols = ['SimSwap DEX', 'QuickRoute DEX', 'AlphaTrade DEX'];
    const bridgeProtocols = ['SimBridge Protocol', 'HyperLane Bridge', 'PortalJump Bridge'];

    if (fromChain === toChain) { // Swap only
        if (fromToken !== toToken) {
             steps.push({
                type: 'Swap', 
                protocol: swapProtocols[Math.floor(Math.random() * swapProtocols.length)], 
                inputTokenSymbol: fromToken,
                inputAmount: amount, 
                outputTokenSymbol: toToken, 
                outputAmount: amount * (0.98 + Math.random()*0.015), // Simulate some slippage/fees
                fromChain: fromChain,
                toChain: toChain,
                details: `Swap ${amount.toFixed(4)} ${fromToken} to ${toToken} on ${fromChain}`,
                estimatedTimeMinutes: Math.floor(Math.random() * 2) + 1,
                iconName: 'Repeat'
            });
        } else {
            // If fromToken and toToken are same, no steps needed or an error should be handled earlier
             steps.push({type: 'Other', protocol: 'N/A', details: 'Same token on same chain, no action.', estimatedTimeMinutes: 0, iconName:'Info'});
        }
    } else { // Bridge (potentially with swaps)
        // Step 1: Swap to native/wrapped native if needed on source chain
        if (fromToken !== fromNative && fromToken !== `W${fromNative}`) { // WETH, WSOL, etc. might be bridgeable
            steps.push({
                type: 'Swap', 
                protocol: swapProtocols[Math.floor(Math.random() * swapProtocols.length)], 
                inputTokenSymbol: fromToken,
                inputAmount: amount,
                outputTokenSymbol: fromNative, 
                outputAmount: amount * (0.98 + Math.random()*0.015), // Placeholder, should use actual swap rate simulation
                fromChain: fromChain,
                toChain: fromChain,
                details: `Swap ${amount.toFixed(4)} ${fromToken} to ${fromNative} on ${fromChain}`,
                estimatedTimeMinutes: Math.floor(Math.random() * 2) + 1,
                iconName: 'Repeat'
            });
        }
        // Step 2: Bridge
        steps.push({
            type: 'Bridge', 
            protocol: bridgeProtocols[Math.floor(Math.random() * bridgeProtocols.length)], 
            inputTokenSymbol: (fromToken === fromNative || fromToken === `W${fromNative}`) ? fromToken : fromNative,
            inputAmount: (fromToken === fromNative || fromToken === `W${fromNative}`) ? amount : amount * 0.99, // approx after potential first swap
            fromChain: fromChain, 
            toChain: toChain, 
            outputTokenSymbol: toNative, // Bridge usually outputs native on dest chain
            outputAmount: ((fromToken === fromNative || fromToken === `W${fromNative}`) ? amount : amount * 0.99) * (0.97 + Math.random()*0.02),
            details: `Bridge asset from ${fromChain} to ${toChain}`,
            estimatedTimeMinutes: Math.floor(Math.random() * 25) + 5,
            iconName: 'ArrowRightLeft'
        });
        // Step 3: Swap from native/wrapped native if needed on destination chain
        if (toToken !== toNative && toToken !== `W${toNative}`) {
             steps.push({
                type: 'Swap', 
                protocol: swapProtocols[Math.floor(Math.random() * swapProtocols.length)],
                inputTokenSymbol: toNative,
                inputAmount: ((fromToken === fromNative || fromToken === `W${fromNative}`) ? amount : amount * 0.99) * 0.98, // approx after bridge
                outputTokenSymbol: toToken,
                outputAmount: (((fromToken === fromNative || fromToken === `W${fromNative}`) ? amount : amount * 0.99) * 0.98) * (0.98 + Math.random()*0.015),
                fromChain: toChain,
                toChain: toChain,
                details: `Swap ${toNative} to ${toToken} on ${toChain}`,
                estimatedTimeMinutes: Math.floor(Math.random() * 2) + 1,
                iconName: 'Repeat'
            });
        }
    }
    return steps;
}


export const AggregatorPage: React.FC = () => {
  const { t } = useTranslation();
  const [fromChain, setFromChain] = useState(BLOCKCHAIN_OPTIONS[0]);
  const [toChain, setToChain] = useState(BLOCKCHAIN_OPTIONS[1]);
  const [fromToken, setFromToken] = useState(MOCK_TOKENS_PER_CHAIN[BLOCKCHAIN_OPTIONS[0]]?.[0]?.value || '');
  const [toToken, setToToken] = useState(MOCK_TOKENS_PER_CHAIN[BLOCKCHAIN_OPTIONS[1]]?.[0]?.value || '');
  const [amount, setAmount] = useState('');
  const [foundRoutes, setFoundRoutes] = useState<AggregatorRoute[] | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);

  const fromTokenOptions = MOCK_TOKENS_PER_CHAIN[fromChain] || [{value: 'NATIVE', label: `Native ${fromChain} Token`}];
  const toTokenOptions = MOCK_TOKENS_PER_CHAIN[toChain] || [{value: 'NATIVE', label: `Native ${toChain} Token`}];

  const handleFromChainChange = (value: string) => {
    setFromChain(value);
    setFromToken(MOCK_TOKENS_PER_CHAIN[value]?.[0]?.value || 'NATIVE');
    setFoundRoutes(null);
  };
  const handleToChainChange = (value: string) => {
    setToChain(value);
    setToToken(MOCK_TOKENS_PER_CHAIN[value]?.[0]?.value || 'NATIVE');
    setFoundRoutes(null);
  };

  const handleFindRoutes = () => {
    if(!amount || parseFloat(amount) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    setIsLoadingRoutes(true);
    setFoundRoutes(null);
    const inputAmountNum = parseFloat(amount);

    setTimeout(() => {
        const mockRouteProviders = [
            { name: "SimHop Express", baseFee: 2.0, gasFactor: 1.5, timeFactor: 10, outputModifier: 0.995, tags: ['Fastest'] as AggregatorRoute['tags'] },
            { name: "MegaSwap (via SimBridge)", baseFee: 1.0, gasFactor: 1.2, timeFactor: 15, outputModifier: 0.998, tags: ['Cheapest', 'Recommended'] as AggregatorRoute['tags'] },
            { name: "SecurePort (Conceptual)", baseFee: 3.5, gasFactor: 1.8, timeFactor: 20, outputModifier: 0.992, tags: ['Most Secure (Conceptual)'] as AggregatorRoute['tags'] },
            { name: "BudgetRoute", baseFee: 0.5, gasFactor: 2.5, timeFactor: 30, outputModifier: 0.990, tags: [] as AggregatorRoute['tags']},
        ];

        const simulatedRoutes = mockRouteProviders.map((provider, index) => {
            const steps = generateMockSteps(fromChain, fromToken, toChain, toToken, inputAmountNum);
            // Determine final output amount from last step if possible
            const finalStepOutput = steps.length > 0 && steps[steps.length-1].outputAmount !== undefined ? steps[steps.length-1].outputAmount : inputAmountNum * provider.outputModifier;
            
            const estimatedGasCostUSD = (provider.gasFactor * (Math.random() * 2 + 1)) + (inputAmountNum * 0.0001);
            const providerFeeUSD = provider.baseFee + (inputAmountNum * 0.001);
            const estimatedCostUSD = estimatedGasCostUSD + providerFeeUSD;
            const estimatedTimeMinutes = steps.reduce((sum, step) => sum + (step.estimatedTimeMinutes || 0), 0) || Math.floor(provider.timeFactor * (0.8 + Math.random() * 0.4));
            
            return {
                id: `route_sim_${index}_${Date.now()}`,
                providerName: provider.name,
                outputAmount: parseFloat(finalStepOutput.toFixed(4)),
                outputTokenSymbol: toToken,
                estimatedCostUSD: parseFloat(estimatedCostUSD.toFixed(2)),
                estimatedGasCostUSD: parseFloat(estimatedGasCostUSD.toFixed(2)),
                providerFeeUSD: parseFloat(providerFeeUSD.toFixed(2)),
                estimatedTimeMinutes,
                steps: steps,
                isSimulated: true,
                tags: provider.tags,
            };
        }).sort((a,b) => a.estimatedCostUSD - b.estimatedCostUSD); 
        
      setFoundRoutes(simulatedRoutes);
      setIsLoadingRoutes(false);
    }, 1200);
  };

  const StepIconComponent: React.FC<{iconName?: string}> = ({iconName}) => {
    if (iconName === 'Repeat') return <Repeat size={12} className="mr-1.5 text-blue-500"/>;
    if (iconName === 'ArrowRightLeft') return <ArrowRightLeft size={12} className="mr-1.5 text-green-500"/>;
    if (iconName === 'Zap') return <Zap size={12} className="mr-1.5 text-yellow-500"/>;
    return <Shuffle size={12} className="mr-1.5 text-gray-400"/>;
  }


  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <RouteIconLucide size={28} className="mr-3 text-primary-light dark:text-primary-dark" />
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">
          {t('aggregator_page_title')}
        </h2>
      </div>
      <Card className="mb-6">
        <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
          {t('aggregator_intro')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <Select label={t('aggregator_source_chain')} value={fromChain} onChange={(e) => handleFromChainChange(e.target.value)} options={BLOCKCHAIN_OPTIONS.map(b => ({value: b, label: b}))} />
          <Select label={t('aggregator_token_send')} value={fromToken} onChange={(e) => setFromToken(e.target.value)} options={fromTokenOptions} />
          <Select label={t('aggregator_dest_chain')} value={toChain} onChange={(e) => handleToChainChange(e.target.value)} options={BLOCKCHAIN_OPTIONS.map(b => ({value: b, label: b}))} />
          <Select label={t('aggregator_token_receive')} value={toToken} onChange={(e) => setToToken(e.target.value)} options={toTokenOptions} />
          <Input label={t('aggregator_amount')} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1.5" min="0" step="any"/>
          <Button onClick={handleFindRoutes} disabled={isLoadingRoutes} leftIcon={isLoadingRoutes ? <Loader2 className="animate-spin"/> : <Repeat /> } className="md:mt-auto h-10">
            {isLoadingRoutes ? "Finding Routes..." : t('aggregator_find_routes_button')}
          </Button>
        </div>
         <p className="text-xs text-red-500 dark:text-red-400 mt-4 text-center font-semibold flex items-center justify-center">
          <Info size={14} className="mr-1.5"/> Disclaimer: All routes and data shown here are ENTIRELY SIMULATED for demonstration and do NOT involve real assets or transactions.
        </p>
      </Card>

      {foundRoutes && (
        <Card title="Simulated Optimal Routes">
          {foundRoutes.length === 0 ? (
            <p className="text-muted-light dark:text-muted-dark">No simulated routes found for this combination.</p>
          ) : (
            <div className="space-y-3">
              {foundRoutes.map((route, index) => (
                <div key={route.id} className={`p-3 border rounded-md ${index === 0 && route.tags?.includes('Recommended') ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : (route.tags?.includes('Fastest') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800')}`}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
                    <h4 className="font-semibold text-text-light dark:text-text-dark">{route.providerName} 
                      {route.tags?.map(tag => (
                        <span key={tag} className={`text-xs ml-1.5 px-1.5 py-0.5 rounded-full ${tag === 'Cheapest' ? 'bg-green-200 text-green-800' : tag === 'Fastest' ? 'bg-blue-200 text-blue-800' : tag === 'Recommended' ? 'bg-yellow-200 text-yellow-800' : 'bg-purple-200 text-purple-800'}`}>{tag}</span>
                      ))}
                    </h4>
                    <span className="text-lg font-bold text-primary-light dark:text-primary-dark">{route.outputAmount.toLocaleString(undefined, {maximumFractionDigits:4})} {route.outputTokenSymbol}</span>
                  </div>
                  <div className="text-xs text-muted-light dark:text-muted-dark mt-1 space-y-0.5 sm:space-y-0 sm:flex sm:gap-x-3">
                    <span>Est. Total Cost: <span className="text-red-500">{formatCurrency(route.estimatedCostUSD)}</span></span>
                    {route.estimatedGasCostUSD !== undefined && <span>{t('aggregator_gas_cost_label')}: {formatCurrency(route.estimatedGasCostUSD)}</span>}
                    {route.providerFeeUSD !== undefined && <span>{t('aggregator_provider_fee_label')}: {formatCurrency(route.providerFeeUSD)}</span>}
                    <span>Est. Time: {route.estimatedTimeMinutes} mins</span>
                  </div>
                  {route.steps && route.steps.length > 0 && (
                    <div className="mt-1.5 text-xs space-y-0.5">
                        <p className="font-medium text-xs">Route Details:</p>
                        {route.steps.map((step, i) => (
                            <div key={i} className="flex items-center pl-2">
                                <StepIconComponent iconName={step.iconName} />
                                <span><strong>{step.type} via {step.protocol}:</strong> {step.details} {step.estimatedTimeMinutes ? `(~${step.estimatedTimeMinutes}m)` : ''}</span>
                            </div>
                        ))}
                    </div>
                  )}
                   <Button size="sm" variant="outline" className="mt-2 text-xs" leftIcon={<Zap size={14}/>} onClick={() => alert("Transaction simulation not implemented. This is a conceptual button.")}>Execute Route (Simulated)</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
       <p className="text-xs text-muted-light dark:text-muted-dark mt-6 text-center">
          Note: This tool uses simulated data and does not perform real transactions or API calls to aggregators. Real aggregator integrations are complex and require API keys.
        </p>
    </PageWrapper>
  );
};
