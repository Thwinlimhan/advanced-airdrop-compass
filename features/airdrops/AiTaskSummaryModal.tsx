import React from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Brain, ListChecks, Lightbulb } from 'lucide-react';
import { AiTaskAnalysis } from '../../types';

interface AiTaskSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryContent: AiTaskAnalysis | null;
}

export const AiTaskSummaryModal: React.FC<AiTaskSummaryModalProps> = ({ isOpen, onClose, summaryContent }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center mb-4"><Brain size={20} className="mr-2 text-accent"/>AI Task Analysis & Prioritization</div>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {!summaryContent ? (
          <p className="text-text-secondary">No summary content available. The AI might still be processing or an error occurred.</p>
        ) : (
          <>
            {summaryContent.summary && (
              <div>
                <h4 className="text-md font-semibold text-primary mb-1">Overall Summary:</h4>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{summaryContent.summary}</p>
              </div>
            )}

            {summaryContent.prioritySuggestions && summaryContent.prioritySuggestions.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-primary mb-2 mt-3 flex items-center">
                    <ListChecks size={18} className="mr-1.5 text-accent"/> Prioritized Task Groups & Suggestions:
                </h4>
                <div className="space-y-2">
                  {summaryContent.prioritySuggestions.map((suggestionGroup, index) => (
                    <div key={index} className="p-2.5 border border-border rounded-md bg-surface-secondary">
                      <h5 className="text-sm font-semibold text-accent mb-1">{suggestionGroup.category}</h5>
                      {suggestionGroup.tasks && suggestionGroup.tasks.length > 0 ? (
                        <ul className="list-disc list-inside text-xs text-primary space-y-0.5 pl-2">
                          {suggestionGroup.tasks.map((task, taskIndex) => (
                            <li key={taskIndex}>{task}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-text-secondary italic">No specific tasks listed for this category.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summaryContent.generalTips && summaryContent.generalTips.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-primary mb-2 mt-3 flex items-center">
                    <Lightbulb size={18} className="mr-1.5 text-warning"/> General Tips:
                </h4>
                <ul className="list-disc list-inside text-sm text-text-secondary space-y-1 pl-4">
                  {summaryContent.generalTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
