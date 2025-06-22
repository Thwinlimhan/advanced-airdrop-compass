export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum ConfidenceLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface PublicToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
}

export type BLOCKCHAIN_EXPLORERS_TYPE = Record<string, { name: string; urlPattern: string, txUrlPattern: string }>;

export type SearchResultType = 'airdrop' | 'airdropTask' | 'wallet' | 'recurringTask' | 'learningGuide' | 'learningGlossary' | 'learningNewsSummary' | 'strategyNote' | 'watchlistItem';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  path: string;
  parentId?: string; // For tasks, to link back to airdrop
  highlightTaskId?: string; // For linking directly to a task in detail view
  airdropStatus?: any; // Will be imported from airdrop.types.ts
}

export interface Command {
  id: string;
  name: string;
  category?: string;
  icon?: React.ElementType;
  keywords?: string[];
  action: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  authRequired?: boolean; 
  publicOnly?: boolean; 
}

export interface DataLoadingStates {
  wallets: boolean;
  airdrops: boolean;
  recurringTasks: boolean;
} 