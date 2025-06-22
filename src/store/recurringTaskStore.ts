import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { recurringTaskService } from '../../services/dataService';
import { RecurringTask } from '../../types';

interface RecurringTaskState {
  // State
  recurringTasks: RecurringTask[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchRecurringTasks: () => Promise<void>;
  createRecurringTask: (task: Omit<RecurringTask, 'id' | 'completionHistory' | 'notes' | 'tags'>) => Promise<void>;
  updateRecurringTask: (task: RecurringTask) => Promise<void>;
  deleteRecurringTask: (taskId: string) => Promise<void>;
  completeRecurringTask: (taskId: string) => Promise<void>;
  snoozeRecurringTask: (taskId: string, daysToSnooze: number) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useRecurringTaskStore = create<RecurringTaskState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        recurringTasks: [],
        isLoading: false,
        error: null,

        // Actions
        fetchRecurringTasks: async () => {
          set({ isLoading: true, error: null });
          try {
            const recurringTasks = await recurringTaskService.fetchRecurringTasks();
            set({ recurringTasks, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch recurring tasks'
            });
          }
        },

        createRecurringTask: async (task) => {
          set({ isLoading: true, error: null });
          try {
            const newTask = await recurringTaskService.createRecurringTask(task);
            set(state => ({
              recurringTasks: [...state.recurringTasks, newTask],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create recurring task'
            });
          }
        },

        updateRecurringTask: async (task) => {
          set({ isLoading: true, error: null });
          try {
            const updatedTask = await recurringTaskService.updateRecurringTask(task);
            set(state => ({
              recurringTasks: state.recurringTasks.map(t => t.id === task.id ? updatedTask : t),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update recurring task'
            });
          }
        },

        deleteRecurringTask: async (taskId) => {
          set({ isLoading: true, error: null });
          try {
            await recurringTaskService.deleteRecurringTask(taskId);
            set(state => ({
              recurringTasks: state.recurringTasks.filter(t => t.id !== taskId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete recurring task'
            });
          }
        },

        completeRecurringTask: async (taskId) => {
          set({ isLoading: true, error: null });
          try {
            const updatedTask = await recurringTaskService.completeRecurringTask(taskId);
            set(state => ({
              recurringTasks: state.recurringTasks.map(t => t.id === taskId ? updatedTask : t),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to complete recurring task'
            });
          }
        },

        snoozeRecurringTask: async (taskId, daysToSnooze) => {
          set({ isLoading: true, error: null });
          try {
            const updatedTask = await recurringTaskService.snoozeRecurringTask(taskId, daysToSnooze);
            set(state => ({
              recurringTasks: state.recurringTasks.map(t => t.id === taskId ? updatedTask : t),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to snooze recurring task'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'recurring-task-storage',
        partialize: (state) => ({
          recurringTasks: state.recurringTasks
        })
      }
    ),
    {
      name: 'recurring-task-store'
    }
  )
); 