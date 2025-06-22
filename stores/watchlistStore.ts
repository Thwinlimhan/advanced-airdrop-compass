import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { WatchlistItem, Airdrop } from '../types';

interface WatchlistState {
  // State
  watchlist: WatchlistItem[];
  isLoading: boolean;

  // Actions
  setWatchlist: (items: WatchlistItem[]) => void;
  addWatchlistItem: (item: Omit<WatchlistItem, 'id' | 'addedDate'>) => Promise<void>;
  updateWatchlistItem: (item: WatchlistItem) => Promise<void>;
  deleteWatchlistItem: (itemId: string) => Promise<void>;
  promoteWatchlistItemToAirdrop: (itemId: string) => Promise<Airdrop | null>;
  setIsLoading: (loading: boolean) => void;
  fetchWatchlist: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      // Initial state
      watchlist: [],
      isLoading: false,

      // Actions
      setWatchlist: (items) => set({ watchlist: items }),

      addWatchlistItem: async (item) => {
        set({ isLoading: true });
        try {
          const newItem = await apiService.createWatchlistItem(item);
          set((state) => ({
            watchlist: [...state.watchlist, newItem],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateWatchlistItem: async (item) => {
        set({ isLoading: true });
        try {
          const updatedItem = await apiService.updateWatchlistItem(item);
          set((state) => ({
            watchlist: state.watchlist.map((wi) =>
              wi.id === updatedItem.id ? updatedItem : wi
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteWatchlistItem: async (itemId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteWatchlistItem(itemId);
          set((state) => ({
            watchlist: state.watchlist.filter((wi) => wi.id !== itemId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      promoteWatchlistItemToAirdrop: async (itemId) => {
        try {
          const newAirdrop = await apiService.promoteWatchlistItemToAirdrop(itemId);
          if (newAirdrop) {
            // Remove from watchlist and add to airdrops
            set((state) => ({
              watchlist: state.watchlist.filter((wi) => wi.id !== itemId),
            }));
            return newAirdrop;
          }
          return null;
        } catch (error) {
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchWatchlist: async () => {
        set({ isLoading: true });
        try {
          const items = await apiService.getWatchlist();
          set({ watchlist: items || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'watchlist-storage',
      partialize: (state) => ({ watchlist: state.watchlist }),
    }
  )
); 