import React, { useState, useEffect, useMemo } from 'react';
import { RecurringTask, TaskFrequency, Airdrop, DayOfWeek } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { TagInput } from '../../components/ui/TagInput'; 
import { History } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext'; 
import { TASK_FREQUENCY_OPTIONS, DAYS_OF_WEEK } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation'; // Added
import { useToast } from '../../hooks/useToast'; // Added

interface TaskFormProps {
  onSubmit: (task: Omit<RecurringTask, 'id' | 'completionHistory'> | RecurringTask) => Promise<void>;
  initialData?: RecurringTask;
  airdrops: Airdrop[];
  onClose: () => void;
}

const NTH_VALUE_OPTIONS = [
    { value: 1, label: '1st' },
    { value: 2, label: '2nd' },
    { value: 3, label: '3rd' },
    { value: 4, label: '4th' },
    { value: 5, label: 'Last' }, 
];

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, airdrops, onClose }) => {
  const { appData } = useAppContext(); 
  const { t } = useTranslation(); // Added
  const { addToast } = useToast(); // Added
  const [formData, setFormData] = useState<Partial<RecurringTask>>({
    name: '',
    associatedAirdropId: undefined,
    frequency: TaskFrequency.WEEKLY,
    everyXDaysValue: undefined, 
    specificDaysOfWeekValue: [], 
    description: '',
    nextDueDate: new Date().toISOString().split('T')[0],
    isActive: true,
    completionHistory: [],
    notes: '',
    tags: [], 
    everyXWeeksValue: undefined,
    specificDayOfWeekForXWeeksValue: undefined,
    specificDatesValue: [],
    nthValue: 1, 
    dayOfWeekForNth: DAYS_OF_WEEK[1], 
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [specificDateInput, setSpecificDateInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        completionHistory: initialData.completionHistory || [],
        notes: initialData.notes || '',
        tags: initialData.tags || [], 
        everyXDaysValue: initialData.everyXDaysValue || undefined,
        specificDaysOfWeekValue: initialData.specificDaysOfWeekValue || [],
        everyXWeeksValue: initialData.everyXWeeksValue || undefined,
        specificDayOfWeekForXWeeksValue: initialData.specificDayOfWeekForXWeeksValue || undefined,
        specificDatesValue: initialData.specificDatesValue || [],
        nthValue: initialData.nthValue || 1,
        dayOfWeekForNth: initialData.dayOfWeekForNth || DAYS_OF_WEEK[1],
      });
    } else {
      setFormData({
        name: '',
        associatedAirdropId: undefined,
        frequency: TaskFrequency.WEEKLY,
        everyXDaysValue: undefined,
        specificDaysOfWeekValue: [],
        description: '',
        nextDueDate: new Date().toISOString().split('T')[0],
        isActive: true,
        completionHistory: [],
        notes: '',
        tags: [],
        everyXWeeksValue: undefined,
        specificDayOfWeekForXWeeksValue: undefined,
        specificDatesValue: [],
        nthValue: 1,
        dayOfWeekForNth: DAYS_OF_WEEK[1],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') { 
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'everyXDaysValue' || name === 'everyXWeeksValue' || name === 'nthValue') {
        setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseInt(value, 10) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecificDaysChange = (day: DayOfWeek) => {
    setFormData(prev => {
        const currentDays = prev.specificDaysOfWeekValue || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        return { ...prev, specificDaysOfWeekValue: newDays };
    });
  };

  const handleAddSpecificDate = () => {
    if (specificDateInput && !formData.specificDatesValue?.includes(specificDateInput)) {
        try {
            new Date(specificDateInput).toISOString(); 
            setFormData(prev => ({
                ...prev,
                specificDatesValue: [...(prev.specificDatesValue || []), specificDateInput].sort()
            }));
            setSpecificDateInput('');
        } catch (e) {
           setErrors(prev => ({...prev, specificDatesValue: 'Invalid date format. Use YYYY-MM-DD.'}));
        }
    }
  };
  const handleRemoveSpecificDate = (dateToRemove: string) => {
    setFormData(prev => ({
        ...prev,
        specificDatesValue: (prev.specificDatesValue || []).filter(d => d !== dateToRemove)
    }));
  };


  const handleTagsChange = (newTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleToggleActive = (isActive: boolean) => {
    setFormData(prev => ({ ...prev, isActive }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Task name is required.';
    if (!formData.nextDueDate) newErrors.nextDueDate = 'Next due date is required.';
    else if (isNaN(new Date(formData.nextDueDate).getTime())) newErrors.nextDueDate = 'Invalid date format.';
    
    if (formData.frequency === TaskFrequency.EVERY_X_DAYS && (!formData.everyXDaysValue || formData.everyXDaysValue <= 0)) {
        newErrors.everyXDaysValue = 'Please enter a positive number of days.';
    }
    if (formData.frequency === TaskFrequency.SPECIFIC_DAYS_OF_WEEK && (!formData.specificDaysOfWeekValue || formData.specificDaysOfWeekValue.length === 0)) {
        newErrors.specificDaysOfWeekValue = 'Please select at least one day.';
    }
    if (formData.frequency === TaskFrequency.EVERY_X_WEEKS_ON_DAY) {
        if (!formData.everyXWeeksValue || formData.everyXWeeksValue <= 0) {
             newErrors.everyXWeeksValue = 'Please enter a positive number of weeks.';
        }
        if (!formData.specificDayOfWeekForXWeeksValue) {
            newErrors.specificDayOfWeekForXWeeksValue = 'Please select a day of the week.';
        }
    }
    if (formData.frequency === TaskFrequency.NTH_WEEKDAY_OF_MONTH) {
        if (!formData.nthValue || formData.nthValue < 1 || formData.nthValue > 5) {
            newErrors.nthValue = 'Please select a valid Nth value (1st-Last).';
        }
        if (!formData.dayOfWeekForNth) {
            newErrors.dayOfWeekForNth = 'Please select a day of the week.';
        }
    }
    if (formData.frequency === TaskFrequency.SPECIFIC_DATES && (!formData.specificDatesValue || formData.specificDatesValue.length === 0)) {
        newErrors.specificDatesValue = 'Please add at least one specific date.';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
        const { completionHistory, ...submissionBase } = formData;
        
        const taskPayload: Partial<RecurringTask> = { 
            name: submissionBase.name || '',
            associatedAirdropId: submissionBase.associatedAirdropId || undefined,
            frequency: submissionBase.frequency || TaskFrequency.WEEKLY,
            description: submissionBase.description || '',
            nextDueDate: submissionBase.nextDueDate || new Date().toISOString().split('T')[0],
            isActive: submissionBase.isActive === undefined ? true : submissionBase.isActive,
            notes: submissionBase.notes || '',
            tags: submissionBase.tags || [], 
        };

        if (taskPayload.frequency === TaskFrequency.EVERY_X_DAYS) taskPayload.everyXDaysValue = submissionBase.everyXDaysValue;
        else delete taskPayload.everyXDaysValue; 
        
        if (taskPayload.frequency === TaskFrequency.SPECIFIC_DAYS_OF_WEEK) taskPayload.specificDaysOfWeekValue = submissionBase.specificDaysOfWeekValue;
        else delete taskPayload.specificDaysOfWeekValue; 
        
        if (taskPayload.frequency === TaskFrequency.EVERY_X_WEEKS_ON_DAY) {
            taskPayload.everyXWeeksValue = submissionBase.everyXWeeksValue;
            taskPayload.specificDayOfWeekForXWeeksValue = submissionBase.specificDayOfWeekForXWeeksValue;
        } else {
            delete taskPayload.everyXWeeksValue;
            delete taskPayload.specificDayOfWeekForXWeeksValue;
        }
        if (taskPayload.frequency === TaskFrequency.NTH_WEEKDAY_OF_MONTH) {
            taskPayload.nthValue = submissionBase.nthValue;
            taskPayload.dayOfWeekForNth = submissionBase.dayOfWeekForNth;
        } else {
            delete taskPayload.nthValue;
            delete taskPayload.dayOfWeekForNth;
        }
        if (taskPayload.frequency === TaskFrequency.SPECIFIC_DATES) taskPayload.specificDatesValue = (submissionBase.specificDatesValue || []).sort();
        else delete taskPayload.specificDatesValue;

        if (initialData && initialData.id) {
            await onSubmit({ ...taskPayload, id: initialData.id, completionHistory: initialData.completionHistory || [] } as RecurringTask);
        } else {
            await onSubmit(taskPayload as Omit<RecurringTask, 'id' | 'completionHistory'>);
        }
        onClose(); // Toast is handled by AppContext now
    } catch (error) {
        addToast(`Error submitting task: ${(error as Error).message}`, "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const airdropOptions = [{ value: '', label: 'None (General Task)' }, ...airdrops.map(a => ({ value: a.id, label: a.projectName }))];
  const existingRecurringTaskTags = useMemo(() => {
    const tagsSet = new Set<string>();
    appData.recurringTasks.forEach(task => task.tags?.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [appData.recurringTasks]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input
        id="taskName"
        name="name"
        label="Task Name"
        value={formData.name || ''}
        onChange={handleChange}
        error={!!errors.name}
        required
        disabled={isSubmitting}
      />
      <Select
        id="associatedAirdropId"
        name="associatedAirdropId"
        label="Associated Airdrop (Optional)"
        value={formData.associatedAirdropId || ''}
        onChange={handleChange}
        options={airdropOptions}
        disabled={isSubmitting}
      />
      <Select
        id="frequency"
        name="frequency"
        label="Frequency"
        value={formData.frequency || TaskFrequency.WEEKLY}
        onChange={handleChange}
        options={TASK_FREQUENCY_OPTIONS}
        required
        disabled={isSubmitting}
      />
      {formData.frequency === TaskFrequency.EVERY_X_DAYS && (
        <Input
            id="everyXDaysValue"
            name="everyXDaysValue"
            label="Repeat Every (Days)"
            type="number"
            value={formData.everyXDaysValue || ''}
            onChange={handleChange}
            error={!!errors.everyXDaysValue}
            min="1"
            placeholder="e.g., 3 for every 3 days"
            disabled={isSubmitting}
        />
      )}
      {formData.frequency === TaskFrequency.SPECIFIC_DAYS_OF_WEEK && (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repeat on Days:</label>
            <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                    <label key={day} className="flex items-center space-x-1.5 p-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
                        <input
                            type="checkbox"
                            name="specificDaysOfWeekValue"
                            value={day}
                            checked={formData.specificDaysOfWeekValue?.includes(day) || false}
                            onChange={() => handleSpecificDaysChange(day)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            disabled={isSubmitting}
                        />
                        <span className="text-sm text-text-light dark:text-text-dark">{day}</span>
                    </label>
                ))}
            </div>
            {!!errors.specificDaysOfWeekValue && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.specificDaysOfWeekValue}</p>}
        </div>
      )}
      {formData.frequency === TaskFrequency.EVERY_X_WEEKS_ON_DAY && (
        <div className="grid grid-cols-2 gap-3">
            <Input id="everyXWeeksValue" name="everyXWeeksValue" label="Repeat Every (Weeks)" type="number" value={formData.everyXWeeksValue || ''} onChange={handleChange} error={!!errors.everyXWeeksValue} min="1" placeholder="e.g., 2 for every 2 weeks" disabled={isSubmitting}/>
            <Select id="specificDayOfWeekForXWeeksValue" name="specificDayOfWeekForXWeeksValue" label="On Day" value={formData.specificDayOfWeekForXWeeksValue || ''} onChange={handleChange} options={[{value: '', label: 'Select Day'}, ...DAYS_OF_WEEK.map(d => ({value: d, label: d}))]} error={!!errors.specificDayOfWeekForXWeeksValue} disabled={isSubmitting}/>
        </div>
      )}
      {formData.frequency === TaskFrequency.NTH_WEEKDAY_OF_MONTH && (
        <div className="grid grid-cols-2 gap-3">
            <Select 
                id="nthValue" 
                name="nthValue" 
                label="Which Week?" 
                value={formData.nthValue || ''} 
                onChange={handleChange} 
                options={NTH_VALUE_OPTIONS} 
                error={!!errors.nthValue}
                disabled={isSubmitting}
            />
            <Select 
                id="dayOfWeekForNth" 
                name="dayOfWeekForNth" 
                label="Day of Week" 
                value={formData.dayOfWeekForNth || ''} 
                onChange={handleChange} 
                options={DAYS_OF_WEEK.map(d => ({value: d, label: d}))} 
                error={!!errors.dayOfWeekForNth}
                disabled={isSubmitting}
            />
        </div>
      )}
      {formData.frequency === TaskFrequency.SPECIFIC_DATES && (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specific Dates (YYYY-MM-DD):</label>
            <div className="flex items-center gap-2 mb-2">
                <Input type="date" value={specificDateInput} onChange={e => setSpecificDateInput(e.target.value)} wrapperClassName="flex-grow mb-0" disabled={isSubmitting}/>
                <Button type="button" size="sm" onClick={handleAddSpecificDate} variant="outline" disabled={!specificDateInput || isSubmitting}>Add Date</Button>
            </div>
            {(formData.specificDatesValue || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 border rounded-md">
                    {(formData.specificDatesValue || []).map(dateStr => (
                        <span key={dateStr} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded-full flex items-center">
                            {dateStr}
                            <button type="button" onClick={() => handleRemoveSpecificDate(dateStr)} className="ml-1.5 text-red-500 hover:text-red-700" disabled={isSubmitting}>&times;</button>
                        </span>
                    ))}
                </div>
            )}
             {!!errors.specificDatesValue && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.specificDatesValue}</p>}
        </div>
      )}

      <Input
        id="nextDueDate"
        name="nextDueDate"
        label="Next Due Date"
        type="date"
        value={formData.nextDueDate || ''}
        onChange={handleChange}
        error={!!errors.nextDueDate}
        required
        disabled={isSubmitting}
      />
      <Textarea
        id="description"
        name="description"
        label="Description / Action to Take"
        value={formData.description || ''}
        onChange={handleChange}
        rows={2}
        disabled={isSubmitting}
      />
      <Textarea
        id="notes"
        name="notes"
        label="Notes (Optional)"
        value={formData.notes || ''}
        onChange={handleChange}
        rows={2}
        placeholder="Add any specific reminders or details for this task."
        disabled={isSubmitting}
      />
      <TagInput 
        id="recurringTaskTags"
        label="Tags (Optional)"
        tags={formData.tags || []}
        onTagsChange={handleTagsChange}
        suggestions={existingRecurringTaskTags}
        placeholder="e.g., Daily, Social, Maintenance"
        disabled={isSubmitting}
      />
      <ToggleSwitch
        id="isActive"
        label="Task Active"
        checked={formData.isActive || false}
        onChange={handleToggleActive}
        disabled={isSubmitting}
      />

      {initialData?.completionHistory && initialData.completionHistory.length > 0 && (
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

      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-card-light dark:bg-card-dark py-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t('common_cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>{initialData ? t('common_save_changes_button', {defaultValue:'Save Changes'}) : t('add_new_task_button')}</Button>
      </div>
    </form>
  );
};
