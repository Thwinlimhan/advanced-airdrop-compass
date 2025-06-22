import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { DraggableModal } from '../../design-system/components/DraggableModal';
import { Input } from '../../design-system/components/Input';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { useAirdropStore } from '../../stores/airdropStore';
import { useStrategyNoteStore } from '../../stores/strategyNoteStore';
import { useWalletStore } from '../../stores/walletStore';
import { Airdrop, AirdropStatus, ClaimedTokenLog, SybilChecklistItem, RoadmapEvent, AirdropPriority, AirdropTask, StrategyNote, AiTaskAnalysis, Wallet, AirdropNotificationSettings, TaskCompletionSuggestion } from '../../types';
import { TaskChecklist } from './TaskChecklist';
import { TransactionLogger } from './TransactionLogger';
import { AirdropFormModal } from './AirdropForm';
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
import { 
  ArrowLeft, Edit3, Trash2, Globe, MessageSquare, Twitter, ShieldCheck, DollarSign, ListChecks, Brain, Archive, ArchiveRestore, MapPin, Clock, BarChartBig, Zap, Link2, GitFork, Image as ImageIcon, PlusCircle, FileText as StrategyNoteIcon, Info, Activity, Share2, ListPlus, Loader2, Download, AlertTriangle, Sparkles, SearchCheck, Calendar, Tag, CheckCircle, Plus, CalendarDays, Timer, Lightbulb, ExternalLink, Copy, ChevronDown, ChevronRight, MoreHorizontal, Target, BookOpen, BarChart3, Shield, Calculator, Filter, Search
} from 'lucide-react'; 
import { useToast } from '../../hooks/useToast';
import { formatMinutesToHoursAndMinutes } from '../../utils/formatting';
import { generateAirdropTasksICS } from '../../utils/icalExport'; 
import { aiService } from '../../utils/aiService';
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
    airdrops,
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
  } = useAirdropStore();
  
  const { strategyNotes } = useStrategyNoteStore();
  const { wallets } = useWalletStore();
  const { addToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailPageTab>('tasks');
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  const airdrop = useMemo(() => airdrops.find(a => a.id === airdropId), [airdrops, airdropId]);

  useEffect(() => {
    const checkAIAvailability = async () => {
      try {
        const isAvailable = await aiService.isAvailable();
        if (!isAvailable) {
          setIsApiKeyMissing(true);
        }
      } catch (error) {
        setIsApiKeyMissing(true);
      }
    };
    
    checkAIAvailability();
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
    if (!airdrop && airdropId && airdrops.length > 0) {
      addToast("Airdrop not found. It may have been deleted or the link is invalid.", "error");
      navigate('/airdrops');
    }
  }, [airdrop, airdropId, navigate, addToast, airdrops]);

  const handleEditAirdropSubmit = async (airdropData: any) => {
    try {
      // Convert AirdropFormData to Airdrop format
      const convertedData = {
        ...airdropData,
        id: airdrop?.id,
        status: airdrop?.status || AirdropStatus.RUMORED,
        priority: airdrop?.priority || AirdropPriority.MEDIUM,
        tasks: airdrop?.tasks || [],
        transactions: airdrop?.transactions || [],
        claimedTokens: airdrop?.claimedTokens || [],
        sybilChecklist: airdrop?.sybilChecklist || [],
        roadmapEvents: airdrop?.roadmapEvents || [],
        dependentOnAirdropIds: airdrop?.dependentOnAirdropIds || [],
        leadsToAirdropIds: airdrop?.leadsToAirdropIds || [],
        customFields: airdrop?.customFields || [],
        dateAdded: airdrop?.dateAdded || new Date().toISOString(),
        notificationOverrides: airdrop?.notificationOverrides || {},
        isArchived: airdrop?.isArchived || false,
        timeSpentHours: airdrop?.timeSpentHours || 0,
        logoBase64: airdrop?.logoBase64 || undefined,
        projectCategory: airdrop?.projectCategory || undefined,
        eligibilityCriteria: airdropData.eligibility || '',
        officialLinks: {
          website: airdropData.website || '',
          twitter: airdropData.twitter || '',
          discord: airdropData.discord || ''
        }
      };

      await updateAirdrop(convertedData as Airdrop);
      addToast(`Airdrop "${convertedData.projectName}" updated.`, 'success');
      setIsEditModalOpen(false);
    } catch (error) {
      addToast('Failed to update airdrop.', 'error');
    }
  };

  const handleDeleteAirdrop = async () => {
    if (!airdrop) return;
    
    if (window.confirm(`Are you sure you want to delete "${airdrop.projectName}"? This action cannot be undone.`)) {
      try {
        await deleteAirdrop(airdrop.id);
        addToast(`Airdrop "${airdrop.projectName}" deleted.`, 'success');
        navigate('/airdrops');
      } catch (error) {
        addToast('Failed to delete airdrop.', 'error');
      }
    }
  };

  const handleToggleArchive = () => {
    if (!airdrop) return;
    updateAirdrop({ ...airdrop, isArchived: !airdrop.isArchived });
    addToast(`Airdrop ${airdrop.isArchived ? 'restored' : 'archived'}.`, 'success');
  };

  const handleOpenTaskFormModal = (task?: AirdropTask, parentId?: string) => {
    // This will be implemented when the TaskFormModal is properly configured
    console.log('Task form modal would open here', { task, parentId });
  };

  const handleOpenTimerModal = (task: AirdropTask) => {
    // This will be implemented when the TaskTimerModal is properly configured
    console.log('Timer modal would open here', { task });
  };

  const handleOpenCompletionSuggestionModal = (task: AirdropTask) => {
    // This will be implemented when the TaskCompletionSuggestionModal is properly configured
    console.log('Completion suggestion modal would open here', { task });
  };

  const handleCompleteAllSubTasks = (parentTaskId: string) => {
    if (airdrop) {
      completeAllSubTasks(airdrop.id, parentTaskId);
    }
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
           <Button variant="ghost" onClick={() => setIsFocusMode(!isFocusMode)} title={isFocusMode ? "Disable Focus Mode" : "Enable Focus Mode"} className={`${isFocusMode ? 'text-green-500' : ''}`}>
                <Activity size={18} /> <span className="ml-1 hidden sm:inline">Focus</span>
           </Button>
           <Button variant="ghost" onClick={() => {}} title="Share Airdrop (Conceptual)">
             <Share2 size={18} />
           </Button>
           <Button variant="ghost" onClick={() => {}} title="Export Tasks to Calendar (ICS)">
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
          </Card>
      )}

      {/* Tab Content */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              leftIcon={<tab.icon size={16} />}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'tasks' && (
            <TaskChecklist
              airdropId={airdrop.id}
              tasks={airdrop.tasks}
              wallets={wallets}
              allAirdropTasksForDependencies={airdrops.flatMap(a => a.tasks)}
              allAirdropsSystemWide={airdrops}
              onAddTask={addAirdropTask}
              onUpdateTask={updateAirdropTask}
              onDeleteTask={deleteAirdropTask}
              onUpdateMultipleTasks={updateMultipleAirdropTasks}
              isArchived={!!airdrop.isArchived}
              highlightTaskId={highlightedTaskId}
              onCompleteAllSubTasks={handleCompleteAllSubTasks}
              onOpenTaskForm={handleOpenTaskFormModal}
              onOpenTimerModal={handleOpenTimerModal}
              onOpenSuggestionModal={handleOpenCompletionSuggestionModal}
            />
          )}
          {activeTab === 'profitloss' && (
            <div className="text-center p-8 text-gray-500">
              Profit & Loss tab content will be implemented here
            </div>
          )}
          {activeTab === 'roadmap' && (
            <div className="text-center p-8 text-gray-500">
              Roadmap tab content will be implemented here
            </div>
          )}
          {activeTab === 'timeline' && (
            <div className="text-center p-8 text-gray-500">
              Timeline tab content will be implemented here
            </div>
          )}
          {activeTab === 'dependencies' && (
            <div className="text-center p-8 text-gray-500">
              Dependencies tab content will be implemented here
            </div>
          )}
          {activeTab === 'sybil' && (
            <div className="text-center p-8 text-gray-500">
              Sybil Checklist tab content will be implemented here
            </div>
          )}
          {activeTab === 'risk' && (
            <div className="text-center p-8 text-gray-500">
              Risk Analysis tab content will be implemented here
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AirdropFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditAirdropSubmit}
        initialAirdrop={airdrop}
        mode="edit"
      />
    </PageWrapper>
  );
};