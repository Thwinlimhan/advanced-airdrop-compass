import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { Modal } from '../../design-system/components/Modal';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { WatchlistItem } from '../../types';
import { 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Tag,
  Calendar
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { WatchlistForm } from './WatchlistForm';
import { WatchlistItemCard } from './WatchlistItemCard';

export const WatchlistPage: React.FC = () => {
  const { watchlist, addWatchlistItem, updateWatchlistItem, deleteWatchlistItem, fetchWatchlist, isLoading } = useWatchlistStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (watchlist.length === 0 && !isLoading) {
      fetchWatchlist();
    }
  }, [watchlist.length, isLoading, fetchWatchlist]);

  const handleAddItem = async (itemData: Omit<WatchlistItem, 'id' | 'addedDate'>) => {
    try {
      await addWatchlistItem(itemData);
      addToast('Watchlist item added successfully.', 'success');
      setIsAddModalOpen(false);
    } catch (error) {
      addToast('Failed to add watchlist item.', 'error');
    }
  };

  const handleUpdateItem = async (item: WatchlistItem | Omit<WatchlistItem, 'id' | 'addedDate'>): Promise<void> => {
    try {
      if ('id' in item) {
        // This is an update operation
        await updateWatchlistItem(item);
        addToast('Watchlist item updated successfully.', 'success');
      } else {
        // This is a create operation (shouldn't happen in edit mode, but handling for type safety)
        await addWatchlistItem(item);
        addToast('Watchlist item added successfully.', 'success');
      }
      setEditingItem(null);
    } catch (error) {
      addToast('Failed to update watchlist item.', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = watchlist.find((item: WatchlistItem) => item.id === itemId);
    if (itemToDelete && window.confirm(`Are you sure you want to delete "${itemToDelete.projectName}"?`)) {
      try {
        await deleteWatchlistItem(itemId);
        addToast('Watchlist item deleted successfully.', 'success');
      } catch (error) {
        addToast('Failed to delete watchlist item.', 'error');
      }
    }
  };

  const handlePromoteItem = async (itemId: string, itemName: string) => {
    try {
      // For now, this is a placeholder implementation
      // In a real app, this would call an API to promote the watchlist item to an airdrop
      addToast(`Promote functionality for "${itemName}" will be implemented in a future update.`, 'info');
    } catch (error) {
      addToast('Failed to promote item to airdrop.', 'error');
    }
  };

  const filteredAndSortedItems = watchlist
    .filter((item: WatchlistItem) => {
      const matchesSearch = item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .sort((a: WatchlistItem, b: WatchlistItem) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.projectName.localeCompare(b.projectName);
          break;
        case 'date':
          comparison = new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();
          break;
        case 'priority':
          comparison = (a.confidence === 'High' ? 3 : a.confidence === 'Medium' ? 2 : 1) - 
                      (b.confidence === 'High' ? 3 : b.confidence === 'Medium' ? 2 : 1);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'airdrop', label: 'Airdrop' },
    { value: 'token', label: 'Token' },
    { value: 'project', label: 'Project' },
    { value: 'event', label: 'Event' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'name', label: 'Sort by Name' },
    { value: 'priority', label: 'Sort by Priority' }
  ];

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={24} className="text-accent" />
                Watchlist
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchWatchlist()}
                  leftIcon={<RefreshCw size={16} />}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Item
                </Button>
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Track important projects, tokens, and events in your crypto journey.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
              />
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={statusOptions}
              />
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={typeOptions}
              />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'priority')}
                options={sortOptions}
              />
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                leftIcon={sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <WatchlistItemCard
              key={item.id}
              item={item}
              onEdit={() => setEditingItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
              onPromote={handlePromoteItem}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedItems.length === 0 && (
          <Card variant="default" padding="xl">
            <CardContent className="text-center py-12">
              <Eye size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No watchlist items found</h3>
              <p className="text-secondary mb-4">
                {searchQuery || filterStatus || filterType
                  ? 'Try adjusting your search or filters.'
                  : 'Start building your watchlist to track important crypto projects and events.'}
              </p>
              {!searchQuery && !filterStatus && !filterType && (
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Your First Item
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Watchlist Item">
          <WatchlistForm
            onSubmit={handleAddItem}
            onClose={() => setIsAddModalOpen(false)}
          />
        </Modal>

        <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Edit Watchlist Item">
          {editingItem && (
            <WatchlistForm
              onSubmit={handleUpdateItem}
              onClose={() => setEditingItem(null)}
              initialData={editingItem}
            />
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
};
