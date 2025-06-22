import React, { useState, useMemo, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { DraggableModal } from '../../design-system/components/DraggableModal';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { Textarea } from '../../design-system/components/Textarea';
import { AirdropFormModal } from './AirdropForm';
import { AirdropCard } from './AirdropCard';
import { useAirdropStore } from '../../stores/airdropStore';
import { Airdrop, AirdropStatus, AirdropPriority, AirdropTask, AirdropTaskFilterPreset } from '../../types';
import { PlusCircle, Search, Filter, Archive, ArchiveRestore, Edit, Info, Layers, Droplets, Trash2 as ClearIcon, StickyNote, Loader2, RefreshCw, Plus, Eye, EyeOff, LayoutGrid, List, DownloadCloud } from 'lucide-react';
import { BLOCKCHAIN_OPTIONS, AIRDROP_STATUS_OPTIONS, MY_AIRDROP_STATUS_OPTIONS, AIRDROP_PRIORITY_OPTIONS } from '../../constants';
import { TagInput } from '../../components/ui/TagInput';
import { BatchEditAirdropsModal } from './BatchEditAirdropsModal';
import { AddAirdropTutorial } from '../tutorials/AddAirdropTutorial';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { FixedSizeList as VirtualList } from 'react-window';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Gift } from 'lucide-react';
import { AirdropListItem } from './AirdropListItem';
import { AirdropScraperModal } from './AirdropScraperModal';

export const AirdropListPage: React.FC = () => {
  const { 
    airdrops, 
    addAirdrop, 
    updateAirdrop, 
    deleteAirdrop, 
    batchUpdateAirdrops, 
    batchAddNotesToAirdrops, 
    clearArchivedAirdrops,
    fetchAirdrops,
    isLoading,
    scrapeAirdropDataFromURL
  } = useAirdropStore();
  
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScraperModalOpen, setIsScraperModalOpen] = useState(false);
  const [editingAirdrop, setEditingAirdrop] = useState<Airdrop | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBlockchain, setFilterBlockchain] = useState('');
  const [filterInteractionType, setFilterInteractionType] = useState('');
  const [filterDateAddedStart, setFilterDateAddedStart] = useState('');
  const [filterDateAddedEnd, setFilterDateAddedEnd] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMyStatus, setFilterMyStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState<AirdropPriority | ''>('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterTaskDueDate, setFilterTaskDueDate] = useState<AirdropTaskFilterPreset>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState('projectName_asc');

  const [selectedAirdropIds, setSelectedAirdropIds] = useState<string[]>([]);
  const [isBatchEditModalOpen, setIsBatchEditModalOpen] = useState(false);
  const [isBatchNotesModalOpen, setIsBatchNotesModalOpen] = useState(false);
  const [bulkNotes, setBulkNotes] = useState('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  useEffect(() => {
    // Initial data fetch
    if (airdrops.length === 0 && !isLoading) {
      fetchAirdrops();
    }
  }, [airdrops.length, isLoading, fetchAirdrops]);

  const handleRefreshData = async () => {
    await fetchAirdrops();
  };

  const openModalForCreate = (prefillData?: Partial<Airdrop>) => {
    // Modified to accept prefill data
    const newAirdropTemplate: Partial<Airdrop> = {
        projectName: prefillData?.projectName || '',
        blockchain: prefillData?.blockchain || BLOCKCHAIN_OPTIONS[0],
        status: prefillData?.status || AirdropStatus.RUMORED,
        potential: prefillData?.potential || 'Unknown',
        myStatus: AirdropStatus.NOT_STARTED,
        priority: prefillData?.priority || AirdropPriority.MEDIUM,
        description: prefillData?.description || '',
        officialLinks: prefillData?.officialLinks || { website: '', twitter: '', discord: '' },
        notes: prefillData?.notes || '',
        tags: prefillData?.tags || [],
        isArchived: false,
        timeSpentHours: 0,
        dependentOnAirdropIds: [],
        leadsToAirdropIds: [],
        dateAdded: new Date().toISOString(),
    };
    setEditingAirdrop(newAirdropTemplate as Airdrop);
    setIsModalOpen(true);
  };
  
  // New handler for the scraper flow
  const handleScrapeAndPrefill = async (url: string) => {
    try {
      const prefillData = await scrapeAirdropDataFromURL(url);
      if (prefillData) {
        openModalForCreate(prefillData);
      }
    } catch (error) {
      addToast('Failed to scrape data from URL.', 'error');
    }
  };

  const openModalForEdit = (airdrop: Airdrop) => {
    setEditingAirdrop(airdrop);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAirdrop(undefined);
  };

  const handleFormSubmit = async (airdropData: any): Promise<void | Airdrop | null> => {
    try {
      // Convert AirdropFormData to Airdrop format
      const convertedData = {
        ...airdropData,
        id: editingAirdrop?.id || undefined,
        status: editingAirdrop?.status || AirdropStatus.RUMORED,
        priority: editingAirdrop?.priority || AirdropPriority.MEDIUM,
        tasks: editingAirdrop?.tasks || [],
        transactions: editingAirdrop?.transactions || [],
        claimedTokens: editingAirdrop?.claimedTokens || [],
        sybilChecklist: editingAirdrop?.sybilChecklist || [],
        roadmapEvents: editingAirdrop?.roadmapEvents || [],
        dependentOnAirdropIds: editingAirdrop?.dependentOnAirdropIds || [],
        leadsToAirdropIds: editingAirdrop?.leadsToAirdropIds || [],
        customFields: editingAirdrop?.customFields || [],
        dateAdded: editingAirdrop?.dateAdded || new Date().toISOString(),
        notificationOverrides: editingAirdrop?.notificationOverrides || {},
        isArchived: editingAirdrop?.isArchived || false,
        timeSpentHours: editingAirdrop?.timeSpentHours || 0,
        logoBase64: editingAirdrop?.logoBase64 || undefined,
        projectCategory: editingAirdrop?.projectCategory || undefined,
        eligibilityCriteria: airdropData.eligibility || '',
        officialLinks: {
          website: airdropData.website || '',
          twitter: airdropData.twitter || '',
          discord: airdropData.discord || ''
        }
      };

      if ('id' in convertedData && convertedData.id) {
        await updateAirdrop(convertedData as Airdrop);
        addToast(`Airdrop "${convertedData.projectName}" updated.`, 'success');
        return Promise.resolve();
      } else {
        const { id, tasks, transactions, claimedTokens, sybilChecklist, roadmapEvents, dateAdded, customFields, notificationOverrides, ...creationDataInput } = convertedData as Partial<Airdrop>;

        const submissionObject = {
          ...creationDataInput,
          priority: (convertedData as Airdrop).priority || AirdropPriority.MEDIUM,
          dependentOnAirdropIds: (convertedData as Airdrop).dependentOnAirdropIds || [],
          leadsToAirdropIds: (convertedData as Airdrop).leadsToAirdropIds || [],
        };

        const newAirdrop = await addAirdrop(submissionObject as Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'tags' | 'isArchived' | 'timeSpentHours' | 'roadmapEvents' | 'dependentOnAirdropIds' | 'leadsToAirdropIds' | 'logoBase64' | 'customFields' | 'dateAdded' | 'notificationOverrides'>);
        addToast(`Airdrop "${(convertedData as Airdrop).projectName}" added.`, 'success');
        return newAirdrop;
      }
    } catch (error) {
      addToast(`Failed to ${editingAirdrop ? 'update' : 'add'} airdrop.`, 'error');
      throw error;
    }
  };

  const handleDeleteAirdrop = async (airdropId: string) => {
    const airdropToDelete = airdrops.find(a => a.id === airdropId);
    if (window.confirm(`Are you sure you want to delete the airdrop "${airdropToDelete?.projectName}" and all its associated tasks and transactions? This action cannot be undone.`)) {
        try {
          await deleteAirdrop(airdropId);
          addToast(`Airdrop "${airdropToDelete?.projectName}" deleted.`, 'success');
          setSelectedAirdropIds(prev => prev.filter(id => id !== airdropId));
        } catch (error) {
          addToast('Failed to delete airdrop.', 'error');
        }
    }
  };

  const filteredAndSortedAirdrops = useMemo(() => {
    let filtered = airdrops.filter(airdrop => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameMatch = airdrop.projectName.toLowerCase().includes(searchTermLower);
      const blockchainMatch = filterBlockchain ? airdrop.blockchain === filterBlockchain : true;
      const statusMatch = filterStatus ? airdrop.status === filterStatus : true;
      const myStatusMatch = filterMyStatus ? airdrop.myStatus === filterMyStatus : true;
      const priorityMatch = filterPriority ? airdrop.priority === filterPriority : true;
      const archiveMatch = airdrop.isArchived === showArchived;
      const tagsMatch = filterTags.length === 0 ? true : filterTags.every(tag => airdrop.tags?.includes(tag));

      const interactionTypeLower = filterInteractionType.toLowerCase();
      const interactionMatch = filterInteractionType ?
        airdrop.tasks.some(task => task.description.toLowerCase().includes(interactionTypeLower) || (task.notes && task.notes.toLowerCase().includes(interactionTypeLower)))
        : true;

      const dateAdded = new Date(airdrop.dateAdded);
      const startDate = filterDateAddedStart ? new Date(filterDateAddedStart) : null;
      const endDate = filterDateAddedEnd ? new Date(filterDateAddedEnd) : null;
      if(startDate) startDate.setHours(0,0,0,0);
      if(endDate) endDate.setHours(23,59,59,999);

      const dateAddedMatch = (!startDate || dateAdded >= startDate) && (!endDate || dateAdded <= endDate);

      let taskDueDateMatch = true;
      if (filterTaskDueDate !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const checkTaskDueDates = (tasks: AirdropTask[]): boolean => {
          return tasks.some(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            if (filterTaskDueDate === 'overdue') return dueDate < today;
            if (filterTaskDueDate === 'dueNext7Days') return dueDate >= today && dueDate <= next7Days;
            if (filterTaskDueDate === 'dueNext30Days') return dueDate >= today && dueDate <= next30Days;
            return false;
          });
        };
        taskDueDateMatch = checkTaskDueDates(airdrop.tasks);
      }

      return nameMatch && blockchainMatch && statusMatch && myStatusMatch && priorityMatch && archiveMatch && tagsMatch && interactionMatch && dateAddedMatch && taskDueDateMatch;
    });

    const potentialMap: Record<string, number> = {'Low':1, 'Medium':2, 'High':3, 'Very High': 4, 'Unknown': 0};
    const priorityOrder: Record<AirdropPriority, number> = { [AirdropPriority.HIGH]: 3, [AirdropPriority.MEDIUM]: 2, [AirdropPriority.LOW]: 1 };

    switch (sortBy) {
        case 'projectName_asc': filtered.sort((a, b) => a.projectName.localeCompare(b.projectName)); break;
        case 'projectName_desc': filtered.sort((a, b) => b.projectName.localeCompare(a.projectName)); break;
        case 'potential_asc': filtered.sort((a,b) => (potentialMap[a.potential] || 0) - (potentialMap[b.potential] || 0)); break;
        case 'potential_desc': filtered.sort((a,b) => (potentialMap[b.potential] || 0) - (potentialMap[a.potential] || 0)); break;
        case 'priority_asc': filtered.sort((a,b) => (priorityOrder[a.priority || AirdropPriority.LOW]) - (priorityOrder[b.priority || AirdropPriority.LOW])); break;
        case 'priority_desc': filtered.sort((a,b) => (priorityOrder[b.priority || AirdropPriority.LOW]) - (priorityOrder[a.priority || AirdropPriority.LOW])); break;
        case 'dateAdded_asc': filtered.sort((a,b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()); break;
        case 'dateAdded_desc': filtered.sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()); break;
    }
    return filtered;
  }, [airdrops, searchTerm, filterBlockchain, filterStatus, filterMyStatus, filterPriority, filterTags, showArchived, sortBy, filterInteractionType, filterDateAddedStart, filterDateAddedEnd, filterTaskDueDate]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    airdrops.forEach(airdrop => airdrop.tags?.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [airdrops]);

  const handleToggleSelectAirdrop = (airdropId: string) => {
    const airdrop = filteredAndSortedAirdrops.find(a => a.id === airdropId);
    if (!airdrop) return;

    if (showArchived !== airdrop.isArchived) return;

    setSelectedAirdropIds(prev =>
      prev.includes(airdropId) ? prev.filter(id => id !== airdropId) : [...prev, airdropId]
    );
  };

  const handleSelectAllVisible = () => {
    const currentlyVisibleSelectableIds = filteredAndSortedAirdrops
      .filter(a => a.isArchived === showArchived)
      .map(a => a.id);

    if (selectedAirdropIds.length === currentlyVisibleSelectableIds.length && currentlyVisibleSelectableIds.every(id => selectedAirdropIds.includes(id))) {
      setSelectedAirdropIds([]);
    } else {
      setSelectedAirdropIds(currentlyVisibleSelectableIds);
    }
  };

  const handleBatchEdit = async (updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain' | 'isArchived'>>) => {
    setIsBatchProcessing(true);
    const idsToUpdate = selectedAirdropIds.filter(id => {
        const ad = airdrops.find(a => a.id === id);
        return ad && ad.isArchived === showArchived;
    });

    if (idsToUpdate.length > 0) {
        try {
          await batchUpdateAirdrops(idsToUpdate, updates);
          addToast(`${idsToUpdate.length} airdrop(s) updated.`, 'success');
        } catch (error) {
          addToast('Failed to update airdrops.', 'error');
        }
    }
    setIsBatchEditModalOpen(false);
    setSelectedAirdropIds([]);
    setIsBatchProcessing(false);
  };

  const handleBatchArchiveOrRestore = async (archive: boolean) => {
    setIsBatchProcessing(true);
    const idsToUpdate = selectedAirdropIds.filter(id => {
        const ad = airdrops.find(a=>a.id===id);
        return ad && ad.isArchived !== archive;
    });
    if (idsToUpdate.length > 0) {
        try {
          await batchUpdateAirdrops(idsToUpdate, { isArchived: archive });
          addToast(`${idsToUpdate.length} airdrop(s) ${archive ? 'archived' : 'restored'}.`, 'success');
        } catch (error) {
          addToast(`Failed to ${archive ? 'archive' : 'restore'} airdrops.`, 'error');
        }
    } else {
        addToast(`No airdrops needed to be ${archive ? 'archived' : 'restored'}.`, 'info');
    }
    setSelectedAirdropIds([]);
    setIsBatchProcessing(false);
  };

  const handleClearArchived = async () => {
    setIsBatchProcessing(true);
    const archivedCount = airdrops.filter(a => a.isArchived).length;
    if(archivedCount === 0) {
        addToast("No archived airdrops to clear.", "info");
        setIsBatchProcessing(false);
        return;
    }
    if (window.confirm(`Are you sure you want to permanently delete ALL ${archivedCount} archived airdrops? This action cannot be undone.`)) {
        try {
          await clearArchivedAirdrops();
          addToast(`${archivedCount} archived airdrops cleared.`, 'success');
        } catch (error) {
          addToast('Failed to clear archived airdrops.', 'error');
        }
    }
    setIsBatchProcessing(false);
  };

  const handleBulkAddNotesSubmit = async () => {
    if (!bulkNotes.trim() || selectedAirdropIds.length === 0) {
        addToast("No notes to add or no airdrops selected.", "warning");
        return;
    }
    setIsBatchProcessing(true);
    try {
      await batchAddNotesToAirdrops(selectedAirdropIds, bulkNotes);
      addToast(`Notes appended to ${selectedAirdropIds.length} airdrop(s).`, 'success');
    } catch (error) {
      addToast('Failed to add notes to airdrops.', 'error');
    }
    setBulkNotes('');
    setIsBatchNotesModalOpen(false);
    setSelectedAirdropIds([]);
    setIsBatchProcessing(false);
  };

  const taskDueDateFilterOptions: {value: AirdropTaskFilterPreset | 'all', label: string}[] = [
    { value: 'all', label: t('airdrop_list_task_due_filter_all', {defaultValue:'All Task Due Dates'}) },
    { value: 'overdue', label: t('airdrop_list_task_due_filter_overdue', {defaultValue:'Overdue Tasks'}) },
    { value: 'dueNext7Days', label: t('airdrop_list_task_due_filter_dueNext7Days', {defaultValue:'Tasks Due Next 7 Days'}) },
    { value: 'dueNext30Days', label: t('airdrop_list_task_due_filter_dueNext30Days', {defaultValue:'Tasks Due Next 30 Days'}) },
  ];

  const activeAirdropsForCount = airdrops.filter(a => !a.isArchived).length;
  const archivedAirdropsForCount = airdrops.filter(a => a.isArchived).length;

  const VirtualizedAirdropList: React.FC<{ airdrops: Airdrop[] }> = ({ airdrops }) => {
    const renderAirdropCard = ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const airdrop = airdrops[index];
      return (
        <div style={style}>
          <AirdropCard
            airdrop={airdrop}
            onEdit={openModalForEdit}
            onDelete={handleDeleteAirdrop}
          />
        </div>
      );
    };

    return (
      <VirtualList
        height={600}
        width="100%"
        itemCount={airdrops.length}
        itemSize={200}
      >
        {renderAirdropCard}
      </VirtualList>
    );
  };

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={24} className="text-accent" />
                Airdrop Management
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshData}
                  leftIcon={<RefreshCw size={16} />}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScraperModalOpen(true)}
                  leftIcon={<DownloadCloud size={16} />}
                >
                  Import from URL (AI)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openModalForCreate()}
                  leftIcon={<Plus size={16} />}
                >
                  Add Airdrop
                </Button>
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Manage your airdrop portfolio, track progress, and optimize your strategy.
            </p>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Search airdrops..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={16} />}
              />
              <Select
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: AirdropStatus.CONFIRMED, label: 'Confirmed' },
                  { value: AirdropStatus.LIVE, label: 'Live' },
                  { value: AirdropStatus.COMPLETED, label: 'Completed' }
                ]}
              />
              <Select
                value={filterPriority}
                onChange={(e: any) => setFilterPriority(e.target.value as AirdropPriority | '')}
                options={[
                  { value: '', label: 'All Priorities' },
                  { value: AirdropPriority.HIGH, label: 'High Priority' },
                  { value: AirdropPriority.MEDIUM, label: 'Medium Priority' },
                  { value: AirdropPriority.LOW, label: 'Low Priority' }
                ]}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchived(!showArchived)}
                  leftIcon={showArchived ? <EyeOff size={16} /> : <Eye size={16} />}
                >
                  {showArchived ? 'Hide' : 'Show'} Archived
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle and Batch Actions */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-card-dark/60 p-1 rounded-lg">
            <Button 
              variant={viewMode === 'grid' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('grid')} 
              className="p-1.5 h-auto"
            >
              <LayoutGrid size={18}/>
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'primary' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')} 
              className="p-1.5 h-auto"
            >
              <List size={18}/>
            </Button>
          </div>
          
          {selectedAirdropIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedAirdropIds.length} airdrop(s) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBatchEditModalOpen(true)}
                leftIcon={<Edit size={16} />}
              >
                Batch Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchArchiveOrRestore(true)}
                leftIcon={<Archive size={16} />}
              >
                Archive Selected
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBatchArchiveOrRestore(false)}
                leftIcon={<ClearIcon size={16} />}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Airdrop Display */}
        {filteredAndSortedAirdrops.length === 0 ? (
          <Card variant="default" padding="xl">
            <CardContent className="text-center py-12">
              <Gift size={48} className="mx-auto text-muted mb-4" />
              <h3 className="text-lg font-semibold mb-2">No airdrops found</h3>
              <p className="text-secondary mb-4">
                {searchTerm || filterStatus !== '' || filterPriority !== ''
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by adding your first airdrop.'}
              </p>
              {!searchTerm && filterStatus === '' && filterPriority === '' && (
                <Button
                  variant="primary"
                  onClick={() => openModalForCreate()}
                  leftIcon={<Plus size={16} />}
                >
                  Add Your First Airdrop
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedAirdrops.map((airdrop) => (
              <AirdropCard
                key={airdrop.id}
                airdrop={airdrop}
                onEdit={openModalForEdit}
                onDelete={handleDeleteAirdrop}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">My Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Official Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider w-32">Progress</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedAirdrops.map(airdrop => (
                  <AirdropListItem
                    key={airdrop.id}
                    airdrop={airdrop}
                    onEdit={openModalForEdit}
                    onDelete={handleDeleteAirdrop}
                    onToggleArchive={(id) => updateAirdrop({ ...airdrop, isArchived: !airdrop.isArchived })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
        <AirdropFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          initialAirdrop={editingAirdrop}
          mode={editingAirdrop ? 'edit' : 'create'}
        />

        <BatchEditAirdropsModal
          isOpen={isBatchEditModalOpen}
          onClose={() => setIsBatchEditModalOpen(false)}
          selectedAirdropIds={selectedAirdropIds}
        />

        <Modal isOpen={isBatchNotesModalOpen} onClose={() => setIsBatchNotesModalOpen(false)} title="Add Notes to Selected Airdrops">
          <div className="space-y-4">
            <Textarea
              placeholder="Enter notes to append to all selected airdrops..."
              value={bulkNotes}
              onChange={(e: any) => setBulkNotes(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBatchNotesModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleBulkAddNotesSubmit} disabled={!bulkNotes.trim() || isBatchProcessing}>
                {isBatchProcessing ? 'Adding...' : 'Add Notes'}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} title="Airdrop Tutorial" size="lg">
          <AddAirdropTutorial 
            onComplete={() => setIsTutorialOpen(false)}
            onSkip={() => setIsTutorialOpen(false)}
          />
        </Modal>
        
        <AirdropScraperModal 
          isOpen={isScraperModalOpen} 
          onClose={() => setIsScraperModalOpen(false)} 
          onScrape={handleScrapeAndPrefill} 
        />
      </div>
    </PageWrapper>
  );
};
