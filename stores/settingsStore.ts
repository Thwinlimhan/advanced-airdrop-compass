import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { AppSettings, UserBadge } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_USER_BADGES } from '../constants';

interface SettingsState {
  // State
  settings: AppSettings;
  userBadges: UserBadge[];
  isLoading: boolean;

  // Actions
  setSettings: (settings: AppSettings) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => void;
  setUserBadges: (badges: UserBadge[]) => void;
  setIsLoading: (loading: boolean) => void;
  fetchSettings: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  addCustomTransactionCategory: (category: string) => Promise<void>;
  deleteCustomTransactionCategory: (category: string) => Promise<void>;
  markTutorialAsCompleted: (tutorialKey: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_SETTINGS,
      userBadges: DEFAULT_USER_BADGES.map(b => ({ ...b, achieved: false, achievedDate: undefined })),
      isLoading: false,

      // Actions
      setSettings: (settings) => set({ settings }),

      updateSettings: async (newSettings) => {
        set({ isLoading: true });
        try {
          const updatedSettings = await apiService.updateSettings(newSettings);
          set({ settings: updatedSettings, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      setUserBadges: (badges) => set({ userBadges: badges }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const settings = await apiService.getSettings();
          set({ settings: { ...DEFAULT_SETTINGS, ...settings }, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      fetchUserProfile: async () => {
        set({ isLoading: true });
        try {
          const [prefs, badges, points, streak] = await Promise.all([
            apiService.getUserProfile(),
            apiService.getUserBadges(),
            apiService.getUserPoints(),
            apiService.getUserStreak(),
          ]);

          const userProfileData = { ...prefs, badges, ...points, ...streak };

          set({
            settings: {
              ...DEFAULT_SETTINGS,
              ...prefs,
              userPoints: userProfileData?.userPoints ?? DEFAULT_SETTINGS.userPoints,
              currentStreak: userProfileData?.currentStreak ?? DEFAULT_SETTINGS.currentStreak,
              lastTaskCompletionDate: userProfileData?.lastTaskCompletionDate ?? DEFAULT_SETTINGS.lastTaskCompletionDate,
            },
            userBadges: userProfileData?.badges || DEFAULT_USER_BADGES.map(b => ({ ...b, achieved: false, achievedDate: undefined })),
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      addCustomTransactionCategory: async (category) => {
        try {
          const response = await apiService.addCustomTransactionCategory(category);
          set((state) => ({
            settings: { ...state.settings, customTransactionCategories: response.categories },
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteCustomTransactionCategory: async (category) => {
        try {
          const response = await apiService.deleteCustomTransactionCategory(category);
          set((state) => ({
            settings: { ...state.settings, customTransactionCategories: response.categories },
          }));
        } catch (error) {
          throw error;
        }
      },

      markTutorialAsCompleted: (tutorialKey) => {
        set((state) => ({
          settings: {
            ...state.settings,
            tutorialsCompleted: {
              ...state.settings.tutorialsCompleted,
              [tutorialKey]: true,
            },
          },
        }));
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ 
        settings: state.settings,
        userBadges: state.userBadges,
      }),
    }
  )
); 