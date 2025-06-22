import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { airdropTemplateService } from '../../services/dataService';
import { AirdropTemplate } from '../../types';

interface AirdropTemplateState {
  // State
  airdropTemplates: AirdropTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAirdropTemplates: () => Promise<void>;
  createAirdropTemplate: (template: Omit<AirdropTemplate, 'id'>) => Promise<void>;
  updateAirdropTemplate: (template: AirdropTemplate) => Promise<void>;
  deleteAirdropTemplate: (templateId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useAirdropTemplateStore = create<AirdropTemplateState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        airdropTemplates: [],
        isLoading: false,
        error: null,

        // Actions
        fetchAirdropTemplates: async () => {
          set({ isLoading: true, error: null });
          try {
            const airdropTemplates = await airdropTemplateService.fetchAirdropTemplates();
            set({ airdropTemplates, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch airdrop templates'
            });
          }
        },

        createAirdropTemplate: async (template) => {
          set({ isLoading: true, error: null });
          try {
            const newTemplate = await airdropTemplateService.createAirdropTemplate(template);
            set(state => ({
              airdropTemplates: [...state.airdropTemplates, newTemplate],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create airdrop template'
            });
          }
        },

        updateAirdropTemplate: async (template) => {
          set({ isLoading: true, error: null });
          try {
            const updatedTemplate = await airdropTemplateService.updateAirdropTemplate(template);
            set(state => ({
              airdropTemplates: state.airdropTemplates.map(t => t.id === template.id ? updatedTemplate : t),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update airdrop template'
            });
          }
        },

        deleteAirdropTemplate: async (templateId) => {
          set({ isLoading: true, error: null });
          try {
            await airdropTemplateService.deleteAirdropTemplate(templateId);
            set(state => ({
              airdropTemplates: state.airdropTemplates.filter(t => t.id !== templateId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete airdrop template'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'airdrop-template-storage',
        partialize: (state) => ({
          airdropTemplates: state.airdropTemplates
        })
      }
    ),
    {
      name: 'airdrop-template-store'
    }
  )
); 