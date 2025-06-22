export interface ReportTimeAnalysisItem {
  airdropId: string;
  airdropName: string;
  totalTimeMinutes: number;
}

export interface ReportCostAnalysisItem {
  airdropId: string;
  airdropName: string;
  totalCost: number; 
  gasCost: number; 
  transactionCost: number; 
  taskCost: number; 
  potentialRewardValue: number;
  netPotential: number;
}

export interface CostByCategoryItem {
  category: string;
  totalCost: number;
  count: number;
}

export interface CostByNetworkItem {
  network: string;
  totalCost: number;
  count: number;
}

export interface CostByWalletItem {
  walletId: string;
  walletName: string;
  totalCost: number;
  count: number;
}

export interface TrendingContract {
  id: string;
  name: string;
  address: string;
  chain: string;
  interactionCount: number; 
  explorerUrl?: string;
  isSimulated?: boolean; 
}

export interface WhaleTransaction {
  id: string;
  hash: string;
  tokenSymbol: string;
  amount: number;
  usdValue: number;
  fromAddress: string;
  toAddress: string;
  timestamp: string;
  chain: string;
  explorerUrl?: string;
  isSimulated?: boolean; 
}

export interface AIPortfolioQueryResponse {
  query: string;
  aiResponse: string; 
  dataUsedSummary?: string; 
  isSimulated: boolean;
} 