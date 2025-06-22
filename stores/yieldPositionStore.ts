import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { YieldPosition } from '../types';

interface YieldPositionState {
  // State
  yieldPositions: YieldPosition[];
  isLoading: boolean;

  // Actions
  setYieldPositions: (positions: YieldPosition[]) => void;
  addYieldPosition: (position: Omit<YieldPosition, 'id'>) => Promise<void>;
  updateYieldPosition: (position: YieldPosition) => Promise<void>;
  deleteYieldPosition: (positionId: string) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  fetchYieldPositions: () => Promise<void>;
}

export const useYieldPositionStore = create<YieldPositionState>()(
  persist(
    (set, get) => ({
      // Initial state
      yieldPositions: [],
      isLoading: false,

      // Actions
      setYieldPositions: (positions) => set({ yieldPositions: positions }),

      addYieldPosition: async (position) => {
        set({ isLoading: true });
        try {
          const newPosition = await apiService.createYieldPosition(position);
          set((state) => ({
            yieldPositions: [...state.yieldPositions, newPosition],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateYieldPosition: async (position) => {
        set({ isLoading: true });
        try {
          const updatedPosition = await apiService.updateYieldPosition(position);
          set((state) => ({
            yieldPositions: state.yieldPositions.map((yp) =>
              yp.id === updatedPosition.id ? updatedPosition : yp
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteYieldPosition: async (positionId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteYieldPosition(positionId);
          set((state) => ({
            yieldPositions: state.yieldPositions.filter((yp) => yp.id !== positionId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchYieldPositions: async () => {
        set({ isLoading: true });
        try {
          const positions = await apiService.getYieldPositions();
          set({ yieldPositions: positions || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'yield-position-storage',
      partialize: (state) => ({ yieldPositions: state.yieldPositions }),
    }
  )
); 