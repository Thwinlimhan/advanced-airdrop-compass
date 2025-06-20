import React, { useState, useMemo, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { Textarea } from '../../design-system/components/Textarea';
import { AirdropForm } from './AirdropForm';
import { AirdropCard } from './AirdropCard';
import { useAppContext } from '../../contexts/AppContext';
import { Airdrop, AirdropStatus, AirdropPriority, AirdropTask, AirdropTaskFilterPreset } from '../../types';
import { PlusCircle, Search, Filter, Archive, ArchiveRestore, Edit, Info, Layers, Droplets, Trash2 as ClearIcon, StickyNote, Loader2, RefreshCw, Plus, Eye, EyeOff } from 'lucide-react';
import { BLOCKCHAIN_OPTIONS, AIRDROP_STATUS_OPTIONS, MY_AIRDROP_STATUS_OPTIONS, AIRDROP_PRIORITY_OPTIONS } from '../../constants';
import { TagInput } from '../../components/ui/TagInput';
import { BatchEditAirdropsModal } from './BatchEditAirdropsModal';
import { AddAirdropTutorial } from '../tutorials/AddAirdropTutorial';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { FixedSizeList as List } from 'react-window';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Gift } from 'lucide-react';

export const AirdropListPage: React.FC = () => {
  const { appData, addAirdrop, updateAirdrop, deleteAirdrop, batchUpdateAirdrops, batchAddNotesToAirdrops, clearArchivedAirdrops, internalFetchAirdropsFromApi, isDataLoading } = useAppContext();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAirdrop, setEditingAirdrop] = useState<Airdrop | undefined>(undefined);

  const [searchTerm, setSearchTerm] = useState('');
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
    // Initial data fetch could be handled by AppContext or here for specific page load.
    // If appData.airdrops is empty and not loading, fetch them.
    // if (appData.airdrops.length === 0 && !isDataLoading.airdrops) {
    //   internalFetchAirdropsFromApi();
    // }
  }, []);

  const handleRefreshData = async () => {
    await internalFetchAirdropsFromApi();
  };

  const openModalForCreate = () => {
    setEditingAirdrop(undefined);
    setIsModalOpen(true);
  };

  const openModalForEdit = (airdrop: Airdrop) => {
    setEditingAirdrop(airdrop);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAirdrop(undefined);
  };

  const handleFormSubmit = async (airdropData: Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'roadmapEvents' | 'dependentOnAirdropIds' | 'leadsToAirdropIds' | 'customFields'| 'dateAdded' | 'notificationOverrides'> | Airdrop): Promise<void | Airdrop | null> => {
    if ('id' in airdropData && airdropData.id) {
      await updateAirdrop(airdropData as Airdrop);
      addToast(`Airdrop "${airdropData.projectName}" updated.`, 'success');
      return Promise.resolve();
    } else {
      const { id, tasks, transactions, claimedTokens, sybilChecklist, roadmapEvents, dateAdded, customFields, notificationOverrides, ...creationDataInput } = airdropData as Partial<Airdrop>;

      const submissionObject = {
        ...creationDataInput,
        priority: (airdropData as Airdrop).priority || AirdropPriority.MEDIUM,
        dependentOnAirdropIds: (airdropData as Airdrop).dependentOnAirdropIds || [],
        leadsToAirdropIds: (airdropData as Airdrop).leadsToAirdropIds || [],
      };

      const newAirdrop = await addAirdrop(submissionObject as Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'tags' | 'isArchived' | 'timeSpentHours' | 'roadmapEvents' | 'dependentOnAirdropIds' | 'leadsToAirdropIds' | 'logoBase64' | 'customFields' | 'dateAdded' | 'notificationOverrides'>);
      addToast(`Airdrop "${(airdropData as Airdrop).projectName}" added.`, 'success');
      return newAirdrop;
    }
  };

  const handleDeleteAirdrop = async (airdropId: string) => {
    const airdropToDelete = appData.airdrops.find(a => a.id === airdropId);
    if (window.confirm(`Are you sure you want to delete the airdrop "${airdropToDelete?.projectName}" and all its associated tasks and transactions? This action cannot be undone.`)) {
        await deleteAirdrop(airdropId);
        addToast(`Airdrop "${airdropToDelete?.projectName}" deleted.`, 'success');
        setSelectedAirdropIds(prev => prev.filter(id => id !== airdropId));
    }
  };

  const filteredAndSortedAirdrops = useMemo(() => {
    let filtered = appData.airdrops.filter(airdrop => {
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
  }, [appData.airdrops, searchTerm, filterBlockchain, filterStatus, filterMyStatus, filterPriority, filterTags, showArchived, sortBy, filterInteractionType, filterDateAddedStart, filterDateAddedEnd, filterTaskDueDate]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    appData.airdrops.forEach(airdrop => airdrop.tags?.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [appData.airdrops]);

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
        const ad = appData.airdrops.find(a => a.id === id);
        return ad && ad.isArchived === showArchived;
    });

    if (idsToUpdate.length > 0) {
        await batchUpdateAirdrops(idsToUpdate, updates);
        addToast(`${idsToUpdate.length} airdrop(s) updated.`, 'success');
    }
    setIsBatchEditModalOpen(false);
    setSelectedAirdropIds([]);
    setIsBatchProcessing(false);
  };

  const handleBatchArchiveOrRestore = async (archive: boolean) => {
    setIsBatchProcessing(true);
    const idsToUpdate = selectedAirdropIds.filter(id => {
        const ad = appData.airdrops.find(a=>a.id===id);
        return ad && ad.isArchived !== archive;
    });
    if (idsToUpdate.length > 0) {
        await batchUpdateAirdrops(idsToUpdate, { isArchived: archive });
        addToast(`${idsToUpdate.length} airdrop(s) ${archive ? 'archived' : 'restored'}.`, 'success');
    } else {
        addToast(`No airdrops needed to be ${archive ? 'archived' : 'restored'}.`, 'info');
    }
    setSelectedAirdropIds([]);
    setIsBatchProcessing(false);
  };

  const handleClearArchived = async () => {
    setIsBatchProcessing(true);
    const archivedCount = appData.airdrops.filter(a => a.isArchived).length;
    if(archivedCount === 0) {
        addToast("No archived airdrops to clear.", "info");
        setIsBatchProcessing(false);
        return;
    }
    if (window.confirm(`Are you sure you want to permanently delete ALL ${archivedCount} archived airdrops? This action cannot be undone.`)) {
        await clearArchivedAirdrops();
    }
    setIsBatchProcessing(false);
  };

  const handleBulkAddNotesSubmit = async () => {
    if (!bulkNotes.trim() || selectedAirdropIds.length === 0) {
        addToast("No notes to add or no airdrops selected.", "warning");
        return;
    }
    setIsBatchProcessing(true);
    await batchAddNotesToAirdrops(selectedAirdropIds, bulkNotes);
    addToast(`Notes appended to ${selectedAirdropIds.length} airdrop(s).`, 'success');
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

  const activeAirdropsForCount = appData.airdrops.filter(a => !a.isArchived).length;
  const archivedAirdropsForCount = appData.airdrops.filter(a => a.isArchived).length;

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
      <List
        height={600}
        width="100%"
        itemCount={airdrops.length}
        itemSize={200}
      >
        {renderAirdropCard}
      </List>
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
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openModalForCreate}
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

        {/* Batch Actions */}
        {selectedAirdropIds.length > 0 && (
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedAirdropIds.length} airdrop(s) selected
                </span>
                <div className="flex items-center gap-2">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Airdrop Grid */}
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

        {/* Empty State */}
        {filteredAndSortedAirdrops.length === 0 && (
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
                  onClick={openModalForCreate}
                  leftIcon={<Plus size={16} />}
                >
                  Add Your First Airdrop
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingAirdrop ? 'Edit Airdrop' : 'Add New Airdrop'}
          size="lg"
        >
          <AirdropForm
            onSubmit={handleFormSubmit}
            initialData={editingAirdrop}
            onClose={closeModal}
          />
        </Modal>

        <BatchEditAirdropsModal
          isOpen={isBatchEditModalOpen}
          onClose={() => setIsBatchEditModalOpen(false)}
          selectedCount={selectedAirdropIds.length}
          onSubmit={handleBatchEdit}
        />

        <Modal isOpen={isBatchNotesModalOpen} onClose={() => setIsBatchNotesModalOpen(false)} title={t('airdrop_list_bulk_notes_modal_title', {count:selectedAirdropIds.length, defaultValue:`Bulk Add Notes to ${selectedAirdropIds.length} Airdrop(s)`})} size="md">
          <Textarea id="bulk-airdrop-notes" label={t('airdrop_list_bulk_notes_label', {defaultValue:"Note to Append:"})} value={bulkNotes} onChange={(e: any) => setBulkNotes(e.target.value)} placeholder={t('airdrop_list_bulk_notes_placeholder', {defaultValue:"Enter notes to append to all selected airdrops..."})} rows={5} />
          <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setIsBatchNotesModalOpen(false); setBulkNotes(''); }}>{t('common_cancel')}</Button>
              <Button onClick={handleBulkAddNotesSubmit} disabled={!bulkNotes.trim() || isBatchProcessing} leftIcon={isBatchProcessing ? <Loader2 size={16} className="animate-spin"/> : undefined}>{t('airdrop_list_bulk_notes_add_button', {defaultValue:'Add Notes'})}</Button>
          </div>
        </Modal>
        <AddAirdropTutorial isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      </div>
    </PageWrapper>
  );
};
