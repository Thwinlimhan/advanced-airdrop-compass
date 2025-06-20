import React, { useState, useEffect, FormEvent } from 'react';
import { Wallet, GasLogEntry, InteractionLogEntry, NftLogEntry, BalanceSnapshot } from '../../types';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { Textarea } from '../../design-system/components/Textarea';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { BLOCKCHAIN_OPTIONS, DEFAULT_TRANSACTION_CATEGORIES } from '../../constants';
import { PlusCircle, Trash2, Coins, Zap, Activity as InteractionIcon, ImageUp as ImageIcon } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface WalletFormProps {
  onSubmit: (wallet: Omit<Wallet, 'id' | 'balanceSnapshots' | 'gasLogs' | 'interactionLogs' | 'nftPortfolio' | 'isArchived' | 'transactionHistory'> | Wallet) => Promise<void>;
  initialData?: Wallet;
  onClose: () => void;
}

export const WalletForm: React.FC<WalletFormProps> = ({ onSubmit, initialData, onClose }) => {
  const { addGasLogToWallet, deleteGasLogFromWallet, addInteractionLogToWallet, deleteInteractionLogFromWallet, addNftToWalletPortfolio, updateNftInWalletPortfolio, deleteNftFromWalletPortfolio, appData } = useAppContext();
  const { addToast } = useToast();
  const { t } = useTranslation(); // Added

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [blockchain, setBlockchain] = useState(BLOCKCHAIN_OPTIONS[0]);
  const [group, setGroup] = useState('');
  const [autoBalanceFetchEnabled, setAutoBalanceFetchEnabled] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; address?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state
  
  const [balanceSnapshots, setBalanceSnapshots] = useState<BalanceSnapshot[]>([]);
  const [newSnapshot, setNewSnapshot] = useState({ tokenSymbol: '', amount: '', date: new Date().toISOString().split('T')[0], notes: ''});

  const [gasLogs, setGasLogs] = useState<GasLogEntry[]>([]);
  const [newGasLog, setNewGasLog] = useState({ date: new Date().toISOString().split('T')[0], amount: '', currency: 'ETH', description: '', network: BLOCKCHAIN_OPTIONS[0] });

  const [interactionLogs, setInteractionLogs] = useState<InteractionLogEntry[]>([]);
  const [newInteractionLog, setNewInteractionLog] = useState({ date: new Date().toISOString().split('T')[0], type: '', description: '', network: BLOCKCHAIN_OPTIONS[0], cost: '', relatedTxHash: '', labels: [] as string[], category: '' });

  const [nftPortfolio, setNftPortfolio] = useState<NftLogEntry[]>([]);
  const [newNftEntry, setNewNftEntry] = useState({ name: '', collectionName: '', tokenId: '', contractAddress: '', imageUrl: '', purchaseDate: '', purchasePrice: '', estimatedFloorPrice: '', notes: '', purchaseLotId: '' });
  
  const availableTransactionCategories = appData.settings.customTransactionCategories || DEFAULT_TRANSACTION_CATEGORIES;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAddress(initialData.address);
      setBlockchain(initialData.blockchain);
      setGroup(initialData.group || '');
      setAutoBalanceFetchEnabled(initialData.autoBalanceFetchEnabled || false);
      setBalanceSnapshots(initialData.balanceSnapshots || []);
      setGasLogs(initialData.gasLogs || []);
      setInteractionLogs(initialData.interactionLogs || []);
      setNftPortfolio(initialData.nftPortfolio || []);
      setNewGasLog(prev => ({ ...prev, network: initialData.blockchain || BLOCKCHAIN_OPTIONS[0] }));
      setNewInteractionLog(prev => ({ ...prev, network: initialData.blockchain || BLOCKCHAIN_OPTIONS[0] }));
    } else {
      setName(''); setAddress(''); setBlockchain(BLOCKCHAIN_OPTIONS[0]); setGroup('');
      setAutoBalanceFetchEnabled(false); setBalanceSnapshots([]); setGasLogs([]);
      setInteractionLogs([]); setNftPortfolio([]);
      setNewGasLog({ date: new Date().toISOString().split('T')[0], amount: '', currency: 'ETH', description: '', network: BLOCKCHAIN_OPTIONS[0] });
      setNewInteractionLog({ date: new Date().toISOString().split('T')[0], type: '', description: '', network: BLOCKCHAIN_OPTIONS[0], cost: '', relatedTxHash: '', labels: [], category: '' });
      setNewNftEntry({ name: '', collectionName: '', tokenId: '', contractAddress: '', imageUrl: '', purchaseDate: '', purchasePrice: '', estimatedFloorPrice: '', notes: '', purchaseLotId: '' });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { name?: string; address?: string } = {};
    if (!name.trim()) newErrors.name = 'Wallet name/label is required.';
    if (!address.trim()) newErrors.address = 'Wallet address is required.';
    if (address.trim() && !/^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(address.trim())) {
        newErrors.address = 'Invalid wallet address format.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const walletData: Omit<Wallet, 'id'> = {
        name, address, blockchain, group, autoBalanceFetchEnabled,
        balanceSnapshots, gasLogs, interactionLogs, nftPortfolio,
        isArchived: initialData?.isArchived || false,
        transactionHistory: initialData?.transactionHistory || [],
      };
      if (initialData?.id) {
        await onSubmit({ ...walletData, id: initialData.id });
      } else {
        await onSubmit(walletData);
      }
      onClose(); // onSubmit in context now handles toasts
    } catch (error) {
        addToast(`Error submitting wallet: ${(error as Error).message}`, "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAddSnapshot = () => {
    if (newSnapshot.tokenSymbol.trim() && newSnapshot.amount.trim() && !isNaN(parseFloat(newSnapshot.amount))) {
        setBalanceSnapshots(prev => [...prev, {
            ...newSnapshot, id: crypto.randomUUID(),
            tokenSymbol: newSnapshot.tokenSymbol.trim().toUpperCase(), amount: parseFloat(newSnapshot.amount),
            notes: newSnapshot.notes?.trim() || undefined
        }]);
        setNewSnapshot({ tokenSymbol: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    } else { addToast("Please fill in Token Symbol and a valid Amount for snapshot.", 'warning'); }
  };
  const handleRemoveSnapshot = (id: string) => setBalanceSnapshots(prev => prev.filter(snap => snap.id !== id));

  const handleAddGasLog = async () => {
    if (newGasLog.amount.trim() && !isNaN(parseFloat(newGasLog.amount)) && newGasLog.currency.trim()) {
        const logData = { ...newGasLog, amount: parseFloat(newGasLog.amount), currency: newGasLog.currency.trim().toUpperCase(), description: newGasLog.description?.trim() || undefined };
        if (initialData?.id) await addGasLogToWallet(initialData.id, logData);
        else setGasLogs(prev => [...prev, { ...logData, id: crypto.randomUUID() }]);
        setNewGasLog({ date: new Date().toISOString().split('T')[0], amount: '', currency: 'ETH', description: '', network: blockchain });
    } else { addToast("Please fill in Gas Amount and Currency.", 'warning'); }
  };
  const handleRemoveGasLog = async (id: string) => {
    if (initialData?.id) await deleteGasLogFromWallet(initialData.id, id);
    else setGasLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleAddInteractionLog = async () => {
    if (newInteractionLog.type.trim() && newInteractionLog.description.trim() && newInteractionLog.date) {
        const logData = { ...newInteractionLog, type: newInteractionLog.type.trim(), description: newInteractionLog.description.trim(), cost: newInteractionLog.cost?.trim() || undefined, relatedTxHash: newInteractionLog.relatedTxHash?.trim() || undefined, labels: newInteractionLog.labels.filter(l => l.trim()), category: newInteractionLog.category.trim() || undefined };
        if (initialData?.id) await addInteractionLogToWallet(initialData.id, logData);
        else setInteractionLogs(prev => [...prev, {...logData, id: crypto.randomUUID()}]);
        setNewInteractionLog({ date: new Date().toISOString().split('T')[0], type: '', description: '', network: blockchain, cost: '', relatedTxHash: '', labels: [], category: '' });
    } else { addToast("Please fill in Interaction Type, Description, and Date.", 'warning'); }
  };
  const handleRemoveInteractionLog = async (id: string) => {
    if (initialData?.id) await deleteInteractionLogFromWallet(initialData.id, id);
    else setInteractionLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleAddNftEntry = async () => {
    if (newNftEntry.name.trim() && newNftEntry.collectionName.trim() && newNftEntry.contractAddress.trim()) {
        const nftData = { ...newNftEntry, name: newNftEntry.name.trim(), collectionName: newNftEntry.collectionName.trim(), contractAddress: newNftEntry.contractAddress.trim(), purchasePrice: newNftEntry.purchasePrice?.trim() || undefined, estimatedFloorPrice: newNftEntry.estimatedFloorPrice?.trim() || undefined, notes: newNftEntry.notes?.trim() || undefined, purchaseLotId: newNftEntry.purchaseLotId?.trim() || undefined };
        if (initialData?.id) await addNftToWalletPortfolio(initialData.id, nftData);
        else setNftPortfolio(prev => [...prev, {...nftData, id: crypto.randomUUID()}]);
        setNewNftEntry({ name: '', collectionName: '', tokenId: '', contractAddress: '', imageUrl: '', purchaseDate: '', purchasePrice: '', estimatedFloorPrice: '', notes: '', purchaseLotId: '' });
    } else { addToast("Please fill in NFT Name, Collection Name, and Contract Address.", 'warning'); }
  };
  const handleUpdateNftEntry = async (nft: NftLogEntry) => { 
    if(initialData?.id) await updateNftInWalletPortfolio(initialData.id, nft);
    else setNftPortfolio(prev => prev.map(n => n.id === nft.id ? nft : n));
  };
  const handleRemoveNftEntry = async (id: string) => {
    if (initialData?.id) await deleteNftFromWalletPortfolio(initialData.id, id);
    else setNftPortfolio(prev => prev.filter(nft => nft.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
      <Input id="walletName" label="Wallet Name/Label" value={name} onChange={(e) => setName(e.target.value)} error={!!errors.name} required disabled={isSubmitting} />
      <Input id="walletAddress" label="Wallet Address" value={address} onChange={(e) => setAddress(e.target.value)} error={!!errors.address} required placeholder="0x... or Sol..." disabled={isSubmitting} />
      <Select id="walletBlockchain" label="Blockchain" value={blockchain} onChange={(e) => {setBlockchain(e.target.value); setNewGasLog(prev => ({...prev, network: e.target.value})); setNewInteractionLog(prev => ({...prev, network: e.target.value}));}} options={BLOCKCHAIN_OPTIONS.map(b => ({ value: b, label: b }))} disabled={isSubmitting} />
      <Input id="walletGroup" label="Group (Optional)" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="e.g., Main, Farming, Testnet" disabled={isSubmitting} />
      <ToggleSwitch id="autoBalanceFetch" label="Enable Auto Data Fetching (Conceptual)" checked={!!autoBalanceFetchEnabled} onChange={setAutoBalanceFetchEnabled} disabled={!!isSubmitting}/>

      <fieldset className="border border-border p-3 rounded-md" disabled={isSubmitting}>
        <legend className="text-sm font-medium px-1 text-text-secondary flex items-center"><Coins size={14} className="mr-1.5"/>Balance Snapshots (Manual)</legend>
        <div className="space-y-2 max-h-40 overflow-y-auto mb-2 pr-1">
          {balanceSnapshots.map(s => (
            <div key={s.id} className="text-xs p-1.5 bg-surface-secondary rounded flex justify-between items-center">
              <span>{s.date}: {s.amount} {s.tokenSymbol} {s.notes ? `(${s.notes})` : ''}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveSnapshot(s.id)} className="p-0.5 text-red-500" disabled={isSubmitting}><Trash2 size={12}/></Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <Input id="newSnapshotDate" type="date" label="Date" value={newSnapshot.date} onChange={e=>setNewSnapshot({...newSnapshot, date: e.target.value})} disabled={isSubmitting}/>
          <Input id="newSnapshotToken" label="Token" value={newSnapshot.tokenSymbol} onChange={e=>setNewSnapshot({...newSnapshot, tokenSymbol: e.target.value})} placeholder="ETH" disabled={isSubmitting}/>
          <Input id="newSnapshotAmount" type="number" label="Amount" value={newSnapshot.amount} onChange={e=>setNewSnapshot({...newSnapshot, amount: e.target.value})} placeholder="10.5" disabled={isSubmitting}/>
        </div>
        <Input id="newSnapshotNotes" label="Notes (Optional)" value={newSnapshot.notes} onChange={e=>setNewSnapshot({...newSnapshot, notes: e.target.value})} placeholder="Staked on..." disabled={isSubmitting}/>
        <Button type="button" size="sm" onClick={handleAddSnapshot} className="mt-2" leftIcon={<PlusCircle size={14}/>} disabled={isSubmitting}>Add Snapshot</Button>
      </fieldset>

      <fieldset className="border border-border p-3 rounded-md" disabled={isSubmitting}>
        <legend className="text-sm font-medium px-1 text-text-secondary flex items-center"><Zap size={14} className="mr-1.5"/>Gas Logs</legend>
        <div className="space-y-2 max-h-40 overflow-y-auto mb-2 pr-1">
          {gasLogs.map(log => (
            <div key={log.id} className="text-xs p-1.5 bg-surface-secondary rounded flex justify-between items-center">
              <span>{log.date}: {log.amount} {log.currency} ({log.description || 'Gas'}) on {log.network}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveGasLog(log.id)} className="p-0.5 text-red-500" disabled={isSubmitting}><Trash2 size={12}/></Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <Input id="newGasLogDate" type="date" label="Date" value={newGasLog.date} onChange={e=>setNewGasLog({...newGasLog, date:e.target.value})} disabled={isSubmitting}/>
          <Input id="newGasLogAmount" type="number" label="Amount" value={newGasLog.amount} onChange={e=>setNewGasLog({...newGasLog, amount:e.target.value})} placeholder="0.01" disabled={isSubmitting}/>
          <Input id="newGasLogCurrency" label="Currency" value={newGasLog.currency} onChange={e=>setNewGasLog({...newGasLog, currency:e.target.value})} placeholder="ETH" disabled={isSubmitting}/>
        </div>
        <Input id="newGasLogDesc" label="Description (Optional)" value={newGasLog.description} onChange={e=>setNewGasLog({...newGasLog, description:e.target.value})} placeholder="Bridge gas" disabled={isSubmitting}/>
        <Select id="newGasLogNetwork" label="Network" value={newGasLog.network || blockchain} onChange={e=>setNewGasLog({...newGasLog, network:e.target.value})} options={BLOCKCHAIN_OPTIONS.map(b=>({value:b, label:b}))} disabled={isSubmitting}/>
        <Button type="button" size="sm" onClick={handleAddGasLog} className="mt-2" leftIcon={<PlusCircle size={14}/>} disabled={isSubmitting}>Add Gas Log</Button>
      </fieldset>

      <fieldset className="border border-border p-3 rounded-md" disabled={isSubmitting}>
        <legend className="text-sm font-medium px-1 text-text-secondary flex items-center"><InteractionIcon size={14} className="mr-1.5"/>Interaction Logs</legend>
         <div className="space-y-2 max-h-40 overflow-y-auto mb-2 pr-1">
          {interactionLogs.map(log => (
            <div key={log.id} className="text-xs p-1.5 bg-surface-secondary rounded flex justify-between items-center">
              <span className="truncate" title={`${log.date}: ${log.type} - ${log.description}`}>
                {log.date}: {log.type} - {log.description.substring(0,30)}{log.description.length > 30 ? '...' : ''} ({log.network}, Cost: {log.cost || 'N/A'})
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveInteractionLog(log.id)} className="p-0.5 text-red-500" disabled={isSubmitting}><Trash2 size={12}/></Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input id="newInteractionDate" type="date" label="Date" value={newInteractionLog.date} onChange={e=>setNewInteractionLog({...newInteractionLog, date:e.target.value})} disabled={isSubmitting}/>
            <Input id="newInteractionType" label="Type" value={newInteractionLog.type} onChange={e=>setNewInteractionLog({...newInteractionLog, type:e.target.value})} placeholder="Swap, Bridge, Mint" disabled={isSubmitting}/>
        </div>
        <Textarea id="newInteractionDesc" label="Description" value={newInteractionLog.description} onChange={e=>setNewInteractionLog({...newInteractionLog, description:e.target.value})} placeholder="e.g., Swapped ETH for USDC on Uniswap" rows={2} disabled={isSubmitting}/>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            <Input id="newInteractionNetwork" label="Network" value={newInteractionLog.network || blockchain} onChange={e=>setNewInteractionLog({...newInteractionLog, network:e.target.value})} disabled={isSubmitting}/>
            <Input id="newInteractionCost" label="Cost (Opt.)" value={newInteractionLog.cost} onChange={e=>setNewInteractionLog({...newInteractionLog, cost:e.target.value})} placeholder="e.g., 0.005 ETH" disabled={isSubmitting}/>
            <Input id="newInteractionTxHash" label="Tx Hash (Opt.)" value={newInteractionLog.relatedTxHash} onChange={e=>setNewInteractionLog({...newInteractionLog, relatedTxHash:e.target.value})} placeholder="0x..." disabled={isSubmitting}/>
        </div>
        <Select id="newInteractionCategory" label="Category (Optional)" value={newInteractionLog.category} onChange={e=>setNewInteractionLog({...newInteractionLog, category: e.target.value})} options={[{value:'', label: 'Select...'}, ...availableTransactionCategories.map(c => ({value: c, label:c}))]} disabled={isSubmitting}/>
        <Button type="button" size="sm" onClick={handleAddInteractionLog} className="mt-2" leftIcon={<PlusCircle size={14}/>} disabled={isSubmitting}>Add Interaction Log</Button>
      </fieldset>

      <fieldset className="border border-border p-3 rounded-md" disabled={isSubmitting}>
        <legend className="text-sm font-medium px-1 text-text-secondary flex items-center"><ImageIcon size={14} className="mr-1.5"/>NFT Portfolio</legend>
        <div className="space-y-2 max-h-40 overflow-y-auto mb-2 pr-1">
            {nftPortfolio.map(nft => (
                <div key={nft.id} className="text-xs p-1.5 bg-surface-secondary rounded flex justify-between items-center">
                    <span className="truncate" title={`${nft.name} (${nft.collectionName})`}>{nft.name} ({nft.collectionName}) - Floor: {nft.estimatedFloorPrice || 'N/A'}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveNftEntry(nft.id)} className="p-0.5 text-red-500" disabled={isSubmitting}><Trash2 size={12}/></Button>
                </div>
            ))}
        </div>
        <Input id="newNftName" label="NFT Name" value={newNftEntry.name} onChange={e=>setNewNftEntry({...newNftEntry, name:e.target.value})} disabled={isSubmitting}/>
        <Input id="newNftCollection" label="Collection" value={newNftEntry.collectionName} onChange={e=>setNewNftEntry({...newNftEntry, collectionName:e.target.value})} disabled={isSubmitting}/>
        <Input id="newNftContract" label="Contract Address" value={newNftEntry.contractAddress} onChange={e=>setNewNftEntry({...newNftEntry, contractAddress:e.target.value})} disabled={isSubmitting}/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          <Input id="newNftPurchasePrice" label="Purchase Price (Opt.)" value={newNftEntry.purchasePrice} onChange={e=>setNewNftEntry({...newNftEntry, purchasePrice:e.target.value})} disabled={isSubmitting}/>
          <Input id="newNftPurchaseDate" type="date" label="Purchase Date (Opt.)" value={newNftEntry.purchaseDate} onChange={e=>setNewNftEntry({...newNftEntry, purchaseDate:e.target.value})} disabled={isSubmitting}/>
        </div>
        <Input id="newNftFloorPrice" label="Est. Floor Price (Opt.)" value={newNftEntry.estimatedFloorPrice} onChange={e=>setNewNftEntry({...newNftEntry, estimatedFloorPrice:e.target.value})} disabled={isSubmitting}/>
        <Button type="button" size="sm" onClick={handleAddNftEntry} className="mt-2" leftIcon={<PlusCircle size={14}/>} disabled={isSubmitting}>Add NFT</Button>
      </fieldset>


      <div className="flex justify-end space-x-3 pt-2 sticky bottom-0 bg-surface py-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{t('common_cancel')}</Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>{initialData ? t('common_save_changes_button', {defaultValue: 'Save Changes'}) : t('add_new_wallet_button')}</Button>
      </div>
    </form>
  );
};
