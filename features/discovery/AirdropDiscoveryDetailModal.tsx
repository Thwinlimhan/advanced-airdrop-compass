import React from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { DiscoveredAirdropSuggestion } from '../../types';
import { Sparkles, PlusCircle, Info, FileText } from 'lucide-react';
import { AlertMessage } from '../../components/ui/AlertMessage';

interface DiscoveredAirdropDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: DiscoveredAirdropSuggestion | null;
  onAddToWatchlist: (suggestion: DiscoveredAirdropSuggestion) => void;
}

export const DiscoveredAirdropDetailModal: React.FC<DiscoveredAirdropDetailModalProps> = ({
  isOpen,
  onClose,
  suggestion,
  onAddToWatchlist,
}) => {
  if (!isOpen || !suggestion) return null;

  const handleAdd = () => {
    onAddToWatchlist(suggestion);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={suggestion?.projectName || ''} size="md">
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-primary">{suggestion.projectName}</h3>
        
        <div>
          <h4 className="text-sm font-medium text-tertiary">Description:</h4>
          <p className="text-sm text-secondary">{suggestion.description}</p>
        </div>

        {suggestion.ecosystem && (
          <div>
            <h4 className="text-sm font-medium text-tertiary">Ecosystem / Chain:</h4>
            <p className="text-sm text-secondary">{suggestion.ecosystem}</p>
          </div>
        )}

        {suggestion.potentialReason && (
          <div>
            <h4 className="text-sm font-medium text-tertiary">Potential Reason for Airdrop:</h4>
            <p className="text-sm text-secondary">{suggestion.potentialReason}</p>
          </div>
        )}
        
        {suggestion.aiConfidence && (
          <div>
            <h4 className="text-sm font-medium text-tertiary">AI Confidence in this type of opportunity:</h4>
            <p className="text-sm font-semibold text-warning">{suggestion.aiConfidence}</p>
          </div>
        )}

        {suggestion.sourceHints && suggestion.sourceHints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-tertiary">Source Hints (Fictional):</h4>
            <ul className="list-disc list-inside text-xs text-tertiary pl-4">
              {suggestion.sourceHints.map((hint, i) => <li key={i}>{hint}</li>)}
            </ul>
          </div>
        )}
        {suggestion.aiRationale && (
            <div className="p-2 bg-surface-secondary rounded-md">
                <h4 className="text-xs font-semibold text-info flex items-center"><FileText size={12} className="mr-1"/>AI's Rationale (Simulated):</h4>
                <p className="text-xs italic text-info">{suggestion.aiRationale}</p>
            </div>
        )}

        <AlertMessage 
            type="info" 
            message="This is an AI-generated suggestion (using fictional data for demo). Always conduct thorough research (DYOR) before interacting with any project." 
            className="text-xs"
        />
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={handleAdd} leftIcon={<PlusCircle size={16}/>}>Add to Watchlist</Button>
      </div>
    </Modal>
  );
};