import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import { StrategyNote } from '../types';

interface StrategyNoteState {
  // State
  strategyNotes: StrategyNote[];
  isLoading: boolean;

  // Actions
  setStrategyNotes: (notes: StrategyNote[]) => void;
  addStrategyNote: (note: Omit<StrategyNote, 'id' | 'lastModified'>) => Promise<void>;
  updateStrategyNote: (note: StrategyNote) => Promise<void>;
  deleteStrategyNote: (noteId: string) => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  fetchStrategyNotes: () => Promise<void>;
}

export const useStrategyNoteStore = create<StrategyNoteState>()(
  persist(
    (set, get) => ({
      // Initial state
      strategyNotes: [],
      isLoading: false,

      // Actions
      setStrategyNotes: (notes) => set({ strategyNotes: notes }),

      addStrategyNote: async (note) => {
        set({ isLoading: true });
        try {
          const newNote = await apiService.createStrategyNote(note);
          set((state) => ({
            strategyNotes: [...state.strategyNotes, newNote],
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateStrategyNote: async (note) => {
        set({ isLoading: true });
        try {
          const updatedNote = await apiService.updateStrategyNote(note);
          set((state) => ({
            strategyNotes: state.strategyNotes.map((sn) =>
              sn.id === updatedNote.id ? updatedNote : sn
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      deleteStrategyNote: async (noteId) => {
        set({ isLoading: true });
        try {
          await apiService.deleteStrategyNote(noteId);
          set((state) => ({
            strategyNotes: state.strategyNotes.filter((sn) => sn.id !== noteId),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      fetchStrategyNotes: async () => {
        set({ isLoading: true });
        try {
          const notes = await apiService.getStrategyNotes();
          set({ strategyNotes: notes || [], isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'strategy-note-storage',
      partialize: (state) => ({ strategyNotes: state.strategyNotes }),
    }
  )
); 