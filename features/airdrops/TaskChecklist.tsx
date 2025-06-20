import React, { useState, useMemo, useEffect } from 'react';
import { AirdropTask, Wallet, TaskSortOption, TaskCompletionSuggestion, Airdrop } from '../../types';
import { TaskItem } from './TaskItem';
import { TaskTimerModal } from './TaskTimerModal';
import { TaskCompletionSuggestionModal } from './TaskCompletionSuggestionModal';
import { Button } from '../../design-system/components/Button';
import { PlusCircle, SortAsc, SortDesc, Filter, CheckSquare, Square, Brain, Loader2 } from 'lucide-react';
import { Select } from '../../design-system/components/Select';
import { Input } from '../../design-system/components/Input';
import { BatchEditAirdropTasksModal } from './BatchEditAirdropTasksModal';
import { useAppContext } from '../../contexts/AppContext';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useToast } from '../../hooks/useToast';
import { AlertMessage } from '../../components/ui/AlertMessage';

interface TaskChecklistProps {
  airdropId: string;
  tasks: AirdropTask[];
  wallets: Wallet[];
  allAirdropTasksForDependencies: AirdropTask[];
  allAirdropsSystemWide: Airdrop[];
  onAddTask: (airdropId: string, taskData: Omit<AirdropTask, 'id' | 'subTasks' | 'completionDate'>) => void;
  onUpdateTask: (airdropId: string, task: AirdropTask) => void;
  onDeleteTask: (airdropId: string, taskId: string, parentId?: string) => void;
  onUpdateMultipleTasks: (airdropId: string, taskIds: string[], updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>>) => void;
  isArchived: boolean;
  highlightTaskId: string | null;
  onCompleteAllSubTasks: (parentTaskId: string) => void; 
  onOpenTaskForm: (task?: AirdropTask, parentId?: string) => void; 
  onOpenTimerModal: (task: AirdropTask) => void;
  onOpenSuggestionModal: (task: AirdropTask) => void; 
}

export const TaskChecklist: React.FC<TaskChecklistProps> = ({
  airdropId, tasks, wallets, allAirdropTasksForDependencies, allAirdropsSystemWide,
  onAddTask, onUpdateTask, onDeleteTask,
  onUpdateMultipleTasks, isArchived, highlightTaskId, onCompleteAllSubTasks,
  onOpenTaskForm, 
  onOpenTimerModal,
  onOpenSuggestionModal 
}) => {
  const { getRecentWalletLogs } = useAppContext();
  const { addToast } = useToast();
  
  const [filterText, setFilterText] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [sortBy, setSortBy] = useState<TaskSortOption>('default');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isBatchEditModalOpen, setIsBatchEditModalOpen] = useState(false);

  const [isAiChecking, setIsAiChecking] = useState(false);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

   useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
    }
  }, []);


  const recursivelyFilterTasks = (tasksToFilter: AirdropTask[], text: string, status: 'all' | 'completed' | 'incomplete'): AirdropTask[] => {
    return tasksToFilter.filter(task => {
      const matchesText = !text || task.description.toLowerCase().includes(text.toLowerCase());
      const matchesStatus = status === 'all' || 
        (status === 'completed' && task.completed) || 
        (status === 'incomplete' && !task.completed);
      
      if (task.subTasks && task.subTasks.length > 0) {
        const filteredSubTasks = recursivelyFilterTasks(task.subTasks, text, status);
        return matchesText && matchesStatus || filteredSubTasks.length > 0;
      }
      
      return matchesText && matchesStatus;
    }).map(task => ({
      ...task,
      subTasks: task.subTasks ? recursivelyFilterTasks(task.subTasks, text, status) : undefined
    }));
  };

  const sortedAndFilteredTasks = useMemo(() => {
    let processedTasks = recursivelyFilterTasks(tasks, filterText, filterCompleted);
    switch (sortBy) {
        case 'dueDateAsc':
            processedTasks.sort((a,b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : (a.dueDate ? -1 : 1));
            break;
        case 'dueDateDesc':
            processedTasks.sort((a,b) => (a.dueDate && b.dueDate) ? new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime() : (a.dueDate ? 1 : -1));
            break;
        case 'completedFirst':
            processedTasks.sort((a,b) => (a.completed === b.completed) ? 0 : a.completed ? -1 : 1);
            break;
        case 'incompleteFirst':
            processedTasks.sort((a,b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
            break;
        case 'descriptionAsc':
             processedTasks.sort((a,b) => a.description.localeCompare(b.description));
            break;
        default: 
            break; 
    }
    return processedTasks;
  }, [tasks, filterText, filterCompleted, sortBy]);
  
  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };
  
  const handleBatchUpdate = (updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>>) => {
    if (selectedTaskIds.length > 0) {
        onUpdateMultipleTasks(airdropId, selectedTaskIds, updates);
        addToast(`${selectedTaskIds.length} tasks updated.`, 'success');
        setSelectedTaskIds([]);
    }
    setIsBatchEditModalOpen(false);
  };
  
  const handleOpenAiSuggestionModalLocal = async (task: AirdropTask) => {
    if (isArchived || isAiChecking) return;
    if (isApiKeyMissing) {
      addToast("AI Task Completion Suggestion requires an API_KEY.", "warning");
      return;
    }
    onOpenSuggestionModal(task);
  };


  const sortOptions: { value: TaskSortOption, label: string }[] = [
    { value: 'default', label: 'Default Order' },
    { value: 'dueDateAsc', label: 'Due Date (Oldest First)' },
    { value: 'dueDateDesc', label: 'Due Date (Newest First)' },
    { value: 'completedFirst', label: 'Completed First' },
    { value: 'incompleteFirst', label: 'Incomplete First' },
    { value: 'descriptionAsc', label: 'Description (A-Z)'},
  ];

  return (
    <>
      {isApiKeyMissing && (
        <AlertMessage
            type="info"
            message="AI Task Completion Suggestion feature is disabled as API_KEY is not configured."
            className="mb-3 text-xs"
        />
      )}
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Input
            id="taskFilterText"
            label="Filter Tasks by Text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search descriptions, notes..."
          />
          <Select
            id="taskFilterCompleted"
            label="Filter by Status"
            value={filterCompleted}
            onChange={(e) => setFilterCompleted(e.target.value as any)}
            options={[
              { value: 'all', label: 'All Tasks' },
              { value: 'completed', label: 'Completed Only' },
              { value: 'incomplete', label: 'Incomplete Only' },
            ]}
          />
          <Select
            id="taskSortBy"
            label="Sort Tasks By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as TaskSortOption)}
            options={sortOptions}
          />
        </div>
        {selectedTaskIds.length > 0 && !isArchived && (
             <Button onClick={() => setIsBatchEditModalOpen(true)} size="sm" variant="secondary" className="mt-3">
                Batch Edit ({selectedTaskIds.length}) Selected
            </Button>
        )}
      </div>

      {sortedAndFilteredTasks.length === 0 ? (
        <p className="text-center text-muted-light dark:text-muted-dark py-4">
          {tasks.length === 0 ? 'No tasks added yet for this airdrop.' : 'No tasks match your current filters.'}
        </p>
      ) : (
        <div className="space-y-0.5"> 
          {sortedAndFilteredTasks.map(task => (
            <div key={task.id} className="flex items-start gap-2">
               {!isArchived && (
                <input 
                    type="checkbox"
                    className="mt-3.5 h-4 w-4 text-primary-light dark:text-primary-dark border-gray-300 dark:border-gray-600 rounded focus:ring-primary-light dark:focus:ring-primary-dark flex-shrink-0"
                    checked={selectedTaskIds.includes(task.id)}
                    onChange={() => handleToggleSelectTask(task.id)}
                    aria-label={`Select task ${task.description}`}
                />
               )}
              <div className="flex-grow">
                <TaskItem
                    task={task}
                    airdropId={airdropId}
                    wallets={wallets}
                    allAirdropTasksForDependencies={allAirdropTasksForDependencies} 
                    allAirdropsSystemWide={allAirdropsSystemWide}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    onOpenTaskForm={onOpenTaskForm} 
                    isArchived={isArchived}
                    highlight={task.id === highlightTaskId}
                    globalHighlightId={highlightTaskId}
                    onCompleteAllSubTasks={() => onCompleteAllSubTasks(task.id)}
                    level={0} 
                    onOpenTimerModal={onOpenTimerModal} 
                    onOpenSuggestionModal={onOpenSuggestionModal} 
                />
              </div>
            </div>
          ))}
        </div>
      )}

       <BatchEditAirdropTasksModal
        isOpen={isBatchEditModalOpen}
        onClose={() => setIsBatchEditModalOpen(false)}
        wallets={wallets}
        onSubmit={handleBatchUpdate}
        selectedCount={selectedTaskIds.length}
      />
    </>
  );
};
