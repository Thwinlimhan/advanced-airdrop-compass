import api, { handleApiResponse, handleApiError } from './api';
import { 
  Airdrop, 
  Wallet, 
  RecurringTask, 
  LearningResource, 
  StrategyNote, 
  UserAlert, 
  WatchlistItem, 
  AirdropTemplate, 
  YieldPosition, 
  UserBadge, 
  SavedAiFarmingStrategy,
  AppSettings,
  AirdropTask,
  ManualTransaction,
  ClaimedTokenLog,
  SybilChecklistItem,
  RoadmapEvent,
  GasLogEntry,
  InteractionLogEntry,
  NftLogEntry,
  BalanceSnapshot,
  TransactionHistoryEntry,
  CurrentUser,
  AuthResponse,
  UserRegistrationInfo
} from '../types';

// Authentication Services
export const authService = {
  login: async (credentials: Pick<UserRegistrationInfo, 'email' | 'password'>): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  register: async (userInfo: UserRegistrationInfo): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', userInfo);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  validateSession: async (): Promise<CurrentUser> => {
    try {
      const response = await api.get('/auth/validate');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Wallet Services
export const walletService = {
  fetchWallets: async (): Promise<Wallet[]> => {
    try {
      const response = await api.get('/wallets');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createWallet: async (wallet: Omit<Wallet, 'id' | 'balanceSnapshots' | 'gasLogs' | 'interactionLogs' | 'nftPortfolio' | 'isArchived' | 'transactionHistory'>): Promise<Wallet> => {
    try {
      const response = await api.post('/wallets', wallet);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateWallet: async (wallet: Wallet): Promise<Wallet> => {
    try {
      const response = await api.put(`/wallets/${wallet.id}`, wallet);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteWallet: async (walletId: string): Promise<void> => {
    try {
      await api.delete(`/wallets/${walletId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  batchUpdateWallets: async (walletIds: string[], updates: Partial<Pick<Wallet, 'isArchived' | 'group'>>): Promise<void> => {
    try {
      await api.put('/wallets/batch-update', { walletIds, updates });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addGasLog: async (walletId: string, logEntry: Omit<GasLogEntry, 'id'>): Promise<GasLogEntry> => {
    try {
      const response = await api.post(`/wallets/${walletId}/gas-logs`, logEntry);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteGasLog: async (walletId: string, logId: string): Promise<void> => {
    try {
      await api.delete(`/wallets/${walletId}/gas-logs/${logId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addInteractionLog: async (walletId: string, logEntry: Omit<InteractionLogEntry, 'id'>): Promise<InteractionLogEntry> => {
    try {
      const response = await api.post(`/wallets/${walletId}/interaction-logs`, logEntry);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteInteractionLog: async (walletId: string, logId: string): Promise<void> => {
    try {
      await api.delete(`/wallets/${walletId}/interaction-logs/${logId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addNftToPortfolio: async (walletId: string, nftEntry: Omit<NftLogEntry, 'id'>): Promise<NftLogEntry> => {
    try {
      const response = await api.post(`/wallets/${walletId}/nft-portfolio`, nftEntry);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateNftInPortfolio: async (walletId: string, nftEntry: NftLogEntry): Promise<NftLogEntry> => {
    try {
      const response = await api.put(`/wallets/${walletId}/nft-portfolio/${nftEntry.id}`, nftEntry);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteNftFromPortfolio: async (walletId: string, nftId: string): Promise<void> => {
    try {
      await api.delete(`/wallets/${walletId}/nft-portfolio/${nftId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  fetchTransactionHistory: async (walletId: string): Promise<TransactionHistoryEntry[]> => {
    try {
      const response = await api.get(`/wallets/${walletId}/transaction-history`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Airdrop Services
export const airdropService = {
  fetchAirdrops: async (): Promise<Airdrop[]> => {
    try {
      const response = await api.get('/airdrops');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createAirdrop: async (airdrop: Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'tags' | 'isArchived' | 'timeSpentHours' | 'roadmapEvents' | 'dependentOnAirdropIds' | 'leadsToAirdropIds' | 'logoBase64' | 'customFields' | 'dateAdded' | 'notificationOverrides'>): Promise<Airdrop> => {
    try {
      const response = await api.post('/airdrops', airdrop);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateAirdrop: async (airdrop: Airdrop): Promise<Airdrop> => {
    try {
      const response = await api.put(`/airdrops/${airdrop.id}`, airdrop);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteAirdrop: async (airdropId: string): Promise<void> => {
    try {
      await api.delete(`/airdrops/${airdropId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  batchUpdateAirdrops: async (airdropIds: string[], updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain' | 'isArchived'>>): Promise<void> => {
    try {
      await api.put('/airdrops/batch-update', { airdropIds, updates });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  batchAddNotesToAirdrops: async (airdropIds: string[], notesToAppend: string): Promise<void> => {
    try {
      await api.put('/airdrops/batch-add-notes', { airdropIds, notesToAppend });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addTask: async (airdropId: string, task: Omit<AirdropTask, 'id' | 'subTasks' | 'completionDate'>): Promise<AirdropTask> => {
    try {
      const response = await api.post(`/airdrops/${airdropId}/tasks`, task);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateTask: async (airdropId: string, task: AirdropTask): Promise<AirdropTask> => {
    try {
      const response = await api.put(`/airdrops/${airdropId}/tasks/${task.id}`, task);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateMultipleTasks: async (airdropId: string, taskIds: string[], updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>>): Promise<void> => {
    try {
      await api.put(`/airdrops/${airdropId}/tasks/batch-update`, { taskIds, updates });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteTask: async (airdropId: string, taskId: string): Promise<void> => {
    try {
      await api.delete(`/airdrops/${airdropId}/tasks/${taskId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addTransaction: async (airdropId: string, transaction: Omit<ManualTransaction, 'id' | 'airdropsId'>): Promise<ManualTransaction> => {
    try {
      const response = await api.post(`/airdrops/${airdropId}/transactions`, transaction);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteTransaction: async (airdropId: string, transactionId: string): Promise<void> => {
    try {
      await api.delete(`/airdrops/${airdropId}/transactions/${transactionId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addClaimedTokenLog: async (airdropId: string, log: Omit<ClaimedTokenLog, 'id' | 'currentMarketPricePerToken'>): Promise<ClaimedTokenLog> => {
    try {
      const response = await api.post(`/airdrops/${airdropId}/claimed-tokens`, log);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateClaimedTokenLog: async (airdropId: string, log: ClaimedTokenLog): Promise<ClaimedTokenLog> => {
    try {
      const response = await api.put(`/airdrops/${airdropId}/claimed-tokens/${log.id}`, log);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteClaimedTokenLog: async (airdropId: string, logId: string): Promise<void> => {
    try {
      await api.delete(`/airdrops/${airdropId}/claimed-tokens/${logId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateSybilItem: async (airdropId: string, item: SybilChecklistItem): Promise<SybilChecklistItem> => {
    try {
      const response = await api.put(`/airdrops/${airdropId}/sybil-checklist/${item.id}`, item);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  addRoadmapEvent: async (airdropId: string, event: Omit<RoadmapEvent, 'id'>): Promise<RoadmapEvent> => {
    try {
      const response = await api.post(`/airdrops/${airdropId}/roadmap-events`, event);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateRoadmapEvent: async (airdropId: string, event: RoadmapEvent): Promise<RoadmapEvent> => {
    try {
      const response = await api.put(`/airdrops/${airdropId}/roadmap-events/${event.id}`, event);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteRoadmapEvent: async (airdropId: string, eventId: string): Promise<void> => {
    try {
      await api.delete(`/airdrops/${airdropId}/roadmap-events/${eventId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Recurring Task Services
export const recurringTaskService = {
  fetchRecurringTasks: async (): Promise<RecurringTask[]> => {
    try {
      const response = await api.get('/recurring-tasks');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createRecurringTask: async (task: Omit<RecurringTask, 'id' | 'completionHistory' | 'notes' | 'tags'>): Promise<RecurringTask> => {
    try {
      const response = await api.post('/recurring-tasks', task);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateRecurringTask: async (task: RecurringTask): Promise<RecurringTask> => {
    try {
      const response = await api.put(`/recurring-tasks/${task.id}`, task);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteRecurringTask: async (taskId: string): Promise<void> => {
    try {
      await api.delete(`/recurring-tasks/${taskId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  completeRecurringTask: async (taskId: string): Promise<RecurringTask> => {
    try {
      const response = await api.post(`/recurring-tasks/${taskId}/complete`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  snoozeRecurringTask: async (taskId: string, daysToSnooze: number): Promise<RecurringTask> => {
    try {
      const response = await api.post(`/recurring-tasks/${taskId}/snooze`, { daysToSnooze });
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Learning Resource Services
export const learningResourceService = {
  fetchLearningResources: async (): Promise<LearningResource[]> => {
    try {
      const response = await api.get('/learning-resources');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createLearningResource: async (resource: Omit<LearningResource, 'id'>): Promise<LearningResource> => {
    try {
      const response = await api.post('/learning-resources', resource);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateLearningResource: async (resource: LearningResource): Promise<LearningResource> => {
    try {
      const response = await api.put(`/learning-resources/${resource.id}`, resource);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteLearningResource: async (resourceId: string): Promise<void> => {
    try {
      await api.delete(`/learning-resources/${resourceId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Strategy Note Services
export const strategyNoteService = {
  fetchStrategyNotes: async (): Promise<StrategyNote[]> => {
    try {
      const response = await api.get('/strategy-notes');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createStrategyNote: async (note: Omit<StrategyNote, 'id' | 'lastModified'>): Promise<StrategyNote> => {
    try {
      const response = await api.post('/strategy-notes', note);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateStrategyNote: async (note: StrategyNote): Promise<StrategyNote> => {
    try {
      const response = await api.put(`/strategy-notes/${note.id}`, note);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteStrategyNote: async (noteId: string): Promise<void> => {
    try {
      await api.delete(`/strategy-notes/${noteId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// User Alert Services
export const userAlertService = {
  fetchUserAlerts: async (): Promise<UserAlert[]> => {
    try {
      const response = await api.get('/user-alerts');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createUserAlert: async (alert: Omit<UserAlert, 'id' | 'date' | 'isRead'>): Promise<UserAlert> => {
    try {
      const response = await api.post('/user-alerts', alert);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  markAlertAsRead: async (alertId: string): Promise<UserAlert> => {
    try {
      const response = await api.put(`/user-alerts/${alertId}/read`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteUserAlert: async (alertId: string): Promise<void> => {
    try {
      await api.delete(`/user-alerts/${alertId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  markAllAlertsAsRead: async (): Promise<void> => {
    try {
      await api.put('/user-alerts/mark-all-read');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  clearReadAlerts: async (): Promise<void> => {
    try {
      await api.delete('/user-alerts/clear-read');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  clearAllAlerts: async (): Promise<void> => {
    try {
      await api.delete('/user-alerts/clear-all');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Settings Services
export const settingsService = {
  fetchSettings: async (): Promise<AppSettings> => {
    try {
      const response = await api.get('/settings');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateSettings: async (settings: Partial<AppSettings>): Promise<AppSettings> => {
    try {
      const response = await api.put('/settings', settings);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Watchlist Services
export const watchlistService = {
  fetchWatchlist: async (): Promise<WatchlistItem[]> => {
    try {
      const response = await api.get('/watchlist');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createWatchlistItem: async (item: Omit<WatchlistItem, 'id' | 'addedDate'>): Promise<WatchlistItem> => {
    try {
      const response = await api.post('/watchlist', item);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateWatchlistItem: async (item: WatchlistItem): Promise<WatchlistItem> => {
    try {
      const response = await api.put(`/watchlist/${item.id}`, item);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteWatchlistItem: async (itemId: string): Promise<void> => {
    try {
      await api.delete(`/watchlist/${itemId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  promoteToAirdrop: async (itemId: string): Promise<Airdrop> => {
    try {
      const response = await api.post(`/watchlist/${itemId}/promote`);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Airdrop Template Services
export const airdropTemplateService = {
  fetchAirdropTemplates: async (): Promise<AirdropTemplate[]> => {
    try {
      const response = await api.get('/airdrop-templates');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createAirdropTemplate: async (template: Omit<AirdropTemplate, 'id'>): Promise<AirdropTemplate> => {
    try {
      const response = await api.post('/airdrop-templates', template);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateAirdropTemplate: async (template: AirdropTemplate): Promise<AirdropTemplate> => {
    try {
      const response = await api.put(`/airdrop-templates/${template.id}`, template);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteAirdropTemplate: async (templateId: string): Promise<void> => {
    try {
      await api.delete(`/airdrop-templates/${templateId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Yield Position Services
export const yieldPositionService = {
  fetchYieldPositions: async (): Promise<YieldPosition[]> => {
    try {
      const response = await api.get('/yield-positions');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createYieldPosition: async (position: Omit<YieldPosition, 'id'>): Promise<YieldPosition> => {
    try {
      const response = await api.post('/yield-positions', position);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateYieldPosition: async (position: YieldPosition): Promise<YieldPosition> => {
    try {
      const response = await api.put(`/yield-positions/${position.id}`, position);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteYieldPosition: async (positionId: string): Promise<void> => {
    try {
      await api.delete(`/yield-positions/${positionId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// AI Strategy Services
export const aiStrategyService = {
  fetchSavedStrategies: async (): Promise<SavedAiFarmingStrategy[]> => {
    try {
      const response = await api.get('/ai-strategies');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createSavedStrategy: async (strategy: Omit<SavedAiFarmingStrategy, 'id' | 'savedDate'>): Promise<SavedAiFarmingStrategy> => {
    try {
      const response = await api.post('/ai-strategies', strategy);
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteSavedStrategy: async (strategyId: string): Promise<void> => {
    try {
      await api.delete(`/ai-strategies/${strategyId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// Export all services
export const dataService = {
  auth: authService,
  wallets: walletService,
  airdrops: airdropService,
  recurringTasks: recurringTaskService,
  learningResources: learningResourceService,
  strategyNotes: strategyNoteService,
  userAlerts: userAlertService,
  settings: settingsService,
  watchlist: watchlistService,
  airdropTemplates: airdropTemplateService,
  yieldPositions: yieldPositionService,
  aiStrategies: aiStrategyService
};
