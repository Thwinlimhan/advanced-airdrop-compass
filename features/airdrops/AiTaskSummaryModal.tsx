import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Textarea } from '../../design-system/components/Textarea';
import { useAirdropStore } from '../../stores/airdropStore';
import { useAiStrategyStore } from '../../stores/aiStrategyStore';
import { AirdropTask } from '../../types';
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Target,
  Plus,
  Save,
  X,
  AlertTriangle,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

interface AiTaskSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  airdropId: string;
  onTasksCreated?: (tasks: AirdropTask[]) => void;
}

interface SuggestedTask {
  description: string;
  estimatedTimeMinutes: number;
  estimatedCost: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  category: string;
}

export const AiTaskSummaryModal: React.FC<AiTaskSummaryModalProps> = ({
  isOpen,
  onClose,
  airdropId,
  onTasksCreated
}) => {
  const { airdrops, addAirdropTask } = useAirdropStore();
  const { generateAITaskSuggestions } = useAiStrategyStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  const airdrop = airdrops.find(a => a.id === airdropId);

  useEffect(() => {
    if (isOpen && airdrop) {
      generateTaskSuggestions();
    }
  }, [isOpen, airdrop]);

  const generateTaskSuggestions = async () => {
    if (!airdrop) return;

    setIsGenerating(true);
    try {
      const suggestions = await generateAITaskSuggestions(airdrop);
      setSuggestedTasks(suggestions);
    } catch (error) {
      console.error('Failed to generate task suggestions:', error);
      addToast('Failed to generate AI suggestions. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskSelection = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const selectAllTasks = () => {
    setSelectedTasks(new Set(suggestedTasks.map((_, index) => index)));
  };

  const deselectAllTasks = () => {
    setSelectedTasks(new Set());
  };

  const handleCreateTasks = async () => {
    if (selectedTasks.size === 0) {
      addToast('Please select at least one task to create.', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const tasksToCreate = Array.from(selectedTasks).map(index => suggestedTasks[index]);
      const createdTasks: AirdropTask[] = [];

      for (const taskData of tasksToCreate) {
        const task = await addAirdropTask(airdropId, {
          description: taskData.description,
          completed: false,
          timeSpentMinutes: taskData.estimatedTimeMinutes,
          cost: taskData.estimatedCost,
          notes: `${taskData.reasoning}\n\nCategory: ${taskData.category}\nPriority: ${taskData.priority}${customNotes ? `\n\nCustom Notes: ${customNotes}` : ''}`
        });
        createdTasks.push(task);
      }

      addToast(`Successfully created ${createdTasks.length} task(s).`, 'success');
      
      if (onTasksCreated) {
        onTasksCreated(createdTasks);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to create tasks:', error);
      addToast('Failed to create tasks. Please try again.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle size={16} />;
      case 'medium': return <Clock size={16} />;
      case 'low': return <CheckCircle size={16} />;
      default: return <Target size={16} />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Task Suggestions"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Brain size={24} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                AI-Powered Task Suggestions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on analysis of {airdrop?.projectName} and similar airdrops
              </p>
            </div>
          </div>
        </div>

        {/* Generation Status */}
        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              AI is analyzing the airdrop and generating task suggestions...
            </p>
          </div>
        )}

        {/* Task Suggestions */}
        {!isGenerating && suggestedTasks.length > 0 && (
          <div className="space-y-4">
            {/* Selection Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTasks.size} of {suggestedTasks.length} tasks selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllTasks}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllTasks}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestedTasks.map((task, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTasks.has(index)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => toggleTaskSelection(index)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(index)}
                      onChange={() => toggleTaskSelection(index)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {task.description}
                        </h4>
                        <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)}
                          <span className="text-xs font-medium capitalize">{task.priority}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock size={14} />
                          <span>{task.estimatedTimeMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <DollarSign size={14} />
                          <span>{task.estimatedCost}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Target size={14} />
                          <span>{task.category}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>AI Reasoning:</strong> {task.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Notes */}
        {!isGenerating && suggestedTasks.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes (Optional)
            </label>
            <Textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Add any additional context or notes for the selected tasks..."
              rows={3}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedTasks.size > 0 && (
              <span>
                Will create {selectedTasks.size} task(s) for {airdrop?.projectName}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={generateTaskSuggestions}
              disabled={isGenerating}
              leftIcon={<RefreshCw size={16} />}
            >
              Regenerate
            </Button>
            <Button
              type="button"
              disabled={isCreating || selectedTasks.size === 0}
              leftIcon={isCreating ? undefined : <Plus size={16} />}
              onClick={handleCreateTasks}
            >
              {isCreating ? 'Creating...' : `Create ${selectedTasks.size} Task(s)`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
