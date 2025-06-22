import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { useAirdropTemplateStore } from '../../stores/airdropTemplateStore';
import { AirdropTemplate, AirdropTask } from '../../types';
import { 
  Plus, 
  Trash2, 
  Save, 
  Copy,
  Target,
  Calendar,
  Clock,
  DollarSign,
  Link
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

interface AirdropTemplateFormProps {
  template?: AirdropTemplate;
  mode: 'create' | 'edit';
  onSave?: (template: AirdropTemplate) => void;
  onCancel?: () => void;
}

export const AirdropTemplateForm: React.FC<AirdropTemplateFormProps> = ({
  template,
  mode,
  onSave,
  onCancel
}) => {
  const { addAirdropTemplate, updateAirdropTemplate } = useAirdropTemplateStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    blockchain: '',
    tasks: [] as Omit<AirdropTask, 'id' | 'completed' | 'subTasks' | 'timeSpentMinutes' | 'notes' | 'cost' | 'linkedGasLogId' | 'completionDate' | 'dependsOnTaskIds' | 'dependsOnAirdropMyStatusCompleted'>[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template && mode === 'edit') {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        blockchain: template.blockchain || '',
        tasks: template.tasks.map(task => ({
          description: task.description,
          associatedWalletId: task.associatedWalletId,
          dueDate: task.dueDate,
          parentId: task.parentId
        }))
      });
    } else {
      setFormData({
        name: '',
        description: '',
        blockchain: '',
        tasks: []
      });
    }
  }, [template, mode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTask = () => {
    const newTask = {
      description: '',
      associatedWalletId: undefined,
      dueDate: undefined,
      parentId: undefined
    };
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const updateTask = (index: number, field: string, value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === index ? { ...task, [field]: value } : task
      )
    }));
  };

  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addToast('Template name is required.', 'error');
      return;
    }

    if (formData.tasks.length === 0) {
      addToast('At least one task is required.', 'error');
      return;
    }

    // Validate tasks
    const invalidTasks = formData.tasks.filter(task => !task.description.trim());
    if (invalidTasks.length > 0) {
      addToast('All tasks must have a description.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const templateData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        blockchain: formData.blockchain || undefined,
        tasks: formData.tasks.map(task => ({
          ...task,
          description: task.description.trim()
        }))
      };

      if (mode === 'create') {
        await addAirdropTemplate(templateData);
        addToast('Template created successfully.', 'success');
      } else if (template) {
        const updatedTemplate: AirdropTemplate = {
          ...template,
          ...templateData
        };
        await updateAirdropTemplate(updatedTemplate);
        addToast('Template updated successfully.', 'success');
      }

      if (onSave && template) {
        onSave(template);
      }
    } catch (error) {
      console.error('Template operation failed:', error);
      addToast('Failed to save template. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const blockchainOptions = [
    { value: '', label: 'Select Blockchain' },
    { value: 'Ethereum', label: 'Ethereum' },
    { value: 'Arbitrum', label: 'Arbitrum' },
    { value: 'Optimism', label: 'Optimism' },
    { value: 'Polygon', label: 'Polygon' },
    { value: 'Base', label: 'Base' },
    { value: 'BSC', label: 'BSC' },
    { value: 'Solana', label: 'Solana' },
    { value: 'Avalanche', label: 'Avalanche' },
    { value: 'Other', label: 'Other' }
  ];

  return (
    <Card variant="default" padding="lg">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target size={20} />
          {mode === 'create' ? 'Create New Template' : 'Edit Template'}
        </h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Template Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., DEX Airdrop Template"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this template is for..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Blockchain
              </label>
              <Select
                value={formData.blockchain}
                onChange={(e) => handleInputChange('blockchain', e.target.value)}
                options={blockchainOptions}
              />
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold flex items-center gap-2">
                <Target size={16} />
                Tasks ({formData.tasks.length})
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTask}
                leftIcon={<Plus size={16} />}
              >
                Add Task
              </Button>
            </div>

            {formData.tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tasks added yet. Click "Add Task" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.tasks.map((task, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">Task {index + 1}</h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTask(index)}
                        leftIcon={<Trash2 size={14} />}
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description *
                        </label>
                        <Textarea
                          value={task.description}
                          onChange={(e) => updateTask(index, 'description', e.target.value)}
                          placeholder="Describe what needs to be done..."
                          rows={2}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Due Date
                          </label>
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              type="date"
                              value={task.dueDate || ''}
                              onChange={(e) => updateTask(index, 'dueDate', e.target.value || undefined)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Parent Task ID
                          </label>
                          <Input
                            type="text"
                            value={task.parentId || ''}
                            onChange={(e) => updateTask(index, 'parentId', e.target.value || undefined)}
                            placeholder="Optional parent task ID"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {formData.tasks.length} task(s) in template
            </div>
            
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name.trim() || formData.tasks.length === 0}
                leftIcon={isSubmitting ? undefined : <Save size={16} />}
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 