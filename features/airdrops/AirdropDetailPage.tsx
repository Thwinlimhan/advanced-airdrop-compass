import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { Input } from '../../design-system/components/Input';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { useAppContext } from '../../contexts/AppContext';
import { Airdrop, AirdropStatus, ClaimedTokenLog, SybilChecklistItem, RoadmapEvent, AirdropPriority, AirdropTask, StrategyNote, AiTaskAnalysis, Wallet, AirdropNotificationSettings, TaskCompletionSuggestion } from '../../types';
import { TaskChecklist } from './TaskChecklist';
import { TransactionLogger } from './TransactionLogger';
import { AirdropForm } from './AirdropForm';
import { ClaimedTokenForm } from './ClaimedTokenForm';
import { SybilChecklistTab } from './SybilChecklistTab';
import { ProfitLossTab } from './ProfitLossTab';
import { RoadmapTab } from './RoadmapTab';
import { RoadmapEventForm } from './RoadmapEventForm';
import { SuggestedTasksModal } from './SuggestedTasksModal';
import { AirdropTimelineView } from './AirdropTimelineView';
import { AirdropDependencyGraph } from './AirdropDependencyGraph';
import { BulkTaskCreationModal } from './BulkTaskCreationModal';
import { AiTaskSummaryModal } from './AiTaskSummaryModal';
import { EligibilityChecker } from './EligibilityChecker';
import { AirdropRiskAnalysisTab } from './AirdropRiskAnalysisTab'; 
import { TaskTimerModal } from './TaskTimerModal'; 
import { TaskCompletionSuggestionModal } from './TaskCompletionSuggestionModal';
import { ArrowLeft, Edit3, Trash2, Globe, MessageSquare, Twitter, ShieldCheck, DollarSign, ListChecks, Brain, Archive, ArchiveRestore, MapPin, Clock, BarChartBig, Zap, Link2, GitFork, Image as ImageIcon, PlusCircle, FileText as StrategyNoteIcon, Info, Activity, Share2, ListPlus, Loader2, Download, AlertTriangle, Sparkles, SearchCheck } from 'lucide-react'; 
import { useToast } from '../../hooks/useToast';
import { formatMinutesToHoursAndMinutes } from '../../utils/formatting';
import { generateAirdropTasksICS } from '../../utils/icalExport'; 
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TaskFormModal } from './TaskFormModal';


const StatusIndicator: React.FC<{ status: AirdropStatus }> = ({ status }) => {
  let colorClasses = '';
  switch (status) {
    case AirdropStatus.LIVE: case AirdropStatus.CONFIRMED: colorClasses = 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200'; break;
    case AirdropStatus.RUMORED: colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'; break;
    case AirdropStatus.ENDED: colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'; break;
    case AirdropStatus.IN_PROGRESS: colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'; break;
    case AirdropStatus.COMPLETED: colorClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200'; break;
    default: colorClasses = 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
  }
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>{status}</span>;
};

const PriorityIndicator: React.FC<{ priority?: AirdropPriority }> = ({ priority }) => {
    if (!priority) return null;
    let colorClasses = '';
    switch (priority) {
        case AirdropPriority.HIGH: colorClasses = 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200'; break;
        case AirdropPriority.MEDIUM: colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200'; break;
        case AirdropPriority.LOW: colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200'; break;
        default: return null;
    }
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClasses} flex items-center`}><Zap size={12} className="mr-1"/> {priority} Priority</span>;
};


type DetailPageTab = 'tasks' | 'timeline' | 'dependencies' | 'roadmap' | 'sybil' | 'profitloss' | 'risk';

export const AirdropDetailPage: React.FC = () => {
  const { airdropId } = useParams<{ airdropId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    appData,
    updateAirdrop,
    deleteAirdrop,
    addAirdropTask,
    updateAirdropTask,
    updateMultipleAirdropTasks,
    deleteAirdropTask,
    addTransactionToAirdrop,
    deleteTransactionFromAirdrop,
    addClaimedTokenLog,
    updateClaimedTokenLog,
    deleteClaimedTokenLog,
    updateAirdropSybilItem,
    addRoadmapEvent,
    updateRoadmapEvent,
    deleteRoadmapEvent,
    completeAllSubTasks, 
   } = useAppContext();
   const { addToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailPageTab>('tasks');

  const [isClaimLogModalOpen, setIsClaimLogModalOpen] = useState(false);
  const [editingClaimLog, setEditingClaimLog] = useState<ClaimedTokenLog | undefined>(undefined);
  
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false); // General AI loading state

  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [editingRoadmapEvent, setEditingRoadmapEvent] = useState<RoadmapEvent | undefined>(undefined);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [quickTaskDescription, setQuickTaskDescription] = useState('');
  
  const [isBulkTaskModalOpen, setIsBulkTaskModalOpen] = useState(false);
  const [isAiTaskSummaryModalOpen, setIsAiTaskSummaryModalOpen] = useState(false);
  const [aiTaskSummaryContent, setAiTaskSummaryContent] = useState<AiTaskAnalysis | null>(null);
  const [isEligibilityCheckerOpen, setIsEligibilityCheckerOpen] = useState(false);
  
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [aiNotesSummary, setAiNotesSummary] = useState<string | null>(null);
  const [isAiSummarizingNotes, setIsAiSummarizingNotes] = useState(false); 
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  const [isTaskFormModalOpen, setIsTaskFormModalOpen] = useState(false);
  const [editingTaskForModal, setEditingTaskForModal] = useState<AirdropTask | undefined>(undefined);
  const [parentTaskIdForNewTask, setParentTaskIdForNewTask] = useState<string | undefined>(undefined);

  const [taskForTimer, setTaskForTimer] = useState<AirdropTask | null>(null);
  const [isTaskTimerModalOpen, setIsTaskTimerModalOpen] = useState(false);
  const [taskForCompletionSuggestion, setTaskForCompletionSuggestion] = useState<AirdropTask | null>(null);
  const [isTaskCompletionSuggestionModalOpen, setIsTaskCompletionSuggestionModalOpen] = useState(false);
  const [currentCompletionSuggestion, setCurrentCompletionSuggestion] = useState<TaskCompletionSuggestion | null>(null);


  const airdrop = useMemo(() => appData.airdrops.find(a => a.id === airdropId), [appData.airdrops, airdropId]);
  const allAirdrops = appData.airdrops;
  const strategyNotes = appData.strategyNotes;

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const taskIdToHighlight = queryParams.get('highlightTaskId');
    if (taskIdToHighlight) {
      setHighlightedTaskId(taskIdToHighlight);
      setActiveTab('tasks');
    } else {
        setHighlightedTaskId(null);
    }
  }, [location.search]);

  useEffect(() => {
    if (!airdrop && airdropId && appData.airdrops.length > 0) {
      addToast("Airdrop not found. It may have been deleted or the link is invalid.", "error");
      navigate('/airdrops');
    }
  }, [airdrop, airdropId, navigate, addToast, appData.airdrops]);

  const taskProgress = useMemo(() => {
    if (!airdrop || !airdrop.tasks || airdrop.tasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const countTasks = (tasks: AirdropTask[]): {completed: number, total: number} => {
        let completed = 0;
        let total = 0;
        tasks.forEach(task => {
            total++;
            if (task.completed) completed++;
            if (task.subTasks && task.subTasks.length > 0) {
                const subCounts = countTasks(task.subTasks);
                completed += subCounts.completed;
                total += subCounts.total;
            }
        });
        return {completed, total};
    };
    const {completed, total} = countTasks(airdrop.tasks);
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  }, [airdrop]);

  const relatedStrategyNotes = useMemo(() => {
    if (!airdrop || !strategyNotes) return [];
    return strategyNotes.filter(note => note.linkedAirdropIds?.includes(airdrop.id));
  }, [airdrop, strategyNotes]);

  const handleEditAirdropSubmit = async (data: Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'roadmapEvents' | 'customFields'| 'dateAdded' | 'notificationOverrides'> | Airdrop) => {
    if (!airdrop) return;
    const finalAirdropData = {
        ...airdrop, 
        ...(data as Airdrop),
        officialLinks: (data as Airdrop).officialLinks || airdrop.officialLinks,
        notificationOverrides: (data as Airdrop).notificationOverrides,
    };

    await updateAirdrop(finalAirdropData);
    addToast(`Airdrop "${finalAirdropData.projectName}" updated.`, 'success');
    setIsEditModalOpen(false);
  };


  const handleDeleteAirdrop = () => {
    if (airdrop && window.confirm(`Are you sure you want to delete the airdrop "${airdrop.projectName}"? This action cannot be undone.`)) {
      deleteAirdrop(airdrop.id);
      addToast(`Airdrop "${airdrop.projectName}" deleted.`, "success");
      navigate('/airdrops');
    }
  };

  const handleToggleArchive = () => {
    if (airdrop) {
      updateAirdrop({ ...airdrop, isArchived: !airdrop.isArchived });
      addToast(`Airdrop "${airdrop.projectName}" ${!airdrop.isArchived ? 'archived' : 'restored'}.`, "success");
    }
  };

  const handleOpenClaimLogModal = (log?: ClaimedTokenLog) => {
    if (airdrop?.isArchived) { addToast("Cannot modify P&L of an archived airdrop.", "warning"); return; }
    setEditingClaimLog(log);
    setIsClaimLogModalOpen(true);
  };

  const handleClaimLogSubmit = async (logData: Omit<ClaimedTokenLog, 'id' | 'currentMarketPricePerToken'> | ClaimedTokenLog) => {
    if (!airdrop) return;
    if ('id' in logData) {
      await updateClaimedTokenLog(airdrop.id, logData);
      addToast("Claimed token log updated.", "success");
    } else {
      await addClaimedTokenLog(airdrop.id, logData);
      addToast("Claimed token log added.", "success");
    }
    setIsClaimLogModalOpen(false);
    setEditingClaimLog(undefined);
  };

  const handleDeleteClaimLog = async (airdropIdParam: string, logId: string) => {
    await deleteClaimedTokenLog(airdropIdParam, logId);
    addToast("Claimed token log deleted.", "success");
  };
  
  const handleOpenRoadmapModal = (event?: RoadmapEvent) => {
    if (airdrop?.isArchived) { addToast("Cannot modify roadmap of an archived airdrop.", "warning"); return; }
    setEditingRoadmapEvent(event);
    setIsRoadmapModalOpen(true);
  };

  const handleRoadmapEventSubmit = async (eventData: Omit<RoadmapEvent, 'id'> | RoadmapEvent) => {
    if (!airdrop) return;
    if ('id' in eventData) {
      await updateRoadmapEvent(airdrop.id, eventData);
      addToast("Roadmap event updated.", "success");
    } else {
      await addRoadmapEvent(airdrop.id, eventData);
      addToast("Roadmap event added.", "success");
    }
    setIsRoadmapModalOpen(false);
    setEditingRoadmapEvent(undefined);
  };

  const handleDeleteRoadmapEvent = async (airdropIdParam: string, eventId: string) => {
    await deleteRoadmapEvent(airdropIdParam, eventId);
    addToast("Roadmap event deleted.", "success");
  };

  const handleSuggestTasks = async () => {
    if (!airdrop || isAiLoading || isApiKeyMissing) {
      if (isApiKeyMissing) addToast("AI features require an API_KEY.", "warning");
      return;
    }
    setIsAiLoading(true);
    setSuggestedTasks([]);
    addToast("AI is thinking of task suggestions...", "info");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const prompt = `Suggest 3-5 actionable tasks for a user participating in the "${airdrop.projectName}" airdrop. Consider its description: "${airdrop.description || 'N/A'}". Tasks should be general and common for this type of project. Phrase them as checklist items. Return as a JSON array of strings. Example: ["Swap on main DEX", "Add liquidity to a pool", "Vote on a proposal"]. Do NOT use markdown code fences in the JSON output.`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { responseMimeType: "application/json", thinkingConfig: {thinkingBudget: 0} }
      });

      let jsonStr = response.text?.trim() || '';
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedSuggestions: string[] = JSON.parse(jsonStr);
      if (Array.isArray(parsedSuggestions) && parsedSuggestions.every(s => typeof s === 'string')) {
          setSuggestedTasks(parsedSuggestions);
          setIsSuggestionsModalOpen(true);
      } else {
          throw new Error("AI response was not a valid array of strings.");
      }

    } catch (error) {
      console.error("Error fetching AI task suggestions:", error);
      addToast(`Error fetching AI suggestions: ${(error as Error).message}.`, "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddSuggestedTasks = (selectedTaskDescriptions: string[]) => {
    if (!airdrop) return;
    selectedTaskDescriptions.forEach(desc => {
      addAirdropTask(airdrop.id, { description: desc, completed: false });
    });
    addToast(`${selectedTaskDescriptions.length} suggested tasks added.`, "success");
  };

  const handleOpenTaskFormModal = (task?: AirdropTask, parentId?: string) => {
    if (airdrop?.isArchived) {
        addToast("Cannot modify tasks of an archived airdrop.", "warning");
        return;
    }
    setEditingTaskForModal(task);
    setParentTaskIdForNewTask(parentId);
    setIsTaskFormModalOpen(true);
  };
  
  const handleModalTaskSubmit = (taskData: Partial<AirdropTask>, modalParentId?: string) => {
    if (!airdrop) return;
    const finalTaskData = { ...taskData, parentId: modalParentId || taskData.parentId };
  
    if (taskData.id) { 
      const findTaskRecursive = (tasks: AirdropTask[], taskId: string): AirdropTask | undefined => {
        for (const task of tasks) {
          if (task.id === taskId) return task;
          if (task.subTasks) {
            const found = findTaskRecursive(task.subTasks, taskId);
            if (found) return found;
          }
        }
        return undefined;
      };
      const existingTask = findTaskRecursive(airdrop.tasks, taskData.id);
      if (existingTask) {
        updateAirdropTask(airdrop.id, { ...existingTask, ...finalTaskData } as AirdropTask);
        addToast("Task updated.", "success");
      } else {
        addToast("Error: Could not find task to update.", "error");
      }
    } else { 
      const newTaskPayload: Omit<AirdropTask, 'id' | 'subTasks' | 'completionDate'> = {
        description: finalTaskData.description || 'New Task',
        completed: false,
        associatedWalletId: finalTaskData.associatedWalletId,
        dueDate: finalTaskData.dueDate,
        notes: finalTaskData.notes,
        timeSpentMinutes: finalTaskData.timeSpentMinutes,
        cost: finalTaskData.cost,
        linkedGasLogId: finalTaskData.linkedGasLogId,
        dependsOnTaskIds: finalTaskData.dependsOnTaskIds || [],
        dependsOnAirdropMyStatusCompleted: finalTaskData.dependsOnAirdropMyStatusCompleted || undefined,
        parentId: finalTaskData.parentId, 
      };
      addAirdropTask(airdrop.id, newTaskPayload);
      addToast("Task added.", "success");
    }
    setIsTaskFormModalOpen(false); 
  };

  const handleQuickAddTask = () => {
    if (!airdrop || !quickTaskDescription.trim() || airdrop.isArchived) return;
    addAirdropTask(airdrop.id, { description: quickTaskDescription.trim(), completed: false });
    setQuickTaskDescription('');
    addToast("Task added quickly!", "success");
  };
  
  const handleBulkAddTasks = (tasksToAdd: { description: string }[]) => {
    if (!airdrop || airdrop.isArchived) return;
    tasksToAdd.forEach(task => addAirdropTask(airdrop.id, { description: task.description, completed: false }));
    addToast(`${tasksToAdd.length} tasks added via bulk add.`, "success");
    setIsBulkTaskModalOpen(false); // Close modal after adding
  };
  
  const handleAiTaskAnalysis = async () => {
    if (!airdrop || airdrop.tasks.length === 0 || isAiLoading || isApiKeyMissing) {
      if (isApiKeyMissing) addToast("AI features require an API_KEY.", "warning");
      else if (airdrop && airdrop.tasks.length === 0) addToast("No tasks to analyze.", "info");
      return;
    }
    setIsAiLoading(true); 
    setAiTaskSummaryContent(null);
    addToast("AI is analyzing your tasks...", "info");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const taskListString = airdrop.tasks.map(t => `- ${t.description} (Completed: ${t.completed}${t.subTasks && t.subTasks.length > 0 ? `, Sub-tasks: ${t.subTasks.length}` : ''})`).join('\n');
      const prompt = `Analyze the following list of tasks for the airdrop "${airdrop.projectName}" and provide a brief overall summary of the effort involved. Then, categorize the tasks into logical groups (e.g., "Social Engagement", "On-Chain Activity", "Community") and suggest 1-2 priority tasks within each category. Finally, provide 2-3 general tips for successfully completing these types of tasks. Project Description: "${airdrop.description || 'N/A'}". Tasks:\n${taskListString}\n\nReturn as a JSON object: { "summary": "string", "prioritySuggestions": Array<{category: "string", tasks: string[]}>, "generalTips": string[] }. Do NOT use markdown code fences.`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      let jsonStr = response.text?.trim() || '';
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedSummary: AiTaskAnalysis = JSON.parse(jsonStr);
      setAiTaskSummaryContent(parsedSummary);
      setIsAiTaskSummaryModalOpen(true);

    } catch (error) {
        console.error("AI Task Analysis Error:", error);
        addToast(`Error fetching AI task analysis: ${(error as Error).message}.`, "error");
    } finally {
        setIsAiLoading(false); 
    }
  };

  const handleExportICS = () => {
    if (!airdrop) return;
    const icsString = generateAirdropTasksICS(airdrop, appData.wallets);
    if (icsString) {
      const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${airdrop.projectName.replace(/\s+/g, '_')}_tasks.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Tasks exported to ICS calendar file.", "success");
    } else {
      addToast("No tasks with due dates to export.", "info");
    }
  };

  const handleToggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    addToast(`Focus Mode ${!isFocusMode ? 'Enabled' : 'Disabled'}.`, 'info');
  };
  
  const handleShare = () => {
    addToast("Sharing features are conceptual and will be implemented in a future update.", "info");
  };

  const handleAiSummarizeNotesAndDesc = async () => {
    if (!airdrop || isAiSummarizingNotes || isApiKeyMissing) {
      if (isApiKeyMissing) addToast("AI features require an API_KEY.", "warning");
      return;
    }
    const textToSummarize = `${airdrop.description || ''}\n\n${airdrop.notes || ''}`.trim();
    if (!textToSummarize) {
      addToast("No notes or description available to summarize.", "info");
      return;
    }

    setIsAiSummarizingNotes(true);
    setAiSummaryError(null);
    setAiNotesSummary(null); 
    addToast("AI is summarizing notes & description...", "info");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const prompt = `Summarize the key points from the following text for the crypto project "${airdrop.projectName}". Focus on actionable items, deadlines, or critical information for airdrop participation. Keep the summary concise (e.g., 3-5 bullet points or a short paragraph). Text to summarize:\n\n${textToSummarize}`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });
      
      setAiNotesSummary(response.text?.trim() || '');
      addToast("Notes & description summarized by AI.", "success");

    } catch (error) {
      console.error("AI Note/Desc Summarization Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error summarizing content.";
      setAiSummaryError(`Summarization failed: ${errorMessage}`);
      addToast(`Error summarizing content: ${errorMessage}`, "error");
    } finally {
      setIsAiSummarizingNotes(false);
    }
  };
  
  const handleOpenTimerModal = (task: AirdropTask) => {
    setTaskForTimer(task);
    setIsTaskTimerModalOpen(true);
  };
  const handleLogTimeFromTimer = (minutes: number) => {
    if (taskForTimer && airdrop) {
      const updatedTime = (taskForTimer.timeSpentMinutes || 0) + minutes;
      updateAirdropTask(airdrop.id, { ...taskForTimer, timeSpentMinutes: updatedTime });
    }
  };
  const handleOpenCompletionSuggestionModal = (task: AirdropTask) => {
    setTaskForCompletionSuggestion(task);
    // In a real app, you'd call an AI here to generate `currentCompletionSuggestion`
    // For now, we'll simulate a simple suggestion or open the modal for manual confirmation.
    // This logic should be moved to the TaskChecklist or TaskItem if more context is needed for AI.
    setCurrentCompletionSuggestion({ // Mock suggestion
        matchFound: false, 
        confidence: 'None', 
        reasoning: "Conceptual: AI would check wallet activity here."
    });
    setIsTaskCompletionSuggestionModalOpen(true);
  };

  const handleConfirmCompleteFromSuggestion = () => {
    if (taskForCompletionSuggestion && airdrop) {
      updateAirdropTask(airdrop.id, { ...taskForCompletionSuggestion, completed: true, completionDate: new Date().toISOString() });
      addToast(`Task "${taskForCompletionSuggestion.description}" marked complete via AI suggestion.`, 'success');
    }
    setIsTaskCompletionSuggestionModalOpen(false);
  };


  if (!airdrop) {
    return <PageWrapper><div className="text-center p-8">Loading airdrop details or airdrop not found...</div></PageWrapper>;
  }

  const tabs: { id: DetailPageTab; label: string; icon: React.ElementType }[] = [
    { id: 'tasks', label: 'Tasks', icon: ListChecks },
    { id: 'profitloss', label: 'P&L / Claims', icon: BarChartBig },
    { id: 'roadmap', label: 'Roadmap', icon: MapPin },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'dependencies', label: 'Dependencies', icon: GitFork },
    { id: 'sybil', label: 'Sybil Checklist', icon: ShieldCheck },
    { id: 'risk', label: 'Risk Analysis (AI)', icon: AlertTriangle },
  ];
  
  const totalTimeSpentMinutes = (airdrop.timeSpentHours || 0) * 60 + (airdrop.tasks.reduce((sum, task) => sum + (task.timeSpentMinutes || 0) + (task.subTasks?.reduce((subSum, subTask) => subSum + (subTask.timeSpentMinutes || 0),0) || 0), 0));

  return (
    <PageWrapper>
      <div className="mb-4 flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/airdrops')} leftIcon={<ArrowLeft size={16}/>}>
          Back to List
        </Button>
        <div className="flex items-center space-x-2">
           <Button variant="ghost" onClick={handleToggleFocusMode} title={isFocusMode ? "Disable Focus Mode" : "Enable Focus Mode"} className={`${isFocusMode ? 'text-green-500' : ''}`}>
                <Activity size={18} /> <span className="ml-1 hidden sm:inline">Focus</span>
           </Button>
           <Button variant="ghost" onClick={handleShare} title="Share Airdrop (Conceptual)">
             <Share2 size={18} />
           </Button>
           <Button variant="ghost" onClick={handleExportICS} title="Export Tasks to Calendar (ICS)">
             <Download size={18} />
           </Button>
           {!isFocusMode && (
             <>
              <Button variant="outline" onClick={handleToggleArchive} leftIcon={airdrop.isArchived ? <ArchiveRestore size={16}/> : <Archive size={16}/>}>
                {airdrop.isArchived ? 'Restore' : 'Archive'}
              </Button>
              {!airdrop.isArchived && (
                <Button variant="primary" onClick={() => setIsEditModalOpen(true)} leftIcon={<Edit3 size={16}/>}>
                  Edit
                </Button>
              )}
              <Button variant="danger" onClick={handleDeleteAirdrop} leftIcon={<Trash2 size={16}/>}>
                Delete
              </Button>
             </>
           )}
        </div>
      </div>

      {!isFocusMode && (
        <Card className="mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-start">
            <div className="flex items-start mb-3 md:mb-0">
                {airdrop.logoBase64 ? (
                <img src={`data:image/jpeg;base64,${airdrop.logoBase64}`} alt={`${airdrop.projectName} logo`} className="w-16 h-16 rounded-lg object-cover mr-4 border border-border" />
                ) : (
                <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center text-text-tertiary mr-4"> <ImageIcon size={32} /> </div>
                )}
                <div>
                <h2 className="text-2xl font-bold text-text-light">{airdrop.projectName}</h2>
                <p className="text-sm text-text-secondary">{airdrop.blockchain}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusIndicator status={airdrop.status} />
                    <StatusIndicator status={airdrop.myStatus} />
                    <PriorityIndicator priority={airdrop.priority} />
                </div>
                </div>
            </div>
            <div className="flex flex-col items-start md:items-end text-sm space-y-1 md:space-y-0.5 mt-2 md:mt-0">
                <p><span className="font-medium">Potential:</span> {airdrop.potential}</p>
                <p><span className="font-medium">Est. Time Spent:</span> {formatMinutesToHoursAndMinutes(totalTimeSpentMinutes)}</p>
                <p><span className="font-medium">Date Added:</span> {new Date(airdrop.dateAdded).toLocaleDateString()}</p>
                {airdrop.tags && airdrop.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                    {airdrop.tags.map(tag => <span key={tag} className="text-xs px-1.5 py-0.5 bg-surface rounded-full">{tag}</span>)}
                    </div>
                )}
                 <Button
                    size="sm" variant="ghost"
                    onClick={() => setIsEligibilityCheckerOpen(true)}
                    className="text-xs p-0 mt-1 text-primary hover:underline"
                    leftIcon={<SearchCheck size={14}/>}
                    disabled={isApiKeyMissing || !airdrop.eligibilityCriteria?.trim()}
                    title={!airdrop.eligibilityCriteria?.trim() ? "No eligibility criteria set for this airdrop." : "Run AI Eligibility Pre-check"}
                >
                    AI Eligibility Pre-check
                </Button>
            </div>
            </div>
            {airdrop.description && <p className="mt-3 text-sm text-text-secondary whitespace-pre-wrap">{airdrop.description}</p>}
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-x-4 gap-y-1">
            {airdrop.officialLinks?.website && <a href={airdrop.officialLinks.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center"><Globe size={14} className="mr-1"/>Website</a>}
            {airdrop.officialLinks?.twitter && <a href={airdrop.officialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center"><Twitter size={14} className="mr-1"/>Twitter</a>}
            {airdrop.officialLinks?.discord && <a href={airdrop.officialLinks.discord} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center"><MessageSquare size={14} className="mr-1"/>Discord</a>}
            </div>
            {airdrop.eligibilityCriteria && <div className="mt-3 p-2 bg-accent-secondary rounded-md"><h5 className="text-xs font-semibold text-accent">Eligibility Criteria:</h5><p className="text-xs text-accent-secondary whitespace-pre-wrap">{airdrop.eligibilityCriteria}</p></div>}
            {airdrop.notes && <div className="mt-3 p-2 bg-accent-secondary rounded-md"><h5 className="text-xs font-semibold text-accent">Personal Notes:</h5><p className="text-xs text-accent-secondary whitespace-pre-wrap">{airdrop.notes}</p></div>}
            
            {(airdrop.notes || airdrop.description) && (
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-md font-semibold text-text-secondary flex items-center">
                    <Brain size={16} className="mr-2 text-accent" />
                    AI Generated Summary
                  </h5>
                  <Button
                    onClick={handleAiSummarizeNotesAndDesc}
                    disabled={isAiSummarizingNotes || isApiKeyMissing || (!airdrop.notes && !airdrop.description)}
                    size="sm"
                    variant="outline"
                    leftIcon={isAiSummarizingNotes ? <Loader2 className="animate-spin"/> : <Sparkles size={14}/>}
                  >
                    {isAiSummarizingNotes ? "Summarizing..." : (aiNotesSummary ? "Re-summarize" : "Summarize Notes & Desc")}
                  </Button>
                </div>
                {isApiKeyMissing && !aiSummaryError && (
                  <AlertMessage type="warning" message="AI Summarization requires an API_KEY. This feature is currently disabled." className="mb-2 text-xs" />
                )}
                {isAiSummarizingNotes && <p className="text-sm text-text-secondary">AI is generating summary...</p>}
                {aiSummaryError && !isAiSummarizingNotes && (
                  <AlertMessage type="error" message={aiSummaryError} onDismiss={() => setAiSummaryError(null)} className="text-xs" />
                )}
                {aiNotesSummary && !isAiSummarizingNotes && !aiSummaryError && (
                  <div className="p-2.5 bg-accent-secondary rounded-md text-sm text-accent">
                    {aiNotesSummary}
                  </div>
                )}
              </div>
            )}

            {(airdrop.customFields || []).length > 0 && (
                <div className="mt-3">
                <h5 className="text-sm font-semibold text-text-secondary">Custom Info:</h5>
                <ul className="list-disc list-inside pl-4 text-xs">
                    {(airdrop.customFields || []).map(cf => <li key={cf.id}><span className="font-medium">{cf.key}:</span> {cf.value}</li>)}
                </ul>
                </div>
            )}
            {relatedStrategyNotes.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <h5 className="text-sm font-semibold text-text-secondary flex items-center"><StrategyNoteIcon size={14} className="mr-1"/>Related Strategy Notes:</h5>
                <ul className="list-disc list-inside pl-4 text-xs">
                  {relatedStrategyNotes.map(note => (
                    <li key={note.id}><Link to={`/learning/notebook/${note.id}`} className="text-primary hover:underline">{note.title}</Link></li>
                  ))}
                </ul>
              </div>
            )}
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border pb-px">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-sm sm:px-4 sm:py-2 ${isFocusMode && tab.id !== 'tasks' ? 'hidden sm:flex' : 'flex'}`}
            leftIcon={<tab.icon size={16}/>}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      
      {activeTab === 'tasks' && (
        <Card>
           <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <h3 className="text-xl font-semibold text-text-light">Tasks Checklist</h3>
                {!airdrop.isArchived && (
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setIsBulkTaskModalOpen(true)} size="sm" variant="outline" leftIcon={<ListPlus size={16}/>}>Bulk Add Tasks</Button>
                        <Button onClick={handleSuggestTasks} size="sm" variant="outline" leftIcon={isAiLoading ? <Loader2 className="animate-spin"/> : <Brain size={16}/>} disabled={isAiLoading || isApiKeyMissing}>Suggest Tasks (AI)</Button>
                        <Button onClick={handleAiTaskAnalysis} size="sm" variant="outline" leftIcon={isAiLoading ? <Loader2 className="animate-spin"/> : <Brain size={16}/>} disabled={isAiLoading || isApiKeyMissing || airdrop.tasks.length === 0}>AI Task Analysis</Button>
                        <Button onClick={() => handleOpenTaskFormModal(undefined, undefined)} size="sm" leftIcon={<PlusCircle size={16}/>}>Add New Task</Button>
                    </div>
                )}
            </div>
            {isApiKeyMissing && <AlertMessage type="info" message="Some AI features for tasks are disabled as API_KEY is not configured." className="mb-3 text-xs"/>}
            {!airdrop.isArchived && (
                <form onSubmit={(e) => {e.preventDefault(); handleQuickAddTask();}} className="flex gap-2 mb-4">
                    <Input id="quickTaskDesc" value={quickTaskDescription} onChange={(e) => setQuickTaskDescription(e.target.value)} placeholder="Quick add task description..." />
                    <Button type="submit" size="sm" disabled={!quickTaskDescription.trim()}>Quick Add</Button>
                </form>
            )}

          <TaskChecklist
            airdropId={airdrop.id}
            tasks={airdrop.tasks}
            wallets={appData.wallets}
            allAirdropTasksForDependencies={airdrop.tasks} 
            allAirdropsSystemWide={allAirdrops} 
            onAddTask={(airdropIdParam, taskData) => addAirdropTask(airdropIdParam, taskData)}
            onUpdateTask={(airdropIdParam, task) => updateAirdropTask(airdropIdParam, task)}
            onDeleteTask={(airdropIdParam, taskId, parentIdParam) => deleteAirdropTask(airdropIdParam, taskId, parentIdParam)}
            onUpdateMultipleTasks={(airdropIdParam, taskIds, updates) => updateMultipleAirdropTasks(airdropIdParam, taskIds, updates)}
            isArchived={airdrop.isArchived || false}
            highlightTaskId={highlightedTaskId}
            onCompleteAllSubTasks={(parentTaskId) => completeAllSubTasks(airdrop.id, parentTaskId)}
            onOpenTaskForm={handleOpenTaskFormModal}
            onOpenTimerModal={handleOpenTimerModal}
            onOpenSuggestionModal={handleOpenCompletionSuggestionModal}
          />
          <TransactionLogger
            airdropId={airdrop.id}
            transactions={airdrop.transactions}
            onAddTransaction={addTransactionToAirdrop}
            onDeleteTransaction={(aid, tid) => deleteTransactionFromAirdrop(aid, tid)}
            isArchived={airdrop.isArchived || false}
          />
        </Card>
      )}
      {activeTab === 'timeline' && <AirdropTimelineView airdrop={airdrop} />}
      {activeTab === 'dependencies' && <AirdropDependencyGraph currentAirdrop={airdrop} allAirdrops={allAirdrops} />}
      {activeTab === 'roadmap' && (
        <RoadmapTab 
            airdrop={airdrop} 
            onOpenModal={handleOpenRoadmapModal} 
            onDeleteEvent={handleDeleteRoadmapEvent} 
            isArchived={airdrop.isArchived || false}
        />
      )}
      {activeTab === 'sybil' && <SybilChecklistTab airdrop={airdrop} onUpdateItem={updateAirdropSybilItem} />}
      {activeTab === 'profitloss' && <ProfitLossTab airdrop={airdrop} onOpenClaimLogModal={handleOpenClaimLogModal} onDeleteClaimLog={handleDeleteClaimLog} isArchived={airdrop.isArchived || false} />}
      {activeTab === 'risk' && <AirdropRiskAnalysisTab airdrop={airdrop} />} {/* Render Risk Analysis Tab */}

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Airdrop Details" size="xl">
        <AirdropForm onSubmit={(data) => handleEditAirdropSubmit(data as Airdrop)} initialData={airdrop} onClose={() => setIsEditModalOpen(false)} />
      </Modal>
      <ClaimedTokenForm isOpen={isClaimLogModalOpen} onSubmit={handleClaimLogSubmit} initialData={editingClaimLog} onClose={() => {setIsClaimLogModalOpen(false); setEditingClaimLog(undefined);}} />
      <SuggestedTasksModal isOpen={isSuggestionsModalOpen} onClose={() => setIsSuggestionsModalOpen(false)} suggestions={suggestedTasks} onAddTasks={handleAddSuggestedTasks} />
      <RoadmapEventForm isOpen={isRoadmapModalOpen} onSubmit={handleRoadmapEventSubmit} initialData={editingRoadmapEvent} onClose={() => setIsRoadmapModalOpen(false)} />
      <TaskFormModal 
        isOpen={isTaskFormModalOpen} 
        onClose={() => setIsTaskFormModalOpen(false)} 
        onSubmit={handleModalTaskSubmit} 
        initialData={editingTaskForModal}
        parentId={parentTaskIdForNewTask}
        wallets={appData.wallets}
        allAirdropTasksForDependencies={airdrop.tasks}
        currentAirdropId={airdrop.id}
        allAirdropsSystemWide={allAirdrops}
      />
      <BulkTaskCreationModal isOpen={isBulkTaskModalOpen} onClose={() => setIsBulkTaskModalOpen(false)} onAddTasks={handleBulkAddTasks} />
      <AiTaskSummaryModal isOpen={isAiTaskSummaryModalOpen} onClose={() => setIsAiTaskSummaryModalOpen(false)} summaryContent={aiTaskSummaryContent} />
      <EligibilityChecker isOpen={isEligibilityCheckerOpen} onClose={() => setIsEligibilityCheckerOpen(false)} airdropName={airdrop.projectName} eligibilityCriteria={airdrop.eligibilityCriteria || ''} />
      
      {taskForTimer && (
        <TaskTimerModal 
            isOpen={isTaskTimerModalOpen} 
            onClose={() => setIsTaskTimerModalOpen(false)}
            taskName={taskForTimer.description}
            initialTimeMinutes={taskForTimer.timeSpentMinutes || 0}
            onLogTime={handleLogTimeFromTimer}
        />
      )}
      {taskForCompletionSuggestion && (
        <TaskCompletionSuggestionModal
            isOpen={isTaskCompletionSuggestionModalOpen}
            onClose={() => setIsTaskCompletionSuggestionModalOpen(false)}
            suggestion={currentCompletionSuggestion}
            onConfirmComplete={handleConfirmCompleteFromSuggestion}
            taskDescription={taskForCompletionSuggestion.description}
        />
      )}

    </PageWrapper>
  );
};
