import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { Airdrop, AirdropTask, ManualTransaction, ClaimedTokenLog, SybilChecklistItem, RoadmapEvent } from '../types';

interface AirdropState {
  // State
  airdrops: Airdrop[];
  isLoading: boolean;

  // Actions
  setAirdrops: (airdrops: Airdrop[]) => void;
  addAirdrop: (airdrop: Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'tags' | 'isArchived' | 'timeSpentHours' | 'roadmapEvents' | 'dependentOnAirdropIds' | 'leadsToAirdropIds' | 'logoBase64' | 'customFields' | 'dateAdded' | 'notificationOverrides'>) => Promise<Airdrop | null>;
  updateAirdrop: (airdrop: Airdrop) => Promise<void>;
  deleteAirdrop: (airdropId: string) => Promise<void>;
  batchUpdateAirdrops: (airdropIds: string[], updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain' | 'isArchived'>>) => Promise<void>;
  batchAddNotesToAirdrops: (airdropIds: string[], notesToAppend: string) => Promise<void>;
  clearArchivedAirdrops: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;

  // Tasks
  addAirdropTask: (airdropId: string, task: Omit<AirdropTask, 'id' | 'subTasks' | 'completionDate'>) => Promise<void>;
  updateAirdropTask: (airdropId: string, task: AirdropTask) => Promise<void>;
  updateMultipleAirdropTasks: (airdropId: string, taskIds: string[], updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>>) => Promise<void>;
  deleteAirdropTask: (airdropId: string, taskId: string, parentId?: string) => Promise<void>;
  completeNextAirdropTask: (airdropId: string) => Promise<void>;
  completeAllSubTasks: (airdropId: string, parentTaskId: string) => Promise<void>;

  // Transactions
  addTransactionToAirdrop: (airdropId: string, transaction: Omit<ManualTransaction, 'id' | 'airdropsId'>) => Promise<void>;
  deleteTransactionFromAirdrop: (airdropId: string, transactionId: string) => Promise<void>;

  // Claimed Tokens
  addClaimedTokenLog: (airdropId: string, log: Omit<ClaimedTokenLog, 'id' | 'currentMarketPricePerToken'>) => Promise<void>;
  updateClaimedTokenLog: (airdropId: string, log: ClaimedTokenLog) => Promise<void>;
  deleteClaimedTokenLog: (airdropId: string, logId: string) => Promise<void>;

  // Sybil Checklist
  updateAirdropSybilItem: (airdropId: string, item: SybilChecklistItem) => Promise<void>;

  // Roadmap Events
  addRoadmapEvent: (airdropId: string, event: Omit<RoadmapEvent, 'id'>) => Promise<void>;
  updateRoadmapEvent: (airdropId: string, event: RoadmapEvent) => Promise<void>;
  deleteRoadmapEvent: (airdropId: string, eventId: string) => Promise<void>;

  // Utility functions
  fetchAirdrops: () => Promise<void>;
  exportAirdropsToCSV: () => void;
  scrapeAirdropDataFromURL: (url: string) => Promise<Partial<Airdrop> | null>;
}

export const useAirdropStore = create<AirdropState>()(
  persist(
    (set, get) => ({
      // Initial state
      airdrops: [],
      isLoading: false,

      // Actions
      setAirdrops: (airdrops) => set({ airdrops }),

      addAirdrop: async (airdrop) => {
        set({ isLoading: true });
        try {
          const newAirdrop = await apiService.createAirdrop(airdrop);
          set((state) => ({
            airdrops: [...state.airdrops, newAirdrop],
            isLoading: false,
          }));
          return newAirdrop;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateAirdrop: async (airdrop) => {
        set({ isLoading: true });
        try {
          const updatedAirdrop = await apiService.updateAirdrop(airdrop);
          set((state) => ({
            airdrops: state.airdrops.map((a) => (a.id === updatedAirdrop.id ? updatedAirdrop : a)),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteAirdrop: async (airdropId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteAirdrop(airdropId);
          set((state) => ({
            airdrops: state.airdrops.filter((a) => a.id !== airdropId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      batchUpdateAirdrops: async (airdropIds, updates) => {
        set({ isLoading: true });
        try {
          await apiService.batchUpdateAirdrops(airdropIds, updates);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              airdropIds.includes(a.id) ? { ...a, ...updates } : a
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      batchAddNotesToAirdrops: async (airdropIds, notesToAppend) => {
        try {
          await apiService.batchAddNotesToAirdrops(airdropIds, notesToAppend);
          set((state) => ({
            airdrops: state.airdrops.map((a) => {
              if (airdropIds.includes(a.id)) {
                return {
                  ...a,
                  notes: `${a.notes || ''}\n\n--- Appended Note (${new Date().toLocaleDateString()}) ---\n${notesToAppend}`.trim(),
                };
              }
              return a;
            }),
          }));
        } catch (error) {
          throw error;
        }
      },

      clearArchivedAirdrops: async () => {
        try {
          await apiService.clearArchivedAirdrops();
          set((state) => ({
            airdrops: state.airdrops.filter((a) => !a.isArchived),
          }));
        } catch (error) {
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      // Tasks
      addAirdropTask: async (airdropId, task) => {
        try {
          const newTask = await apiService.createAirdropTask(airdropId, task);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? { ...a, tasks: [...a.tasks, newTask] }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      updateAirdropTask: async (airdropId, task) => {
        try {
          const updatedTask = await apiService.updateAirdropTask(airdropId, task);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? {
                    ...a,
                    tasks: a.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
                  }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      updateMultipleAirdropTasks: async (airdropId, taskIds, updates) => {
        try {
          await apiService.updateMultipleAirdropTasks(airdropId, taskIds, updates);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? {
                    ...a,
                    tasks: a.tasks.map((t) =>
                      taskIds.includes(t.id) ? { ...t, ...updates } : t
                    ),
                  }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteAirdropTask: async (airdropId, taskId, parentId) => {
        try {
          await apiService.deleteAirdropTask(airdropId, taskId, parentId);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? {
                    ...a,
                    tasks: a.tasks.filter((t) => t.id !== taskId),
                  }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      completeNextAirdropTask: async (airdropId) => {
        try {
          await apiService.completeNextAirdropTask(airdropId);
          // Refresh airdrops to get updated task status
          await get().fetchAirdrops();
        } catch (error) {
          throw error;
        }
      },

      completeAllSubTasks: async (airdropId, parentTaskId) => {
        try {
          await apiService.completeAllSubTasks(airdropId, parentTaskId);
          // Refresh airdrops to get updated task status
          await get().fetchAirdrops();
        } catch (error) {
          throw error;
        }
      },

      // Transactions
      addTransactionToAirdrop: async (airdropId, transaction) => {
        try {
          const newTransaction = await apiService.createTransaction(airdropId, transaction);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? { ...a, transactions: [...a.transactions, newTransaction] }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteTransactionFromAirdrop: async (airdropId, transactionId) => {
        try {
          await apiService.deleteTransaction(airdropId, transactionId);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? { ...a, transactions: a.transactions.filter((t) => t.id !== transactionId) }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      // Claimed Tokens
      addClaimedTokenLog: async (airdropId, log) => {
        try {
          const newLog = await apiService.createClaimedTokenLog(airdropId, log);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? { ...a, claimedTokens: [...a.claimedTokens, newLog] }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      updateClaimedTokenLog: async (airdropId, log) => {
        try {
          const updatedLog = await apiService.updateClaimedTokenLog(airdropId, log);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? {
                    ...a,
                    claimedTokens: a.claimedTokens.map((cl) =>
                      cl.id === updatedLog.id ? updatedLog : cl
                    ),
                  }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteClaimedTokenLog: async (airdropId, logId) => {
        try {
          await apiService.deleteClaimedTokenLog(airdropId, logId);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? { ...a, claimedTokens: a.claimedTokens.filter((cl) => cl.id !== logId) }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      // Sybil Checklist
      updateAirdropSybilItem: async (airdropId, item) => {
        try {
          const updatedItem = await apiService.updateSybilItem(airdropId, item);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? {
                    ...a,
                    sybilChecklist: a.sybilChecklist.map((si) =>
                      si.id === updatedItem.id ? updatedItem : si
                    ),
                  }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      // Roadmap Events
      addRoadmapEvent: async (airdropId, event) => {
        try {
          const newEvent = await apiService.createRoadmapEvent(airdropId, event);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? { ...a, roadmapEvents: [...(a.roadmapEvents || []), newEvent] }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      updateRoadmapEvent: async (airdropId, event) => {
        try {
          const updatedEvent = await apiService.updateRoadmapEvent(airdropId, event);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? {
                    ...a,
                    roadmapEvents: (a.roadmapEvents || []).map((re) =>
                      re.id === updatedEvent.id ? updatedEvent : re
                    ),
                  }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteRoadmapEvent: async (airdropId, eventId) => {
        try {
          await apiService.deleteRoadmapEvent(airdropId, eventId);
          set((state) => ({
            airdrops: state.airdrops.map((a) =>
              a.id === airdropId
                ? { ...a, roadmapEvents: (a.roadmapEvents || []).filter((re) => re.id !== eventId) }
                : a
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      // Utility functions
      fetchAirdrops: async () => {
        set({ isLoading: true });
        try {
          const airdrops = await apiService.getAirdrops();
          set({ airdrops: airdrops || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      exportAirdropsToCSV: () => {
        // Implementation for CSV export
        const { airdrops } = get();
        // CSV export logic here
        console.log('Exporting airdrops to CSV:', airdrops);
      },

      scrapeAirdropDataFromURL: async (url) => {
        set({ isLoading: true });
        try {
          const data = await apiService.scrapeAirdropDataFromURL(url);
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'airdrop-storage',
      partialize: (state) => ({ airdrops: state.airdrops }),
    }
  )
); 