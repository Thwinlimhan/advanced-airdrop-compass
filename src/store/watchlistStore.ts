import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { watchlistService } from '../../services/dataService';
import { WatchlistItem, Airdrop } from '../../types';

interface WatchlistState {
  // State
  watchlist: WatchlistItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWatchlist: () => Promise<void>;
  createWatchlistItem: (item: Omit<WatchlistItem, 'id' | 'addedDate'>) => Promise<void>;
  updateWatchlistItem: (item: WatchlistItem) => Promise<void>;
  deleteWatchlistItem: (itemId: string) => Promise<void>;
  promoteToAirdrop: (itemId: string) => Promise<Airdrop | null>;
  
  // Utility
  clearError: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        watchlist: [],
        isLoading: false,
        error: null,

        // Actions
        fetchWatchlist: async () => {
          set({ isLoading: true, error: null });
          try {
            const watchlist = await watchlistService.fetchWatchlist();
            set({ watchlist, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch watchlist'
            });
          }
        },

        createWatchlistItem: async (item) => {
          set({ isLoading: true, error: null });
          try {
            const newItem = await watchlistService.createWatchlistItem(item);
            set(state => ({
              watchlist: [...state.watchlist, newItem],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create watchlist item'
            });
          }
        },

        updateWatchlistItem: async (item) => {
          set({ isLoading: true, error: null });
          try {
            const updatedItem = await watchlistService.updateWatchlistItem(item);
            set(state => ({
              watchlist: state.watchlist.map(w => w.id === item.id ? updatedItem : w),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update watchlist item'
            });
          }
        },

        deleteWatchlistItem: async (itemId) => {
          set({ isLoading: true, error: null });
          try {
            await watchlistService.deleteWatchlistItem(itemId);
            set(state => ({
              watchlist: state.watchlist.filter(w => w.id !== itemId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete watchlist item'
            });
          }
        },

        promoteToAirdrop: async (itemId) => {
          set({ isLoading: true, error: null });
          try {
            const airdrop = await watchlistService.promoteToAirdrop(itemId);
            // Remove the item from watchlist after promotion
            set(state => ({
              watchlist: state.watchlist.filter(w => w.id !== itemId),
              isLoading: false
            }));
            return airdrop;
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to promote watchlist item to airdrop'
            });
            return null;
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'watchlist-storage',
        partialize: (state) => ({
          watchlist: state.watchlist
        })
      }
    ),
    {
      name: 'watchlist-store'
    }
  )
); 