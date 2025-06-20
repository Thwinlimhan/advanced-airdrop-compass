import React, { useState, useMemo, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { WatchlistForm } from './WatchlistForm';
import { WatchlistItemCard } from './WatchlistItemCard';
import { useAppContext } from '../../contexts/AppContext';
import { WatchlistItem, ConfidenceLevel, Airdrop } from '../../types'; 
import { PlusCircle, Filter as FilterIconLucide, ArrowUpCircle, Eye } from 'lucide-react'; // Renamed Filter to FilterIconLucide
import { useToast } from '../../hooks/useToast';
import { useNavigate, useLocation } from 'react-router-dom';
import { CONFIDENCE_LEVELS } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';


export const WatchlistPage: React.FC = () => {
  const { appData, addWatchlistItem, updateWatchlistItem, deleteWatchlistItem, promoteWatchlistItemToAirdrop } = useAppContext();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchlistItem | undefined>(undefined);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConfidence, setFilterConfidence] = useState<ConfidenceLevel | ''>('');
  const [sortBy, setSortBy] = useState<'projectName_asc' | 'addedDate_desc' | 'confidence_desc'>('addedDate_desc');
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const itemIdToHighlight = queryParams.get('highlightItemId');
    if (itemIdToHighlight) {
      setHighlightedItemId(itemIdToHighlight);
    } else {
        setHighlightedItemId(null);
    }
  }, [location.search]);

  const openModalForCreate = () => {
    setEditingItem(undefined);
    setIsModalOpen(true);
  };

  const openModalForEdit = (item: WatchlistItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(undefined);
  };

  const handleFormSubmit = async (itemData: Omit<WatchlistItem, 'id' | 'addedDate'> | WatchlistItem) => {
    if ('id' in itemData) { 
      await updateWatchlistItem(itemData as WatchlistItem);
      addToast(t('watchlist_item_updated_toast', {itemName: itemData.projectName, defaultValue: `Watchlist item "${itemData.projectName}" updated.`}), 'success');
    } else { 
      await addWatchlistItem(itemData as Omit<WatchlistItem, 'id' | 'addedDate'>);
      addToast(t('watchlist_item_added_toast', {itemName: itemData.projectName, defaultValue: `Watchlist item "${itemData.projectName}" added.`}), 'success');
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (window.confirm(t('watchlist_delete_confirm', {itemName, defaultValue: `Are you sure you want to delete "${itemName}" from the watchlist?`}))) {
        await deleteWatchlistItem(itemId);
        addToast(t('watchlist_item_deleted_toast', {itemName, defaultValue: `Watchlist item "${itemName}" deleted.`}), 'success');
    }
  };

  const handlePromoteItem = async (itemId: string, itemName: string) => {
    if (window.confirm(t('watchlist_promote_confirm', {itemName, defaultValue: `Are you sure you want to promote "${itemName}" to a full Airdrop entry? It will be removed from the watchlist.`}))) {
        const promotedAirdrop: Airdrop | null = await promoteWatchlistItemToAirdrop(itemId);
        if (promotedAirdrop && promotedAirdrop.id) {
            addToast(t('watchlist_item_promoted_toast', {itemName, defaultValue: `"${itemName}" promoted to Airdrop Tracker! You can edit details there.`}), 'success');
            navigate(`/airdrops/${promotedAirdrop.id}`); 
        } else {
            addToast(t('watchlist_item_promote_fail_toast', {itemName, defaultValue: `Failed to promote "${itemName}". Item not found or promotion error.`}), 'error');
        }
    }
  };


  const filteredAndSortedItems = useMemo(() => {
    let filtered = (appData.watchlist || []).filter(item => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameMatch = item.projectName.toLowerCase().includes(searchTermLower);
      const confidenceMatch = filterConfidence ? item.confidence === filterConfidence : true;
      return nameMatch && confidenceMatch;
    });

    switch (sortBy) {
        case 'projectName_asc': filtered.sort((a, b) => a.projectName.localeCompare(b.projectName)); break;
        case 'addedDate_desc': filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()); break;
        case 'confidence_desc': 
            const confidenceOrder: Record<ConfidenceLevel, number> = { [ConfidenceLevel.HIGH]: 3, [ConfidenceLevel.MEDIUM]: 2, [ConfidenceLevel.LOW]: 1 };
            filtered.sort((a,b) => (confidenceOrder[b.confidence] || 0) - (confidenceOrder[a.confidence] || 0));
            break;
    }
    return filtered;
  }, [appData.watchlist, searchTerm, filterConfidence, sortBy]);

  const confidenceOptions = [{value: '', label: t('watchlist_filter_all_confidence_levels', {defaultValue: 'All Confidence Levels'})}, ...CONFIDENCE_LEVELS.map(c => ({ value: c, label: c }))];

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center">
            <Eye size={28} className="mr-3 text-primary-light" />
            <h2 className="text-2xl font-semibold text-text-light">{t('nav_watchlist')}</h2>
        </div>
        <Button onClick={openModalForCreate} leftIcon={<PlusCircle size={18}/>}>
          {t('watchlist_add_button_text', {defaultValue: 'Add to Watchlist'})}
        </Button>
      </div>
      <p className="text-sm text-muted-light mb-6">
        {t('watchlist_intro_text', {defaultValue: "Keep an eye on potential airdrops that aren't confirmed yet. Promote them to the main Airdrop Tracker when you're ready."})}
      </p>

      <div className="mb-6 p-4 bg-card-light rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input id="searchWatchlist" label={t('watchlist_search_label', {defaultValue:"Search by Name"})} placeholder={t('watchlist_search_placeholder', {defaultValue:"E.g., Unannounced Protocol"})} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10" />
          <Select id="filterConfidence" label={t('watchlist_filter_confidence_label', {defaultValue:"Filter by Confidence"})} value={filterConfidence} onChange={(e) => setFilterConfidence(e.target.value as ConfidenceLevel | '')} options={confidenceOptions} className="h-10" />
          <Select id="sortWatchlistBy" label={t('watchlist_sort_by_label', {defaultValue:"Sort By"})} value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} options={[ { value: 'addedDate_desc', label: t('watchlist_sort_date_desc', {defaultValue:'Date Added (Newest)'}) }, { value: 'projectName_asc', label: t('watchlist_sort_name_asc', {defaultValue:'Name (A-Z)'}) }, { value: 'confidence_desc', label: t('watchlist_sort_confidence_desc', {defaultValue:'Confidence (High-Low)'}) }, ]} className="h-10" />
        </div>
      </div>

      {(appData.watchlist || []).length === 0 && !searchTerm && !filterConfidence ? (
        <div className="text-center py-10">
          <Eye size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-text-light mb-2">{t('watchlist_empty_title', {defaultValue:'Your Watchlist is Eager for Prospects!'})}</p>
          <p className="text-muted-light">{t('watchlist_empty_message', {defaultValue:"Add potential airdrops here to keep them on your radar. Let's find some gems!"})}</p>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-10">
          <FilterIconLucide size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-text-light mb-2">{t('watchlist_filter_no_match_title', {defaultValue:'No Watchlist Items Found'})}</p>
          <p className="text-muted-light">{t('watchlist_filter_no_match_message', {defaultValue:'Try adjusting your search or filters.'})}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedItems.map(item => (
            <WatchlistItemCard key={item.id} item={item} onEdit={openModalForEdit} onDelete={handleDeleteItem} onPromote={handlePromoteItem} isHighlighted={item.id === highlightedItemId} />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? t('watchlist_edit_modal_title', {defaultValue:'Edit Watchlist Item'}) : t('watchlist_add_modal_title', {defaultValue:'Add to Watchlist'})} size="lg">
        <WatchlistForm onSubmit={handleFormSubmit} initialData={editingItem} onClose={closeModal} />
      </Modal>
    </PageWrapper>
  );
};
