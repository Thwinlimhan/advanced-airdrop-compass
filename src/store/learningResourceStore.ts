import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { learningResourceService } from '../../services/dataService';
import { LearningResource } from '../../types';

interface LearningResourceState {
  // State
  learningResources: LearningResource[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLearningResources: () => Promise<void>;
  createLearningResource: (resource: Omit<LearningResource, 'id'>) => Promise<void>;
  updateLearningResource: (resource: LearningResource) => Promise<void>;
  deleteLearningResource: (resourceId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useLearningResourceStore = create<LearningResourceState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        learningResources: [],
        isLoading: false,
        error: null,

        // Actions
        fetchLearningResources: async () => {
          set({ isLoading: true, error: null });
          try {
            const learningResources = await learningResourceService.fetchLearningResources();
            set({ learningResources, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch learning resources'
            });
          }
        },

        createLearningResource: async (resource) => {
          set({ isLoading: true, error: null });
          try {
            const newResource = await learningResourceService.createLearningResource(resource);
            set(state => ({
              learningResources: [...state.learningResources, newResource],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create learning resource'
            });
          }
        },

        updateLearningResource: async (resource) => {
          set({ isLoading: true, error: null });
          try {
            const updatedResource = await learningResourceService.updateLearningResource(resource);
            set(state => ({
              learningResources: state.learningResources.map(r => r.id === resource.id ? updatedResource : r),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update learning resource'
            });
          }
        },

        deleteLearningResource: async (resourceId) => {
          set({ isLoading: true, error: null });
          try {
            await learningResourceService.deleteLearningResource(resourceId);
            set(state => ({
              learningResources: state.learningResources.filter(r => r.id !== resourceId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete learning resource'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'learning-resource-storage',
        partialize: (state) => ({
          learningResources: state.learningResources
        })
      }
    ),
    {
      name: 'learning-resource-store'
    }
  )
); 