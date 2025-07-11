import { Wallet } from './wallet.types';
import { Airdrop } from './airdrop.types';
import { RecurringTask } from './tasks.types';
import { LearningResource } from './learning.types';
import { StrategyNote } from './learning.types';
import { UserAlert } from './notifications.types';
import { AppSettings } from './user.types';
import { WatchlistItem } from './watchlist.types';
import { AirdropTemplate } from './airdrop.types';
import { YieldPosition } from './wallet.types';
import { UserBadge } from './user.types';
import { SavedAiFarmingStrategy } from './ai.types';

export interface AppData {
  wallets: Wallet[];
  airdrops: Airdrop[];
  recurringTasks: RecurringTask[];
  learningResources: LearningResource[];
  strategyNotes: StrategyNote[];
  userAlerts: UserAlert[]; 
  settings: AppSettings;
  watchlist?: WatchlistItem[];
  airdropTemplates?: AirdropTemplate[];
  yieldPositions?: YieldPosition[]; 
  userBadges?: UserBadge[]; 
  savedAiStrategies?: SavedAiFarmingStrategy[];
}

export interface AppContextType {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  isAuthenticated: boolean;
  currentUser: any; // Will be imported from user.types.ts
  token: string | null;
  isLoadingAuth: boolean; 
  isDataLoading: any; // Will be imported from common.types.ts
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  login: (credentials: any) => Promise<boolean>;
  register: (userInfo: any) => Promise<boolean>;
  logout: () => void;
  addWallet: (wallet: any) => Promise<void>;
  updateWallet: (wallet: any) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  batchUpdateWallets: (walletIds: string[], updates: any) => Promise<void>; 
  getRecentWalletLogs: (limitPerWalletType?: number) => any; 
  addGasLogToWallet: (walletId: string, logEntry: any) => Promise<void>;
  deleteGasLogFromWallet: (walletId: string, logId: string) => Promise<void>;
  addInteractionLogToWallet: (walletId: string, logEntry: any) => Promise<void>;
  deleteInteractionLogFromWallet: (walletId: string, logId: string) => Promise<void>;
  addNftToWalletPortfolio: (walletId: string, nftEntry: any) => Promise<void>;
  deleteNftFromWalletPortfolio: (walletId: string, nftId: string) => Promise<void>;
  updateNftInWalletPortfolio: (walletId: string, nftEntry: any) => Promise<void>;
  addAirdrop: (airdrop: any) => Promise<any>;
  updateAirdrop: (airdrop: any) => Promise<void>;
  deleteAirdrop: (airdropId: string) => Promise<void>;
  batchUpdateAirdrops: (airdropIds: string[], updates: any) => Promise<void>; 
  batchAddNotesToAirdrops: (airdropIds: string[], notesToAppend: string) => Promise<void>;
  addAirdropTask: (airdropId: string, task: any) => Promise<void>; 
  updateAirdropTask: (airdropId: string, task: any) => Promise<void>;
  updateMultipleAirdropTasks: (airdropId: string, taskIds: string[], updates: any) => Promise<void>;
  deleteAirdropTask: (airdropId: string, taskId: string, parentId?: string) => Promise<void>;
  completeNextAirdropTask: (airdropId: string) => Promise<void>;
  completeAllSubTasks: (airdropId: string, parentTaskId: string) => Promise<void>;
  addTransactionToAirdrop: (airdropId: string, transaction: any) => Promise<void>;
  deleteTransactionFromAirdrop: (airdropId: string, transactionId: string) => Promise<void>;
  addRecurringTask: (task: any) => Promise<void>;
  updateRecurringTask: (task: any) => Promise<void>;
  deleteRecurringTask: (taskId: string) => Promise<void>;
  completeRecurringTask: (taskId: string) => Promise<void>;
  snoozeRecurringTask: (taskId: string, daysToSnooze: number) => Promise<void>;
  addLearningResource: (resource: any) => Promise<any>;
  updateLearningResource: (resource: any) => Promise<void>;
  deleteLearningResource: (resourceId: string) => Promise<void>;
  addStrategyNote: (note: any) => Promise<void>;
  updateStrategyNote: (note: any) => Promise<void>;
  deleteStrategyNote: (noteId: string) => Promise<void>;
  addUserAlert: (alertData: any) => Promise<void>;
  markUserAlertAsRead: (alertId: string) => Promise<void>;
  deleteUserAlert: (alertId: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  clearReadAlerts: () => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  updateSettings: (newSettings: any) => Promise<void>;
  addClaimedTokenLog: (airdropId: string, log: any) => Promise<void>;
  updateClaimedTokenLog: (airdropId: string, log: any) => Promise<void>;
  deleteClaimedTokenLog: (airdropId: string, logId: string) => Promise<void>;
  updateAirdropSybilItem: (airdropId: string, item: any) => Promise<void>;
  addWatchlistItem: (item: any) => Promise<void>;
  updateWatchlistItem: (item: any) => Promise<void>;
  deleteWatchlistItem: (itemId: string) => Promise<void>;
  promoteWatchlistItemToAirdrop: (itemId: string) => Promise<any>;
  addRoadmapEvent: (airdropId: string, event: any) => Promise<void>;
  updateRoadmapEvent: (airdropId: string, event: any) => Promise<void>;
  deleteRoadmapEvent: (airdropId: string, eventId: string) => Promise<void>;
  markTutorialAsCompleted: (tutorialKey: string) => void;
  addAirdropTemplate: (template: any) => Promise<void>;
  updateAirdropTemplate: (template: any) => Promise<void>;
  deleteAirdropTemplate: (templateId: string) => Promise<void>;
  addYieldPosition: (position: any) => Promise<void>;
  updateYieldPosition: (position: any) => Promise<void>;
  deleteYieldPosition: (positionId: string) => Promise<void>;
  addCustomTransactionCategory: (category: string) => Promise<void>;
  deleteCustomTransactionCategory: (category: string) => Promise<void>;
  fetchTokenPricesAndUpdateLogs: (airdrops: any[]) => Promise<void>;
  fetchWalletBalances: (walletId: string) => Promise<void>; 
  checkAndAwardBadges: () => void; 
  addSavedAiStrategy: (strategy: any) => Promise<void>; 
  deleteSavedAiStrategy: (strategyId: string) => Promise<void>; 
  clearArchivedAirdrops: () => Promise<void>;
  fetchTransactionHistory: (walletId: string) => Promise<void>; 
  getPortfolioSummaryForAI: () => Record<string, any>; 
  runAiSentinelCheck: () => Promise<void>;
  runAiTaskValidation: (airdropId: string) => Promise<void>;
  scrapeAirdropDataFromURL: (url: string) => Promise<Partial<Airdrop> | null>;

  exportAirdropsToCSV: () => void;
  exportWalletsToCSV: () => void;
  exportRecurringTasksToCSV: () => void;
  exportSoldTokenLogsToCSV: () => void;

  internalFetchWalletsFromApi: () => Promise<void>;
  internalFetchAirdropsFromApi: () => Promise<void>;
  internalFetchRecurringTasksFromApi: () => Promise<void>;
} 