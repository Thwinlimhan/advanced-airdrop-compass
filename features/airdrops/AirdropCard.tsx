import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { Link } from 'react-router-dom';
import { useAirdropStore } from '../../stores/airdropStore';
import { Airdrop, AirdropStatus, AirdropPriority } from '../../types';
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Star,
  TrendingUp,
  Calendar,
  Target,
  DollarSign,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatting';

interface AirdropCardProps {
  airdrop: Airdrop;
  onEdit: (airdrop: Airdrop) => void;
  onDelete: (airdropId: string) => void;
}

export const AirdropCard: React.FC<AirdropCardProps> = ({ airdrop, onEdit, onDelete }) => {
  const { updateAirdrop, completeNextAirdropTask } = useAirdropStore();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: AirdropStatus) => {
    switch (status) {
      case AirdropStatus.LIVE:
        return 'bg-green-500 text-white';
      case AirdropStatus.CONFIRMED:
        return 'bg-blue-500 text-white';
      case AirdropStatus.COMPLETED:
        return 'bg-purple-500 text-white';
      case AirdropStatus.ENDED:
        return 'bg-gray-500 text-white';
      case AirdropStatus.RUMORED:
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getPriorityColor = (priority: AirdropPriority) => {
    switch (priority) {
      case AirdropPriority.HIGH:
        return 'bg-red-500 text-white';
      case AirdropPriority.MEDIUM:
        return 'bg-yellow-500 text-black';
      case AirdropPriority.LOW:
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getMyStatusColor = (status: AirdropStatus) => {
    switch (status) {
      case AirdropStatus.COMPLETED:
        return 'bg-green-500 text-white';
      case AirdropStatus.IN_PROGRESS:
        return 'bg-blue-500 text-white';
      case AirdropStatus.NOT_STARTED:
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getPotentialIcon = (potential: string) => {
    const lowerPotential = potential.toLowerCase();
    if (lowerPotential.includes('high') || lowerPotential.includes('very high')) {
      return <TrendingUp size={16} className="text-green-500" />;
    } else if (lowerPotential.includes('medium')) {
      return <Target size={16} className="text-yellow-500" />;
    } else {
      return <DollarSign size={16} className="text-gray-500" />;
    }
  };

  const handleCompleteNextTask = async () => {
    setIsLoading(true);
    try {
      await completeNextAirdropTask(airdrop.id);
    } catch (error) {
      console.error('Failed to complete next task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedTasks = airdrop.tasks.filter(task => task.completed).length;
  const totalTasks = airdrop.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const hasOverdueTasks = airdrop.tasks.some(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  });

  const hasUpcomingTasks = airdrop.tasks.some(task => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return dueDate <= nextWeek;
  });

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {airdrop.projectName}
              </h3>
              {airdrop.priority === AirdropPriority.HIGH && (
                <Star size={16} className="text-red-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(airdrop.status)}>
                {airdrop.status}
              </Badge>
              <Badge className={getMyStatusColor(airdrop.myStatus)}>
                {airdrop.myStatus}
              </Badge>
              <Badge className={getPriorityColor(airdrop.priority || AirdropPriority.MEDIUM)}>
                {airdrop.priority || AirdropPriority.MEDIUM}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(airdrop)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Edit Airdrop"
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(airdrop.id)}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Delete Airdrop"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Description */}
          {airdrop.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {airdrop.description}
            </p>
          )}

          {/* Blockchain and Potential */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {airdrop.blockchain}
            </span>
            <div className="flex items-center gap-1">
              {getPotentialIcon(airdrop.potential)}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {airdrop.potential}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          {totalTasks > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress: {completedTasks}/{totalTasks} tasks
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Task Alerts */}
          <div className="space-y-1">
            {hasOverdueTasks && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle size={14} />
                <span>Overdue tasks</span>
              </div>
            )}
            {hasUpcomingTasks && !hasOverdueTasks && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                <Clock size={14} />
                <span>Tasks due soon</span>
              </div>
            )}
            {completedTasks > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle size={14} />
                <span>{completedTasks} task{completedTasks !== 1 ? 's' : ''} completed</span>
              </div>
            )}
          </div>

          {/* Date Added */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>Added {formatRelativeDate(airdrop.dateAdded)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Link
              to={`/airdrops/${airdrop.id}`}
              className="flex-1"
            >
              <Button variant="outline" className="w-full justify-center">
                <span>View Details</span>
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </Link>
            {totalTasks > completedTasks && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCompleteNextTask}
                disabled={isLoading}
                className="flex-shrink-0"
              >
                {isLoading ? 'Completing...' : 'Complete Next'}
              </Button>
            )}
          </div>

          {/* Official Links */}
          {airdrop.officialLinks && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {airdrop.officialLinks.website && (
                <a
                  href={airdrop.officialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              {airdrop.officialLinks.twitter && (
                <a
                  href={airdrop.officialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  title="Follow on Twitter"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              )}
              {airdrop.officialLinks.discord && (
                <a
                  href={airdrop.officialLinks.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                  title="Join Discord"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
