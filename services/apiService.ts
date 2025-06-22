import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constants';

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  username?: string;
  message?: string;
}

// API Service class
class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        // Validate response structure
        if (!response || response.status === null || response.status === undefined) {
          console.error('Invalid response received:', response);
          throw new Error('Invalid response: missing status code');
        }
        return response;
      },
      (error) => {
        console.error('API Error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });

        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
        }
        
        // Handle null status responses
        if (error.response && (error.response.status === null || error.response.status === undefined)) {
          console.error('Response with null status detected:', error.response);
          throw new Error('Server returned invalid response status');
        }
        
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // Generic request method
  private async request<T>(config: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.request(config);
      
      // Additional validation
      if (!response || response.status === null || response.status === undefined) {
        throw new Error('Invalid response: missing status code');
      }
      
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error('Request failed:', {
        url: config.url,
        method: config.method,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Provide more specific error messages
      if (error.response?.status === null || error.response?.status === undefined) {
        throw new Error('Server returned invalid response status');
      }
      
      if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error: Unable to connect to server');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: Server took too long to respond');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'API request failed');
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    });
  }

  async register(userInfo: any): Promise<AuthResponse> {
    return this.request<AuthResponse>({
      method: 'POST',
      url: '/auth/register',
      data: userInfo,
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/auth/me',
    });
  }

  // Wallet endpoints
  async getWallets(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/wallets',
    });
  }

  async createWallet(wallet: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/wallets',
      data: wallet,
    });
  }

  async updateWallet(wallet: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/wallets/${wallet.id}`,
      data: wallet,
    });
  }

  async deleteWallet(walletId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/wallets/${walletId}`,
    });
  }

  async batchUpdateWallets(walletIds: string[], updates: any): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: '/wallets/batch-update',
      data: { walletIds, updates },
    });
  }

  // Gas Log endpoints
  async createGasLog(walletId: string, logEntry: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/wallets/${walletId}/gas-logs`,
      data: logEntry,
    });
  }

  async deleteGasLog(walletId: string, logId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/wallets/${walletId}/gas-logs/${logId}`,
    });
  }

  // Interaction Log endpoints
  async createInteractionLog(walletId: string, logEntry: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/wallets/${walletId}/interaction-logs`,
      data: logEntry,
    });
  }

  async deleteInteractionLog(walletId: string, logId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/wallets/${walletId}/interaction-logs/${logId}`,
    });
  }

  // NFT endpoints
  async createNft(walletId: string, nftEntry: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/wallets/${walletId}/nfts`,
      data: nftEntry,
    });
  }

  async updateNft(walletId: string, nftEntry: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/wallets/${walletId}/nfts/${nftEntry.id}`,
      data: nftEntry,
    });
  }

  async deleteNft(walletId: string, nftId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/wallets/${walletId}/nfts/${nftId}`,
    });
  }

  // Airdrop endpoints
  async getAirdrops(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/airdrops',
    });
  }

  async createAirdrop(airdrop: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/airdrops',
      data: airdrop,
    });
  }

  async updateAirdrop(airdrop: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/airdrops/${airdrop.id}`,
      data: airdrop,
    });
  }

  async deleteAirdrop(airdropId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/airdrops/${airdropId}`,
    });
  }

  async batchUpdateAirdrops(airdropIds: string[], updates: any): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: '/airdrops/batch-update',
      data: { airdropIds, updates },
    });
  }

  async batchAddNotesToAirdrops(airdropIds: string[], notesToAppend: string): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: '/airdrops/batch-add-notes',
      data: { airdropIds, notesToAppend },
    });
  }

  async clearArchivedAirdrops(): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: '/airdrops/archived/all',
    });
  }

  // Airdrop Task endpoints
  async createAirdropTask(airdropId: string, task: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/airdrops/${airdropId}/tasks`,
      data: task,
    });
  }

  async updateAirdropTask(airdropId: string, task: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/airdrops/${airdropId}/tasks/${task.id}`,
      data: task,
    });
  }

  async updateMultipleAirdropTasks(airdropId: string, taskIds: string[], updates: any): Promise<void> {
    return this.request<void>({
      method: 'PUT',
      url: `/airdrops/${airdropId}/tasks/batch-update`,
      data: { taskIds, updates },
    });
  }

  async deleteAirdropTask(airdropId: string, taskId: string, parentId?: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/airdrops/${airdropId}/tasks/${taskId}`,
      params: { parentId },
    });
  }

  async completeNextAirdropTask(airdropId: string): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: `/airdrops/${airdropId}/tasks/complete-next`,
    });
  }

  async completeAllSubTasks(airdropId: string, parentTaskId: string): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: `/airdrops/${airdropId}/tasks/${parentTaskId}/complete-all-subtasks`,
    });
  }

  // Transaction endpoints
  async createTransaction(airdropId: string, transaction: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/airdrops/${airdropId}/transactions`,
      data: transaction,
    });
  }

  async deleteTransaction(airdropId: string, transactionId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/airdrops/${airdropId}/transactions/${transactionId}`,
    });
  }

  // Claimed Token endpoints
  async createClaimedTokenLog(airdropId: string, log: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/airdrops/${airdropId}/claimed-tokens`,
      data: log,
    });
  }

  async updateClaimedTokenLog(airdropId: string, log: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/airdrops/${airdropId}/claimed-tokens/${log.id}`,
      data: log,
    });
  }

  async deleteClaimedTokenLog(airdropId: string, logId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/airdrops/${airdropId}/claimed-tokens/${logId}`,
    });
  }

  // Sybil Checklist endpoints
  async updateSybilItem(airdropId: string, item: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/airdrops/${airdropId}/sybil-checklist/${item.id}`,
      data: item,
    });
  }

  // Roadmap Event endpoints
  async createRoadmapEvent(airdropId: string, event: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/airdrops/${airdropId}/roadmap-events`,
      data: event,
    });
  }

  async updateRoadmapEvent(airdropId: string, event: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/airdrops/${airdropId}/roadmap-events/${event.id}`,
      data: event,
    });
  }

  async deleteRoadmapEvent(airdropId: string, eventId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/airdrops/${airdropId}/roadmap-events/${eventId}`,
    });
  }

  // Recurring Task endpoints
  async getRecurringTasks(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/recurring-tasks',
    });
  }

  async createRecurringTask(task: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/recurring-tasks',
      data: task,
    });
  }

  async updateRecurringTask(task: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/recurring-tasks/${task.id}`,
      data: task,
    });
  }

  async deleteRecurringTask(taskId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/recurring-tasks/${taskId}`,
    });
  }

  async completeRecurringTask(taskId: string): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: `/recurring-tasks/${taskId}/complete`,
    });
  }

  async snoozeRecurringTask(taskId: string, daysToSnooze: number): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: `/recurring-tasks/${taskId}/snooze`,
      data: { daysToSnooze },
    });
  }

  // Learning Resource endpoints
  async getLearningResources(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/learning-resources',
    });
  }

  async createLearningResource(resource: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/learning-resources',
      data: resource,
    });
  }

  async updateLearningResource(resource: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/learning-resources/${resource.id}`,
      data: resource,
    });
  }

  async deleteLearningResource(resourceId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/learning-resources/${resourceId}`,
    });
  }

  // Strategy Note endpoints
  async getStrategyNotes(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/strategy-notes',
    });
  }

  async createStrategyNote(note: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/strategy-notes',
      data: note,
    });
  }

  async updateStrategyNote(note: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/strategy-notes/${note.id}`,
      data: note,
    });
  }

  async deleteStrategyNote(noteId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/strategy-notes/${noteId}`,
    });
  }

  // User Alert endpoints
  async getUserAlerts(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/user-alerts',
    });
  }

  async createUserAlert(alert: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/user-alerts',
      data: alert,
    });
  }

  async markAlertAsRead(alertId: string): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/user-alerts/${alertId}/read`,
    });
  }

  async deleteUserAlert(alertId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/user-alerts/${alertId}`,
    });
  }

  async markAllAlertsAsRead(): Promise<void> {
    return this.request<void>({
      method: 'POST',
      url: '/user-alerts/mark-all-read',
    });
  }

  async clearReadAlerts(): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: '/user-alerts/read/clear',
    });
  }

  async clearAllAlerts(): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: '/user-alerts/all/clear',
    });
  }

  // Settings endpoints
  async getSettings(): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/settings',
    });
  }

  async updateSettings(settings: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: '/settings',
      data: settings,
    });
  }

  async addCustomTransactionCategory(category: string): Promise<{message: string, categories: string[]}> {
    return this.request<{message: string, categories: string[]}>({
      method: 'POST',
      url: '/settings/transaction-categories',
      data: { category },
    });
  }

  async deleteCustomTransactionCategory(category: string): Promise<{message: string, categories: string[]}> {
    return this.request<{message: string, categories: string[]}>({
      method: 'DELETE',
      url: `/settings/transaction-categories/${encodeURIComponent(category)}`,
    });
  }

  // Watchlist endpoints
  async getWatchlist(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/watchlist',
    });
  }

  async createWatchlistItem(item: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/watchlist',
      data: item,
    });
  }

  async updateWatchlistItem(item: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/watchlist/${item.id}`,
      data: item,
    });
  }

  async deleteWatchlistItem(itemId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/watchlist/${itemId}`,
    });
  }

  async promoteWatchlistItemToAirdrop(itemId: string): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: `/watchlist/${itemId}/promote-to-airdrop`,
    });
  }

  // Airdrop Template endpoints
  async getAirdropTemplates(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/airdrop-templates',
    });
  }

  async createAirdropTemplate(template: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/airdrop-templates',
      data: template,
    });
  }

  async updateAirdropTemplate(template: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/airdrop-templates/${template.id}`,
      data: template,
    });
  }

  async deleteAirdropTemplate(templateId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/airdrop-templates/${templateId}`,
    });
  }

  // Yield Position endpoints
  async getYieldPositions(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/yield-positions',
    });
  }

  async createYieldPosition(position: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/yield-positions',
      data: position,
    });
  }

  async updateYieldPosition(position: any): Promise<any> {
    return this.request<any>({
      method: 'PUT',
      url: `/yield-positions/${position.id}`,
      data: position,
    });
  }

  async deleteYieldPosition(positionId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/yield-positions/${positionId}`,
    });
  }

  // AI Strategy endpoints
  async getAiStrategies(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/ai-strategies',
    });
  }

  async createAiStrategy(strategy: any): Promise<any> {
    return this.request<any>({
      method: 'POST',
      url: '/ai-strategies',
      data: strategy,
    });
  }

  async deleteAiStrategy(strategyId: string): Promise<void> {
    return this.request<void>({
      method: 'DELETE',
      url: `/ai-strategies/${strategyId}`,
    });
  }

  // User Profile endpoints
  async getUserProfile(): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/user-profile/preferences',
    });
  }

  async getUserBadges(): Promise<any[]> {
    return this.request<any[]>({
      method: 'GET',
      url: '/user-profile/badges',
    });
  }

  async getUserPoints(): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/user-profile/points',
    });
  }

  async getUserStreak(): Promise<any> {
    return this.request<any>({
      method: 'GET',
      url: '/user-profile/streak',
    });
  }

  async scrapeAirdropDataFromURL(url: string): Promise<Partial<any> | null> {
    return this.request<Partial<any> | null>({
      method: 'POST',
      url: '/ai/scrape-airdrop',
      data: { url },
    });
  }
}

// Export singleton instance
export const apiService = new ApiService(); 