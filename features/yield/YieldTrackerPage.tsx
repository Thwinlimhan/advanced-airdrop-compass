import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { Modal } from '../../design-system/components/Modal';
import { useYieldPositionStore } from '../../stores/yieldPositionStore';
import { useWalletStore } from '../../stores/walletStore';
import { YieldPosition } from '../../types';
import { 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  DollarSign,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { YieldForm } from './YieldForm';

export const YieldTrackerPage: React.FC = () => {
  const { yieldPositions, addYieldPosition, updateYieldPosition, deleteYieldPosition, fetchYieldPositions, isLoading } = useYieldPositionStore();
  const { wallets } = useWalletStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<YieldPosition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [sortBy, setSortBy] = useState<'platformName' | 'date' | 'apy' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (yieldPositions.length === 0 && !isLoading) {
      fetchYieldPositions();
    }
  }, [yieldPositions.length, isLoading, fetchYieldPositions]);

  const handleAddPosition = async (positionData: Omit<YieldPosition, 'id'> | YieldPosition) => {
    try {
      if ('id' in positionData) {
        await updateYieldPosition(positionData);
        addToast('Yield position updated successfully.', 'success');
        setEditingPosition(null);
      } else {
        await addYieldPosition(positionData);
        addToast('Yield position added successfully.', 'success');
        setIsAddModalOpen(false);
      }
    } catch (error) {
      addToast('Failed to save yield position.', 'error');
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    const positionToDelete = yieldPositions.find(pos => pos.id === positionId);
    if (positionToDelete && window.confirm(`Are you sure you want to delete "${positionToDelete.platformName}"?`)) {
      try {
        await deleteYieldPosition(positionId);
        addToast('Yield position deleted successfully.', 'success');
      } catch (error) {
        addToast('Failed to delete yield position.', 'error');
      }
    }
  };

  const filteredAndSortedPositions = yieldPositions
    .filter(position => {
      const matchesSearch = position.platformName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           position.assetSymbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = !filterPlatform || position.platformName === filterPlatform;
      return matchesSearch && matchesPlatform;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'platformName':
          comparison = a.platformName.localeCompare(b.platformName);
          break;
        case 'date':
          comparison = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
          break;
        case 'apy':
          comparison = (a.currentApy || 0) - (b.currentApy || 0);
          break;
        case 'value':
          comparison = (a.currentValue || 0) - (b.currentValue || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const platformOptions = [
    { value: '', label: 'All Platforms' },
    ...Array.from(new Set(yieldPositions.map(pos => pos.platformName))).map(platform => ({
      value: platform,
      label: platform
    }))
  ];

  const sortOptions = [
    { value: 'date', label: 'Sort by Date' },
    { value: 'platformName', label: 'Sort by Platform' },
    { value: 'apy', label: 'Sort by APY' },
    { value: 'value', label: 'Sort by Value' }
  ];

  // Calculate summary statistics
  const totalValue = yieldPositions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0);
  const averageAPY = yieldPositions.length > 0 
    ? yieldPositions.reduce((sum, pos) => sum + (pos.currentApy || 0), 0) / yieldPositions.length 
    : 0;
  const totalPositions = yieldPositions.length;

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={24} className="text-accent" />
                Yield Tracker
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchYieldPositions()}
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
                  Add Position
                </Button>
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Track your yield farming positions and monitor their performance.
            </p>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                </div>
                <DollarSign size={24} className="text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average APY</p>
                  <p className="text-2xl font-bold">{averageAPY.toFixed(2)}%</p>
                </div>
                <Percent size={24} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Positions</p>
                  <p className="text-2xl font-bold">{totalPositions}</p>
                </div>
                <BarChart3 size={24} className="text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
              />
              <Select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                options={platformOptions}
              />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'platformName' | 'date' | 'apy' | 'value')}
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

        {/* Positions List */}
        <div className="space-y-4">
          {filteredAndSortedPositions.map((position) => (
            <Card key={position.id} variant="default" padding="md">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold">{position.platformName}</h4>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full">
                        {position.assetSymbol}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Amount Staked: {position.amountStaked.toLocaleString()} {position.assetSymbol}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Current Value:</span>
                        <span className="ml-1 font-medium">${(position.currentValue || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">APY:</span>
                        <span className="ml-1 font-medium">{(position.currentApy || 0).toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Entry Date:</span>
                        <span className="ml-1 font-medium">{new Date(position.entryDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Wallet ID:</span>
                        <span className="ml-1 font-medium">{position.walletId}</span>
                      </div>
                    </div>
                    {position.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                        Notes: {position.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPosition(position)}
                      leftIcon={<Edit3 size={14} />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePosition(position.id)}
                      leftIcon={<Trash2 size={14} />}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedPositions.length === 0 && (
          <Card variant="default" padding="xl">
            <CardContent className="text-center py-12">
              <TrendingUp size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No yield positions found</h3>
              <p className="text-secondary mb-4">
                {searchQuery || filterPlatform
                  ? 'Try adjusting your search or filters.'
                  : 'Start tracking your yield farming positions to monitor their performance.'}
              </p>
              {!searchQuery && !filterPlatform && (
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Your First Position
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Yield Position">
          <YieldForm
            onSubmit={handleAddPosition}
            onClose={() => setIsAddModalOpen(false)}
            wallets={wallets}
          />
        </Modal>

        <Modal isOpen={!!editingPosition} onClose={() => setEditingPosition(null)} title="Edit Yield Position">
          {editingPosition && (
            <YieldForm
              onSubmit={handleAddPosition}
              onClose={() => setEditingPosition(null)}
              initialData={editingPosition}
              wallets={wallets}
            />
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
};