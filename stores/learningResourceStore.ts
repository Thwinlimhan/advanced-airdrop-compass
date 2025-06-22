import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { LearningResource } from '../types';
import { MOCK_GUIDES, MOCK_GLOSSARY_TERMS } from '../constants';

interface LearningResourceState {
  // State
  learningResources: LearningResource[];
  isLoading: boolean;

  // Actions
  setLearningResources: (resources: LearningResource[]) => void;
  addLearningResource: (resource: Omit<LearningResource, 'id'>) => Promise<LearningResource | null>;
  updateLearningResource: (resource: LearningResource) => Promise<void>;
  deleteLearningResource: (resourceId: string) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  fetchLearningResources: () => Promise<void>;
}

export const useLearningResourceStore = create<LearningResourceState>()(
  persist(
    (set, get) => ({
      // Initial state
      learningResources: [...MOCK_GUIDES, ...MOCK_GLOSSARY_TERMS],
      isLoading: false,

      // Actions
      setLearningResources: (resources) => set({ learningResources: resources }),

      addLearningResource: async (resource) => {
        set({ isLoading: true });
        try {
          const newResource = await apiService.createLearningResource(resource);
          set((state) => ({
            learningResources: [...state.learningResources, newResource],
            isLoading: false,
          }));
          return newResource;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateLearningResource: async (resource) => {
        set({ isLoading: true });
        try {
          const updatedResource = await apiService.updateLearningResource(resource);
          set((state) => ({
            learningResources: state.learningResources.map((lr) =>
              lr.id === updatedResource.id ? updatedResource : lr
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteLearningResource: async (resourceId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteLearningResource(resourceId);
          set((state) => ({
            learningResources: state.learningResources.filter((lr) => lr.id !== resourceId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchLearningResources: async () => {
        set({ isLoading: true });
        try {
          const resources = await apiService.getLearningResources();
          set({ learningResources: resources || [...MOCK_GUIDES, ...MOCK_GLOSSARY_TERMS], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          // Fallback to mock data if API fails
          set({ learningResources: [...MOCK_GUIDES, ...MOCK_GLOSSARY_TERMS] });
        }
      },
    }),
    {
      name: 'learning-resource-storage',
      partialize: (state) => ({ learningResources: state.learningResources }),
    }
  )
); 