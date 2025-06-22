import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // State
  isSidebarOpen: boolean;
  isLoading: {
    wallets: boolean;
    airdrops: boolean;
    recurringTasks: boolean;
  };

  // Actions
  toggleSidebar: () => void;
  setIsSidebarOpen: (open: boolean) => void;
  setIsLoading: (key: keyof UIState['isLoading'], loading: boolean) => void;
  setAllLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isSidebarOpen: true,
      isLoading: {
        wallets: false,
        airdrops: false,
        recurringTasks: false,
      },

      // Actions
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),

      setIsLoading: (key, loading) =>
        set((state) => ({
          isLoading: { ...state.isLoading, [key]: loading },
        })),

      setAllLoading: (loading) =>
        set({
          isLoading: {
            wallets: loading,
            airdrops: loading,
            recurringTasks: loading,
          },
        }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ isSidebarOpen: state.isSidebarOpen }),
    }
  )
); 