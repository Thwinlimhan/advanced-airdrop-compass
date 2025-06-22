import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { airdropService } from '../../services/dataService';
import { 
  Airdrop, 
  AirdropTask, 
  ManualTransaction, 
  ClaimedTokenLog, 
  SybilChecklistItem, 
  RoadmapEvent 
} from '../../types';

interface AirdropState {
  // State
  airdrops: Airdrop[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAirdrops: () => Promise<void>;
  createAirdrop: (airdrop: Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'tags' | 'isArchived' | 'timeSpentHours' | 'roadmapEvents' | 'dependentOnAirdropIds' | 'leadsToAirdropIds' | 'logoBase64' | 'customFields' | 'dateAdded' | 'notificationOverrides'>) => Promise<void>;
  updateAirdrop: (airdrop: Airdrop) => Promise<void>;
  deleteAirdrop: (airdropId: string) => Promise<void>;
  batchUpdateAirdrops: (airdropIds: string[], updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain' | 'isArchived'>>) => Promise<void>;
  batchAddNotesToAirdrops: (airdropIds: string[], notesToAppend: string) => Promise<void>;
  
  // Tasks
  addTask: (airdropId: string, task: Omit<AirdropTask, 'id' | 'subTasks' | 'completionDate'>) => Promise<void>;
  updateTask: (airdropId: string, task: AirdropTask) => Promise<void>;
  updateMultipleTasks: (airdropId: string, taskIds: string[], updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>>) => Promise<void>;
  deleteTask: (airdropId: string, taskId: string) => Promise<void>;
  
  // Transactions
  addTransaction: (airdropId: string, transaction: Omit<ManualTransaction, 'id' | 'airdropsId'>) => Promise<void>;
  deleteTransaction: (airdropId: string, transactionId: string) => Promise<void>;
  
  // Claimed Tokens
  addClaimedTokenLog: (airdropId: string, log: Omit<ClaimedTokenLog, 'id' | 'currentMarketPricePerToken'>) => Promise<void>;
  updateClaimedTokenLog: (airdropId: string, log: ClaimedTokenLog) => Promise<void>;
  deleteClaimedTokenLog: (airdropId: string, logId: string) => Promise<void>;
  
  // Sybil Checklist
  updateSybilItem: (airdropId: string, item: SybilChecklistItem) => Promise<void>;
  
  // Roadmap Events
  addRoadmapEvent: (airdropId: string, event: Omit<RoadmapEvent, 'id'>) => Promise<void>;
  updateRoadmapEvent: (airdropId: string, event: RoadmapEvent) => Promise<void>;
  deleteRoadmapEvent: (airdropId: string, eventId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useAirdropStore = create<AirdropState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        airdrops: [],
        isLoading: false,
        error: null,

        // Actions
        fetchAirdrops: async () => {
          set({ isLoading: true, error: null });
          try {
            const airdrops = await airdropService.fetchAirdrops();
            set({ airdrops, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch airdrops'
            });
          }
        },

        createAirdrop: async (airdrop) => {
          set({ isLoading: true, error: null });
          try {
            const newAirdrop = await airdropService.createAirdrop(airdrop);
            set(state => ({
              airdrops: [...state.airdrops, newAirdrop],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create airdrop'
            });
          }
        },

        updateAirdrop: async (airdrop) => {
          set({ isLoading: true, error: null });
          try {
            const updatedAirdrop = await airdropService.updateAirdrop(airdrop);
            set(state => ({
              airdrops: state.airdrops.map(a => a.id === airdrop.id ? updatedAirdrop : a),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update airdrop'
            });
          }
        },

        deleteAirdrop: async (airdropId) => {
          set({ isLoading: true, error: null });
          try {
            await airdropService.deleteAirdrop(airdropId);
            set(state => ({
              airdrops: state.airdrops.filter(a => a.id !== airdropId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete airdrop'
            });
          }
        },

        batchUpdateAirdrops: async (airdropIds, updates) => {
          set({ isLoading: true, error: null });
          try {
            await airdropService.batchUpdateAirdrops(airdropIds, updates);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdropIds.includes(airdrop.id) 
                  ? { ...airdrop, ...updates }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to batch update airdrops'
            });
          }
        },

        batchAddNotesToAirdrops: async (airdropIds, notesToAppend) => {
          set({ isLoading: true, error: null });
          try {
            await airdropService.batchAddNotesToAirdrops(airdropIds, notesToAppend);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdropIds.includes(airdrop.id) 
                  ? { ...airdrop, notes: (airdrop.notes || '') + '\n' + notesToAppend }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to batch add notes to airdrops'
            });
          }
        },

        // Tasks
        addTask: async (airdropId, task) => {
          set({ isLoading: true, error: null });
          try {
            const newTask = await airdropService.addTask(airdropId, task);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { ...airdrop, tasks: [...airdrop.tasks, newTask] }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to add task'
            });
          }
        },

        updateTask: async (airdropId, task) => {
          set({ isLoading: true, error: null });
          try {
            const updatedTask = await airdropService.updateTask(airdropId, task);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { 
                      ...airdrop, 
                      tasks: airdrop.tasks.map(t => t.id === task.id ? updatedTask : t)
                    }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update task'
            });
          }
        },

        updateMultipleTasks: async (airdropId, taskIds, updates) => {
          set({ isLoading: true, error: null });
          try {
            await airdropService.updateMultipleTasks(airdropId, taskIds, updates);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { 
                      ...airdrop, 
                      tasks: airdrop.tasks.map(task => 
                        taskIds.includes(task.id) 
                          ? { ...task, ...updates }
                          : task
                      )
                    }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update multiple tasks'
            });
          }
        },

        deleteTask: async (airdropId, taskId) => {
          set({ isLoading: true, error: null });
          try {
            await airdropService.deleteTask(airdropId, taskId);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { ...airdrop, tasks: airdrop.tasks.filter(t => t.id !== taskId) }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete task'
            });
          }
        },

        // Transactions
        addTransaction: async (airdropId, transaction) => {
          set({ isLoading: true, error: null });
          try {
            const newTransaction = await airdropService.addTransaction(airdropId, transaction);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { ...airdrop, transactions: [...airdrop.transactions, newTransaction] }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to add transaction'
            });
          }
        },

        deleteTransaction: async (airdropId, transactionId) => {
          set({ isLoading: true, error: null });
          try {
            await airdropService.deleteTransaction(airdropId, transactionId);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { ...airdrop, transactions: airdrop.transactions.filter(t => t.id !== transactionId) }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete transaction'
            });
          }
        },

        // Claimed Tokens
        addClaimedTokenLog: async (airdropId, log) => {
          set({ isLoading: true, error: null });
          try {
            const newLog = await airdropService.addClaimedTokenLog(airdropId, log);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { ...airdrop, claimedTokens: [...airdrop.claimedTokens, newLog] }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to add claimed token log'
            });
          }
        },

        updateClaimedTokenLog: async (airdropId, log) => {
          set({ isLoading: true, error: null });
          try {
            const updatedLog = await airdropService.updateClaimedTokenLog(airdropId, log);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { 
                      ...airdrop, 
                      claimedTokens: airdrop.claimedTokens.map(l => l.id === log.id ? updatedLog : l)
                    }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update claimed token log'
            });
          }
        },

        deleteClaimedTokenLog: async (airdropId, logId) => {
          set({ isLoading: true, error: null });
          try {
            await airdropService.deleteClaimedTokenLog(airdropId, logId);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { ...airdrop, claimedTokens: airdrop.claimedTokens.filter(l => l.id !== logId) }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete claimed token log'
            });
          }
        },

        // Sybil Checklist
        updateSybilItem: async (airdropId, item) => {
          set({ isLoading: true, error: null });
          try {
            const updatedItem = await airdropService.updateSybilItem(airdropId, item);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { 
                      ...airdrop, 
                      sybilChecklist: airdrop.sybilChecklist.map(i => i.id === item.id ? updatedItem : i)
                    }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update sybil item'
            });
          }
        },

        // Roadmap Events
        addRoadmapEvent: async (airdropId, event) => {
          set({ isLoading: true, error: null });
          try {
            const newEvent = await airdropService.addRoadmapEvent(airdropId, event);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { ...airdrop, roadmapEvents: [...(airdrop.roadmapEvents || []), newEvent] }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to add roadmap event'
            });
          }
        },

        updateRoadmapEvent: async (airdropId, event) => {
          set({ isLoading: true, error: null });
          try {
            const updatedEvent = await airdropService.updateRoadmapEvent(airdropId, event);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { 
                      ...airdrop, 
                      roadmapEvents: airdrop.roadmapEvents?.map(e => e.id === event.id ? updatedEvent : e) || []
                    }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update roadmap event'
            });
          }
        },

        deleteRoadmapEvent: async (airdropId, eventId) => {
          set({ isLoading: true, error: null });
          try {
            await airdropService.deleteRoadmapEvent(airdropId, eventId);
            set(state => ({
              airdrops: state.airdrops.map(airdrop => 
                airdrop.id === airdropId 
                  ? { ...airdrop, roadmapEvents: airdrop.roadmapEvents?.filter(e => e.id !== eventId) || [] }
                  : airdrop
              ),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete roadmap event'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'airdrop-storage',
        partialize: (state) => ({
          airdrops: state.airdrops
        })
      }
    ),
    {
      name: 'airdrop-store'
    }
  )
); 