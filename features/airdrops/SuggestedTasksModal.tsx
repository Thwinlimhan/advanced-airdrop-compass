import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { CheckSquare, Square, Zap } from 'lucide-react'; // Added Zap for AI icon

interface SuggestedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string[];
  onAddTasks: (selectedTasks: string[]) => void;
}

export const SuggestedTasksModal: React.FC<SuggestedTasksModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onAddTasks,
}) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // When suggestions change (e.g., new AI call), pre-select all by default
    // or when modal opens with new suggestions.
    if (isOpen) {
      setSelectedSuggestions(suggestions);
    }
    // No else here to clear, so selections persist if modal is closed and reopened
    // with the same suggestions. If suggestions prop changes, selection resets.
  }, [suggestions, isOpen]);

  // Clear selections when modal is explicitly closed by user (not just re-rendered)
  const handleCloseAndClear = () => {
    setSelectedSuggestions([]);
    onClose();
  };

  const handleToggleSuggestion = (suggestion: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(suggestion)
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    );
  };

  const handleAddSelected = () => {
    onAddTasks(selectedSuggestions);
    handleCloseAndClear(); // Close and clear after adding
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndClear} title={
      <span className="flex items-center">
        <Zap size={20} className="mr-2 text-yellow-500" /> AI Task Suggestions
      </span>
    } size="lg">
      {suggestions.length === 0 ? (
        <p className="text-muted-light dark:text-muted-dark text-center py-4">
          The AI couldn't find specific task suggestions. Try interacting with the core features of the project based on its documentation.
        </p>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <p className="text-sm text-muted-light dark:text-muted-dark mb-2">
            Here are some tasks suggested by our AI based on the airdrop details. Select the ones you'd like to add to your checklist:
          </p>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleToggleSuggestion(suggestion)}
              className="flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
              role="checkbox"
              aria-checked={selectedSuggestions.includes(suggestion)}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleToggleSuggestion(suggestion);}}
            >
              {selectedSuggestions.includes(suggestion) ? (
                <CheckSquare size={20} className="text-primary-light dark:text-primary-dark mr-3 flex-shrink-0" />
              ) : (
                <Square size={20} className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
              )}
              <span className="text-text-light dark:text-text-dark">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={handleCloseAndClear}>
          Cancel
        </Button>
        <Button onClick={handleAddSelected} disabled={selectedSuggestions.length === 0 || suggestions.length === 0}>
          Add Selected ({selectedSuggestions.length})
        </Button>
      </div>
    </Modal>
  );
};
