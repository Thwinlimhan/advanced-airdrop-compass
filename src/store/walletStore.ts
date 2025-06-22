import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { walletService } from '../../services/dataService';
import { 
  Wallet, 
  GasLogEntry, 
  InteractionLogEntry, 
  NftLogEntry, 
  TransactionHistoryEntry 
} from '../../types';

interface WalletState {
  // State
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWallets: () => Promise<void>;
  createWallet: (wallet: Omit<Wallet, 'id' | 'balanceSnapshots' | 'gasLogs' | 'interactionLogs' | 'nftPortfolio' | 'isArchived' | 'transactionHistory'>) => Promise<void>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  batchUpdateWallets: (walletIds: string[], updates: Partial<Pick<Wallet, 'isArchived' | 'group'>>) => Promise<void>;
  
  // Gas Logs
  addGasLog: (walletId: string, logEntry: Omit<GasLogEntry, 'id'>) => Promise<void>;
  deleteGasLog: (walletId: string, logId: string) => Promise<void>;
  
  // Interaction Logs
  addInteractionLog: (walletId: string, logEntry: Omit<InteractionLogEntry, 'id'>) => Promise<void>;
  deleteInteractionLog: (walletId: string, logId: string) => Promise<void>;
  
  // NFT Portfolio
  addNftToPortfolio: (walletId: string, nftEntry: Omit<NftLogEntry, 'id'>) => Promise<void>;
  updateNftInPortfolio: (walletId: string, nftEntry: NftLogEntry) => Promise<void>;
  deleteNftFromPortfolio: (walletId: string, nftId: string) => Promise<void>;
  
  // Transaction History
  fetchTransactionHistory: (walletId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
  getRecentWalletLogs: (limitPerWalletType?: number) => { gasLogs: GasLogEntry[], interactionLogs: InteractionLogEntry[] };
}

export const useWalletStore = create<WalletState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        wallets: [],
        isLoading: false,
        error: null,

        // Actions
        fetchWallets: async () => {
          set({ isLoading: true, error: null });
          try {
            const wallets = await walletService.fetchWallets();
            set({ wallets, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch wallets'
            });
          }
        },

        createWallet: async (wallet) => {
          set({ isLoading: true, error: null });
          try {
            const newWallet = await walletService.createWallet(wallet);
            set(state => ({
              wallets: [...state.wallets, newWallet],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create wallet'
            });
          }
        },

        updateWallet: async (wallet) => {
          set({ isLoading: true, error: null });
          try {
            const updatedWallet = await walletService.updateWallet(wallet);
            set(state => ({
              wallets: state.wallets.map(w => w.id === wallet.id ? updatedWallet : w),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update wallet'
            });
          }
        },

        deleteWallet: async (walletId) => {
          set({ isLoading: true, error: null });
          try {
            await walletService.deleteWallet(walletId);
            set(state => ({
              wallets: state.wallets.filter(w => w.id !== walletId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete wallet'
            });
          }
        },

        batchUpdateWallets: async (walletIds, updates) => {
          set({ isLoading: true, error: null });
          try {
            await walletService.batchUpdateWallets(walletIds, updates);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                walletIds.includes(wallet.id) 
                  ? { ...wallet, ...updates }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to batch update wallets'
            });
          }
        },

        // Gas Logs
        addGasLog: async (walletId, logEntry) => {
          set({ isLoading: true, error: null });
          try {
            const newLog = await walletService.addGasLog(walletId, logEntry);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                wallet.id === walletId 
                  ? { ...wallet, gasLogs: [...(wallet.gasLogs || []), newLog] }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to add gas log'
            });
          }
        },

        deleteGasLog: async (walletId, logId) => {
          set({ isLoading: true, error: null });
          try {
            await walletService.deleteGasLog(walletId, logId);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                wallet.id === walletId 
                  ? { ...wallet, gasLogs: wallet.gasLogs?.filter(log => log.id !== logId) || [] }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete gas log'
            });
          }
        },

        // Interaction Logs
        addInteractionLog: async (walletId, logEntry) => {
          set({ isLoading: true, error: null });
          try {
            const newLog = await walletService.addInteractionLog(walletId, logEntry);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                wallet.id === walletId 
                  ? { ...wallet, interactionLogs: [...(wallet.interactionLogs || []), newLog] }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to add interaction log'
            });
          }
        },

        deleteInteractionLog: async (walletId, logId) => {
          set({ isLoading: true, error: null });
          try {
            await walletService.deleteInteractionLog(walletId, logId);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                wallet.id === walletId 
                  ? { ...wallet, interactionLogs: wallet.interactionLogs?.filter(log => log.id !== logId) || [] }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete interaction log'
            });
          }
        },

        // NFT Portfolio
        addNftToPortfolio: async (walletId, nftEntry) => {
          set({ isLoading: true, error: null });
          try {
            const newNft = await walletService.addNftToPortfolio(walletId, nftEntry);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                wallet.id === walletId 
                  ? { ...wallet, nftPortfolio: [...(wallet.nftPortfolio || []), newNft] }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to add NFT to portfolio'
            });
          }
        },

        updateNftInPortfolio: async (walletId, nftEntry) => {
          set({ isLoading: true, error: null });
          try {
            const updatedNft = await walletService.updateNftInPortfolio(walletId, nftEntry);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                wallet.id === walletId 
                  ? { 
                      ...wallet, 
                      nftPortfolio: wallet.nftPortfolio?.map(nft => 
                        nft.id === nftEntry.id ? updatedNft : nft
                      ) || []
                    }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update NFT in portfolio'
            });
          }
        },

        deleteNftFromPortfolio: async (walletId, nftId) => {
          set({ isLoading: true, error: null });
          try {
            await walletService.deleteNftFromPortfolio(walletId, nftId);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                wallet.id === walletId 
                  ? { ...wallet, nftPortfolio: wallet.nftPortfolio?.filter(nft => nft.id !== nftId) || [] }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete NFT from portfolio'
            });
          }
        },

        // Transaction History
        fetchTransactionHistory: async (walletId) => {
          set({ isLoading: true, error: null });
          try {
            const transactionHistory = await walletService.fetchTransactionHistory(walletId);
            set(state => ({
              wallets: state.wallets.map(wallet => 
                wallet.id === walletId 
                  ? { ...wallet, transactionHistory }
                  : wallet
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch transaction history'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        },

        getRecentWalletLogs: (limitPerWalletType = 5) => {
          const { wallets } = get();
          const gasLogs: GasLogEntry[] = [];
          const interactionLogs: InteractionLogEntry[] = [];

          wallets.forEach(wallet => {
            // Add recent gas logs
            if (wallet.gasLogs) {
              const recentGasLogs = wallet.gasLogs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, limitPerWalletType)
                .map(log => ({
                  ...log,
                  walletName: wallet.name,
                  walletId: wallet.id
                }));
              gasLogs.push(...recentGasLogs);
            }

            // Add recent interaction logs
            if (wallet.interactionLogs) {
              const recentInteractionLogs = wallet.interactionLogs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, limitPerWalletType)
                .map(log => ({
                  ...log,
                  walletName: wallet.name,
                  walletId: wallet.id
                }));
              interactionLogs.push(...recentInteractionLogs);
            }
          });

          return {
            gasLogs: gasLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            interactionLogs: interactionLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          };
        }
      }),
      {
        name: 'wallet-storage',
        partialize: (state) => ({
          wallets: state.wallets
        })
      }
    ),
    {
      name: 'wallet-store'
    }
  )
); 