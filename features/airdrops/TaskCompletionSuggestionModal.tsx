import React from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { TaskCompletionSuggestion, GasLogEntry, InteractionLogEntry, ManualTransaction } from '../../types';
import { Lightbulb, CheckCircle, XCircle, Info } from 'lucide-react';
import { AlertMessage } from '../../components/ui/AlertMessage'; // Assuming AlertMessage component exists

interface TaskCompletionSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: TaskCompletionSuggestion | null;
  onConfirmComplete: () => void;
  taskDescription: string;
}

const getLogDisplayString = (log: GasLogEntry | InteractionLogEntry | ManualTransaction | undefined): string => {
    if (!log) return "Unknown Log";
    
    if ('type' in log && 'description' in log) { // InteractionLogEntry
        return `${(log as InteractionLogEntry).type.toUpperCase()} - ${(log as InteractionLogEntry).description}`;
    } else if ('amount' in log && 'currency' in log && 'description' in log) { // GasLogEntry
        return `Gas Log - ${(log as GasLogEntry).description || ((log as GasLogEntry).amount + ' ' + (log as GasLogEntry).currency)}`;
    } else if ('hash' in log && 'cost' in log) { // ManualTransaction
        return `Manual Tx - ${(log as ManualTransaction).notes || log.hash.substring(0,10) + "..."}`;
    }
    return "Log Details Unavailable";
}


export const TaskCompletionSuggestionModal: React.FC<TaskCompletionSuggestionModalProps> = ({
  isOpen,
  onClose,
  suggestion,
  onConfirmComplete,
  taskDescription,
}) => {
  if (!isOpen) return null; // Don't render if not open

  const handleConfirm = () => {
    onConfirmComplete();
    // onClose(); // Parent component handles closing if needed after confirmation
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center">
        <Lightbulb size={20} className="mr-2 text-yellow-400" /> AI Task Completion Suggestion
      </div>
    } size="md">
      <div className="space-y-3">
        <p className="text-sm text-muted-light dark:text-muted-dark">
          For task: <span className="font-semibold text-text-light dark:text-text-dark">{taskDescription}</span>
        </p>
        
        {!suggestion ? (
            <AlertMessage type="info" message="AI is processing or no suggestion data available."/>
        ) : suggestion.matchFound && suggestion.matchingLog ? (
          <div className="p-3 bg-green-50 dark:bg-green-800 rounded-md border border-green-200 dark:border-green-700">
            <h4 className="text-md font-semibold text-green-700 dark:text-green-200 mb-1">Potential Match Found!</h4>
            <p className="text-xs text-green-600 dark:text-green-300">
              Matching Log: "{getLogDisplayString(suggestion.matchingLog)}" on {new Date(suggestion.matchingLog.date).toLocaleDateString()}.
            </p>
            <p className="text-xs mt-1">AI Confidence: {suggestion.confidence}</p>
            {suggestion.reasoning && <p className="text-xs italic mt-1">AI Reasoning: {suggestion.reasoning}</p>}
            <p className="text-sm mt-3 text-green-700 dark:text-green-200">Would you like to mark this task as complete based on this suggestion?</p>
             <div className="mt-4 flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={onClose}>Dismiss</Button>
                <Button variant="primary" size="sm" onClick={handleConfirm} leftIcon={<CheckCircle size={16}/>}>Mark Complete</Button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-800 rounded-md border border-yellow-200 dark:border-yellow-700">
            <h4 className="text-md font-semibold text-yellow-700 dark:text-yellow-200 mb-1">No Strong Match Found.</h4>
            <p className="text-xs text-yellow-600 dark:text-yellow-300">
              The AI could not confidently match this task with your recent logged wallet activity.
            </p>
            {suggestion.reasoning && <p className="text-xs italic mt-1">AI Reasoning: {suggestion.reasoning}</p>}
             <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={onClose}>OK</Button>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-light dark:text-muted-dark text-center mt-1">
            Remember, AI suggestions are conceptual. Always verify task completion yourself.
        </p>
      </div>
    </Modal>
  );
};
