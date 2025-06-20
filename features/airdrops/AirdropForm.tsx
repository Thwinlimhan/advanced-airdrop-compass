import React, { useState, useEffect } from 'react';
import { Airdrop, AirdropStatus, AirdropPriority, AirdropTemplate, AirdropTask, AirdropCustomField, AirdropNotificationSettings, AirdropProjectCategory } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Button } from '../../design-system/components/Button';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { TagInput } from '../../components/ui/TagInput';
import { BLOCKCHAIN_OPTIONS, AIRDROP_STATUS_OPTIONS, MY_AIRDROP_STATUS_OPTIONS, AIRDROP_PRIORITY_OPTIONS, AIRDROP_PROJECT_CATEGORIES, AIRDROP_POTENTIAL_OPTIONS } from '../../constants';
import { useAppContext } from '../../contexts/AppContext';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageUp, Loader2, Brain, PlusCircle, Trash2, Bell, Info } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface AirdropFormProps {
  onSubmit: (airdrop: Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'roadmapEvents' | 'customFields' | 'dateAdded' | 'notificationOverrides'> | Airdrop) => Promise<void | Airdrop | null>; 
  initialData?: Airdrop;
  onClose: () => void;
}

export const AirdropForm: React.FC<AirdropFormProps> = ({ onSubmit, initialData, onClose }) => {
  const { appData } = useAppContext();
  const { addToast } = useToast();
  const { t } = useTranslation(); // Added
  
  const getInitialNotificationToggleState = (key: keyof AirdropNotificationSettings, initialAirdropData?: Airdrop): boolean => {
    if (initialAirdropData?.notificationOverrides && initialAirdropData.notificationOverrides[key] !== undefined) {
      return initialAirdropData.notificationOverrides[key]!;
    }
    return appData.settings.defaultAirdropNotificationSettings[key];
  };

  const [formData, setFormData] = useState<Partial<Airdrop>>({
    projectName: '',
    blockchain: BLOCKCHAIN_OPTIONS[0],
    status: AirdropStatus.RUMORED,
    potential: AIRDROP_POTENTIAL_OPTIONS[0],
    myStatus: AirdropStatus.NOT_STARTED,
    priority: AirdropPriority.MEDIUM,
    description: '',
    officialLinks: { website: '', twitter: '', discord: '' },
    eligibilityCriteria: '',
    notes: '',
    tags: [],
    timeSpentHours: 0,
    isArchived: false,
    dependentOnAirdropIds: [],
    leadsToAirdropIds: [],
    logoBase64: undefined,
    customFields: [],
    notificationOverrides: initialData?.notificationOverrides ? { ...initialData.notificationOverrides } : undefined,
    projectCategory: undefined,
  });

  const [notifyTaskDueDate, setNotifyTaskDueDate] = useState<boolean>(getInitialNotificationToggleState('taskDueDate', initialData));
  const [notifyStatusChange, setNotifyStatusChange] = useState<boolean>(getInitialNotificationToggleState('statusChange', initialData));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state
  const [newCustomFieldKey, setNewCustomFieldKey] = useState('');
  const [newCustomFieldValue, setNewCustomFieldValue] = useState('');

  const blockchainOptions = BLOCKCHAIN_OPTIONS.map((b) => ({ value: b, label: b }));

  useEffect(() => {
    if (initialData) {
      const { tasks, transactions, claimedTokens, sybilChecklist, roadmapEvents, dateAdded, ...editableData } = initialData;
      setFormData({
        ...editableData,
        potential: initialData.potential || AIRDROP_POTENTIAL_OPTIONS[0],
        officialLinks: { ...(initialData.officialLinks || {}) },
        tags: initialData.tags || [],
        priority: initialData.priority || AirdropPriority.MEDIUM,
        timeSpentHours: initialData.timeSpentHours || 0,
        isArchived: initialData.isArchived || false,
        dependentOnAirdropIds: initialData.dependentOnAirdropIds || [],
        leadsToAirdropIds: initialData.leadsToAirdropIds || [],
        logoBase64: initialData.logoBase64 || undefined,
        customFields: initialData.customFields || [],
        notificationOverrides: initialData.notificationOverrides ? { ...initialData.notificationOverrides } : undefined,
        projectCategory: initialData.projectCategory || undefined,
      });
      setNotifyTaskDueDate(getInitialNotificationToggleState('taskDueDate', initialData));
      setNotifyStatusChange(getInitialNotificationToggleState('statusChange', initialData));
      setSelectedTemplateId('');
    } else {
        setFormData({
            projectName: '', blockchain: BLOCKCHAIN_OPTIONS[0], status: AirdropStatus.RUMORED,
            potential: AIRDROP_POTENTIAL_OPTIONS[0], myStatus: AirdropStatus.NOT_STARTED,
            priority: AirdropPriority.MEDIUM, description: '',
            officialLinks: { website: '', twitter: '', discord: '' },
            eligibilityCriteria: '', notes: '', tags: [], timeSpentHours: 0, isArchived: false,
            dependentOnAirdropIds: [], leadsToAirdropIds: [], logoBase64: undefined, customFields: [],
            notificationOverrides: undefined, 
            projectCategory: undefined,
        });
        setNotifyTaskDueDate(appData.settings.defaultAirdropNotificationSettings.taskDueDate);
        setNotifyStatusChange(appData.settings.defaultAirdropNotificationSettings.statusChange);
        setSelectedTemplateId('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, appData.settings.defaultAirdropNotificationSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'timeSpentHours' && type === 'number') {
        setFormData(prev => ({...prev, [name]: value === '' ? 0 : parseFloat(value) }));
    } else if (type === 'number') {
        setFormData(prev => ({...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      officialLinks: {
        ...(prev.officialLinks || {}),
        [name]: value,
      },
    }));
  };

  const handleTagsChange = (newTags: string[]) => {
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleMultiSelectChange = (name: 'dependentOnAirdropIds' | 'leadsToAirdropIds', selectedOptions: HTMLSelectElement['selectedOptions']) => {
    const values = Array.from(selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (templateId) {
        const template = appData.airdropTemplates?.find(t => t.id === templateId);
        if (template) {
            setFormData(prev => ({
                ...prev,
                description: template.description || prev.description,
                blockchain: template.blockchain || prev.blockchain,
            }));
             addToast(`Template "${template.name}" applied. Tasks will be added on save.`, 'info');
        }
    }
  };
  
  const handleNotificationToggleChange = (key: keyof AirdropNotificationSettings, value: boolean) => {
    if (key === 'taskDueDate') setNotifyTaskDueDate(value);
    if (key === 'statusChange') setNotifyStatusChange(value);

    setFormData(prev => {
        const currentOverrides = { ...(prev.notificationOverrides || {}) };
        const globalDefault = appData.settings.defaultAirdropNotificationSettings[key];
        
        if (value === globalDefault) {
            delete currentOverrides[key];
        } else {
            currentOverrides[key] = value;
        }
        
        const finalOverrides = Object.keys(currentOverrides).length > 0 ? currentOverrides : undefined;
        return { ...prev, notificationOverrides: finalOverrides };
    });
  };


  const validate = (): boolean => { 
    const newErrors: Record<string, string> = {};
    if (!formData.projectName?.trim()) newErrors.projectName = 'Project name is required.';
    if (!formData.blockchain?.trim()) newErrors.blockchain = 'Blockchain is required.';
    if (formData.timeSpentHours !== undefined && formData.timeSpentHours < 0) newErrors.timeSpentHours = 'Time spent cannot be negative.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
        const finalNotificationOverrides: Partial<AirdropNotificationSettings> = {};
        let overridesNeeded = false;

        if (notifyTaskDueDate !== appData.settings.defaultAirdropNotificationSettings.taskDueDate) {
            finalNotificationOverrides.taskDueDate = notifyTaskDueDate;
            overridesNeeded = true;
        }
        if (notifyStatusChange !== appData.settings.defaultAirdropNotificationSettings.statusChange) {
            finalNotificationOverrides.statusChange = notifyStatusChange;
            overridesNeeded = true;
        }
        
        const { dateAdded, ...submissionDataNoDate } = formData; 
        const submissionData = {
            projectName: submissionDataNoDate.projectName || '',
            blockchain: submissionDataNoDate.blockchain || BLOCKCHAIN_OPTIONS[0],
            status: submissionDataNoDate.status || AirdropStatus.RUMORED,
            potential: submissionDataNoDate.potential || AIRDROP_POTENTIAL_OPTIONS[0],
            myStatus: submissionDataNoDate.myStatus || AirdropStatus.NOT_STARTED,
            priority: submissionDataNoDate.priority || AirdropPriority.MEDIUM,
            description: submissionDataNoDate.description || '',
            officialLinks: submissionDataNoDate.officialLinks || { website: '', twitter: '', discord: '' },
            eligibilityCriteria: submissionDataNoDate.eligibilityCriteria || '',
            notes: submissionDataNoDate.notes || '',
            tags: submissionDataNoDate.tags || [],
            timeSpentHours: submissionDataNoDate.timeSpentHours || 0,
            isArchived: submissionDataNoDate.isArchived || false,
            dependentOnAirdropIds: submissionDataNoDate.dependentOnAirdropIds || [],
            leadsToAirdropIds: submissionDataNoDate.leadsToAirdropIds || [],
            logoBase64: submissionDataNoDate.logoBase64 || undefined,
            customFields: (submissionDataNoDate.customFields || []).filter(f => f.key.trim()),
            notificationOverrides: overridesNeeded ? finalNotificationOverrides : undefined,
            projectCategory: submissionDataNoDate.projectCategory || undefined,
        };

        let finalDataWithTasks: any = submissionData;

        if (!initialData?.id && selectedTemplateId) {
            const template = appData.airdropTemplates?.find(t => t.id === selectedTemplateId);
            if (template && template.tasks) {
            finalDataWithTasks.tasks = template.tasks.map(taskTemplate => ({
                id: crypto.randomUUID(),
                description: taskTemplate.description,
                completed: false,
                associatedWalletId: (taskTemplate as any).associatedWalletId,
                dueDate: (taskTemplate as any).dueDate,
                timeSpentMinutes: 0,
                notes: '',
                cost: '',
                linkedGasLogId: undefined,
                subTasks: [],
            }));
            }
        } else if (initialData?.id) {
            finalDataWithTasks = { ...initialData, ...submissionData }; 
        }

        await onSubmit(finalDataWithTasks as Airdrop); 
        onClose(); // Toast is handled by AppContext on successful API call
    } catch (error) {
        addToast(`Error submitting airdrop: ${(error as Error).message}`, "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const airdropOptionsForDependencies = appData.airdrops
    .filter(a => a.id !== initialData?.id)
    .map(a => ({ value: a.id, label: a.projectName }));

  const airdropTemplateOptions = [
    { value: '', label: 'None (Start Fresh)' },
    ...(appData.airdropTemplates || []).map(t => ({ value: t.id, label: t.name })),
  ];

  const projectCategoryOptions = AIRDROP_PROJECT_CATEGORIES.map((c) => ({ value: c, label: c }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input
        id="projectName"
        name="projectName"
        label="Project Name"
        value={formData.projectName || ''}
        onChange={handleChange}
        error={!!errors.projectName}
        required
        disabled={isSubmitting}
      />
      {!initialData?.id && (
        <Select id="airdropTemplate" name="airdropTemplate" label="Airdrop Template (Optional)" value={selectedTemplateId} onChange={handleTemplateChange} options={airdropTemplateOptions} disabled={isSubmitting}/>
      )}
      <Select
        id="blockchain"
        name="blockchain"
        label="Blockchain"
        value={formData.blockchain || ''}
        onChange={handleChange}
        options={blockchainOptions}
        error={!!errors.blockchain}
        required
        disabled={isSubmitting}
      />
      <Select id="projectCategory" name="projectCategory" label="Project Category (Optional)" value={formData.projectCategory || ''} onChange={handleChange} options={projectCategoryOptions} disabled={isSubmitting}/>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          id="status"
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          options={AIRDROP_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
          disabled={isSubmitting}
        />
        <Select id="potential" name="potential" label="Potential" value={formData.potential || AIRDROP_POTENTIAL_OPTIONS[0]} onChange={handleChange} options={AIRDROP_POTENTIAL_OPTIONS.map(p => ({ value: p, label: p }))} disabled={isSubmitting}/>
        <Select id="priority" name="priority" label="Priority" value={formData.priority || AirdropPriority.MEDIUM} onChange={handleChange} options={AIRDROP_PRIORITY_OPTIONS.map(p => ({value:p, label:p}))} disabled={isSubmitting}/>
      </div>

      <div>
        <Select id="myStatus" name="myStatus" label="My Status" value={formData.myStatus || AirdropStatus.NOT_STARTED} onChange={handleChange} options={AIRDROP_STATUS_OPTIONS.map(s => ({ value: s, label: s }))} disabled={isSubmitting}/>
        <p className="text-xs text-text-secondary mt-1">Your progress with this airdrop.</p>
      </div>

      <TagInput id="tags" label="Tags (Optional)" tags={formData.tags || []} onTagsChange={handleTagsChange} disabled={isSubmitting}/>
      
      <Input id="timeSpentHours" name="timeSpentHours" label="Overall Estimated Hours Spent (Manual Entry - Optional)" type="number" value={formData.timeSpentHours === undefined ? '' : formData.timeSpentHours.toString()} onChange={handleChange} error={!!errors.timeSpentHours} min="0" step="0.1" disabled={isSubmitting}/>
      <p className="text-xs text-text-secondary -mt-3 mb-2">Note: Task-specific time is logged separately.</p>
      
      <div className="space-y-2">
        <label htmlFor="dependentOnAirdropIds" className="block text-sm font-medium text-text-secondary">Depends On (Prerequisites - Optional)</label>
        <select
          id="dependentOnAirdropIds"
          name="dependentOnAirdropIds"
          multiple
          value={formData.dependentOnAirdropIds || []}
          onChange={(e) => handleMultiSelectChange('dependentOnAirdropIds', e.target.selectedOptions)}
          className="block w-full h-24 px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-surface-secondary text-text-primary"
          disabled={isSubmitting}
        >
          {airdropOptionsForDependencies.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="leadsToAirdropIds" className="block text-sm font-medium text-text-secondary">Leads To (Unlocks - Optional)</label>
        <select
          id="leadsToAirdropIds"
          name="leadsToAirdropIds"
          multiple
          value={formData.leadsToAirdropIds || []}
          onChange={(e) => handleMultiSelectChange('leadsToAirdropIds', e.target.selectedOptions)}
          className="block w-full h-24 px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm bg-surface-secondary text-text-primary"
          disabled={isSubmitting}
        >
          {airdropOptionsForDependencies.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div className="relative">
        <Textarea
          id="description"
          name="description"
          label="Description"
          value={formData.description || ''}
          onChange={handleChange}
          error={!!errors.description}
          rows={2}
          disabled={isSubmitting}
        />
      </div>

      <fieldset className="border border-border p-4 rounded-md" disabled={isSubmitting}>
        <legend className="text-sm font-medium px-1">Official Links (Optional)</legend>
        <div className="space-y-3">
          <Input id="website" name="website" label="Website URL" value={formData.officialLinks?.website || ''} onChange={handleLinkChange} type="url" placeholder="https://..." disabled={isSubmitting}/>
          <Input id="twitter" name="twitter" label="Twitter URL" value={formData.officialLinks?.twitter || ''} onChange={handleLinkChange} type="url" placeholder="https://twitter.com/..." disabled={isSubmitting}/>
          <Input id="discord" name="discord" label="Discord Invite URL" value={formData.officialLinks?.discord || ''} onChange={handleLinkChange} type="url" placeholder="https://discord.gg/..." disabled={isSubmitting}/>
        </div>
      </fieldset>

      <Textarea id="eligibilityCriteria" name="eligibilityCriteria" label="Eligibility Criteria (If known)" value={formData.eligibilityCriteria || ''} onChange={handleChange} rows={3} placeholder="e.g., Interacted before snapshot date, specific volume, testnet user..." disabled={isSubmitting}/>
      <Textarea id="notes" name="notes" label="Personal Notes" value={formData.notes || ''} onChange={handleChange} rows={3} placeholder="Any other relevant info, reminders, strategies..." disabled={isSubmitting}/>

      <fieldset className="border border-border p-4 rounded-md" disabled={isSubmitting}>
        <legend className="text-sm font-medium px-1 text-text-secondary flex items-center"><Bell size={14} className="mr-1.5 text-warning"/> Notification Overrides</legend>
        {!appData.settings.notificationsEnabled && (
            <div className="p-2 bg-warning/10 rounded-md text-xs text-warning flex items-center gap-2 my-2">
                <Info size={16}/> Global notifications are currently disabled in settings. These overrides will apply if global notifications are re-enabled.
            </div>
        )}
        <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
                <ToggleSwitch
                    id={`notify-task-due-${initialData?.id || 'new'}`}
                    label="Task Due Dates"
                    checked={notifyTaskDueDate}
                    onChange={(checked) => handleNotificationToggleChange('taskDueDate', checked)}
                    srLabel="Toggle task due date notifications for this airdrop"
                    disabled={isSubmitting}
                />
                <span className="text-xs text-text-secondary ml-2">
                    (Global default: {appData.settings.defaultAirdropNotificationSettings.taskDueDate ? "On" : "Off"})
                </span>
            </div>
            <div className="flex items-center justify-between">
                <ToggleSwitch
                    id={`notify-status-change-${initialData?.id || 'new'}`}
                    label="Airdrop Status Changes"
                    checked={notifyStatusChange}
                    onChange={(checked) => handleNotificationToggleChange('statusChange', checked)}
                    srLabel="Toggle airdrop status change notifications for this airdrop"
                    disabled={isSubmitting}
                />
                 <span className="text-xs text-text-secondary ml-2">
                    (Global default: {appData.settings.defaultAirdropNotificationSettings.statusChange ? "On" : "Off"})
                </span>
            </div>
        </div>
        <p className="text-xs text-text-secondary mt-2">
            Adjust these toggles to override the global notification settings for this specific airdrop. If a toggle's state matches the global default, no specific override is stored.
        </p>
      </fieldset>


      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-surface py-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t('common_cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>{initialData ? t('common_save_changes_button', {defaultValue:'Save Changes'}) : t('add_new_airdrop_button')}</Button>
      </div>
    </form>
  );
};
