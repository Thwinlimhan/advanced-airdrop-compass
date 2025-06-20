import React, { useState } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { Input } from '../../design-system/components/Input';
import { Wallet, AirdropTask } from '../../types';
import { Edit } from 'lucide-react';

interface BatchEditAirdropTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSubmit: (updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>>) => void; // Expanded based on context
  selectedCount: number;
}

export const BatchEditAirdropTasksModal: React.FC<BatchEditAirdropTasksModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onSubmit,
  selectedCount,
}) => {
  const [completed, setCompleted] = useState<string>(''); // '' | 'true' | 'false'
  const [associatedWalletId, setAssociatedWalletId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  // Add other fields if needed for batch edit, e.g., timeSpent, notes, etc.

  const handleSubmit = () => {
    const updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>> = {};
    if (completed === 'true') {
        updates.completed = true;
        updates.completionDate = new Date().toISOString(); // Set completion date if marking true
    } else if (completed === 'false') {
        updates.completed = false;
        updates.completionDate = undefined; // Clear completion date if marking false
    }

    if (associatedWalletId) {
        updates.associatedWalletId = associatedWalletId === 'none' ? undefined : associatedWalletId;
    }

    if (dueDate) {
      updates.dueDate = dueDate;
    } else if (dueDate === 'clear_date') { // Special value to clear date
      updates.dueDate = undefined;
    }


    if (Object.keys(updates).length > 0) {
      onSubmit(updates);
    }
    // Reset form fields after submit
    setCompleted('');
    setAssociatedWalletId('');
    setDueDate('');
    onClose();
  };

  const walletOptions = [
    { value: '', label: 'Keep Current Wallet' },
    { value: 'none', label: 'Remove Wallet Association' },
    ...wallets.map(w => ({ value: w.id, label: `${w.name} (${w.blockchain})` }))
  ];

  const completedOptions = [
    { value: '', label: 'Keep Current Status' },
    { value: 'true', label: 'Mark as Complete' },
    { value: 'false', label: 'Mark as Incomplete' },
  ];

  const dueDateOptions = [
    { value: '', label: 'Keep Current Due Date' },
    { value: 'clear_date', label: 'Clear Due Date' }
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center mb-4">
        <Edit size={20} className="mr-2 text-accent"/>
        Batch Edit {selectedCount} Task(s)
      </div>
      <p className="text-sm text-text-secondary mb-4">
        Selected fields will be updated for all {selectedCount} chosen tasks. Leave fields blank or "Keep Current" to preserve their existing values.
      </p>
      <div className="space-y-4">
        <Select
          id="batch-task-completed"
          label="Completion Status"
          value={completed}
          onChange={(e) => setCompleted(e.target.value)}
          options={completedOptions}
        />
        <Select
          id="batch-task-wallet"
          label="Associated Wallet"
          value={associatedWalletId}
          onChange={(e) => setAssociatedWalletId(e.target.value)}
          options={walletOptions}
        />
        <div className="space-y-1">
            <Input
              id="batch-task-dueDate"
              type="date"
              label="Set New Due Date"
              value={dueDate === 'clear_date' ? '' : dueDate} // if 'clear_date' is selected, input should be empty
              onChange={(e) => setDueDate(e.target.value)}
              disabled={dueDate === 'clear_date'} // disable input if clear is chosen
            />
            <Select
              id="batch-task-dueDate-action"
              label="Due Date Action"
              value={dueDate === 'clear_date' ? 'clear_date' : (dueDate ? 'set_new' : '')}
              onChange={(e) => {
                if (e.target.value === 'clear_date') {
                  setDueDate('clear_date');
                } else if (e.target.value === 'set_new'){
                  // If switching from "clear" to "set new", and dueDate was 'clear_date', reset it
                  if(dueDate === 'clear_date') setDueDate(''); 
                  // Otherwise, just let the Input field above handle it
                } else { // Keep current or empty input
                  setDueDate('');
                }
              }}
              options={[
                { value: '', label: 'Keep Current / Set New Above' },
                { value: 'clear_date', label: 'Clear Due Date' }
              ]}
            />
        </div>

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
