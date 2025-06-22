import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { aiStrategyService } from '../../services/dataService';
import { SavedAiFarmingStrategy } from '../../types';

interface AiStrategyState {
  // State
  savedStrategies: SavedAiFarmingStrategy[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSavedStrategies: () => Promise<void>;
  createSavedStrategy: (strategy: Omit<SavedAiFarmingStrategy, 'id' | 'savedDate'>) => Promise<void>;
  deleteSavedStrategy: (strategyId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useAiStrategyStore = create<AiStrategyState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        savedStrategies: [],
        isLoading: false,
        error: null,

        // Actions
        fetchSavedStrategies: async () => {
          set({ isLoading: true, error: null });
          try {
            const savedStrategies = await aiStrategyService.fetchSavedStrategies();
            set({ savedStrategies, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch saved strategies'
            });
          }
        },

        createSavedStrategy: async (strategy) => {
          set({ isLoading: true, error: null });
          try {
            const newStrategy = await aiStrategyService.createSavedStrategy(strategy);
            set(state => ({
              savedStrategies: [...state.savedStrategies, newStrategy],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create saved strategy'
            });
          }
        },

        deleteSavedStrategy: async (strategyId) => {
          set({ isLoading: true, error: null });
          try {
            await aiStrategyService.deleteSavedStrategy(strategyId);
            set(state => ({
              savedStrategies: state.savedStrategies.filter(s => s.id !== strategyId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete saved strategy'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'ai-strategy-storage',
        partialize: (state) => ({
          savedStrategies: state.savedStrategies
        })
      }
    ),
    {
      name: 'ai-strategy-store'
    }
  )
); 