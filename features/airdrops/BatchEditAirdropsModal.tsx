import React, { useState } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { Airdrop, AirdropStatus, AirdropPriority } from '../../types';
import { BLOCKCHAIN_OPTIONS, AIRDROP_STATUS_OPTIONS, MY_AIRDROP_STATUS_OPTIONS, AIRDROP_PRIORITY_OPTIONS } from '../../constants';
import { Edit } from 'lucide-react';

interface BatchEditAirdropsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onSubmit: (updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain'>>) => void;
}

export const BatchEditAirdropsModal: React.FC<BatchEditAirdropsModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onSubmit,
}) => {
  const [status, setStatus] = useState<AirdropStatus | ''>('');
  const [myStatus, setMyStatus] = useState<AirdropStatus | ''>('');
  const [priority, setPriority] = useState<AirdropPriority | ''>('');
  const [blockchain, setBlockchain] = useState<string | ''>('');

  const handleSubmit = () => {
    const updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain'>> = {};
    if (status) updates.status = status;
    if (myStatus) updates.myStatus = myStatus;
    if (priority) updates.priority = priority;
    if (blockchain) updates.blockchain = blockchain;

    if (Object.keys(updates).length > 0) {
      onSubmit(updates);
    } else {
      onClose(); // Or show a message that no changes were selected
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
        <div className="flex items-center">
            <Edit size={20} className="mr-2 text-accent"/>
            Batch Edit {selectedCount} Airdrop(s)
        </div>
    } size="md">
      <p className="text-sm text-text-secondary mb-4">
        Selected fields will be updated for all {selectedCount} chosen airdrops. Leave fields blank to keep their current values.
      </p>
      <div className="space-y-4">
        <Select
          id="batch-status"
          label="Official Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AirdropStatus | '')}
          options={[{value: '', label: 'Keep Current'}, ...AIRDROP_STATUS_OPTIONS.map(s => ({ value: s, label: s }))]}
        />
        <Select
          id="batch-myStatus"
          label="My Participation Status"
          value={myStatus}
          onChange={(e) => setMyStatus(e.target.value as AirdropStatus | '')}
          options={[{value: '', label: 'Keep Current'}, ...MY_AIRDROP_STATUS_OPTIONS.map(s => ({ value: s, label: s }))]}
        />
        <Select
          id="batch-priority"
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as AirdropPriority | '')}
          options={[{value: '', label: 'Keep Current'}, ...AIRDROP_PRIORITY_OPTIONS.map(p => ({ value: p, label: p }))]}
        />
        <Select
          id="batch-blockchain"
          label="Blockchain"
          value={blockchain}
          onChange={(e) => setBlockchain(e.target.value)}
          options={[{value: '', label: 'Keep Current'}, ...BLOCKCHAIN_OPTIONS.map(b => ({ value: b, label: b }))]}
        />
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Apply Changes
        </Button>
      </div>
    </Modal>
  );
};
