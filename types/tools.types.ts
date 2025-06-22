export interface AggregatorRouteStep {
  type: 'Swap' | 'Bridge' | 'Gas Top-up' | 'Other'; 
  protocol: string; 
  inputTokenSymbol?: string;
  inputAmount?: number;
  outputTokenSymbol?: string;
  outputAmount?: number;
  fromChain?: string;
  toChain?: string;
  details: string; 
  estimatedTimeMinutes?: number; 
  iconName?: string; 
}

export interface AggregatorRoute {
  id: string;
  providerName: string; 
  outputAmount: number;
  outputTokenSymbol: string;
  estimatedCostUSD: number;
  estimatedGasCostUSD?: number; 
  providerFeeUSD?: number; 
  estimatedTimeMinutes: number;
  steps?: AggregatorRouteStep[]; 
  isSimulated?: boolean; 
  tags?: ('Cheapest' | 'Fastest' | 'Most Secure (Conceptual)' | 'Recommended')[]; 
} 