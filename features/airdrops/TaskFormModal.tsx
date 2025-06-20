import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { AirdropTask, Wallet, GasLogEntry, Airdrop, AirdropStatus } from '../../types'; 
import { useAppContext } from '../../contexts/AppContext';
import { XCircle, PlusCircle } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<AirdropTask>, parentId?: string) => void;
  initialData?: AirdropTask;
  parentId?: string;
  wallets: Wallet[];
  allAirdropTasksForDependencies: AirdropTask[]; 
  currentAirdropId: string;
  allAirdropsSystemWide: Airdrop[]; 
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  parentId,
  wallets,
  allAirdropTasksForDependencies,
  currentAirdropId,
  allAirdropsSystemWide,
}) => {
  const { appData } = useAppContext(); 
  const [description, setDescription] = useState('');
  const [associatedWalletId, setAssociatedWalletId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string | undefined>(undefined);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState<number | undefined>(undefined);
  const [cost, setCost] = useState<string | undefined>(undefined);
  const [linkedGasLogId, setLinkedGasLogId] = useState<string | undefined>(undefined);
  const [dependsOnTaskIds, setDependsOnTaskIds] = useState<string[]>([]);
  const [dependsOnAirdropMyStatusCompleted, setDependsOnAirdropMyStatusCompleted] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<{ description?: string }>({});

  const availableGasLogs = useMemo(() => {
    if (!associatedWalletId) return [];
    const wallet = wallets.find(w => w.id === associatedWalletId);
    return wallet?.gasLogs || [];
  }, [associatedWalletId, wallets]);

  useEffect(() => {
    if (isOpen) { // Only reset/initialize when modal becomes visible or initialData changes
        if (initialData) {
            setDescription(initialData.description);
            setAssociatedWalletId(initialData.associatedWalletId);
            setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : undefined);
            setNotes(initialData.notes);
            setTimeSpentMinutes(initialData.timeSpentMinutes);
            setCost(initialData.cost);
            setLinkedGasLogId(initialData.linkedGasLogId);
            setDependsOnTaskIds(initialData.dependsOnTaskIds || []);
            setDependsOnAirdropMyStatusCompleted(initialData.dependsOnAirdropMyStatusCompleted || undefined);
        } else {
            setDescription('');
            setAssociatedWalletId(undefined);
            setDueDate(undefined);
            setNotes(undefined);
            setTimeSpentMinutes(undefined);
            setCost(undefined);
            setLinkedGasLogId(undefined);
            setDependsOnTaskIds([]);
            setDependsOnAirdropMyStatusCompleted(undefined);
        }
        setErrors({}); // Clear errors when modal opens or data changes
    }
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: { description?: string } = {};
    if (!description.trim()) newErrors.description = 'Task description is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const taskData: Partial<AirdropTask> = {
        description: description.trim(),
        associatedWalletId: associatedWalletId || undefined,
        dueDate: dueDate || undefined,
        notes: notes?.trim() || undefined,
        timeSpentMinutes: timeSpentMinutes !== undefined ? Number(timeSpentMinutes) : undefined,
        cost: cost?.trim() || undefined,
        linkedGasLogId: linkedGasLogId || undefined,
        dependsOnTaskIds: dependsOnTaskIds,
        dependsOnAirdropMyStatusCompleted: dependsOnAirdropMyStatusCompleted || undefined,
        completed: initialData?.completed || false, 
      };
      if (initialData?.id) {
        taskData.id = initialData.id;
      }
      if (parentId && !initialData?.id) { // Only set parentId for new sub-tasks
        taskData.parentId = parentId;
      }
      
      onSubmit(taskData, parentId && !initialData?.id ? parentId : initialData?.parentId);
      // onClose(); // Parent component will close after successful submission from context
    }
  };
  
  const dependencyOptions = useMemo(() => {
    const options: { value: string, label: string, disabled?: boolean }[] = [];
    const currentEditingTaskId = initialData?.id;
    let descendantIds: string[] = [];

    const getDescendantIdsRecursive = (taskId: string | undefined, tasks: AirdropTask[]): string[] => {
      const descendants: string[] = [];
      for (const task of tasks) {
        if (task.id === taskId) {
          if (task.subTasks) {
            task.subTasks.forEach(subTask => {
              descendants.push(subTask.id);
              descendants.push(...getDescendantIdsRecursive(subTask.id, task.subTasks!));
            });
          }
          break;
        }
        if (task.subTasks) {
          descendants.push(...getDescendantIdsRecursive(taskId, task.subTasks));
        }
      }
      return descendants;
    };
    
    if (currentEditingTaskId) {
        descendantIds = getDescendantIdsRecursive(currentEditingTaskId, allAirdropTasksForDependencies);
    }


    const processTasksForOptions = (tasks: AirdropTask[], prefix: string = ''): { value: string; label: string }[] => {
      const options: { value: string; label: string }[] = [];
      tasks.forEach(task => {
        const label = prefix + task.description;
        options.push({ value: task.id, label });
        if (task.subTasks && task.subTasks.length > 0) {
          options.push(...processTasksForOptions(task.subTasks, prefix + '  '));
        }
      });
      return options;
    };
    processTasksForOptions(allAirdropTasksForDependencies);
    
    return options;
  }, [allAirdropTasksForDependencies, initialData, parentId]);

  const prerequisiteAirdropOptions = useMemo(() => {
    return [
      { value: '', label: 'None' },
      ...allAirdropsSystemWide
        .filter(ad => ad.id !== currentAirdropId) 
        .map(ad => ({ value: ad.id, label: ad.projectName }))
    ];
  }, [allAirdropsSystemWide, currentAirdropId]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : (parentId ? 'Add Sub-task' : 'Add New Task')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <Textarea
          id="taskDescription"
          label="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
          rows={3}
          placeholder="e.g., Swap on main DEX, Bridge ETH to Arbitrum"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="taskDueDate"
            label="Due Date (Optional)"
            type="date"
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Select
            id="taskAssociatedWallet"
            label="Associated Wallet (Optional)"
            value={associatedWalletId || ''}
            onChange={(e) => {
                setAssociatedWalletId(e.target.value || undefined);
                setLinkedGasLogId(undefined); 
            }}
            options={[{ value: '', label: 'None' }, ...wallets.map(w => ({ value: w.id, label: `${w.name} (${w.address.substring(0,6)}...${w.address.substring(w.address.length-4)})` }))]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                id="taskTimeSpent"
                label="Time Spent (Minutes, Optional)"
                type="number"
                value={timeSpentMinutes === undefined ? '' : timeSpentMinutes.toString()}
                onChange={(e) => setTimeSpentMinutes(e.target.value === '' ? undefined : parseInt(e.target.value))}
                min="0"
                placeholder="e.g., 30"
            />
            <Input
                id="taskCost"
                label="Direct Cost (Optional, e.g., mint fee)"
                value={cost || ''}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g., 0.01 ETH or $5"
            />
        </div>
         <Select
            id="taskLinkedGasLog"
            label="Link to General Gas Log (Optional)"
            value={linkedGasLogId || ''}
            onChange={(e) => setLinkedGasLogId(e.target.value || undefined)}
            disabled={!associatedWalletId || availableGasLogs.length === 0}
            options={[
                { value: '', label: availableGasLogs.length === 0 && associatedWalletId ? 'No gas logs for selected wallet' : (associatedWalletId ? 'None' : 'Select a wallet first') },
                ...availableGasLogs.map(log => ({
                    value: log.id,
                    label: `${new Date(log.date).toLocaleDateString()}: ${log.amount} ${log.currency} (${log.description || 'Gas'}) on ${log.network || 'N/A'}`
                }))
            ]}
        />
        
        <div>
            <label htmlFor="taskDependencies" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Depends On Other Tasks (Optional)
            </label>
            <select
                id="taskDependencies"
                multiple
                value={dependsOnTaskIds}
                onChange={(e) => setDependsOnTaskIds(Array.from(e.target.selectedOptions, option => option.value))}
                className="block w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary dark:focus:ring-primary focus:border-primary dark:focus:border-primary sm:text-sm bg-white dark:bg-card-dark text-text-light dark:text-muted-dark"
            >
                {dependencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}{opt.disabled ? ' (Cannot select self/child/parent)' : ''}
                    </option>
                ))}
            </select>
             <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Select tasks within *this* airdrop that must be completed before this one. Cannot depend on self, children or parent (if adding sub-task).</p>
        </div>

        <Select
            id="taskAirdropDependency"
            label="Prerequisite Airdrop Completion (Optional)"
            value={dependsOnAirdropMyStatusCompleted || ''}
            onChange={(e) => setDependsOnAirdropMyStatusCompleted(e.target.value || undefined)}
            options={prerequisiteAirdropOptions}
        />
         <p className="text-xs text-muted-light dark:text-muted-dark -mt-3 mb-2">This task will be blocked until the selected airdrop is marked as 'Completed' in 'My Status'.</p>


        <Textarea
          id="taskNotes"
          label="Notes (Optional)"
          value={notes || ''}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g., Specific requirements, links to guides"
        />
        <div className="flex justify-end space-x-2 pt-3 sticky bottom-0 bg-card-light dark:bg-card-dark py-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialData ? 'Save Changes' : 'Add Task'}</Button>
        </div>
      </form>
    </Modal>
  );
};
