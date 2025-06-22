import React, { useState } from 'react';
import { ManualTransaction, Wallet } from '../../types';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { TagInput } from '../../components/ui/TagInput';
import { PlusCircle, Trash2, ExternalLink } from 'lucide-react';
import { useAirdropStore } from '../../stores/airdropStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { BLOCKCHAIN_EXPLORERS, DEFAULT_TRANSACTION_CATEGORIES } from '../../constants';

interface TransactionLoggerProps {
  airdropId: string;
  transactions: ManualTransaction[];
  onAddTransaction: (airdropId: string, transactionData: Omit<ManualTransaction, 'id' | 'airdropsId'>) => void;
  onDeleteTransaction: (airdropId: string, transactionId: string) => void;
  isArchived: boolean;
}

export const TransactionLogger: React.FC<TransactionLoggerProps> = ({
  airdropId,
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  isArchived,
}) => {
  const { airdrops } = useAirdropStore();
  const { settings } = useSettingsStore();
  const airdrop = airdrops.find(a => a.id === airdropId);
  
  const [newTxHash, setNewTxHash] = useState('');
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTxCost, setNewTxCost] = useState('');
  const [newTxNotes, setNewTxNotes] = useState('');
  const [newTxLabels, setNewTxLabels] = useState<string[]>([]);
  const [newTxCategory, setNewTxCategory] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const availableCategories = settings.customTransactionCategories || DEFAULT_TRANSACTION_CATEGORIES;

  const handleAddTransaction = () => {
    if (isArchived) return;
    if (newTxHash.trim() && newTxDate) {
      onAddTransaction(airdropId, {
        hash: newTxHash.trim(),
        date: newTxDate,
        cost: newTxCost.trim(),
        notes: newTxNotes.trim(),
        labels: newTxLabels.filter(l => l.trim()),
        category: newTxCategory.trim() || undefined,
      });
      setNewTxHash('');
      setNewTxDate(new Date().toISOString().split('T')[0]);
      setNewTxCost('');
      setNewTxNotes('');
      setNewTxLabels([]);
      setNewTxCategory('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-text-light dark:text-text-dark">Manual Transaction Log</h4>
        {!isArchived && (
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" variant={showAddForm ? "outline" : "primary"} leftIcon={!showAddForm && <PlusCircle size={16}/>}>
            {showAddForm ? 'Cancel' : 'Log Transaction'}
            </Button>
        )}
      </div>

      {showAddForm && !isArchived && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md shadow-sm space-y-3">
          <Input id={`new-tx-hash-${airdropId}`} label="Transaction Hash" placeholder="0x..." value={newTxHash} onChange={(e) => setNewTxHash(e.target.value)} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input id={`new-tx-date-${airdropId}`} label="Date" type="date" value={newTxDate} onChange={(e) => setNewTxDate(e.target.value)} required />
            <Input id={`new-tx-cost-${airdropId}`} label="Cost (e.g., 0.01 ETH)" placeholder="Gas fee / Amount" value={newTxCost} onChange={(e) => setNewTxCost(e.target.value)} />
          </div>
          <Select id={`new-tx-category-${airdropId}`} label="Category (Optional)" value={newTxCategory} onChange={(e) => setNewTxCategory(e.target.value)} options={[{value:'', label:'Select Category'}, ...availableCategories.map(c => ({value:c, label:c}))]} />
          <TagInput id={`new-tx-labels-${airdropId}`} label="Labels (Optional)" tags={newTxLabels} onTagsChange={setNewTxLabels} placeholder="e.g., Mainnet, Gas, Initial" />
          <Textarea id={`new-tx-notes-${airdropId}`} label="Notes (Optional)" placeholder="e.g., Bridge to Arbitrum" value={newTxNotes} onChange={(e) => setNewTxNotes(e.target.value)} rows={2} />
          <Button onClick={handleAddTransaction} size="sm">Add Log Entry</Button>
        </div>
      )}

      {transactions.length === 0 ? (
        <p className="text-muted-light dark:text-muted-dark">No transactions logged for this airdrop yet.</p>
      ) : (
        <ul className="space-y-3">
          {transactions.slice().reverse().map((tx) => {
            const explorer = airdrop ? BLOCKCHAIN_EXPLORERS[airdrop.blockchain] : null;
            const explorerTxUrl = explorer?.txUrlPattern ? explorer.txUrlPattern.replace('{txHash}', tx.hash) : null;

            return (
              <li key={tx.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <div className="flex items-center">
                        <p className="font-mono text-sm text-indigo-600 dark:text-indigo-400 break-all truncate" title={tx.hash}>{tx.hash}</p>
                        {explorerTxUrl && ( <a href={explorerTxUrl} target="_blank" rel="noopener noreferrer" title={`View on ${explorer?.name || 'explorer'}`} className="ml-2 flex-shrink-0"><ExternalLink size={14} className="text-gray-400 hover:text-primary-light" /></a> )}
                    </div>
                    <p className="text-xs text-muted-light dark:text-muted-dark"> {new Date(tx.date).toLocaleDateString()} - Cost: {tx.cost || 'N/A'} </p>
                    {tx.category && <span className="text-xs mt-1 mr-1 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-700 text-purple-700 dark:text-purple-200 rounded-full inline-block">{tx.category}</span>}
                    {(tx.labels || []).map(label => <span key={label} className="text-xs mt-1 mr-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full inline-block">{label}</span>)}
                    {tx.notes && <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{tx.notes}</p>}
                  </div>
                  {!isArchived && ( <Button variant="ghost" size="sm" onClick={() => onDeleteTransaction(airdropId, tx.id)} className="text-red-500 hover:text-red-700 flex-shrink-0" title="Delete Log Entry" disabled={isArchived}><Trash2 size={16} /></Button> )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
