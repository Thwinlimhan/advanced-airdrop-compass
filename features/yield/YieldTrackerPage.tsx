import React, { useState, useMemo } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { YieldForm } from './YieldForm';
import { useAppContext } from '../../contexts/AppContext';
import { YieldPosition, Wallet } from '../../types';
import { PlusCircle, Edit3, Trash2, DatabaseIcon, DollarSign, ExternalLink } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatting';

export const YieldTrackerPage: React.FC = () => {
  const { appData, addYieldPosition, updateYieldPosition, deleteYieldPosition } = useAppContext();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<YieldPosition | undefined>(undefined);

  const openModalForCreate = () => {
    setEditingPosition(undefined);
    setIsModalOpen(true);
  };

  const openModalForEdit = (position: YieldPosition) => {
    setEditingPosition(position);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPosition(undefined);
  };

  const handleFormSubmit = async (positionData: Omit<YieldPosition, 'id'> | YieldPosition) => {
    if ('id' in positionData) {
      await updateYieldPosition(positionData as YieldPosition);
      addToast('Yield position updated.', 'success');
    } else {
      await addYieldPosition(positionData as Omit<YieldPosition, 'id'>);
      addToast('Yield position added.', 'success');
    }
    closeModal();
  };

  const handleDeletePosition = async (positionId: string, platformName: string) => {
    if (window.confirm(`Are you sure you want to delete the position at "${platformName}"?`)) {
      await deleteYieldPosition(positionId);
      addToast(`Position at "${platformName}" deleted.`, 'success');
    }
  };

  const totalValueStaked = useMemo(() => {
    return (appData.yieldPositions || []).reduce((sum, pos) => sum + (pos.currentValue || 0), 0);
  }, [appData.yieldPositions]);
  
  const getWalletName = (walletId: string): string => {
      const wallet = appData.wallets.find(w => w.id === walletId);
      return wallet ? wallet.name : "Unknown Wallet";
  };

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <DatabaseIcon size={28} className="mr-3 text-primary-light" />
          <h2 className="text-2xl font-semibold text-text-light">Yield Farming & Staking Tracker</h2>
        </div>
        <Button onClick={openModalForCreate} leftIcon={<PlusCircle size={18} />}>
          Add New Position
        </Button>
      </div>
      <p className="text-sm text-muted-light mb-6">
        Manually track your assets deposited in yield farms, liquidity pools, and staking contracts.
      </p>

      <Card className="mb-6">
        <h4 className="text-lg font-semibold mb-2">Summary (Based on Manual Data)</h4>
        <p>Total Positions Tracked: {(appData.yieldPositions || []).length}</p>
        <p>Total Estimated Value of Positions: {formatCurrency(totalValueStaked)}</p>
        <p className="text-xs text-muted-light mt-1">Note: Total value based on manually entered "Current Value". Update positions for accuracy.</p>
      </Card>

      {(appData.yieldPositions || []).length === 0 ? (
        <p className="text-center text-muted-light py-8">No yield positions tracked yet.</p>
      ) : (
        <div className="space-y-4">
          {(appData.yieldPositions || []).map(pos => (
            <Card key={pos.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                <div className="min-w-0">
                  <h4 className="text-lg font-semibold text-indigo-600">{pos.platformName}</h4>
                  <p className="text-sm text-text-light">Asset: {pos.assetSymbol}</p>
                  <p className="text-sm text-muted-light">Amount Staked: {pos.amountStaked.toLocaleString()}</p>
                  {pos.currentValue !== undefined && <p className="text-sm font-medium text-green-600">Current Value: {formatCurrency(pos.currentValue)}</p>}
                  <p className="text-xs text-muted-light">Wallet: {getWalletName(pos.walletId)}</p>
                  <p className="text-xs text-muted-light">Entry Date: {new Date(pos.entryDate).toLocaleDateString()}</p>
                  {pos.currentApy !== undefined && <p className="text-xs text-green-600">Current APY (Manual): {pos.currentApy}%</p>}
                  {pos.poolUrl && <a href={pos.poolUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center mt-1"><ExternalLink size={12} className="mr-1"/>View Pool</a>}
                </div>
                <div className="flex space-x-2 mt-2 sm:mt-0 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openModalForEdit(pos)} title="Edit Position"><Edit3 size={16} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePosition(pos.id, pos.platformName)} className="text-red-500 hover:text-red-700" title="Delete Position"><Trash2 size={16} /></Button>
                </div>
              </div>
              {pos.notes && <p className="text-sm mt-2 pt-2 border-t border-gray-200 italic text-gray-600">{pos.notes}</p>}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPosition ? 'Edit Yield Position' : 'Add New Yield Position'} size="lg">
        <YieldForm onSubmit={handleFormSubmit} initialData={editingPosition} onClose={closeModal} wallets={appData.wallets} />
      </Modal>
    </PageWrapper>
  );
};