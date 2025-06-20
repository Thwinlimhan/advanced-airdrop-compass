import React, { useState, useMemo } from 'react';
import { AirdropTask, Wallet, Airdrop, AirdropStatus } from '../../types';
import { Button } from '../../design-system/components/Button';
import { formatRelativeDate, formatMinutesToHoursAndMinutes } from '../../utils/formatting';
import { CheckSquare, Square, Edit3, Trash2, PlusCircle, ChevronDown, ChevronRight, Link as LinkIcon, Clock, DollarSign, Brain, CheckCheck, Lock } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

interface TaskItemProps {
  task: AirdropTask;
  airdropId: string;
  wallets: Wallet[];
  allAirdropTasksForDependencies: AirdropTask[];
  allAirdropsSystemWide: Airdrop[];
  onUpdateTask: (airdropId: string, task: AirdropTask) => void;
  onDeleteTask: (airdropId: string, taskId: string, parentId?: string) => void;
  onOpenTaskForm: (task?: AirdropTask, parentId?: string) => void;
  isArchived: boolean;
  highlight: boolean;
  globalHighlightId: string | null;
  onCompleteAllSubTasks: (parentTaskId: string) => void;
  level: number;
  onOpenTimerModal: (task: AirdropTask) => void;
  onOpenSuggestionModal: (task: AirdropTask) => void;
}

const findTaskByIdRecursive = (tasks: AirdropTask[], taskId: string): AirdropTask | undefined => {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    if (task.subTasks) {
      const found = findTaskByIdRecursive(task.subTasks, taskId);
      if (found) return found;
    }
  }
  return undefined;
};

const TaskItemComponent: React.FC<TaskItemProps> = ({
  task, airdropId, wallets, allAirdropTasksForDependencies, allAirdropsSystemWide,
  onUpdateTask, onDeleteTask,
  onOpenTaskForm, isArchived, highlight, globalHighlightId, onCompleteAllSubTasks, level,
  onOpenTimerModal, onOpenSuggestionModal
}) => {
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const associatedWallet = wallets.find(w => w.id === task.associatedWalletId);

  const areTaskDependenciesMet = useMemo(() => {
    if (!task.dependsOnTaskIds || task.dependsOnTaskIds.length === 0) return true;
    return task.dependsOnTaskIds.every(depId => {
        const dependentTask = findTaskByIdRecursive(allAirdropTasksForDependencies, depId);
        return dependentTask?.completed || false;
    });
  }, [task.dependsOnTaskIds, allAirdropTasksForDependencies]);

  const isAirdropDependencyMet = useMemo(() => {
    if (!task.dependsOnAirdropMyStatusCompleted) return true;
    const prerequisiteAirdrop = allAirdropsSystemWide.find(ad => ad.id === task.dependsOnAirdropMyStatusCompleted);
    return prerequisiteAirdrop?.myStatus === AirdropStatus.COMPLETED;
  }, [task.dependsOnAirdropMyStatusCompleted, allAirdropsSystemWide]);

  const areAllDependenciesMet = areTaskDependenciesMet && isAirdropDependencyMet;

  const unmetDependencyDetails = useMemo(() => {
    let details = '';
    if (!areTaskDependenciesMet && task.dependsOnTaskIds && task.dependsOnTaskIds.length > 0) {
      const taskNames = task.dependsOnTaskIds
        .map(depId => findTaskByIdRecursive(allAirdropTasksForDependencies, depId)?.description)
        .filter(Boolean)
        .join(', ');
      if (taskNames) details += `Prerequisite Tasks: ${taskNames}. `;
    }
    if (!isAirdropDependencyMet && task.dependsOnAirdropMyStatusCompleted) {
      const airdropName = allAirdropsSystemWide.find(ad => ad.id === task.dependsOnAirdropMyStatusCompleted)?.projectName;
      if (airdropName) details += `Prerequisite Airdrop: '${airdropName}' must be marked completed.`;
    }
    return details.trim() || "Unmet prerequisites.";
  }, [task.dependsOnTaskIds, task.dependsOnAirdropMyStatusCompleted, allAirdropTasksForDependencies, allAirdropsSystemWide, areTaskDependenciesMet, isAirdropDependencyMet]);

  const handleToggleComplete = () => {
    if (isArchived) {
      addToast("Cannot modify tasks of an archived airdrop.", "warning");
      return;
    }
    if (!areAllDependenciesMet) {
      addToast(`Cannot complete: ${unmetDependencyDetails}`, "warning", 5000);
      return;
    }
    onUpdateTask(airdropId, { ...task, completed: !task.completed, completionDate: !task.completed ? new Date().toISOString() : undefined });
  };

  const handleDelete = () => {
    if (isArchived) return;
    if (window.confirm(`Are you sure you want to delete task: "${task.description}"? ${task.subTasks && task.subTasks.length > 0 ? 'All its sub-tasks will also be deleted.' : ''}`)) {
      onDeleteTask(airdropId, task.id, task.parentId);
    }
  };

  const getTaskDependencyNames = useMemo(() => {
    return (task.dependsOnTaskIds || [])
        .map(depId => findTaskByIdRecursive(allAirdropTasksForDependencies, depId)?.description)
        .filter(Boolean)
        .join(', ');
  }, [task.dependsOnTaskIds, allAirdropTasksForDependencies]);

  const prerequisiteAirdropName = useMemo(() => {
    if (!task.dependsOnAirdropMyStatusCompleted) return null;
    return allAirdropsSystemWide.find(ad => ad.id === task.dependsOnAirdropMyStatusCompleted)?.projectName;
  }, [task.dependsOnAirdropMyStatusCompleted, allAirdropsSystemWide]);

  const titleForCheckbox = !areAllDependenciesMet && !task.completed
    ? `Blocked by: ${unmetDependencyDetails}`
    : (task.completed ? "Mark incomplete" : "Mark complete");

  const isCompletionDisabled = isArchived || (!areAllDependenciesMet && !task.completed);

  return (
    <div className={`
      my-1 rounded-md transition-all duration-200 ease-in-out
      ${(highlight || globalHighlightId === task.id) ? 'ring-2 ring-primary dark:ring-primary shadow-lg' : ''}
      ${task.completed ? 'bg-gray-100 dark:bg-gray-800 opacity-70' : 'bg-surface dark:bg-card-dark hover:shadow-md'}
      ${isCompletionDisabled && !task.completed ? 'opacity-60 cursor-not-allowed' : ''}
    `} style={{ marginLeft: `${level * 20}px` }}>
      <div className={`p-2.5 border ${task.completed ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-600'} rounded-md`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start flex-grow min-w-0">
            {task.subTasks && task.subTasks.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="mr-1 p-1 self-center" aria-label={isExpanded ? t('taskitem_collapse_subtasks_aria', { taskName: task.description }) : t('taskitem_expand_subtasks_aria', { taskName: task.description })}>
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Button>
            )}
            {!(task.subTasks && task.subTasks.length > 0) && <div className="w-7 mr-1 flex-shrink-0"></div>}

            <div
                className={`flex-shrink-0 mt-0.5 ${isCompletionDisabled && !task.completed ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={!isCompletionDisabled ? handleToggleComplete : undefined}
                title={titleForCheckbox}
                aria-label={titleForCheckbox}
            >
                {task.completed ? <CheckSquare size={18} className="text-green-500" /> :
                  (!areAllDependenciesMet ? <Lock size={18} className="text-yellow-500" /> : <Square size={18} className="text-gray-400" />)
                }
            </div>

            <div className="ml-2.5 flex-grow min-w-0">
              <p className={`text-sm break-words flex items-center ${task.completed ? 'line-through text-muted-light dark:text-muted-dark' : 'text-text-light dark:text-text-dark'}`}>
                {task.description}
              </p>
              <div className="text-xs text-muted-light dark:text-muted-dark mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                {task.dueDate && (
                    <span className={new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500 font-semibold' : ''}>
                        Due: {formatRelativeDate(task.dueDate)}
                    </span>
                )}
                {associatedWallet && <span>Wallet: {associatedWallet.name}</span>}
                {task.timeSpentMinutes && task.timeSpentMinutes > 0 && <span>Logged: {formatMinutesToHoursAndMinutes(task.timeSpentMinutes)}</span>}
                {task.cost && <span>Cost: {task.cost}</span>}
                {getTaskDependencyNames && (
                    <span title={`Depends on tasks: ${getTaskDependencyNames}`} className="flex items-center">
                        <LinkIcon size={12} className="mr-0.5"/> {task.dependsOnTaskIds?.length || 0} task dep(s)
                    </span>
                )}
                {prerequisiteAirdropName && (
                     <span title={`Depends on airdrop: ${prerequisiteAirdropName}`} className="flex items-center text-purple-600 dark:text-purple-400">
                        <LinkIcon size={12} className="mr-0.5"/> Airdrop Dep: {prerequisiteAirdropName}
                    </span>
                )}
              </div>
              {task.notes && <p className="text-xs italic mt-1 text-gray-500 dark:text-gray-400 line-clamp-2" title={task.notes}>Notes: {task.notes}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {!isArchived && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onOpenSuggestionModal(task)} title={t('taskitem_ai_suggestion_aria', { taskName: task.description })} aria-label={t('taskitem_ai_suggestion_aria', { taskName: task.description })} className="p-1" disabled={isCompletionDisabled && !task.completed}><Brain size={14}/></Button>
                <Button variant="ghost" size="sm" onClick={() => onOpenTimerModal(task)} title={t('taskitem_timer_aria', { taskName: task.description })} aria-label={t('taskitem_timer_aria', { taskName: task.description })} className="p-1"><Clock size={14}/></Button>
                <Button variant="ghost" size="sm" onClick={() => onOpenTaskForm(task)} title={t('taskitem_edit_aria', { taskName: task.description })} aria-label={t('taskitem_edit_aria', { taskName: task.description })} className="p-1"><Edit3 size={14} /></Button>
                <Button variant="ghost" size="sm" onClick={() => onOpenTaskForm(undefined, task.id)} title={t('taskitem_add_subtask_aria', { parentTaskName: task.description })} aria-label={t('taskitem_add_subtask_aria', { parentTaskName: task.description })} className="p-1"><PlusCircle size={14} /></Button>
              </>
            )}
             <Button variant="ghost" size="sm" onClick={handleDelete} title={t('taskitem_delete_aria', { taskName: task.description })} aria-label={t('taskitem_delete_aria', { taskName: task.description })} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"><Trash2 size={14} /></Button>
          </div>
        </div>
        {task.subTasks && task.subTasks.length > 0 && task.completed && !task.subTasks.every(st => st.completed) && !isArchived && areAllDependenciesMet && (
            <div className="ml-8 mt-1">
                <Button variant="outline" size="sm" onClick={() => onCompleteAllSubTasks(task.id)} leftIcon={<CheckCheck size={14}/>}>
                    Mark All Sub-tasks Complete
                </Button>
            </div>
        )}
      </div>
      {isExpanded && task.subTasks && task.subTasks.length > 0 && (
        <div className="mt-0.5">
          {task.subTasks.map(subTask => (
            <TaskItemComponent
              key={subTask.id}
              task={subTask}
              airdropId={airdropId}
              wallets={wallets}
              allAirdropTasksForDependencies={allAirdropTasksForDependencies}
              allAirdropsSystemWide={allAirdropsSystemWide}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onOpenTaskForm={onOpenTaskForm}
              isArchived={isArchived}
              highlight={globalHighlightId === subTask.id}
              globalHighlightId={globalHighlightId}
              onCompleteAllSubTasks={onCompleteAllSubTasks}
              level={level + 1}
              onOpenTimerModal={onOpenTimerModal}
              onOpenSuggestionModal={onOpenSuggestionModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export const TaskItem = React.memo(TaskItemComponent);
