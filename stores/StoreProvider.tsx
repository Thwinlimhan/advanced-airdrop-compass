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
import { useUIStore } from './uiStore';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { addToast } = useToast();
  
  // Auth store
  const { 
    isAuthenticated, 
    token, 
    isLoadingAuth, 
    validateSession,
    setToken 
  } = useAuthStore();

  // Data stores
  const { fetchWallets } = useWalletStore();
  const { fetchAirdrops } = useAirdropStore();
  const { fetchRecurringTasks } = useRecurringTaskStore();
  const { fetchLearningResources } = useLearningResourceStore();
  const { fetchStrategyNotes } = useStrategyNoteStore();
  const { fetchUserAlerts } = useUserAlertStore();
  const { fetchSettings, fetchUserProfile } = useSettingsStore();
  const { fetchWatchlist } = useWatchlistStore();
  const { fetchAirdropTemplates } = useAirdropTemplateStore();
  const { fetchYieldPositions } = useYieldPositionStore();
  const { fetchAiStrategies } = useAiStrategyStore();

  // UI store
  const { setAllLoading } = useUIStore();

  // Initialize session on mount
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // Set token in API service when auth state changes
  useEffect(() => {
    apiService.setToken(token);
  }, [token]);

  // Fetch all data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      const fetchAllData = async () => {
        setAllLoading(true);
        try {
          await Promise.all([
            fetchWallets(),
            fetchAirdrops(),
            fetchRecurringTasks(),
            fetchLearningResources(),
            fetchStrategyNotes(),
            fetchUserAlerts(),
            fetchSettings(),
            fetchUserProfile(),
            fetchWatchlist(),
            fetchAirdropTemplates(),
            fetchYieldPositions(),
            fetchAiStrategies(),
          ]);
          addToast('All data synced successfully', 'success');
        } catch (error) {
          console.error('Error fetching data:', error);
          addToast('Error syncing data. Some features may be limited.', 'error');
        } finally {
          setAllLoading(false);
        }
      };

      fetchAllData();
    }
  }, [
    isAuthenticated,
    token,
    fetchWallets,
    fetchAirdrops,
    fetchRecurringTasks,
    fetchLearningResources,
    fetchStrategyNotes,
    fetchUserAlerts,
    fetchSettings,
    fetchUserProfile,
    fetchWatchlist,
    fetchAirdropTemplates,
    fetchYieldPositions,
    fetchAiStrategies,
    setAllLoading,
    addToast,
  ]);

  // Show loading screen while validating auth
  if (isLoadingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Initializing application...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export { StoreProvider }; 