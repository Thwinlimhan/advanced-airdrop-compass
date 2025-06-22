import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { userAlertService } from '../../services/dataService';
import { UserAlert } from '../../types';

interface UserAlertState {
  // State
  userAlerts: UserAlert[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUserAlerts: () => Promise<void>;
  createUserAlert: (alert: Omit<UserAlert, 'id' | 'date' | 'isRead'>) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  deleteUserAlert: (alertId: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  clearReadAlerts: () => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useUserAlertStore = create<UserAlertState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        userAlerts: [],
        isLoading: false,
        error: null,

        // Actions
        fetchUserAlerts: async () => {
          set({ isLoading: true, error: null });
          try {
            const userAlerts = await userAlertService.fetchUserAlerts();
            set({ userAlerts, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch user alerts'
            });
          }
        },

        createUserAlert: async (alert) => {
          set({ isLoading: true, error: null });
          try {
            const newAlert = await userAlertService.createUserAlert(alert);
            set(state => ({
              userAlerts: [...state.userAlerts, newAlert],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create user alert'
            });
          }
        },

        markAlertAsRead: async (alertId) => {
          set({ isLoading: true, error: null });
          try {
            const updatedAlert = await userAlertService.markAlertAsRead(alertId);
            set(state => ({
              userAlerts: state.userAlerts.map(a => a.id === alertId ? updatedAlert : a),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to mark alert as read'
            });
          }
        },

        deleteUserAlert: async (alertId) => {
          set({ isLoading: true, error: null });
          try {
            await userAlertService.deleteUserAlert(alertId);
            set(state => ({
              userAlerts: state.userAlerts.filter(a => a.id !== alertId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete user alert'
            });
          }
        },

        markAllAlertsAsRead: async () => {
          set({ isLoading: true, error: null });
          try {
            await userAlertService.markAllAlertsAsRead();
            set(state => ({
              userAlerts: state.userAlerts.map(alert => ({ ...alert, isRead: true })),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to mark all alerts as read'
            });
          }
        },

        clearReadAlerts: async () => {
          set({ isLoading: true, error: null });
          try {
            await userAlertService.clearReadAlerts();
            set(state => ({
              userAlerts: state.userAlerts.filter(alert => !alert.isRead),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to clear read alerts'
            });
          }
        },

        clearAllAlerts: async () => {
          set({ isLoading: true, error: null });
          try {
            await userAlertService.clearAllAlerts();
            set({ userAlerts: [], isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to clear all alerts'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'user-alert-storage',
        partialize: (state) => ({
          userAlerts: state.userAlerts
        })
      }
    ),
    {
      name: 'user-alert-store'
    }
  )
); 