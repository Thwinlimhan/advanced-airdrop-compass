import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { Wallet, GasLogEntry, InteractionLogEntry, NftLogEntry } from '../types';

interface WalletState {
  // State
  wallets: Wallet[];
  isLoading: boolean;

  // Actions
  setWallets: (wallets: Wallet[]) => void;
  addWallet: (wallet: Omit<Wallet, 'id' | 'balanceSnapshots' | 'gasLogs' | 'interactionLogs' | 'nftPortfolio' | 'isArchived' | 'transactionHistory'>) => Promise<void>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  batchUpdateWallets: (walletIds: string[], updates: Partial<Pick<Wallet, 'isArchived' | 'group'>>) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  
  // Gas Logs
  addGasLogToWallet: (walletId: string, logEntry: Omit<GasLogEntry, 'id'>) => Promise<void>;
  deleteGasLogFromWallet: (walletId: string, logId: string) => Promise<void>;
  
  // Interaction Logs
  addInteractionLogToWallet: (walletId: string, logEntry: Omit<InteractionLogEntry, 'id'>) => Promise<void>;
  deleteInteractionLogFromWallet: (walletId: string, logId: string) => Promise<void>;
  
  // NFT Portfolio
  addNftToWalletPortfolio: (walletId: string, nftEntry: Omit<NftLogEntry, 'id'>) => Promise<void>;
  updateNftInWalletPortfolio: (walletId: string, nftEntry: NftLogEntry) => Promise<void>;
  deleteNftFromWalletPortfolio: (walletId: string, nftId: string) => Promise<void>;
  
  // Utility functions
  getRecentWalletLogs: (limitPerWalletType?: number) => { gasLogs: GasLogEntry[], interactionLogs: InteractionLogEntry[] };
  fetchWallets: () => Promise<void>;
  fetchWalletBalances: (walletId: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      wallets: [],
      isLoading: false,

      // Actions
      setWallets: (wallets) => set({ wallets }),

      addWallet: async (wallet) => {
        set({ isLoading: true });
        try {
          const newWallet = await apiService.createWallet(wallet);
          set((state) => ({
            wallets: [...state.wallets, newWallet],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateWallet: async (wallet) => {
        set({ isLoading: true });
        try {
          const updatedWallet = await apiService.updateWallet(wallet);
          set((state) => ({
            wallets: state.wallets.map((w) => (w.id === updatedWallet.id ? updatedWallet : w)),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteWallet: async (walletId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteWallet(walletId);
          set((state) => ({
            wallets: state.wallets.filter((w) => w.id !== walletId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      batchUpdateWallets: async (walletIds, updates) => {
        set({ isLoading: true });
        try {
          await apiService.batchUpdateWallets(walletIds, updates);
          set((state) => ({
            wallets: state.wallets.map((w) =>
              walletIds.includes(w.id) ? { ...w, ...updates } : w
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      // Gas Logs
      addGasLogToWallet: async (walletId, logEntry) => {
        try {
          const newLog = await apiService.createGasLog(walletId, logEntry);
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? { ...w, gasLogs: [...(w.gasLogs || []), newLog] }
                : w
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteGasLogFromWallet: async (walletId, logId) => {
        try {
          await apiService.deleteGasLog(walletId, logId);
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? { ...w, gasLogs: (w.gasLogs || []).filter((l) => l.id !== logId) }
                : w
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      // Interaction Logs
      addInteractionLogToWallet: async (walletId, logEntry) => {
        try {
          const newLog = await apiService.createInteractionLog(walletId, logEntry);
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? { ...w, interactionLogs: [...(w.interactionLogs || []), newLog] }
                : w
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteInteractionLogFromWallet: async (walletId, logId) => {
        try {
          await apiService.deleteInteractionLog(walletId, logId);
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? { ...w, interactionLogs: (w.interactionLogs || []).filter((l) => l.id !== logId) }
                : w
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      // NFT Portfolio
      addNftToWalletPortfolio: async (walletId, nftEntry) => {
        try {
          const newNft = await apiService.createNft(walletId, nftEntry);
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? { ...w, nftPortfolio: [...(w.nftPortfolio || []), newNft] }
                : w
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      updateNftInWalletPortfolio: async (walletId, nftEntry) => {
        try {
          const updatedNft = await apiService.updateNft(walletId, nftEntry);
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? {
                    ...w,
                    nftPortfolio: (w.nftPortfolio || []).map((n) =>
                      n.id === updatedNft.id ? updatedNft : n
                    ),
                  }
                : w
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteNftFromWalletPortfolio: async (walletId, nftId) => {
        try {
          await apiService.deleteNft(walletId, nftId);
          set((state) => ({
            wallets: state.wallets.map((w) =>
              w.id === walletId
                ? { ...w, nftPortfolio: (w.nftPortfolio || []).filter((n) => n.id !== nftId) }
                : w
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      // Utility functions
      getRecentWalletLogs: (limitPerWalletType = 5) => {
        const { wallets } = get();
        let allGasLogs: GasLogEntry[] = [];
        let allInteractionLogs: InteractionLogEntry[] = [];

        wallets.forEach((wallet) => {
          if (wallet.gasLogs) {
            allGasLogs.push(
              ...wallet.gasLogs.map((log) => ({
                ...log,
                walletName: wallet.name,
                walletId: wallet.id,
              }))
            );
          }
          if (wallet.interactionLogs) {
            allInteractionLogs.push(
              ...wallet.interactionLogs.map((log) => ({
                ...log,
                walletName: wallet.name,
                walletId: wallet.id,
              }))
            );
          }
        });

        allGasLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        allInteractionLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
          gasLogs: allGasLogs.slice(0, limitPerWalletType),
          interactionLogs: allInteractionLogs.slice(0, limitPerWalletType),
        };
      },

      fetchWallets: async () => {
        set({ isLoading: true });
        try {
          const wallets = await apiService.getWallets();
          set({ wallets: wallets || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      fetchWalletBalances: async (walletId: string) => {
        try {
          // This is a placeholder implementation
          // In a real app, this would fetch current balances from blockchain APIs
          console.log(`Fetching balances for wallet ${walletId}`);
        } catch (error) {
          console.error('Failed to fetch wallet balances:', error);
          throw error;
        }
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ wallets: state.wallets }),
    }
  )
); 