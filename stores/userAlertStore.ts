import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { UserAlert } from '../types';

interface UserAlertState {
  // State
  userAlerts: UserAlert[];
  isLoading: boolean;

  // Actions
  setUserAlerts: (alerts: UserAlert[]) => void;
  addUserAlert: (alertData: Omit<UserAlert, 'id' | 'date' | 'isRead'>) => Promise<void>;
  markUserAlertAsRead: (alertId: string) => Promise<void>;
  deleteUserAlert: (alertId: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  clearReadAlerts: () => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  fetchUserAlerts: () => Promise<void>;
}

export const useUserAlertStore = create<UserAlertState>()(
  persist(
    (set, get) => ({
      // Initial state
      userAlerts: [],
      isLoading: false,

      // Actions
      setUserAlerts: (alerts) => set({ userAlerts: alerts }),

      addUserAlert: async (alertData) => {
        try {
          const newAlert = await apiService.createUserAlert(alertData);
          set((state) => ({
            userAlerts: [newAlert, ...state.userAlerts],
          }));
        } catch (error) {
          throw error;
        }
      },

      markUserAlertAsRead: async (alertId) => {
        try {
          const updatedAlert = await apiService.markAlertAsRead(alertId);
          set((state) => ({
            userAlerts: state.userAlerts.map((ua) =>
              ua.id === updatedAlert.id ? updatedAlert : ua
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteUserAlert: async (alertId) => {
        try {
          await apiService.deleteUserAlert(alertId);
          set((state) => ({
            userAlerts: state.userAlerts.filter((ua) => ua.id !== alertId),
          }));
        } catch (error) {
          throw error;
        }
      },

      markAllAlertsAsRead: async () => {
        try {
          await apiService.markAllAlertsAsRead();
          set((state) => ({
            userAlerts: state.userAlerts.map((ua) => ({ ...ua, isRead: true })),
          }));
        } catch (error) {
          throw error;
        }
      },

      clearReadAlerts: async () => {
        try {
          await apiService.clearReadAlerts();
          set((state) => ({
            userAlerts: state.userAlerts.filter((ua) => !ua.isRead),
          }));
        } catch (error) {
          throw error;
        }
      },

      clearAllAlerts: async () => {
        try {
          await apiService.clearAllAlerts();
          set({ userAlerts: [] });
        } catch (error) {
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchUserAlerts: async () => {
        set({ isLoading: true });
        try {
          const alerts = await apiService.getUserAlerts();
          set({ userAlerts: alerts || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'user-alert-storage',
      partialize: (state) => ({ userAlerts: state.userAlerts }),
    }
  )
); 