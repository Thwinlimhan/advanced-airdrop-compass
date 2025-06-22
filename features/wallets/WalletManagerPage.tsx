import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { useWalletStore } from '../../stores/walletStore';
import { Wallet, BalanceSnapshot, GasLogEntry, InteractionLogEntry, NftLogEntry, TransactionHistoryEntry } from '../../types';
import { WalletList } from './WalletList';
import { WalletForm } from './WalletForm';
import { WalletHealthCheckModal } from './WalletHealthCheckModal';
import { 
  Plus, 
  RefreshCw, 
  Archive, 
  ArchiveRestore, 
  Trash2, 
  Download, 
  Upload, 
  Shield, 
  Activity,
  Wallet as WalletIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { BLOCKCHAIN_OPTIONS } from '../../constants';

export const WalletManagerPage: React.FC = () => {
  const { 
    wallets, 
    addWallet, 
    updateWallet, 
    deleteWallet, 
    batchUpdateWallets,
    fetchWallets,
    isLoading 
  } = useWalletStore();
  
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHealthCheckModalOpen, setIsHealthCheckModalOpen] = useState(false);
  const [selectedWalletForHealthCheck, setSelectedWalletForHealthCheck] = useState<Wallet | undefined>(undefined);
  const [filterBlockchain, setFilterBlockchain] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);

  useEffect(() => {
    if (wallets.length === 0 && !isLoading) {
      fetchWallets();
    }
  }, [wallets.length, isLoading, fetchWallets]);

  const handleRefreshData = async () => {
    await fetchWallets();
  };

  const handleAddWallet = async (walletData: Omit<Wallet, 'id' | 'balanceSnapshots' | 'gasLogs' | 'interactionLogs' | 'nftPortfolio' | 'isArchived' | 'transactionHistory'>) => {
    try {
      await addWallet(walletData);
      addToast(`Wallet "${walletData.name}" added successfully.`, 'success');
      setIsAddModalOpen(false);
    } catch (error) {
      addToast('Failed to add wallet.', 'error');
    }
  };

  const handleUpdateWallet = async (wallet: Wallet) => {
    try {
      await updateWallet(wallet);
      addToast(`Wallet "${wallet.name}" updated successfully.`, 'success');
    } catch (error) {
      addToast('Failed to update wallet.', 'error');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    const walletToDelete = wallets.find(w => w.id === walletId);
    if (walletToDelete && window.confirm(`Are you sure you want to delete the wallet "${walletToDelete.name}"? This action cannot be undone.`)) {
      try {
        await deleteWallet(walletId);
        addToast(`Wallet "${walletToDelete.name}" deleted successfully.`, 'success');
        setSelectedWalletIds(prev => prev.filter(id => id !== walletId));
      } catch (error) {
        addToast('Failed to delete wallet.', 'error');
      }
    }
  };

  const handleBatchArchive = async (archive: boolean) => {
    if (selectedWalletIds.length === 0) {
      addToast('No wallets selected.', 'warning');
      return;
    }

    try {
      await batchUpdateWallets(selectedWalletIds, { isArchived: archive });
      addToast(`${selectedWalletIds.length} wallet(s) ${archive ? 'archived' : 'restored'} successfully.`, 'success');
      setSelectedWalletIds([]);
    } catch (error) {
      addToast(`Failed to ${archive ? 'archive' : 'restore'} wallets.`, 'error');
    }
  };

  const handleOpenHealthCheck = (wallet: Wallet) => {
    setSelectedWalletForHealthCheck(wallet);
    setIsHealthCheckModalOpen(true);
  };

  const filteredWallets = wallets.filter(wallet => {
    const blockchainMatch = filterBlockchain ? wallet.blockchain === filterBlockchain : true;
    const groupMatch = filterGroup ? wallet.group === filterGroup : true;
    const archiveMatch = wallet.isArchived === showArchived;
    return blockchainMatch && groupMatch && archiveMatch;
  });

  const activeWallets = wallets.filter(w => !w.isArchived);
  const archivedWallets = wallets.filter(w => w.isArchived);
  const allGroups = Array.from(new Set(wallets.map(w => w.group).filter(Boolean)));

  const walletStats = {
    total: wallets.length,
    active: activeWallets.length,
    archived: archivedWallets.length,
    withBalances: wallets.filter(w => w.balanceSnapshots && w.balanceSnapshots.length > 0).length,
    withTransactions: wallets.filter(w => w.transactionHistory && w.transactionHistory.length > 0).length
  };

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon size={24} className="text-accent" />
                Wallet Management
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
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Wallet
                </Button>
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Manage your crypto wallets, track balances, and monitor transactions across different blockchains.
            </p>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Wallets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{walletStats.total}</p>
              </div>
              <WalletIcon size={24} className="text-blue-500" />
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{walletStats.active}</p>
              </div>
              <CheckCircle size={24} className="text-green-500" />
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Archived</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{walletStats.archived}</p>
              </div>
              <Archive size={24} className="text-gray-500" />
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">With Balances</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{walletStats.withBalances}</p>
              </div>
              <TrendingUp size={24} className="text-purple-500" />
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">With Transactions</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{walletStats.withTransactions}</p>
              </div>
              <Activity size={24} className="text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={filterBlockchain}
                onChange={(e) => setFilterBlockchain(e.target.value)}
                options={[
                  { value: '', label: 'All Blockchains' },
                  ...BLOCKCHAIN_OPTIONS.map(blockchain => ({ value: blockchain, label: blockchain }))
                ]}
              />
              <Select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                options={[
                  { value: '', label: 'All Groups' },
                  ...allGroups.filter(group => group !== undefined).map(group => ({ value: group, label: group }))
                ]}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchived(!showArchived)}
                  leftIcon={showArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                >
                  {showArchived ? 'Show Active' : 'Show Archived'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch Actions */}
        {selectedWalletIds.length > 0 && (
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedWalletIds.length} wallet(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchArchive(true)}
                    leftIcon={<Archive size={16} />}
                  >
                    Archive Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBatchArchive(false)}
                    leftIcon={<ArchiveRestore size={16} />}
                  >
                    Restore Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet List */}
        <WalletList
          wallets={filteredWallets}
          onEdit={handleUpdateWallet}
          onDelete={handleDeleteWallet}
          onToggleArchive={(walletId: string, isArchived: boolean) => {
            const wallet = wallets.find(w => w.id === walletId);
            if (wallet) {
              handleUpdateWallet({ ...wallet, isArchived });
            }
          }}
          selectedWallets={selectedWalletIds}
          onToggleSelectWallet={(walletId: string) => {
            setSelectedWalletIds(prev =>
              prev.includes(walletId) ? prev.filter(id => id !== walletId) : [...prev, walletId]
            );
          }}
        />

        {/* Empty State */}
        {filteredWallets.length === 0 && (
          <Card variant="default" padding="xl">
            <CardContent className="text-center py-12">
              <WalletIcon size={48} className="mx-auto text-muted mb-4" />
              <h3 className="text-lg font-semibold mb-2">No wallets found</h3>
              <p className="text-secondary mb-4">
                {filterBlockchain || filterGroup || showArchived
                  ? 'Try adjusting your filters.'
                  : 'Get started by adding your first wallet.'}
              </p>
              {!filterBlockchain && !filterGroup && !showArchived && (
                <Button
                  variant="primary"
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Your First Wallet
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Wallet">
          <WalletForm
            onSubmit={handleAddWallet}
            onClose={() => setIsAddModalOpen(false)}
          />
        </Modal>

        <WalletHealthCheckModal
          isOpen={isHealthCheckModalOpen}
          onClose={() => setIsHealthCheckModalOpen(false)}
          wallet={selectedWalletForHealthCheck}
        />
      </div>
    </PageWrapper>
  );
};
