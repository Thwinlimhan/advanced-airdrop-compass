import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { SubtaskChecklist } from '../tasks/SubtaskChecklist';
import { useWalletStore } from '../../stores/walletStore';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Calendar, 
  Link, 
  Wallet, 
  DollarSign, 
  Clock, 
  FileText, 
  CheckSquare, 
  ChevronDown, 
  ChevronRight,
  Info,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';

interface TaskFormData {
  description: string;
  dueDate: string;
  webLink: string;
  walletId: string;
  cost: string;
  timeSpent: string;
  notes: string;
  subtasks: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
}

interface TaskFormErrors {
  description?: string;
  dueDate?: string;
  webLink?: string;
  cost?: string;
  timeSpent?: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskFormData) => void;
  initialTask?: Partial<TaskFormData>;
  mode?: 'create' | 'edit';
  airdropId?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask = {},
  mode = 'create',
  airdropId
}) => {
  const { wallets } = useWalletStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<TaskFormData>({
    description: '',
    dueDate: '',
    webLink: '',
    walletId: '',
    cost: '',
    timeSpent: '',
    notes: '',
    subtasks: [],
    ...initialTask
  });

  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        description: '',
        dueDate: '',
        webLink: '',
        walletId: '',
        cost: '',
        timeSpent: '',
        notes: '',
        subtasks: [],
        ...initialTask
      });
      setErrors({});
      setShowAdvanced(false);
    }
  }, [isOpen, initialTask]);

  // Inline validation
  const validateField = (field: keyof TaskFormData, value: string) => {
    switch (field) {
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 3) return 'Description must be at least 3 characters';
        break;
      case 'dueDate':
        if (value && new Date(value) < new Date()) {
          return 'Due date cannot be in the past';
        }
        break;
      case 'webLink':
        if (value && !isValidUrl(value)) {
          return 'Please enter a valid URL';
        }
        break;
      case 'cost':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
          return 'Cost must be a positive number';
        }
        break;
      case 'timeSpent':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
          return 'Time spent must be a positive number';
        }
        break;
    }
    return '';
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFieldChange = (field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof TaskFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Validate field
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: TaskFormErrors = {};
    
    // Validate required fields
    const descriptionError = validateField('description', formData.description);
    if (descriptionError) newErrors.description = descriptionError;
    
    // Validate optional fields if they have values
    if (formData.dueDate) {
      const dueDateError = validateField('dueDate', formData.dueDate);
      if (dueDateError) newErrors.dueDate = dueDateError;
    }
    
    if (formData.webLink) {
      const webLinkError = validateField('webLink', formData.webLink);
      if (webLinkError) newErrors.webLink = webLinkError;
    }
    
    if (formData.cost) {
      const costError = validateField('cost', formData.cost);
      if (costError) newErrors.cost = costError;
    }
    
    if (formData.timeSpent) {
      const timeSpentError = validateField('timeSpent', formData.timeSpent);
      if (timeSpentError) newErrors.timeSpent = timeSpentError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the errors in the form', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      addToast(`Task ${mode === 'create' ? 'created' : 'updated'} successfully!`, 'success');
      onClose();
    } catch (error) {
      addToast(`Failed to ${mode === 'create' ? 'create' : 'update'} task`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'create' ? 'Create' : 'Edit'} Task`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Details Section */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Task Details
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe what needs to be done..."
                  className={errors.description ? 'border-red-500' : ''}
                  rows={3}
                />
                {errors.description && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                    className={errors.dueDate ? 'border-red-500' : ''}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.dueDate && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.dueDate}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Web Link
                </label>
                <div className="relative">
                  <Input
                    type="url"
                    value={formData.webLink}
                    onChange={(e) => handleFieldChange('webLink', e.target.value)}
                    placeholder="https://project.com"
                    className={errors.webLink ? 'border-red-500' : ''}
                  />
                  <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  Optional. Link to project page or instructions.
                </div>
                {errors.webLink && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.webLink}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Associated Wallet
                </label>
                <Select
                  value={formData.walletId}
                  onValueChange={(value) => handleFieldChange('walletId', value)}
                  options={[
                    { value: '', label: 'Select a wallet' },
                    ...wallets.map(wallet => ({
                      value: wallet.id,
                      label: `${wallet.name} (${wallet.blockchain})`
                    }))
                  ]}
                />
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Info className="h-3 w-3 mr-1" />
                  Choose the wallet for this task.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Section */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Tracking
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Cost (USD)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleFieldChange('cost', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={errors.cost ? 'border-red-500' : ''}
                  />
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.cost && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.cost}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Spent (minutes)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.timeSpent}
                    onChange={(e) => handleFieldChange('timeSpent', e.target.value)}
                    placeholder="0"
                    min="0"
                    className={errors.timeSpent ? 'border-red-500' : ''}
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.timeSpent && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.timeSpent}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Subtasks Section */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-purple-600" />
              Notes & Subtasks
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Any additional notes or context..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtasks
              </label>
              <SubtaskChecklist
                subtasks={formData.subtasks}
                onChange={(subtasks) => setFormData(prev => ({ ...prev, subtasks }))}
                placeholder="Add a subtask..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
            variant="primary"
            disabled={isSubmitting || !formData.description.trim()}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              `${mode === 'create' ? 'Create' : 'Update'} Task`
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
