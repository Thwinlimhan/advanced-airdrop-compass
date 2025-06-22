import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { SavedAiFarmingStrategy, AiFarmingStrategy, Airdrop } from '../types';

interface AiStrategyState {
  // State
  savedAiStrategies: SavedAiFarmingStrategy[];
  isLoading: boolean;

  // Actions
  setSavedAiStrategies: (strategies: SavedAiFarmingStrategy[]) => void;
  addSavedAiStrategy: (strategy: AiFarmingStrategy) => Promise<void>;
  deleteSavedAiStrategy: (strategyId: string) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  fetchAiStrategies: () => Promise<void>;
  generateAITaskSuggestions: (airdrop: Airdrop) => Promise<any[]>;
}

export const useAiStrategyStore = create<AiStrategyState>()(
  persist(
    (set, get) => ({
      // Initial state
      savedAiStrategies: [],
      isLoading: false,

      // Actions
      setSavedAiStrategies: (strategies) => set({ savedAiStrategies: strategies }),

      addSavedAiStrategy: async (strategy) => {
        set({ isLoading: true });
        try {
          const newSavedStrategy = await apiService.createAiStrategy(strategy);
          set((state) => ({
            savedAiStrategies: [...state.savedAiStrategies, newSavedStrategy],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteSavedAiStrategy: async (strategyId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteAiStrategy(strategyId);
          set((state) => ({
            savedAiStrategies: state.savedAiStrategies.filter((sas) => sas.id !== strategyId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchAiStrategies: async () => {
        set({ isLoading: true });
        try {
          const strategies = await apiService.getAiStrategies();
          set({ savedAiStrategies: strategies || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      generateAITaskSuggestions: async (airdrop: Airdrop) => {
        // Mock implementation for now
        return [
          {
            description: `Complete basic interaction with ${airdrop.projectName}`,
            estimatedTimeMinutes: 30,
            estimatedCost: '$5-10',
            priority: 'high' as const,
            reasoning: 'Essential for eligibility',
            category: 'Core Interaction'
          },
          {
            description: `Join ${airdrop.projectName} community channels`,
            estimatedTimeMinutes: 15,
            estimatedCost: '$0',
            priority: 'medium' as const,
            reasoning: 'Community engagement often required',
            category: 'Social'
          },
          {
            description: `Research ${airdrop.projectName} tokenomics and roadmap`,
            estimatedTimeMinutes: 45,
            estimatedCost: '$0',
            priority: 'low' as const,
            reasoning: 'Understanding the project helps with long-term strategy',
            category: 'Research'
          }
        ];
      },
    }),
    {
      name: 'ai-strategy-storage',
      partialize: (state) => ({ savedAiStrategies: state.savedAiStrategies }),
    }
  )
); 