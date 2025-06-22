import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { useAirdropStore } from '../../stores/airdropStore';
import { Airdrop, AirdropStatus, AirdropPriority } from '../../types';
import { 
  Edit3, 
  Save, 
  X, 
  CheckSquare,
  Square,
  AlertTriangle,
  Target,
  Calendar,
  Tag,
  Star
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

interface BatchEditAirdropsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAirdropIds?: string[];
}

export const BatchEditAirdropsModal: React.FC<BatchEditAirdropsModalProps> = ({
  isOpen,
  onClose,
  selectedAirdropIds = []
}) => {
  const { airdrops, batchUpdateAirdrops, batchAddNotesToAirdrops } = useAirdropStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    status: '',
    myStatus: '',
    priority: '',
    blockchain: '',
    notesToAppend: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  const selectedAirdrops = (airdrops || []).filter(a => selectedAirdropIds.includes(a.id));

  useEffect(() => {
    if (isOpen) {
      setFormData({
        status: '',
        myStatus: '',
        priority: '',
        blockchain: '',
        notesToAppend: ''
      });
      setSelectedFields(new Set());
    }
  }, [isOpen]);

  const handleFieldToggle = (field: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(field)) {
      newSelected.delete(field);
    } else {
      newSelected.add(field);
    }
    setSelectedFields(newSelected);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFields.size === 0) {
      addToast('Please select at least one field to update.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare updates object
      const updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain'>> = {};
      
      if (selectedFields.has('status') && formData.status) {
        updates.status = formData.status as AirdropStatus;
      }
      if (selectedFields.has('myStatus') && formData.myStatus) {
        updates.myStatus = formData.myStatus as AirdropStatus;
      }
      if (selectedFields.has('priority') && formData.priority) {
        updates.priority = formData.priority as AirdropPriority;
      }
      if (selectedFields.has('blockchain') && formData.blockchain) {
        updates.blockchain = formData.blockchain;
      }

      // Apply batch updates
      if (Object.keys(updates).length > 0) {
        await batchUpdateAirdrops(selectedAirdropIds, updates);
      }

      // Handle notes separately
      if (selectedFields.has('notes') && formData.notesToAppend.trim()) {
        await batchAddNotesToAirdrops(selectedAirdropIds, formData.notesToAppend.trim());
      }

      addToast(`Successfully updated ${selectedAirdropIds.length} airdrop(s).`, 'success');
      onClose();
    } catch (error) {
      console.error('Batch update failed:', error);
      addToast('Failed to update airdrops. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUniqueValues = (field: keyof Airdrop) => {
    const values = (selectedAirdrops || []).map(a => a[field]).filter(Boolean);
    return Array.from(new Set(values));
  };

  const statusOptions = Object.values(AirdropStatus).map(status => ({
    value: status,
    label: status
  }));

  const priorityOptions = Object.values(AirdropPriority).map(priority => ({
    value: priority,
    label: priority
  }));

  const blockchainOptions = Array.from(new Set((airdrops || []).map(a => a.blockchain))).map(blockchain => ({
    value: blockchain,
    label: blockchain
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Batch Edit ${selectedAirdropIds.length} Airdrop(s)`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Selected Airdrops Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Selected Airdrops ({selectedAirdropIds.length})
          </h4>
          <div className="space-y-1">
            {(selectedAirdrops || []).slice(0, 5).map(airdrop => (
              <div key={airdrop.id} className="text-sm text-gray-600 dark:text-gray-400">
                • {airdrop.projectName} ({airdrop.blockchain})
              </div>
            ))}
            {(selectedAirdrops || []).length > 5 && (
              <div className="text-sm text-gray-500">
                ... and {(selectedAirdrops || []).length - 5} more
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Field Selection */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Select Fields to Update
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'status', label: 'Status', icon: Target },
                { key: 'myStatus', label: 'My Status', icon: CheckSquare },
                { key: 'priority', label: 'Priority', icon: Star },
                { key: 'blockchain', label: 'Blockchain', icon: Tag },
                { key: 'notes', label: 'Add Notes', icon: Edit3 }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleFieldToggle(key)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    selectedFields.has(key)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Values Summary */}
          {selectedFields.size > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400" />
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Current Values (will be overwritten)
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {selectedFields.has('status') && (
                  <div>
                    <span className="text-yellow-700 dark:text-yellow-300">Status:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {getUniqueValues('status').join(', ') || 'Mixed'}
                    </span>
                  </div>
                )}
                {selectedFields.has('myStatus') && (
                  <div>
                    <span className="text-yellow-700 dark:text-yellow-300">My Status:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {getUniqueValues('myStatus').join(', ') || 'Mixed'}
                    </span>
                  </div>
                )}
                {selectedFields.has('priority') && (
                  <div>
                    <span className="text-yellow-700 dark:text-yellow-300">Priority:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {getUniqueValues('priority').join(', ') || 'Mixed'}
                    </span>
                  </div>
                )}
                {selectedFields.has('blockchain') && (
                  <div>
                    <span className="text-yellow-700 dark:text-yellow-300">Blockchain:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {getUniqueValues('blockchain').join(', ') || 'Mixed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {selectedFields.has('status') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Status
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  options={[
                    { value: '', label: 'Select Status' },
                    ...statusOptions
                  ]}
                />
              </div>
            )}

            {selectedFields.has('myStatus') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New My Status
                </label>
                <Select
                  value={formData.myStatus}
                  onChange={(e) => handleInputChange('myStatus', e.target.value)}
                  options={[
                    { value: '', label: 'Select My Status' },
                    ...statusOptions
                  ]}
                />
              </div>
            )}

            {selectedFields.has('priority') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Priority
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  options={[
                    { value: '', label: 'Select Priority' },
                    ...priorityOptions
                  ]}
                />
              </div>
            )}

            {selectedFields.has('blockchain') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Blockchain
                </label>
                <Select
                  value={formData.blockchain}
                  onChange={(e) => handleInputChange('blockchain', e.target.value)}
                  options={[
                    { value: '', label: 'Select Blockchain' },
                    ...blockchainOptions
                  ]}
                />
              </div>
            )}

            {selectedFields.has('notes') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes to Append
                </label>
                <Textarea
                  value={formData.notesToAppend}
                  onChange={(e) => handleInputChange('notesToAppend', e.target.value)}
                  placeholder="Notes will be appended to existing notes..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFields.size} field(s) selected
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedFields.size === 0}
                leftIcon={isSubmitting ? undefined : <Save size={16} />}
              >
                {isSubmitting ? 'Updating...' : `Update ${selectedAirdropIds.length} Airdrop(s)`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
