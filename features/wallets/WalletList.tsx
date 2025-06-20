import React, { useState, useMemo } from 'react'; 
import { Wallet, BalanceSnapshot, NftLogEntry } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input'; 
import { Select } from '../../design-system/components/Select'; 
import { Edit3, Trash2, Copy, ExternalLink, Layers, Power, Brain, RefreshCw, Coins, Activity, Loader2, Image as ImageIconLucide, Archive, ArchiveRestore, DollarSign, Filter as FilterIcon, WalletCards } from 'lucide-react'; 
import { useToast } from '../../hooks/useToast';
import { BLOCKCHAIN_EXPLORERS } from '../../constants';
import { WalletHealthCheckModal } from './WalletHealthCheckModal'; 
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../utils/formatting'; 
import { useTranslation } from '../../hooks/useTranslation';

interface WalletListProps {
  wallets: Wallet[];
  onEdit: (wallet: Wallet) => void;
  onDelete: (walletId: string) => void;
  onToggleArchive: (walletId: string, isArchived: boolean) => void;
  selectedWallets: string[];
  onToggleSelectWallet: (walletId: string) => void;
}

const GROUP_COLORS = [
  'bg-pink-100 text-pink-700 dark:bg-pink-700 dark:text-pink-200',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-700 dark:text-cyan-200',
  'bg-lime-100 text-lime-700 dark:bg-lime-700 dark:text-lime-200',
  'bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-200',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-700 dark:text-fuchsia-200',
  'bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-200',
  'bg-rose-100 text-rose-700 dark:bg-rose-700 dark:text-rose-200',
];

const getGroupColor = (groupName: string): string => {
  if (!groupName) return 'bg-surface-secondary text-text-secondary';
  switch (groupName) {
    case 'Pink':
      return 'bg-accent-secondary text-accent';
    case 'Cyan':
      return 'bg-accent-secondary text-accent';
    case 'Lime':
      return 'bg-success text-success';
    case 'Orange':
      return 'bg-warning text-warning';
    case 'Fuchsia':
      return 'bg-error text-error';
    case 'Sky':
      return 'bg-info text-info';
    case 'Rose':
      return 'bg-error text-error';
    default:
      return 'bg-surface-secondary text-text-secondary';
  }
};


export const WalletList: React.FC<WalletListProps> = ({ wallets, onEdit, onDelete, onToggleArchive, selectedWallets, onToggleSelectWallet }) => {
  const { addToast } = useToast();
  const { fetchWalletBalances } = useAppContext(); 
  const { t } = useTranslation();
  const [filterGroup, setFilterGroup] = useState(''); 
  const [showArchived, setShowArchived] = useState(false);
  const [isHealthCheckModalOpen, setIsHealthCheckModalOpen] = useState(false);
  const [selectedWalletForHealthCheck, setSelectedWalletForHealthCheck] = useState<Wallet | undefined>(undefined);
  const [loadingBalanceWalletId, setLoadingBalanceWalletId] = useState<string | null>(null);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => addToast(t('wallet_address_copied', {defaultValue: 'Address copied to clipboard!'}), 'success'))
      .catch(err => {
        console.error('Failed to copy address: ', err);
        addToast(t('wallet_address_copy_failed', {defaultValue: 'Failed to copy address.'}), 'error');
      });
  };
  
  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>();
    wallets.forEach(w => w.group && groups.add(w.group));
    return Array.from(groups).sort();
  }, [wallets]);

  const groupedAndFilteredWallets = useMemo(() => {
    const filtered = wallets.filter(w => 
        (showArchived ? w.isArchived : !w.isArchived) &&
        (filterGroup ? w.group === filterGroup : true)
    );

    const groups: Record<string, Wallet[]> = {};
    filtered.forEach(wallet => {
        if(!groups[wallet.blockchain]) groups[wallet.blockchain] = [];
        groups[wallet.blockchain].push(wallet);
    });
    return Object.entries(groups)
        .sort(([chainA], [chainB]) => chainA.localeCompare(chainB))
        .map(([chain, walletList]) => ({
            blockchain: chain,
            wallets: walletList.sort((a,b) => a.name.localeCompare(b.name))
        }));
  }, [wallets, filterGroup, showArchived]);

  const openHealthCheckModal = (wallet: Wallet) => {
    setSelectedWalletForHealthCheck(wallet);
    setIsHealthCheckModalOpen(true);
  };

  const handleFetchWalletData = async (walletId: string) => {
    setLoadingBalanceWalletId(walletId);
    await fetchWalletBalances(walletId); 
    setLoadingBalanceWalletId(null);
  };

  if (wallets.length === 0 && !filterGroup) {
    return (
        <div className="text-center py-10">
            <WalletCards size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-text-primary mb-2">
                {t('wallet_list_empty_title', {defaultValue: 'No Wallets Yet'})}
            </p>
            <p className="text-text-secondary">
                {t('wallet_list_empty_message', {defaultValue: 'Add your first wallet to start tracking balances and interactions.'})}
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {uniqueGroups.length > 0 && (
              <Select id="filterWalletGroup" label={t('wallet_filter_group_label', {defaultValue:"Filter by Group:"})} value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} options={[{value: '', label: t('wallet_filter_all_groups', {defaultValue:'All Groups'})}, ...uniqueGroups.map(g => ({value: g, label: g}))]} className="max-w-xs h-10" />
          )}
          <Button onClick={() => setShowArchived(!showArchived)} variant="outline" leftIcon={showArchived ? <ArchiveRestore size={16}/> : <Archive size={16}/>} className="h-10" aria-pressed={showArchived}>
              {showArchived ? t('wallet_show_active_button', {defaultValue:"Show Active Wallets"}) : t('wallet_show_archived_button', {defaultValue:"Show Archived Wallets"})}
          </Button>
      </div>

      {groupedAndFilteredWallets.length === 0 && ( 
        <div className="text-center py-10">
            <FilterIcon size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-text-primary mb-2">
                {t('wallet_list_filter_no_match_title', {defaultValue: 'No Wallets Found'})}
            </p>
            <p className="text-text-secondary">
                {t('wallet_list_filter_no_match_message', {defaultValue: 'Try adjusting your filters or add more wallets.'})}
            </p>
        </div>
      )}

      {groupedAndFilteredWallets.map(({ blockchain, wallets: chainWallets }) => (
        <div key={blockchain} className="mb-6">
            <h3 className="text-xl font-semibold text-text-primary mb-3 border-b pb-1 dark:border-gray-600">{blockchain}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chainWallets.map((wallet) => {
                const explorer = BLOCKCHAIN_EXPLORERS[wallet.blockchain];
                const explorerUrl = explorer ? explorer.urlPattern.replace('{address}', wallet.address) : null;
                const groupColorClass = wallet.group ? getGroupColor(wallet.group) : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
                
                const latestBalancesMap = new Map<string, BalanceSnapshot>();
                (wallet.balanceSnapshots || []).forEach(snapshot => {
                    const existing = latestBalancesMap.get(snapshot.tokenSymbol.toUpperCase());
                    if (!existing || new Date(snapshot.date) > new Date(existing.date)) {
                        latestBalancesMap.set(snapshot.tokenSymbol.toUpperCase(), snapshot);
                    }
                });
                const displayBalances = Array.from(latestBalancesMap.values())
                    .sort((a,b) => { 
                      const nativeSymbols = ['ETH', 'SOL', 'MATIC', 'AVAX', 'BNB', 'OP', 'ARB'];
                      const isANative = nativeSymbols.includes(a.tokenSymbol.toUpperCase());
                      const isBNative = nativeSymbols.includes(b.tokenSymbol.toUpperCase());
                      if (isANative && !isBNative) return -1;
                      if (!isANative && isBNative) return 1;
                      return b.amount - a.amount; 
                    });

                const nftPortfolioSummary = (wallet.nftPortfolio || []).slice(0,2).map(nft => nft.name).join(', ');
                const totalNfts = (wallet.nftPortfolio || []).length;
                
                const conceptualTotalValue = displayBalances.reduce((sum, snap) => {
                    const nativeSymbols = ['ETH', 'SOL', 'MATIC', 'AVAX', 'BNB', 'OP', 'ARB']; 
                    if (nativeSymbols.includes(snap.tokenSymbol.toUpperCase())) { 
                      return sum + snap.amount; 
                    }
                    return sum;
                }, 0);

                return (
                <Card key={wallet.id} className={`hover:shadow-lg transition-shadow ${wallet.isArchived ? 'opacity-60 bg-gray-100 dark:bg-gray-800' : 'bg-card-light dark:bg-card-dark'}`} aria-label={`Wallet card for ${wallet.name}`}>
                    <div className="flex items-start space-x-2 mb-3">
                         <input
                            type="checkbox"
                            className="mt-1.5 h-5 w-5 text-primary-light dark:text-primary-dark border-gray-300 dark:border-gray-600 rounded focus:ring-primary-light dark:focus:ring-primary-dark flex-shrink-0"
                            checked={selectedWallets.includes(wallet.id)}
                            onChange={() => onToggleSelectWallet(wallet.id)}
                            aria-label={`Select wallet ${wallet.name}`}
                          />
                        <div className="flex-grow min-w-0">
                            <h3 className="text-lg font-semibold text-text-primary">{wallet.name}</h3>
                            <p className="text-sm text-primary-light dark:text-primary-dark break-all truncate" title={wallet.address}>{wallet.address}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">{wallet.blockchain}</span>
                            {wallet.group && ( <span className={`text-xs px-2 py-0.5 rounded-full flex items-center font-medium ${groupColorClass}`}> <Layers size={12} className="mr-1" /> {wallet.group} </span> )}
                            {wallet.autoBalanceFetchEnabled && ( <span className="text-xs px-2 py-0.5 bg-teal-100 dark:bg-teal-700 text-teal-700 dark:text-teal-200 rounded-full flex items-center font-medium" title={t('wallet_autofetch_enabled_title', {defaultValue:"Automated Data Fetching Enabled"})}> <Power size={12} className="mr-1"/> Auto-Fetch </span> )}
                            </div>
                             {conceptualTotalValue > 0 && (
                                <p className="text-xs text-muted-light dark:text-muted-dark mt-1 flex items-center"><DollarSign size={12} className="mr-0.5"/> Est. Native Value: {conceptualTotalValue.toLocaleString(undefined, {maximumFractionDigits:4})} (conceptual)</p>
                            )}
                        </div>
                    </div>
                    {displayBalances.length > 0 && (
                    <div className="mt-2 text-sm text-text-primary space-y-0.5 max-h-24 overflow-y-auto pr-1 border-t pt-2 dark:border-gray-600">
                        {displayBalances.map(snap => (
                            <div key={snap.id} className="flex items-center text-xs">
                                <Coins size={12} className="mr-1.5 text-yellow-500"/>
                                <strong>{snap.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} {snap.tokenSymbol}</strong> 
                                <span className="text-xs text-muted-light dark:text-muted-dark ml-1.5">({snap.notes ? snap.notes + " " : ""}as of {new Date(snap.date).toLocaleDateString()})</span>
                            </div>
                        ))}
                    </div>
                    )}
                    {displayBalances.length === 0 && wallet.autoBalanceFetchEnabled && ( <p className="text-xs text-muted-light dark:text-muted-dark mt-2">{t('wallet_no_snapshots_autofetch', {defaultValue:'No balance snapshots. Try refreshing data.'})}</p> )}
                    {totalNfts > 0 && ( <div className="mt-1 text-xs text-muted-light dark:text-muted-dark flex items-center"> <ImageIconLucide size={12} className="mr-1 text-purple-500"/> NFTs: {totalNfts} ({nftPortfolioSummary}{totalNfts > 2 ? ', ...' : ''}) </div> )}

                    <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t dark:border-gray-600 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleFetchWalletData(wallet.id)} title={t('wallet_refresh_data_button', {defaultValue:"Refresh Data (Balances & NFTs)"})} disabled={loadingBalanceWalletId === wallet.id || wallet.isArchived} className="p-1.5" aria-label={`Refresh data for wallet ${wallet.name}`}> {loadingBalanceWalletId === wallet.id ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14} />} </Button>
                        <Button variant="ghost" size="sm" onClick={() => openHealthCheckModal(wallet)} title={t('wallet_ai_health_check_button', {defaultValue:"AI Wallet Health Check"})} className="p-1.5" disabled={wallet.isArchived} aria-label={`AI health check for wallet ${wallet.name}`}> <Brain size={14} /> </Button>
                        {explorerUrl && ( <a href={explorerUrl} target="_blank" rel="noopener noreferrer" title={`View on ${explorer.name}`} className="p-1.5"> <Button variant="ghost" size="sm" className="p-0" aria-label={`View wallet ${wallet.name} on explorer`}><ExternalLink size={14} /></Button> </a> )}
                        <Button variant="ghost" size="sm" onClick={() => handleCopyAddress(wallet.address)} title={t('wallet_copy_address_button', {defaultValue:"Copy Address"})} className="p-1.5" aria-label={`Copy address for wallet ${wallet.name}`}><Copy size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => onToggleArchive(wallet.id, !!wallet.isArchived)} title={wallet.isArchived ? t('wallet_restore_button', {defaultValue:"Restore Wallet"}) : t('wallet_archive_button', {defaultValue:"Archive Wallet"})} className="p-1.5" aria-label={wallet.isArchived ? `Restore wallet ${wallet.name}` : `Archive wallet ${wallet.name}`}> {wallet.isArchived ? <ArchiveRestore size={14}/> : <Archive size={14} />} </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(wallet)} title={t('wallet_edit_button', {defaultValue:"Edit Wallet"})} className="p-1.5" disabled={wallet.isArchived} aria-label={`Edit wallet ${wallet.name}`}><Edit3 size={14} /></Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(wallet.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5" title={t('wallet_delete_button', {defaultValue:"Delete Wallet"})} aria-label={`Delete wallet ${wallet.name}`}><Trash2 size={14} /></Button>
                    </div>
                </Card>
                );
            })}
            </div>
        </div>
      ))}
      {selectedWalletForHealthCheck && (
        <WalletHealthCheckModal
            isOpen={isHealthCheckModalOpen}
            onClose={() => {setIsHealthCheckModalOpen(false); setSelectedWalletForHealthCheck(undefined);}}
            wallet={selectedWalletForHealthCheck}
        />
      )}
    </div>
  );
};