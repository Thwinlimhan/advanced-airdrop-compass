import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Link } from 'react-router-dom';
import { Edit3, Trash2, ExternalLink, ListChecks, Archive, ArchiveRestore, Zap, Image as ImageIcon, EyeOff, CheckSquare, CircleSlash, Brain, Loader2, Share2, CheckCircle, Clock, AlertTriangle, TrendingUp, Tag, Link as LinkIcon, DollarSign, Calendar, RotateCcw, Eye, Timer } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../hooks/useToast';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useTranslation } from '../../hooks/useTranslation';
import { formatRelativeDate, formatMinutesToHoursAndMinutes } from '../../utils/formatting';
import { Airdrop, AirdropStatus, AirdropPriority, AirdropTask } from '../../types';

interface AirdropCardProps {
  airdrop: Airdrop;
  onEdit: (airdrop: Airdrop) => void;
  onDelete: (airdropId: string) => void;
}

const getStatusColor = (status: AirdropStatus): string => {
  switch (status) {
    case AirdropStatus.LIVE:
      return 'text-success';
    case AirdropStatus.CONFIRMED:
      return 'text-info';
    case AirdropStatus.COMPLETED:
      return 'text-accent';
    case AirdropStatus.ENDED:
      return 'text-error';
    case AirdropStatus.RUMORED:
      return 'text-warning';
    default:
      return 'text-secondary';
  }
};

const getPriorityColor = (priority?: AirdropPriority): string => {
  switch (priority) {
    case AirdropPriority.HIGH:
      return 'text-error';
    case AirdropPriority.MEDIUM:
      return 'text-warning';
    case AirdropPriority.LOW:
      return 'text-success';
    default:
      return 'text-secondary';
  }
};

export const AirdropCard: React.FC<AirdropCardProps> = ({ airdrop, onEdit, onDelete }) => {
  const { appData, updateAirdrop, completeNextAirdropTask } = useAppContext();
  const { addToast } = useToast();
  const cardSettings = appData.settings.airdropCardLayout;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const countTasksRecursive = (tasks: AirdropTask[]): { completed: number, total: number } => {
    let completed = 0;
    let total = 0;
    
    tasks.forEach(task => {
      total++;
      if (task.completed) completed++;
      if (task.subTasks) {
        const subResult = countTasksRecursive(task.subTasks);
        completed += subResult.completed;
        total += subResult.total;
      }
    });
    
    return { completed, total };
  };

  const taskStats = useMemo(() => countTasksRecursive(airdrop.tasks), [airdrop.tasks]);
  const progressPercentage = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

  const hasUncompletedTasks = airdrop.tasks.some(task => {
    if (!task.completed) return true;
    if (task.subTasks && task.subTasks.length > 0) {
        return task.subTasks.some(st => !st.completed);
    }
    return false;
  });

  const handleToggleArchive = () => {
    updateAirdrop({ ...airdrop, isArchived: !airdrop.isArchived });
    addToast(
      `Airdrop "${airdrop.projectName}" ${!airdrop.isArchived ? 'archived' : 'restored'}.`,
      'success'
    );
  };

  const handleCompleteNextTask = () => {
    if (airdrop.isArchived) {
      addToast("Cannot complete tasks for an archived airdrop.", "warning");
      return;
    }

    let taskToComplete: AirdropTask | undefined;
    const findTask = (tasks: AirdropTask[]): AirdropTask | undefined => {
        for (const task of tasks) {
            if (!task.completed) return task;
            if (task.subTasks) {
                const sub = findTask(task.subTasks);
                if (sub) return sub;
            }
        }
        return undefined;
    };
    taskToComplete = findTask(airdrop.tasks);

    if (taskToComplete) {
        completeNextAirdropTask(airdrop.id);
        addToast(`Next task for "${airdrop.projectName}" marked as done!`, 'success');
    } else {
        addToast(`No uncompleted tasks found for "${airdrop.projectName}".`, 'info');
    }
  };

  const handleFetchAiSummary = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const prompt = `Provide a very concise, one-sentence summary of what this project likely does: Project Name: "${airdrop.projectName}", Description: "${airdrop.description || 'No description provided.'}". Max 20 words.`;
      const response: GenerateContentResponse = await ai.models.generateContent({
           model: 'gemini-2.5-flash-preview-04-17',
           contents: prompt,
           config: { thinkingConfig: { thinkingBudget: 0 } }
      });
      addToast('AI summary generated!', 'success');
    } catch (error) {
      console.error("AI Summary Error:", error);
      addToast('Failed to generate AI summary', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: airdrop.projectName,
        text: `Check out this airdrop: ${airdrop.projectName}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'success');
    }
  };

  return (
    <Card 
      variant="elevated" 
      padding="md" 
      className="h-full hover:shadow-lg transition-all duration-200"
      hoverable
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {airdrop.projectName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-medium ${getStatusColor(airdrop.status)}`}>
                {airdrop.status}
              </span>
              {airdrop.priority && (
                <span className={`text-sm font-medium ${getPriorityColor(airdrop.priority)}`}>
                  {airdrop.priority} Priority
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(airdrop)}
              title="Edit airdrop"
            >
              <Edit3 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(airdrop.id)}
              title="Delete airdrop"
              className="text-error hover:text-error"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {airdrop.description && (
          <p className="text-sm text-secondary line-clamp-2">
            {airdrop.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Progress</span>
            <span className="font-medium">
              {taskStats.completed}/{taskStats.total} tasks
            </span>
          </div>
          <div className="w-full bg-surface-secondary rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-success" />
            <span className="text-secondary">Potential:</span>
            <span className="font-medium">{airdrop.potential}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-info" />
            <span className="text-secondary">Time:</span>
            <span className="font-medium">
              {airdrop.timeSpentHours ? `${airdrop.timeSpentHours}h` : '0h'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-accent" />
            <span className="text-secondary">Added:</span>
            <span className="font-medium">
              {formatRelativeDate(airdrop.dateAdded)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-warning" />
            <span className="text-secondary">Tags:</span>
            <span className="font-medium">
              {airdrop.tags?.length || 0}
            </span>
          </div>
        </div>

        {/* Tags */}
        {airdrop.tags && airdrop.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {airdrop.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full"
              >
                {tag}
              </span>
            ))}
            {airdrop.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-surface-secondary text-secondary rounded-full">
                +{airdrop.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCompleteNextTask}
            className="flex-1"
            leftIcon={<CheckCircle size={16} />}
          >
            Complete Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={<Share2 size={16} />}
          >
            Share
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleArchive}
            leftIcon={airdrop.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          >
            {airdrop.isArchived ? 'Restore' : 'Archive'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFetchAiSummary}
            leftIcon={<Brain size={14} />}
            disabled={isLoading}
          >
            AI Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
