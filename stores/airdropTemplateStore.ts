import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { AirdropTemplate } from '../types';

interface AirdropTemplateState {
  // State
  airdropTemplates: AirdropTemplate[];
  isLoading: boolean;

  // Actions
  setAirdropTemplates: (templates: AirdropTemplate[]) => void;
  addAirdropTemplate: (template: Omit<AirdropTemplate, 'id'>) => Promise<void>;
  updateAirdropTemplate: (template: AirdropTemplate) => Promise<void>;
  deleteAirdropTemplate: (templateId: string) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  fetchAirdropTemplates: () => Promise<void>;
}

export const useAirdropTemplateStore = create<AirdropTemplateState>()(
  persist(
    (set, get) => ({
      // Initial state
      airdropTemplates: [],
      isLoading: false,

      // Actions
      setAirdropTemplates: (templates) => set({ airdropTemplates: templates }),

      addAirdropTemplate: async (template) => {
        set({ isLoading: true });
        try {
          const newTemplate = await apiService.createAirdropTemplate(template);
          set((state) => ({
            airdropTemplates: [...state.airdropTemplates, newTemplate],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateAirdropTemplate: async (template) => {
        set({ isLoading: true });
        try {
          const updatedTemplate = await apiService.updateAirdropTemplate(template);
          set((state) => ({
            airdropTemplates: state.airdropTemplates.map((at) =>
              at.id === updatedTemplate.id ? updatedTemplate : at
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteAirdropTemplate: async (templateId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteAirdropTemplate(templateId);
          set((state) => ({
            airdropTemplates: state.airdropTemplates.filter((at) => at.id !== templateId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchAirdropTemplates: async () => {
        set({ isLoading: true });
        try {
          const templates = await apiService.getAirdropTemplates();
          set({ airdropTemplates: templates || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'airdrop-template-storage',
      partialize: (state) => ({ airdropTemplates: state.airdropTemplates }),
    }
  )
); 