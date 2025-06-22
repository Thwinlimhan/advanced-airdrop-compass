import React, { useState, useEffect, useMemo } from 'react';
import { RecurringTask, TaskFrequency, Airdrop, DayOfWeek } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { TagInput } from '../../components/ui/TagInput'; 
import { CreatableSelect } from '../../components/ui/CreatableSelect';
import { History } from 'lucide-react';
import { TASK_FREQUENCY_OPTIONS, DAYS_OF_WEEK } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation'; // Added
import { useToast } from '../../hooks/useToast'; // Added
import { Modal } from '../../design-system/components/Modal';
import { useRecurringTaskStore } from '../../stores/recurringTaskStore';
import { useAirdropStore } from '../../stores/airdropStore';
import { 
  Plus, 
  Save, 
  X, 
  Calendar,
  Clock,
  Repeat,
  Tag,
  Link
} from 'lucide-react';

interface TaskFormProps {
  onSubmit: (taskData: Omit<RecurringTask, 'id'> | RecurringTask) => Promise<void>;
  initialData?: RecurringTask;
  airdrops?: Airdrop[];
  onClose: () => void;
}

const NTH_VALUE_OPTIONS = [
    { value: 1, label: '1st' },
    { value: 2, label: '2nd' },
    { value: 3, label: '3rd' },
    { value: 4, label: '4th' },
    { value: 5, label: 'Last' }, 
];

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  initialData,
  airdrops = [],
  onClose
}) => {
  const { addRecurringTask, updateRecurringTask, recurringTasks } = useRecurringTaskStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: TaskFrequency.DAILY,
    everyXDaysValue: 1,
    specificDaysOfWeekValue: [] as DayOfWeek[],
    nextDueDate: '',
    isActive: true,
    notes: '',
    tags: [] as string[],
    associatedAirdropId: '',
    category: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specificDateInput, setSpecificDateInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        frequency: initialData.frequency || TaskFrequency.DAILY,
        everyXDaysValue: initialData.everyXDaysValue || 1,
        specificDaysOfWeekValue: initialData.specificDaysOfWeekValue || [],
        nextDueDate: initialData.nextDueDate || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        notes: initialData.notes || '',
        tags: initialData.tags || [],
        associatedAirdropId: initialData.associatedAirdropId || '',
        category: initialData.category || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        frequency: TaskFrequency.DAILY,
        everyXDaysValue: 1,
        specificDaysOfWeekValue: [],
        nextDueDate: '',
        isActive: true,
        notes: '',
        tags: [],
        associatedAirdropId: '',
        category: ''
      });
    }
  }, [initialData]);

  // Load available categories from existing tasks
  useEffect(() => {
    const categories = new Set<string>();
    recurringTasks.forEach(task => {
      if (task.category) {
        categories.add(task.category);
      }
    });
    setAvailableCategories(Array.from(categories).sort());
  }, [recurringTasks]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addToast('Task name is required.', 'error');
      return;
    }

    if (!formData.nextDueDate) {
      addToast('Due date is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        frequency: formData.frequency,
        everyXDaysValue: formData.frequency === TaskFrequency.EVERY_X_DAYS ? formData.everyXDaysValue : undefined,
        specificDaysOfWeekValue: formData.frequency === TaskFrequency.SPECIFIC_DAYS_OF_WEEK ? formData.specificDaysOfWeekValue : undefined,
        nextDueDate: formData.nextDueDate,
        isActive: formData.isActive,
        notes: formData.notes || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        associatedAirdropId: formData.associatedAirdropId || undefined,
        completionHistory: initialData?.completionHistory || [],
        category: formData.category || undefined
      };

      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Task operation failed:', error);
      addToast('Failed to save task. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const airdropOptions = [
    { value: '', label: 'No Associated Airdrop' },
    ...airdrops.map(airdrop => ({
      value: airdrop.id,
      label: airdrop.projectName
    }))
  ];

  const existingRecurringTaskTags = useMemo(() => {
    const tagsSet = new Set<string>();
    recurringTasks.forEach(task => task.tags?.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [recurringTasks]);

  const frequencyOptions = Object.values(TaskFrequency).map(freq => ({
    value: freq,
    label: freq
  }));

  const dayOfWeekOptions = [
    { value: 'Sun', label: 'Sunday' },
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Task Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter task name..."
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
            placeholder="Describe what needs to be done..."
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Repeat size={16} />
          Frequency Settings
        </h4>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Frequency *
          </label>
          <Select
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            options={frequencyOptions}
          />
        </div>

        {formData.frequency === TaskFrequency.EVERY_X_DAYS && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Every X Days
            </label>
            <Input
              type="number"
              value={formData.everyXDaysValue}
              onChange={(e) => handleInputChange('everyXDaysValue', e.target.value)}
              min="1"
              max="365"
              required
            />
          </div>
        )}

        {formData.frequency === TaskFrequency.SPECIFIC_DAYS_OF_WEEK && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Days of Week
            </label>
            <div className="grid grid-cols-2 gap-2">
              {dayOfWeekOptions.map(day => (
                <label key={day.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.specificDaysOfWeekValue.includes(day.value as DayOfWeek)}
                    onChange={(e) => {
                      const newDays = e.target.checked
                        ? [...formData.specificDaysOfWeekValue, day.value as DayOfWeek]
                        : formData.specificDaysOfWeekValue.filter(d => d !== day.value);
                      handleInputChange('specificDaysOfWeekValue', newDays);
                    }}
                  />
                  <span className="text-sm">{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Next Due Date *
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Associated Airdrop
        </label>
        <Select
          value={formData.associatedAirdropId}
          onChange={(e) => handleInputChange('associatedAirdropId', e.target.value)}
          options={airdropOptions}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <CreatableSelect
          value={formData.category}
          onChange={(value) => handleInputChange('category', value)}
          options={[
            { value: '', label: 'No Category' },
            ...availableCategories.map(category => ({
              value: category,
              label: category
            }))
          ]}
          placeholder="Select or create a category..."
          allowCreate={true}
          onCreateOption={(newCategory) => {
            setAvailableCategories(prev => [...prev, newCategory].sort());
          }}
        />
      </div>

      <div>
        <TagInput
          id="task-tags"
          tags={formData.tags}
          onTagsChange={(tags) => handleInputChange('tags', tags)}
          placeholder="Add tags..."
          suggestions={existingRecurringTaskTags}
          allowCustomTags={true}
          storageKey="recurring-tasks"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      {initialData && initialData.completionHistory && initialData.completionHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-text-light dark:text-text-dark mb-2 flex items-center">
            <History size={18} className="mr-2 text-indigo-500" />
            Completion History:
          </h4>
          <ul className="list-disc list-inside text-sm text-muted-light dark:text-muted-dark max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
            {initialData.completionHistory.map((dateStr, index) => (
              <li key={index}>{new Date(dateStr).toLocaleDateString()} at {new Date(dateStr).toLocaleTimeString()}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Creating new recurring task
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
            disabled={isSubmitting || !formData.name.trim() || !formData.nextDueDate}
            leftIcon={isSubmitting ? undefined : <Save size={16} />}
          >
            {isSubmitting ? 'Saving...' : 'Create Task'}
          </Button>
        </div>
      </div>
    </form>
  );
};
