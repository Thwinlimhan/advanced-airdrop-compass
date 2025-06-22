import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { RecurringTask } from '../types';

interface RecurringTaskState {
  // State
  recurringTasks: RecurringTask[];
  isLoading: boolean;

  // Actions
  setRecurringTasks: (tasks: RecurringTask[]) => void;
  addRecurringTask: (task: Omit<RecurringTask, 'id' | 'completionHistory' | 'notes' | 'tags'>) => Promise<void>;
  updateRecurringTask: (task: RecurringTask) => Promise<void>;
  deleteRecurringTask: (taskId: string) => Promise<void>;
  completeRecurringTask: (taskId: string) => Promise<void>;
  snoozeRecurringTask: (taskId: string, daysToSnooze: number) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  fetchRecurringTasks: () => Promise<void>;
  exportRecurringTasksToCSV: () => void;
}

export const useRecurringTaskStore = create<RecurringTaskState>()(
  persist(
    (set, get) => ({
      // Initial state
      recurringTasks: [],
      isLoading: false,

      // Actions
      setRecurringTasks: (tasks) => set({ recurringTasks: tasks.map(t => ({ ...t, currentStreak: typeof t.currentStreak === 'number' ? t.currentStreak : 0 })) }),

      addRecurringTask: async (task) => {
        set({ isLoading: true });
        try {
          const newTask = await apiService.createRecurringTask(task);
          set((state) => ({
            recurringTasks: [...state.recurringTasks, newTask],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateRecurringTask: async (task) => {
        set({ isLoading: true });
        try {
          const updatedTask = await apiService.updateRecurringTask(task);
          set((state) => ({
            recurringTasks: state.recurringTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteRecurringTask: async (taskId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteRecurringTask(taskId);
          set((state) => ({
            recurringTasks: state.recurringTasks.filter((t) => t.id !== taskId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      completeRecurringTask: async (taskId) => {
        try {
          await apiService.completeRecurringTask(taskId);
          // Refresh tasks to get updated completion status
          await get().fetchRecurringTasks();
        } catch (error) {
          throw error;
        }
      },

      snoozeRecurringTask: async (taskId, daysToSnooze) => {
        try {
          await apiService.snoozeRecurringTask(taskId, daysToSnooze);
          // Refresh tasks to get updated due date
          await get().fetchRecurringTasks();
        } catch (error) {
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchRecurringTasks: async () => {
        set({ isLoading: true });
        try {
          const tasks = await apiService.getRecurringTasks();
          set({ recurringTasks: (tasks || []).map(t => ({ ...t, currentStreak: typeof t.currentStreak === 'number' ? t.currentStreak : 0 })), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      exportRecurringTasksToCSV: () => {
        // Implementation for CSV export
        const { recurringTasks } = get();
        console.log('Exporting recurring tasks to CSV:', recurringTasks);
      },
    }),
    {
      name: 'recurring-task-storage',
      partialize: (state) => ({ recurringTasks: state.recurringTasks }),
    }
  )
); 