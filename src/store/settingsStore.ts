import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { settingsService } from '../../services/dataService';
import { AppSettings } from '../../types';

interface SettingsState {
  // State
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        settings: null,
        isLoading: false,
        error: null,

        // Actions
        fetchSettings: async () => {
          set({ isLoading: true, error: null });
          try {
            const settings = await settingsService.fetchSettings();
            set({ settings, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch settings'
            });
          }
        },

        updateSettings: async (newSettings) => {
          set({ isLoading: true, error: null });
          try {
            const updatedSettings = await settingsService.updateSettings(newSettings);
            set({ settings: updatedSettings, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update settings'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'settings-storage',
        partialize: (state) => ({
          settings: state.settings
        })
      }
    ),
    {
      name: 'settings-store'
    }
  )
); 