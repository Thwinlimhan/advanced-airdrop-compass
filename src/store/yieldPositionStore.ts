import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { yieldPositionService } from '../../services/dataService';
import { YieldPosition } from '../../types';

interface YieldPositionState {
  // State
  yieldPositions: YieldPosition[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchYieldPositions: () => Promise<void>;
  createYieldPosition: (position: Omit<YieldPosition, 'id'>) => Promise<void>;
  updateYieldPosition: (position: YieldPosition) => Promise<void>;
  deleteYieldPosition: (positionId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useYieldPositionStore = create<YieldPositionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        yieldPositions: [],
        isLoading: false,
        error: null,

        // Actions
        fetchYieldPositions: async () => {
          set({ isLoading: true, error: null });
          try {
            const yieldPositions = await yieldPositionService.fetchYieldPositions();
            set({ yieldPositions, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch yield positions'
            });
          }
        },

        createYieldPosition: async (position) => {
          set({ isLoading: true, error: null });
          try {
            const newPosition = await yieldPositionService.createYieldPosition(position);
            set(state => ({
              yieldPositions: [...state.yieldPositions, newPosition],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create yield position'
            });
          }
        },

        updateYieldPosition: async (position) => {
          set({ isLoading: true, error: null });
          try {
            const updatedPosition = await yieldPositionService.updateYieldPosition(position);
            set(state => ({
              yieldPositions: state.yieldPositions.map(p => p.id === position.id ? updatedPosition : p),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update yield position'
            });
          }
        },

        deleteYieldPosition: async (positionId) => {
          set({ isLoading: true, error: null });
          try {
            await yieldPositionService.deleteYieldPosition(positionId);
            set(state => ({
              yieldPositions: state.yieldPositions.filter(p => p.id !== positionId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete yield position'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'yield-position-storage',
        partialize: (state) => ({
          yieldPositions: state.yieldPositions
        })
      }
    ),
    {
      name: 'yield-position-store'
    }
  )
); 