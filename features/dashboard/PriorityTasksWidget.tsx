import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
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
  const { completeRecurringTask } = useAppContext();

  const handleCompleteRecurringTask = (taskId: string, taskName: string) => {
    completeRecurringTask(taskId);
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
              <div className="flex items-center gap-2">
                {task.isOverdue ? (
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                ) : (
                  <Clock size={16} className="text-muted-dark flex-shrink-0" />
                )}
                <p className={`text-sm ${task.isOverdue ? 'text-red-400 font-semibold' : 'text-white'}`}>
                  {task.name}
                </p>
              </div>
              {task.airdropName && (
                <Link to={`/airdrops/${task.airdropId}`} className="text-xs text-primary hover:underline">
                  {task.airdropName}
                </Link>
              )}
               {task.dueDate && (
                <p className={`text-xs ${task.isOverdue ? 'text-red-400 font-semibold' : 'text-muted-dark'}`}>
                  {formatRelativeDate(task.dueDate)}
                </p>
              )}
            </div>
            {task.type === 'recurring' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCompleteRecurringTask(task.id, task.name)}
                className="p-1 text-green-400 hover:text-green-300"
                title="Mark as Done"
              >
                <CheckCircle size={16} />
              </Button>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card title="Priority Tasks" className="h-full">
      {mainContent}
      {tasks.length > 10 && (
        <p className="text-xs text-muted-dark mt-2 text-center">
          Showing top 10 tasks. View all tasks in the Tasks section.
        </p>
      )}
    </Card>
  );
};