import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../hooks/useToast';
import { formatRelativeDate } from '../../utils/formatting';

interface PriorityTaskItem {
  id: string;
  name: string;
  dueDate?: string;
  type: 'recurring' | 'airdrop';
  airdropName?: string;
  airdropId?: string;
  isOverdue: boolean;
}

interface PriorityTasksWidgetProps {
  tasks: PriorityTaskItem[];
}

export const PriorityTasksWidget: React.FC<PriorityTasksWidgetProps> = ({ tasks }) => {
  const { completeRecurringTask: contextCompleteRecurringTask } = useAppContext();
  const { addToast } = useToast();

  const handleCompleteRecurringTask = (taskId: string, taskName: string) => {
    contextCompleteRecurringTask(taskId);
    addToast(`Task "${taskName}" marked as done!`, 'success');
  };

  let mainContent;
  if (tasks.length === 0) {
    mainContent = <p className="text-muted-dark">No upcoming or overdue tasks. Great job!</p>;
  } else {
    mainContent = (
      <ul className="space-y-2.5 max-h-96 overflow-y-auto">
        {tasks.slice(0, 10).map((task) => (
          <li key={task.id} className={`p-3 rounded-lg flex items-start justify-between ${task.isOverdue ? 'bg-red-500/10 dark:bg-red-500/20 border-l-4 border-red-500' : 'bg-background-dark/30 dark:bg-card-dark/70'}`}>
            <div className="flex-grow">
              <div className="flex items-center">
                 {task.isOverdue && <AlertCircle size={16} className="mr-2 text-red-400 flex-shrink-0" />}
                <h4 className="font-medium text-white">{task.name}</h4>
              </div>
              {task.airdropName && (
                <Link to={`/airdrops/${task.airdropId}`} className="text-xs text-primary hover:underline block">
                  For: {task.airdropName}
                </Link>
              )}
               {task.dueDate && (
                <p className={`text-xs ${task.isOverdue ? 'text-red-400 font-semibold' : 'text-muted-dark'}`}>
                  {formatRelativeDate(task.dueDate)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
              {task.type === 'recurring' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCompleteRecurringTask(task.id, task.name)}
                  className="p-1 text-green-400 hover:text-green-300"
                  title="Mark as Done"
                >
                  <CheckCircle size={18} />
                </Button>
              )}
              <Link
                to={task.type === 'recurring' ? `/tasks?taskId=${task.id}` : `/airdrops/${task.airdropId}?highlightTaskId=${task.id}`}
                className="text-sm text-primary hover:underline p-1"
              >
                View
              </Link>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const viewAllLink = tasks.length > 10 ? (
    <Link to="/tasks" className="mt-4 block text-center text-sm text-primary hover:underline">
      View all tasks ({tasks.length})
    </Link>
  ) : null;

  return (
    <Card title="Priority Tasks">
      {mainContent}
      {viewAllLink}
    </Card>
  );
};