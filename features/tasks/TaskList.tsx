import React, { useState, useMemo } from 'react';
import { RecurringTask, Airdrop } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Edit3, Trash2, CheckCircle, Clock, Link as LinkIcon, CalendarClock, Flame } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { formatRelativeDate } from '../../utils/formatting';
import { useRecurringTaskStore } from '../../stores/recurringTaskStore';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { useToast } from '../../hooks/useToast';

interface TaskListProps {
  tasks: RecurringTask[];
  airdrops: Airdrop[];
  onEdit: (task: RecurringTask) => void;
  onDelete: (taskId: string) => Promise<void>;
  onComplete: (taskId: string) => Promise<void>;
}

const SnoozeDropdown: React.FC<{ taskId: string, taskName: string, onSnooze: (taskId: string, days: number) => Promise<void> }> = ({ taskId, onSnooze }) => {
    const [isOpen, setIsOpen] = useState(false);
    const snoozeOptions = [ 
        { label: 'Snooze 1 Day', days: 1 }, 
        { label: 'Snooze 3 Days', days: 3 }, 
        { label: 'Snooze 1 Week', days: 7 }, 
    ];

    const handleSnoozeClick = async (days: number) => {
        await onSnooze(taskId, days);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="p-1 text-muted-dark hover:text-white" title="Snooze Task">
                <Clock size={16} />
            </Button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-card-light dark:bg-card-dark ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {snoozeOptions.map(opt => (
                            <button key={opt.days} onClick={() => handleSnoozeClick(opt.days)} className="block w-full text-left px-3 py-1.5 text-xs text-text-light dark:text-text-dark hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
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
  const { snoozeRecurringTask } = useRecurringTaskStore();
  const { addToast } = useToast();
  const [filterStatus, setFilterStatus] = useState<'due_overdue' | 'all_active' | 'inactive'>('due_overdue');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSnoozeTask = async (taskId: string, days: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await snoozeRecurringTask(taskId, days * 24); // Convert days to hours
        addToast(`Task snoozed for ${days} day${days > 1 ? 's' : ''}`, 'success');
      }
    } catch (error) {
      console.error('Failed to snooze task:', error);
      addToast('Failed to snooze task', 'error');
    }
  };

  const filteredTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    return tasks.filter(task => {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = task.name.toLowerCase().includes(searchTermLower);
        const descriptionMatch = task.description?.toLowerCase().includes(searchTermLower) || false;
        
        const dueDate = new Date(task.nextDueDate);
        dueDate.setHours(0,0,0,0);
        
        let statusMatch = false;
        if(filterStatus === 'inactive') {
            statusMatch = !task.isActive;
        } else if (filterStatus === 'all_active') {
            statusMatch = task.isActive;
        } else { // 'due_overdue' is the default
            statusMatch = task.isActive && dueDate <= today;
        }
        return (nameMatch || descriptionMatch) && statusMatch;
    }).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [tasks, searchTerm, filterStatus]);

  if (tasks.length === 0) {
    return <p className="text-center text-muted-light dark:text-muted-dark py-8">No recurring tasks scheduled yet. Add some to stay organized!</p>;
  }

  return (
    <div className="space-y-4">
        <Card className="p-3 sticky top-16 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <Input 
                    id="taskSearch" 
                    label="Search Tasks" 
                    placeholder="Name or description..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    wrapperClassName="mb-0" 
                />
                <Select 
                    id="taskStatusFilter" 
                    label="Filter Tasks" 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value as any)} 
                    options={[
                        {value: 'due_overdue', label: 'Due & Overdue'},
                        {value: 'all_active', label: 'All Active Tasks'},
                        {value: 'inactive', label: 'Inactive'},
                    ]} 
                    wrapperClassName="mb-0" 
                />
            </div>
        </Card>

       {filteredTasks.length === 0 ? (
         <p className="text-center text-muted-light dark:text-muted-dark py-6">No tasks match your current filters.</p>
       ) : (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Task / Airdrop</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Frequency</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Streak</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card-light dark:bg-card-dark divide-y divide-gray-200 dark:divide-gray-600">
                {filteredTasks.map(task => {
                    const airdrop = task.associatedAirdropId ? airdrops.find(a => a.id === task.associatedAirdropId) : null;
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const dueDate = new Date(task.nextDueDate);
                    dueDate.setHours(0,0,0,0);
                    const isOverdue = task.isActive && dueDate < today;

                  return (
                    <tr key={task.id} className={isOverdue ? "bg-red-900/10 dark:bg-red-900/20" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-text-light dark:text-text-dark">{task.name}</div>
                        {airdrop && (
                           <RouterLink to={`/airdrops/${airdrop.id}`} className="text-xs text-primary-light dark:text-primary-dark hover:underline flex items-center">
                            <LinkIcon size={12} className="mr-1"/>
                            {airdrop.projectName}
                           </RouterLink>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`flex items-center ${isOverdue ? "text-red-500 font-semibold" : "text-muted-light dark:text-muted-dark"}`}>
                           {isOverdue && <CalendarClock size={14} className="mr-1.5"/>}
                           {formatRelativeDate(task.nextDueDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-light dark:text-muted-dark">{task.frequency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="flex items-center justify-center text-sm font-semibold text-text-light dark:text-text-dark" title={`Current streak: ${task.currentStreak || 0}`}>
                          {task.currentStreak || 0}
                          {(task.currentStreak || 0) > 0 && <Flame size={14} className="ml-1 text-orange-500" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          {task.isActive && (
                            <>
                                <SnoozeDropdown taskId={task.id} taskName={task.name} onSnooze={handleSnoozeTask} />
                                <Button variant="ghost" size="sm" onClick={async () => await onComplete(task.id)} className="p-1 text-green-500 hover:text-green-300" title="Mark as Done"><CheckCircle size={18} /></Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="p-1 text-muted-dark hover:text-white" title="Edit Task"><Edit3 size={16} /></Button>
                          <Button variant="ghost" size="sm" onClick={async () => await onDelete(task.id)} className="p-1 text-red-400 hover:text-red-300" title="Delete Task"><Trash2 size={16} /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
       )}
    </div>
  );
}; 