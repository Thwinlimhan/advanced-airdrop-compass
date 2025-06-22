import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from './authStore';
import { useWalletStore } from './walletStore';
import { useAirdropStore } from './airdropStore';
import { useRecurringTaskStore } from './recurringTaskStore';
import { useLearningResourceStore } from './learningResourceStore';
import { useStrategyNoteStore } from './strategyNoteStore';
import { useUserAlertStore } from './userAlertStore';
import { useSettingsStore } from './settingsStore';
import { useWatchlistStore } from './watchlistStore';
import { useAirdropTemplateStore } from './airdropTemplateStore';
import { useYieldPositionStore } from './yieldPositionStore';
import { useAiStrategyStore } from './aiStrategyStore';
import { useUiStore } from './uiStore';

// Define the store context type
interface StoreContextType {
  // Auth
  auth: ReturnType<typeof useAuthStore>;
  // Data stores
  wallets: ReturnType<typeof useWalletStore>;
  airdrops: ReturnType<typeof useAirdropStore>;
  recurringTasks: ReturnType<typeof useRecurringTaskStore>;
  learningResources: ReturnType<typeof useLearningResourceStore>;
  strategyNotes: ReturnType<typeof useStrategyNoteStore>;
  userAlerts: ReturnType<typeof useUserAlertStore>;
  settings: ReturnType<typeof useSettingsStore>;
  watchlist: ReturnType<typeof useWatchlistStore>;
  airdropTemplates: ReturnType<typeof useAirdropTemplateStore>;
  yieldPositions: ReturnType<typeof useYieldPositionStore>;
  aiStrategies: ReturnType<typeof useAiStrategyStore>;
  // UI
  ui: ReturnType<typeof useUiStore>;
}

// Create a context for the store provider
const StoreContext = createContext<StoreContextType | null>(null);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Initialize all stores
  const auth = useAuthStore();
  const wallets = useWalletStore();
  const airdrops = useAirdropStore();
  const recurringTasks = useRecurringTaskStore();
  const learningResources = useLearningResourceStore();
  const strategyNotes = useStrategyNoteStore();
  const userAlerts = useUserAlertStore();
  const settings = useSettingsStore();
  const watchlist = useWatchlistStore();
  const airdropTemplates = useAirdropTemplateStore();
  const yieldPositions = useYieldPositionStore();
  const aiStrategies = useAiStrategyStore();
  const ui = useUiStore();

  // Initialize data when user is authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      // Fetch all data in parallel
      const fetchAllData = async () => {
        try {
          await Promise.all([
            wallets.fetchWallets(),
            airdrops.fetchAirdrops(),
            recurringTasks.fetchRecurringTasks(),
            learningResources.fetchLearningResources(),
            strategyNotes.fetchStrategyNotes(),
            userAlerts.fetchUserAlerts(),
            settings.fetchSettings(),
            watchlist.fetchWatchlist(),
            airdropTemplates.fetchAirdropTemplates(),
            yieldPositions.fetchYieldPositions(),
            aiStrategies.fetchSavedStrategies()
          ]);
        } catch (error) {
          console.error('Error fetching initial data:', error);
          ui.addToast('Failed to load some data. Please refresh the page.', 'error');
        }
      };

      fetchAllData();
    }
  }, [auth.isAuthenticated, auth.user]);

  // Validate session on mount
  useEffect(() => {
    auth.validateSession();
  }, []);

  const storeValue: StoreContextType = {
    auth,
    wallets,
    airdrops,
    recurringTasks,
    learningResources,
    strategyNotes,
    userAlerts,
    settings,
    watchlist,
    airdropTemplates,
    yieldPositions,
    aiStrategies,
    ui
  };

  return (
    <StoreContext.Provider value={storeValue}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use the store context
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Individual store hooks for convenience - properly typed
export const useAuth = (): ReturnType<typeof useAuthStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAuth must be used within a StoreProvider');
  }
  return context.auth;
};

export const useWallets = (): ReturnType<typeof useWalletStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useWallets must be used within a StoreProvider');
  }
  return context.wallets;
};

export const useAirdrops = (): ReturnType<typeof useAirdropStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAirdrops must be used within a StoreProvider');
  }
  return context.airdrops;
};

export const useRecurringTasks = (): ReturnType<typeof useRecurringTaskStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useRecurringTasks must be used within a StoreProvider');
  }
  return context.recurringTasks;
};

export const useLearningResources = (): ReturnType<typeof useLearningResourceStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useLearningResources must be used within a StoreProvider');
  }
  return context.learningResources;
};

export const useStrategyNotes = (): ReturnType<typeof useStrategyNoteStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStrategyNotes must be used within a StoreProvider');
  }
  return context.strategyNotes;
};

export const useUserAlerts = (): ReturnType<typeof useUserAlertStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useUserAlerts must be used within a StoreProvider');
  }
  return context.userAlerts;
};

export const useSettings = (): ReturnType<typeof useSettingsStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useSettings must be used within a StoreProvider');
  }
  return context.settings;
};

export const useWatchlist = (): ReturnType<typeof useWatchlistStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a StoreProvider');
  }
  return context.watchlist;
};

export const useAirdropTemplates = (): ReturnType<typeof useAirdropTemplateStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAirdropTemplates must be used within a StoreProvider');
  }
  return context.airdropTemplates;
};

export const useYieldPositions = (): ReturnType<typeof useYieldPositionStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useYieldPositions must be used within a StoreProvider');
  }
  return context.yieldPositions;
};

export const useAiStrategies = (): ReturnType<typeof useAiStrategyStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAiStrategies must be used within a StoreProvider');
  }
  return context.aiStrategies;
};

export const useUi = (): ReturnType<typeof useUiStore> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useUi must be used within a StoreProvider');
  }
  return context.ui;
}; 