import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { strategyNoteService } from '../../services/dataService';
import { StrategyNote } from '../../types';

interface StrategyNoteState {
  // State
  strategyNotes: StrategyNote[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStrategyNotes: () => Promise<void>;
  createStrategyNote: (note: Omit<StrategyNote, 'id' | 'lastModified'>) => Promise<void>;
  updateStrategyNote: (note: StrategyNote) => Promise<void>;
  deleteStrategyNote: (noteId: string) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

export const useStrategyNoteStore = create<StrategyNoteState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        strategyNotes: [],
        isLoading: false,
        error: null,

        // Actions
        fetchStrategyNotes: async () => {
          set({ isLoading: true, error: null });
          try {
            const strategyNotes = await strategyNoteService.fetchStrategyNotes();
            set({ strategyNotes, isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to fetch strategy notes'
            });
          }
        },

        createStrategyNote: async (note) => {
          set({ isLoading: true, error: null });
          try {
            const newNote = await strategyNoteService.createStrategyNote(note);
            set(state => ({
              strategyNotes: [...state.strategyNotes, newNote],
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to create strategy note'
            });
          }
        },

        updateStrategyNote: async (note) => {
          set({ isLoading: true, error: null });
          try {
            const updatedNote = await strategyNoteService.updateStrategyNote(note);
            set(state => ({
              strategyNotes: state.strategyNotes.map(n => n.id === note.id ? updatedNote : n),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to update strategy note'
            });
          }
        },

        deleteStrategyNote: async (noteId) => {
          set({ isLoading: true, error: null });
          try {
            await strategyNoteService.deleteStrategyNote(noteId);
            set(state => ({
              strategyNotes: state.strategyNotes.filter(n => n.id !== noteId),
              isLoading: false
            }));
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to delete strategy note'
            });
          }
        },

        // Utility
        clearError: () => {
          set({ error: null });
        }
      }),
      {
        name: 'strategy-note-storage',
        partialize: (state) => ({
          strategyNotes: state.strategyNotes
        })
      }
    ),
    {
      name: 'strategy-note-store'
    }
  )
); 