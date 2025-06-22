import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { Modal } from '../../design-system/components/Modal';
import { useRecurringTaskStore } from '../../stores/recurringTaskStore';
import { useAirdropStore } from '../../stores/airdropStore';
import { RecurringTask, TaskFrequency, DayOfWeek } from '../../types';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  CalendarDays,
  Repeat,
  Target,
  TrendingUp
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { formatRelativeDate, formatDate } from '../../utils/formatting';

export const TasksPage: React.FC = () => {
  const { recurringTasks, addRecurringTask, updateRecurringTask, deleteRecurringTask, completeRecurringTask, fetchRecurringTasks, isLoading } = useRecurringTaskStore();
  const { airdrops } = useAirdropStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterAirdrop, setFilterAirdrop] = useState('');
  const [sortBy, setSortBy] = useState<'nextDueDate' | 'name' | 'frequency'>('nextDueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (recurringTasks.length === 0 && !isLoading) {
      fetchRecurringTasks();
    }
  }, [recurringTasks.length, isLoading, fetchRecurringTasks]);

  const handleAddTask = async (taskData: Omit<RecurringTask, 'id' | 'completionHistory'>) => {
    try {
      await addRecurringTask(taskData);
      addToast('Recurring task added successfully.', 'success');
      setIsAddModalOpen(false);
    } catch (error) {
      addToast('Failed to add recurring task.', 'error');
    }
  };

  const handleUpdateTask = async (taskData: Omit<RecurringTask, 'id' | 'completionHistory'>) => {
    if (!editingTask) return;
    
    try {
      const updatedTask: RecurringTask = {
        ...editingTask,
        ...taskData
      };
      await updateRecurringTask(updatedTask);
      addToast('Task updated successfully', 'success');
      setEditingTask(null);
    } catch (error) {
      addToast('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = recurringTasks.find(t => t.id === taskId);
    if (taskToDelete && window.confirm(`Are you sure you want to delete the task "${taskToDelete.name}"?`)) {
      try {
        await deleteRecurringTask(taskId);
        addToast('Recurring task deleted successfully.', 'success');
      } catch (error) {
        addToast('Failed to delete recurring task.', 'error');
      }
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeRecurringTask(taskId);
      addToast('Task marked as completed.', 'success');
    } catch (error) {
      addToast('Failed to complete task.', 'error');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = recurringTasks.filter(task => {
      const statusMatch = filterStatus === 'all' || 
        (filterStatus === 'active' && task.isActive) ||
        (filterStatus === 'completed' && !task.isActive);
      
      const airdropMatch = !filterAirdrop || task.associatedAirdropId === filterAirdrop;
      
      return statusMatch && airdropMatch;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'nextDueDate':
          comparison = new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'frequency':
          comparison = a.frequency.localeCompare(b.frequency);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [recurringTasks, filterStatus, filterAirdrop, sortBy, sortOrder]);

  const taskStats = {
    total: recurringTasks.length,
    active: recurringTasks.filter(t => t.isActive).length,
    completed: recurringTasks.filter(t => !t.isActive).length,
    overdue: recurringTasks.filter(t => t.isActive && new Date(t.nextDueDate) < new Date()).length,
    dueToday: recurringTasks.filter(t => {
      const today = new Date().toDateString();
      const dueDate = new Date(t.nextDueDate).toDateString();
      return t.isActive && dueDate === today;
    }).length
  };

  const availableAirdrops = airdrops.filter(a => !a.isArchived);

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={24} className="text-accent" />
                Recurring Tasks
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchRecurringTasks()}
                  leftIcon={<RefreshCw size={16} />}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Task
                </Button>
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Manage recurring tasks and stay on top of your airdrop farming schedule.
            </p>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
              </div>
              <Calendar size={24} className="text-blue-500" />
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{taskStats.active}</p>
              </div>
              <Target size={24} className="text-green-500" />
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{taskStats.completed}</p>
              </div>
              <CheckCircle size={24} className="text-purple-500" />
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{taskStats.overdue}</p>
              </div>
              <AlertTriangle size={24} className="text-red-500" />
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Due Today</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{taskStats.dueToday}</p>
              </div>
              <Clock size={24} className="text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed')}
                options={[
                  { value: 'all', label: 'All Tasks' },
                  { value: 'active', label: 'Active Only' },
                  { value: 'completed', label: 'Completed Only' }
                ]}
              />
              <Select
                value={filterAirdrop}
                onChange={(e) => setFilterAirdrop(e.target.value)}
                options={[
                  { value: '', label: 'All Airdrops' },
                  ...availableAirdrops.map(airdrop => ({ value: airdrop.id, label: airdrop.projectName }))
                ]}
              />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'nextDueDate' | 'name' | 'frequency')}
                options={[
                  { value: 'nextDueDate', label: 'Sort by Due Date' },
                  { value: 'name', label: 'Sort by Name' },
                  { value: 'frequency', label: 'Sort by Frequency' }
                ]}
              />
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                leftIcon={sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <div className="space-y-4">
          {filteredAndSortedTasks.map((task) => {
            const associatedAirdrop = airdrops.find(a => a.id === task.associatedAirdropId);
            const isOverdue = task.isActive && new Date(task.nextDueDate) < new Date();
            const isDueToday = task.isActive && new Date(task.nextDueDate).toDateString() === new Date().toDateString();

            return (
              <Card key={task.id} variant="default" padding="md">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{task.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.isActive 
                            ? isOverdue 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : isDueToday
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                        }`}>
                          {task.isActive 
                            ? isOverdue 
                              ? 'Overdue'
                              : isDueToday
                                ? 'Due Today'
                                : 'Active'
                            : 'Completed'
                          }
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Repeat size={14} />
                          <span>{task.frequency}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDays size={14} />
                          <span>Next: {formatDate(task.nextDueDate)}</span>
                        </div>
                        {associatedAirdrop && (
                          <div className="flex items-center gap-1">
                            <Target size={14} />
                            <span>{associatedAirdrop.projectName}</span>
                          </div>
                        )}
                        {task.lastCompletedDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle size={14} />
                            <span>Last: {formatDate(task.lastCompletedDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {task.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          leftIcon={<CheckCircle size={14} />}
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTask(task)}
                        leftIcon={<Edit3 size={14} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        leftIcon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedTasks.length === 0 && (
          <Card variant="default" padding="xl">
            <CardContent className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-secondary mb-4">
                {filterStatus !== 'all' || filterAirdrop
                  ? 'Try adjusting your filters.'
                  : 'Get started by adding your first recurring task.'}
              </p>
              {filterStatus === 'all' && !filterAirdrop && (
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Your First Task
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Recurring Task">
          <RecurringTaskForm
            onSubmit={handleAddTask}
            onClose={() => setIsAddModalOpen(false)}
            availableAirdrops={availableAirdrops}
          />
        </Modal>

        <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Recurring Task">
          {editingTask && (
            <RecurringTaskForm
              onSubmit={handleUpdateTask}
              onClose={() => setEditingTask(null)}
              initialData={editingTask}
              availableAirdrops={availableAirdrops}
            />
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
};

// RecurringTaskForm component would be implemented here
// For now, I'll create a placeholder
const RecurringTaskForm: React.FC<{
  onSubmit: (taskData: Omit<RecurringTask, 'id' | 'completionHistory'>) => Promise<void>;
  onClose: () => void;
  initialData?: RecurringTask;
  availableAirdrops: any[];
}> = ({ onSubmit, onClose, initialData, availableAirdrops }) => {
  // This would be a full form implementation
  return (
    <div className="p-4">
      <p>Task form implementation would go here</p>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}; 