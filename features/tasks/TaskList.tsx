import React, { useState, useMemo } from 'react'; 
import { RecurringTask, Airdrop } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Edit3, Trash2, CheckCircle, PlayCircle, Tag, Clock, CalendarClock, ListChecks as ListChecksIcon, Filter as FilterIcon } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import { formatRelativeDate } from '../../utils/formatting';
import { useAppContext } from '../../contexts/AppContext'; 
import { useToast } from '../../hooks/useToast'; 
import { Input } from '../../design-system/components/Input'; 
import { Select } from '../../design-system/components/Select'; 
import { useTranslation } from '../../hooks/useTranslation';

interface TaskListProps {
  tasks: RecurringTask[];
  airdrops: Airdrop[];
  onEdit: (task: RecurringTask) => void;
  onDelete: (taskId: string) => Promise<void>; 
  onComplete: (taskId: string) => Promise<void>; 
}

const formatTimeSince = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

const getTaskStatusInfo = (task: RecurringTask): { classes: string; statusText: string; isOverdue: boolean } => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dueDate = new Date(task.nextDueDate);
    dueDate.setHours(0,0,0,0);
    const isOverdue = task.isActive && dueDate < today;


    let classes = 'bg-surface dark:bg-gray-700';
    let statusText = formatRelativeDate(task.nextDueDate);

    if (!task.isActive) {
        classes = 'opacity-60 bg-gray-100 dark:bg-gray-800';
        statusText = `Inactive. ${statusText}`;
    } else if (isOverdue) {
        classes = 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/70';
    } else if (dueDate.getTime() === today.getTime()) {
        classes = 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/60'; 
    }
    return { classes, statusText, isOverdue };
};

const SnoozeDropdown: React.FC<{ taskId: string, taskName: string, onSnooze: (taskId: string, days: number) => Promise<void> }> = ({ taskId, taskName, onSnooze }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const snoozeOptions = [
        { label: t('recurring_task_snooze_1_day', {defaultValue: 'Snooze 1 Day'}), days: 1 },
        { label: t('recurring_task_snooze_3_days', {defaultValue: 'Snooze 3 Days'}), days: 3 },
        { label: t('recurring_task_snooze_1_week', {defaultValue: 'Snooze 1 Week'}), days: 7 },
    ];

    const handleSnoozeClick = async (days: number) => {
        await onSnooze(taskId, days);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-1"
                title={t('recurring_task_snooze_button', {defaultValue:"Snooze Task"})}
            >
                <Clock size={16} /> 
            </Button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-surface dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {snoozeOptions.map(opt => (
                            <button
                                key={opt.days}
                                onClick={() => handleSnoozeClick(opt.days)}
                                className="block w-full text-left px-3 py-1.5 text-xs text-primary dark:text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-700"
                                role="menuitem"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


export const TaskList: React.FC<TaskListProps> = ({ tasks, airdrops, onEdit, onDelete, onComplete }) => {
  const { snoozeRecurringTask, appData } = useAppContext(); // Added appData
  const { addToast } = useToast(); 
  const { t } = useTranslation();
  const [filterTag, setFilterTag] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'overdue'>('all');

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    tasks.forEach(task => task.tags?.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [tasks]);

  const handleSnoozeTask = async (taskId: string, days: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await snoozeRecurringTask(taskId, days);
      // Toast is handled within AppContext
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = task.name.toLowerCase().includes(searchTermLower);
        const descriptionMatch = task.description?.toLowerCase().includes(searchTermLower) || false;
        const notesMatch = task.notes?.toLowerCase().includes(searchTermLower) || false;
        const tagMatch = filterTag ? task.tags?.includes(filterTag) : true;
        
        const today = new Date(); today.setHours(0,0,0,0);
        const dueDate = new Date(task.nextDueDate); dueDate.setHours(0,0,0,0);
        const isOverdue = task.isActive && dueDate < today;

        let statusMatch = true;
        if (filterStatus === 'active') statusMatch = task.isActive && !isOverdue;
        else if (filterStatus === 'inactive') statusMatch = !task.isActive;
        else if (filterStatus === 'overdue') statusMatch = isOverdue;

        return (nameMatch || descriptionMatch || notesMatch) && tagMatch && statusMatch;
    }).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [tasks, searchTerm, filterTag, filterStatus]);

  // Check if there are any tasks in the original list before filtering
  if (appData.recurringTasks.length === 0) { 
    return (
        <div className="text-center py-10">
            <ListChecksIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                {t('recurring_tasks_no_data_title', {defaultValue:'No Recurring Tasks Yet'})}
            </p>
            <p className="text-muted-light dark:text-muted-dark">
                {t('recurring_tasks_no_data_message', {defaultValue:'Stay on top of your airdrop game by scheduling regular interactions.'})}
            </p>
        </div>
    );
  }


  return (
    <div className="space-y-4">
        <Card className="p-3 sticky top-[calc(4rem+1px)] z-10 bg-opacity-90 backdrop-blur-sm dark:bg-opacity-90 dark:bg-background-dark"> {/* Adjusted top value for navbar height */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <Input id="taskSearch" label={t('recurring_tasks_search_label', {defaultValue:"Search Tasks"})} placeholder={t('recurring_tasks_search_placeholder', {defaultValue:"Name, description, notes..."})} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <Select id="taskTagFilter" label={t('recurring_tasks_filter_tag_label', {defaultValue:"Filter by Tag"})} value={filterTag} onChange={e => setFilterTag(e.target.value)} options={[{value: '', label: t('recurring_tasks_filter_all_tags', {defaultValue:'All Tags'})}, ...allTags.map(tag => ({value: tag, label: tag}))]} />
                <Select id="taskStatusFilter" label={t('recurring_tasks_filter_status_label', {defaultValue:"Filter by Status"})} value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} options={[
                    {value: 'all', label: t('recurring_tasks_filter_all_statuses', {defaultValue:'All Statuses'})},
                    {value: 'active', label: t('recurring_tasks_filter_active', {defaultValue:'Active (Not Overdue)'})},
                    {value: 'inactive', label: t('recurring_tasks_filter_inactive', {defaultValue:'Inactive'})},
                    {value: 'overdue', label: t('recurring_tasks_filter_overdue', {defaultValue:'Overdue'})},
                ]} />
            </div>
        </Card>

       {filteredTasks.length === 0 && (
         <div className="text-center py-6">
            <FilterIcon size={40} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-lg font-medium text-text-light dark:text-text-dark">
              {t('recurring_tasks_filter_no_match_title', {defaultValue:'No Tasks Match Filters'})}
            </p>
            <p className="text-sm text-muted-light dark:text-muted-dark">
              {t('recurring_tasks_filter_no_match_message', {defaultValue:'Try adjusting your search terms or filters.'})}
            </p>
        </div>
       )}

      {filteredTasks.map((task) => {
        const airdrop = task.associatedAirdropId ? airdrops.find(a => a.id === task.associatedAirdropId) : null;
        const { classes, statusText, isOverdue } = getTaskStatusInfo(task);

        return (
          <Card key={task.id} className={`transition-shadow hover:shadow-md ${classes}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
              <div className="flex-grow min-w-0">
                <div className="flex items-center">
                    {isOverdue && <CalendarClock size={18} className="mr-2 text-red-500 flex-shrink-0"/>}
                    <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">{task.name}</h3>
                </div>
                <p className={`text-sm font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                   {task.frequency} - Due: {statusText}
                </p>
                {task.description && <p className="text-sm text-muted-light dark:text-muted-dark mt-1">{task.description}</p>}
                {airdrop && (
                  <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
                    For: <Link to={`/airdrops/${airdrop.id}`} className="text-primary-light dark:text-primary-dark hover:underline">{airdrop.projectName}</Link>
                  </p>
                )}
                {task.lastCompletedDate && (
                  <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">Last done: {new Date(task.lastCompletedDate).toLocaleDateString()} ({formatTimeSince(task.lastCompletedDate)})</p>
                )}
                 {task.notes && <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1 line-clamp-2" title={task.notes}>Notes: {task.notes}</p>}
                {task.tags && task.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {task.tags.map(tag => <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full"><Tag size={10} className="inline mr-0.5"/>{tag}</span>)}
                  </div>
                )}
              </div>
              <div className="flex space-x-1 sm:space-x-1.5 mt-2 sm:mt-0 flex-shrink-0 self-start sm:self-center">
                {task.isActive && <SnoozeDropdown taskId={task.id} taskName={task.name} onSnooze={handleSnoozeTask} />}
                {task.isActive && (
                  <Button variant="ghost" size="sm" onClick={async () => await onComplete(task.id)} className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400" title={t('task_mark_done_button_title', {defaultValue:"Mark as Done"})}>
                    <CheckCircle size={18} />
                  </Button>
                )}
                {!task.isActive && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="p-1 text-yellow-600 hover:text-yellow-700" title={t('task_reactivate_button_title', {defaultValue:"Re-activate Task (Edit)"})}>
                        <PlayCircle size={18}/>
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="p-1" title={t('task_edit_button_title', {defaultValue:"Edit Task"})}><Edit3 size={16} /></Button>
                <Button variant="ghost" size="sm" onClick={async () => await onDelete(task.id)} className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400" title={t('task_delete_button_title', {defaultValue:"Delete Task"})}><Trash2 size={16} /></Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
