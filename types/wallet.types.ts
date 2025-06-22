export interface GasLogEntry {
  id: string;
  date: string;
  amount: number; 
  currency: string; 
  description?: string;
  network?: string; 
  walletName?: string; // Added for getRecentWalletLogs
  walletId?: string; // Added for getRecentWalletLogs
}

export interface InteractionLogEntry {
  id: string;
  date: string;
  type: string; 
  description: string;
  network?: string;
  cost?: string; 
  relatedTxHash?: string;
  labels?: string[];
  category?: string;
  walletName?: string; // Added for getRecentWalletLogs
  walletId?: string; // Added for getRecentWalletLogs
}

export interface NftLogEntry {
  id: string; 
  name: string;
  collectionName: string; 
  tokenId?: string;
  contractAddress: string; 
  imageUrl?: string; 
  purchaseDate?: string; 
  purchasePrice?: string; 
  estimatedFloorPrice?: string; 
  notes?: string;
  purchaseLotId?: string; // For cost basis tracking
}

export interface BalanceSnapshot { 
  id: string;
  date: string;
  tokenSymbol: string;
  amount: number;
  notes?: string;
}

export interface TransactionHistoryEntry {
  id: string;
  hash: string;
  date: string;
  from: string;
  to: string;
  value: string; // e.g., "0.1 ETH"
  description?: string; // e.g., "Swap ETH for USDC"
  status: 'Success' | 'Failed' | 'Pending';
  gasUsed?: string;
  gasPrice?: string;
  fee?: string; // Total fee
  blockNumber?: number;
  isSimulated?: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  address: string;
  blockchain: string;
  group?: string;
  balanceSnapshots?: BalanceSnapshot[]; 
  gasLogs?: GasLogEntry[];
  autoBalanceFetchEnabled?: boolean; 
  interactionLogs?: InteractionLogEntry[]; 
  nftPortfolio?: NftLogEntry[]; 
  isArchived?: boolean; 
  transactionHistory?: TransactionHistoryEntry[];
  lastSynced?: string; // Added for walletRoutes
}

export interface GasPrice {
  network: string;
  price: string;
  lastUpdated: string;
  source: 'live' | 'simulated' | 'estimate'; 
}

export interface YieldPosition { 
  id: string;
  platformName: string;
  assetSymbol: string; 
  amountStaked: number;
  walletId: string; 
  entryDate: string;
  currentApy?: number; 
  notes?: string;
  poolUrl?: string; 
  currentValue?: number; 
  userId?: string; // Added for backend store
} 