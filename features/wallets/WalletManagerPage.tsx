import React, { useState, useMemo, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { Card } from '../../design-system/components/Card'; 
import { WalletForm } from './WalletForm';
import { WalletList } from './WalletList';
import { useAppContext } from '../../contexts/AppContext';
import { Wallet, Wallet as WalletType } from '../../types'; 
import { PlusCircle, PieChart, Archive, ArchiveRestore, Layers, Loader2, RefreshCw, WalletCards as WalletIcon } from 'lucide-react'; // Added RefreshCw and WalletIcon
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

interface GroupedBalance {
  [groupName: string]: {
    [tokenSymbol: string]: number;
  };
}

export const WalletManagerPage: React.FC = () => {
  const { appData, addWallet, updateWallet, deleteWallet, batchUpdateWallets, internalFetchWalletsFromApi, isDataLoading } = useAppContext();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | undefined>(undefined);
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  

  useEffect(() => {
    // Initial data fetch could be handled by AppContext or here for specific page load
    // If appData.wallets is empty and not loading, fetch them.
    // if (appData.wallets.length === 0 && !isDataLoading.wallets) {
    //   internalFetchWalletsFromApi();
    // }
  }, []);

  const handleRefreshData = async () => {
    await internalFetchWalletsFromApi(); 
  };


  const openModalForCreate = () => {
    setEditingWallet(undefined);
    setIsModalOpen(true);
  };

  const openModalForEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWallet(undefined);
  };

  const handleFormSubmit = async (walletData: Omit<Wallet, 'id'> | Wallet) => {
    if ('id' in walletData) { 
      await updateWallet(walletData as Wallet);
      addToast(`Wallet "${walletData.name}" updated.`, 'success');
    } else { 
      await addWallet(walletData as Omit<Wallet, 'id'>);
      addToast(`Wallet "${(walletData as Wallet).name}" added.`, 'success');
    }
  };

  const handleDeleteWallet = async (walletId: string) => {
    const walletToDelete = appData.wallets.find(w => w.id === walletId);
    if (window.confirm(`Are you sure you want to delete wallet "${walletToDelete?.name}"? This action cannot be undone.`)) {
        await deleteWallet(walletId);
        addToast(`Wallet "${walletToDelete?.name}" deleted.`, 'success');
        setSelectedWalletIds(prev => prev.filter(id => id !== walletId));
    }
  };
  
  const handleToggleArchiveWallet = async (walletId: string, currentIsArchived: boolean) => {
    const wallet = appData.wallets.find(w => w.id === walletId);
    if (wallet) {
        await updateWallet({ ...wallet, isArchived: !currentIsArchived });
        addToast(`Wallet "${wallet.name}" ${!currentIsArchived ? 'archived' : 'restored'}.`, 'success');
    }
  };

  const handleToggleSelectWallet = (walletId: string) => {
    setSelectedWalletIds(prev => 
        prev.includes(walletId) ? prev.filter(id => id !== walletId) : [...prev, walletId]
    );
  };
  
  const handleBatchArchive = async () => {
    if (selectedWalletIds.length === 0) return;
    setIsBatchProcessing(true);
    await batchUpdateWallets(selectedWalletIds, { isArchived: true });
    addToast(`${selectedWalletIds.length} wallet(s) archived.`, 'success');
    setSelectedWalletIds([]);
    setIsBatchProcessing(false);
  };

  const handleBatchUnarchive = async () => {
     if (selectedWalletIds.length === 0) return;
    setIsBatchProcessing(true);
    await batchUpdateWallets(selectedWalletIds, { isArchived: false });
    addToast(`${selectedWalletIds.length} wallet(s) restored.`, 'success');
    setSelectedWalletIds([]);
    setIsBatchProcessing(false);
  };


  const walletGroupBalances = useMemo((): GroupedBalance => {
    const balances: GroupedBalance = {};
    appData.wallets.filter(w => !w.isArchived).forEach(wallet => { 
        const groupName = wallet.group || 'Ungrouped';
        if (!balances[groupName]) {
            balances[groupName] = {};
        }
        wallet.balanceSnapshots?.forEach(snapshot => {
            balances[groupName][snapshot.tokenSymbol.toUpperCase()] = 
                (balances[groupName][snapshot.tokenSymbol.toUpperCase()] || 0) + snapshot.amount;
        });
    });
    return balances;
  }, [appData.wallets]);

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-light flex items-center">
            <Layers size={26} className="mr-2 text-primary"/>{t('nav_wallet_manager')}
        </h2>
        <div className="flex gap-2">
            <Button onClick={handleRefreshData} variant="outline" leftIcon={isDataLoading.wallets ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} disabled={isDataLoading.wallets}>
                {isDataLoading.wallets ? t('wallet_manager_refreshing_button', {defaultValue:"Refreshing..."}) : t('wallet_manager_refresh_button', {defaultValue:"Refresh Wallets"})}
            </Button>
            <Button onClick={openModalForCreate} leftIcon={<PlusCircle size={18}/>}>
            {t('add_new_wallet_button')}
            </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-light mb-6">
        {t('wallet_manager_intro_text', {defaultValue: "Manage your public wallet addresses here. IMPORTANT: This application will NEVER ask for, handle, or store your private keys or seed phrases."})}
      </p>

      {selectedWalletIds.length > 0 && (
        <Card className="mb-4 p-3">
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium">{t('wallet_manager_selected_count_text', {count: selectedWalletIds.length, defaultValue: `Selected: ${selectedWalletIds.length} wallet(s)`})}</span>
                <Button size="sm" variant="outline" onClick={handleBatchArchive} leftIcon={isBatchProcessing ? <Loader2 size={14} className="animate-spin"/> : <Archive size={14}/>} disabled={isBatchProcessing}>{t('wallet_manager_batch_archive_button')}</Button>
                <Button size="sm" variant="outline" onClick={handleBatchUnarchive} leftIcon={isBatchProcessing ? <Loader2 size={14} className="animate-spin"/> : <ArchiveRestore size={14}/>} disabled={isBatchProcessing}>{t('wallet_manager_batch_restore_button')}</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedWalletIds([])} disabled={isBatchProcessing}>{t('wallet_manager_clear_selection_button')}</Button>
            </div>
        </Card>
      )}

      {Object.keys(walletGroupBalances).length > 0 && (
        <Card title={t('wallet_manager_group_balance_title', {defaultValue:"Active Wallet Group Balance Summary (Manual Snapshots)"})} className="mb-6">
          <div className="space-y-4">
            {Object.entries(walletGroupBalances).map(([group, tokens]) => (
              Object.keys(tokens).length > 0 && (
                <div key={group} className="p-3 bg-gray-50 rounded-md">
                  <h4 className="text-md font-semibold text-indigo-600 mb-1.5">{group}</h4>
                  <ul className="list-disc list-inside text-sm space-y-0.5">
                    {Object.entries(tokens).map(([symbol, amount]) => (
                      <li key={symbol} className="text-text-light">
                        {symbol}: <span className="font-medium">{amount.toLocaleString(undefined, {maximumFractionDigits: 8})}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}
          </div>
           <p className="text-xs text-muted-light mt-3">{t('wallet_manager_group_balance_note')}</p>
        </Card>
      )}
      
      {isDataLoading.wallets && appData.wallets.length === 0 && (
        <div className="text-center py-10">
            <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
            <p className="text-xl font-semibold text-text-light">
                {t('wallet_manager_loading_wallets', {defaultValue: 'Loading Wallets...'})}
            </p>
        </div>
      )}

      {!isDataLoading.wallets && appData.wallets.length === 0 && (
         <div className="text-center py-10">
            <WalletIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-text-light mb-2">
                {t('wallet_list_empty_title', {defaultValue: 'No Wallets Yet'})}
            </p>
            <p className="text-muted-light">
                {t('wallet_list_empty_message', {defaultValue: 'Add your first wallet to start tracking balances and interactions.'})}
            </p>
        </div>
      )}


      <WalletList
        wallets={appData.wallets}
        onEdit={openModalForEdit}
        onDelete={handleDeleteWallet}
        onToggleArchive={handleToggleArchiveWallet}
        selectedWallets={selectedWalletIds}
        onToggleSelectWallet={handleToggleSelectWallet}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingWallet ? t('wallet_form_edit_title', {defaultValue: 'Edit Wallet'}) : t('wallet_form_add_title', {defaultValue: 'Add New Wallet'})}
      >
        <WalletForm
          onSubmit={handleFormSubmit}
          initialData={editingWallet}
          onClose={closeModal}
        />
      </Modal>
    </PageWrapper>
  );
};
