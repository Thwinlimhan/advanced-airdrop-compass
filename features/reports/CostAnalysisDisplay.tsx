import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { CostByCategoryItem, CostByNetworkItem, CostByWalletItem, ReportCostAnalysisItem, InteractionLogEntry, GasLogEntry, ManualTransaction, AirdropTask } from '../../types';
import { formatCurrency, parseMonetaryValue } from '../../utils/formatting';
import { BarChart2, Network, Layers, WalletCards as WalletIcon, Package, DollarSign, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { CostDetailModal } from './CostDetailModal';
import { useAirdropStore } from '../../stores/airdropStore';
import { useWalletStore } from '../../stores/walletStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { EnhancedBarChart as BarChart } from '../../components/charts/BarChart'; // New Import
import { ChartData } from 'chart.js';
import { DISTINCT_COLORS, CATEGORY_COLORS, NETWORK_COLORS } from '../../constants'; // Import color constants

interface CostAnalysisDisplayProps {
  totalOverallCosts: number;
  costsByCategory: CostByCategoryItem[];
  costsByNetwork: CostByNetworkItem[];
  costsByWallet: CostByWalletItem[];
  costsByAirdrop: ReportCostAnalysisItem[]; 
}

interface DetailedLogItem {
  id: string;
  date: string;
  description: string;
  cost: number;
  type: string; // 'Gas Log', 'Interaction', 'Airdrop Tx', 'Task Cost'
  relatedItem?: string; // e.g., Wallet Name, Airdrop Name
}

export const CostAnalysisDisplay: React.FC<CostAnalysisDisplayProps> = ({
  totalOverallCosts,
  costsByCategory,
  costsByNetwork,
  costsByWallet,
  costsByAirdrop,
}) => {
  const { airdrops } = useAirdropStore();
  const { wallets } = useWalletStore();
  const { settings } = useSettingsStore();
  const navigate = useNavigate(); // Initialize useNavigate
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalTitle, setDetailModalTitle] = useState('');
  const [detailModalItems, setDetailModalItems] = useState<DetailedLogItem[]>([]);
  const [detailModalItemType, setDetailModalItemType] = useState<'category'|'network'|'wallet'>('category');

  const getChartData = (items: any[], labelKey: string, valueKey: string, colorMapping?: Record<string,string>, topN: number = 7): ChartData<'bar'> => {
    const sortedItems = [...items].sort((a,b) => b[valueKey] - a[valueKey]).slice(0, topN);
    return {
        labels: sortedItems.map(item => item[labelKey]),
        datasets: [{
            label: `Cost by ${labelKey.charAt(0).toUpperCase() + labelKey.slice(1)}`,
            data: sortedItems.map(item => item[valueKey]),
            backgroundColor: sortedItems.map((item, idx) => colorMapping?.[item[labelKey]] || DISTINCT_COLORS[idx % DISTINCT_COLORS.length]),
        }]
    };
  };

  const categoryChartData = getChartData(costsByCategory, 'category', 'totalCost', CATEGORY_COLORS);
  const networkChartData = getChartData(costsByNetwork, 'network', 'totalCost', NETWORK_COLORS);
  const walletChartData = getChartData(costsByWallet, 'walletName', 'totalCost', undefined, 5); // Top 5 wallets for cleaner chart
  const airdropChartData = getChartData(costsByAirdrop.filter(a => a.totalCost > 0), 'airdropName', 'totalCost', undefined, 5);


  const openDetailModal = (item: CostByCategoryItem | CostByNetworkItem | CostByWalletItem, type: 'category' | 'network' | 'wallet') => {
    let title = '';
    let items: DetailedLogItem[] = [];
    const defaultCategory = 'Uncategorized';

    if (type === 'category') {
        const categoryItem = item as CostByCategoryItem;
        title = `Cost Details for Category: ${categoryItem.category}`;
        airdrops.forEach(ad => {
            ad.transactions.forEach(tx => {
                if ((tx.category || defaultCategory) === categoryItem.category) {
                    items.push({ id: tx.id, date: tx.date, description: tx.notes || `Tx: ${tx.hash.substring(0,10)}...`, cost: parseMonetaryValue(tx.cost), type: 'Airdrop Tx', relatedItem: ad.projectName });
                }
            });
        });
        wallets.forEach(w => {
            (w.interactionLogs || []).forEach(log => {
                if ((log.category || log.type || defaultCategory) === categoryItem.category) {
                     items.push({ id: log.id, date: log.date, description: log.description, cost: parseMonetaryValue(log.cost), type: 'Interaction Log', relatedItem: w.name });
                }
            });
            (w.gasLogs || []).forEach(log => {
                const logCat = log.description && log.description.toLowerCase().includes('gas') ? 'Gas Fee' : (log.description || 'Gas Fee');
                if (logCat === categoryItem.category) {
                     items.push({ id: log.id, date: log.date, description: log.description || 'Gas Fee', cost: parseMonetaryValue(log.amount), type: 'Gas Log', relatedItem: w.name });
                }
            });
        });
    } else if (type === 'network') {
        const networkItem = item as CostByNetworkItem;
        title = `Cost Details for Network: ${networkItem.network}`;
        wallets.forEach(w => {
            (w.gasLogs || []).filter(gl => (gl.network || w.blockchain || 'Unknown/Other') === networkItem.network).forEach(log => {
                items.push({id: log.id, date: log.date, description: log.description || 'Gas Fee', cost: parseMonetaryValue(log.amount), type: 'Gas Log', relatedItem: w.name});
            });
            (w.interactionLogs || []).filter(il => (il.network || w.blockchain || 'Unknown/Other') === networkItem.network).forEach(log => {
                items.push({id: log.id, date: log.date, description: log.description, cost: parseMonetaryValue(log.cost), type: 'Interaction Log', relatedItem: w.name});
            });
        });
        airdrops.forEach(ad => {
            if((ad.blockchain || 'Unknown/Other') === networkItem.network) {
                ad.transactions.forEach(tx => {
                     items.push({id: tx.id, date: tx.date, description: tx.notes || `Tx: ${tx.hash.substring(0,10)}...`, cost: parseMonetaryValue(tx.cost), type: 'Airdrop Tx', relatedItem: ad.projectName});
                });
                const processTasks = (tasks: AirdropTask[]) => {
                  tasks.forEach(task => {
                    if (task.cost && parseMonetaryValue(task.cost) > 0) {
                      items.push({id: task.id, date: task.completionDate || task.dueDate || new Date().toISOString(), description: task.description, cost: parseMonetaryValue(task.cost), type: 'Task Cost', relatedItem: ad.projectName });
                    }
                    if (task.subTasks) processTasks(task.subTasks);
                  });
                };
                processTasks(ad.tasks);
            }
        });
    } else if (type === 'wallet') {
        const walletItem = item as CostByWalletItem;
        title = `Cost Details for Wallet: ${walletItem.walletName}`;
        const wallet = wallets.find(w => w.id === walletItem.walletId);
        if(wallet) {
            (wallet.gasLogs || []).forEach(log => {
                items.push({id: log.id, date: log.date, description: log.description || 'Gas Fee', cost: parseMonetaryValue(log.amount), type: 'Gas Log'});
            });
            (wallet.interactionLogs || []).forEach(log => {
                items.push({id: log.id, date: log.date, description: log.description, cost: parseMonetaryValue(log.cost), type: 'Interaction Log'});
            });
             airdrops.forEach(ad => {
                ad.tasks.forEach(task => {
                    if(task.associatedWalletId === wallet.id && task.cost && parseMonetaryValue(task.cost) > 0 && !task.linkedGasLogId) { 
                        items.push({ id: task.id, date: task.completionDate || task.dueDate || new Date().toISOString(), description: task.description, cost: parseMonetaryValue(task.cost), type: 'Task Cost', relatedItem: ad.projectName });
                    }
                })
            })
        }
    }
    setDetailModalTitle(title);
    setDetailModalItems(items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setDetailModalItemType(type);
    setIsDetailModalOpen(true);
  };


  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3 flex items-center">
          <BarChart2 size={24} className="mr-2 text-primary" />
          Overall Cost Summary
        </h3>
        <p className="text-3xl font-bold text-red-600 dark:text-red-500">
          Total Logged Costs: {formatCurrency(totalOverallCosts)}
        </p>
        <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
          This sum includes all gas fees, transaction costs, and direct task costs logged across the application.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h4 className="text-lg font-semibold mb-3 flex items-center"><Layers size={18} className="mr-2 text-teal-500"/>Costs by Category</h4>
          {costsByCategory.length === 0 ? <p className="text-sm text-muted-light dark:text-muted-dark">No costs logged by category.</p> : (
            <div className="h-80">
              <BarChart 
                data={categoryChartData} 
                settings={settings}
                options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, onClick: (event, elements) => { if(elements.length > 0) {const index = elements[0].index; openDetailModal(costsByCategory[index], 'category');}} }}
                titleText="Top Categories by Cost"
              />
            </div>
          )}
           <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Click on chart bars or labels for drill-down.</p>
        </Card>
        <Card>
          <h4 className="text-lg font-semibold mb-3 flex items-center"><Network size={18} className="mr-2 text-cyan-500"/>Costs by Network</h4>
           {costsByNetwork.length === 0 ? <p className="text-sm text-muted-light dark:text-muted-dark">No costs logged by network.</p> : (
             <div className="h-80">
               <BarChart
                data={networkChartData}
                settings={settings}
                options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, onClick: (event, elements) => { if(elements.length > 0) {const index = elements[0].index; openDetailModal(costsByNetwork[index], 'network');}} }}
                titleText="Top Networks by Cost"
               />
             </div>
           )}
           <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Click on chart bars or labels for drill-down.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
            <h4 className="text-lg font-semibold mb-3 flex items-center"><WalletIcon size={18} className="mr-2 text-orange-500"/>Costs by Wallet</h4>
            {costsByWallet.length === 0 ? <p className="text-sm text-muted-light dark:text-muted-dark">No costs associated with specific wallets yet.</p> : (
                 <div className="h-80">
                    <BarChart
                        data={walletChartData}
                        settings={settings}
                        options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, onClick: (event, elements) => { if(elements.length > 0) {const index = elements[0].index; openDetailModal(costsByWallet[index], 'wallet');}} }}
                        titleText="Top 5 Wallets by Cost"
                    />
                 </div>
            )}
            <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Click on chart bars or labels for drill-down.</p>
        </Card>
         <Card>
            <h4 className="text-lg font-semibold mb-3 flex items-center"><Package size={18} className="mr-2 text-fuchsia-500"/>Costs by Airdrop Project</h4>
            {costsByAirdrop.filter(a => a.totalCost > 0).length === 0 ? <p className="text-sm text-muted-light dark:text-muted-dark">No costs associated with specific airdrops yet.</p> : (
                 <div className="h-80">
                    <BarChart
                        data={airdropChartData}
                        settings={settings}
                        options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, onClick: (event, elements) => { if(elements.length > 0) {const index = elements[0].index; const airdrop = costsByAirdrop.filter(a => a.totalCost > 0)[index]; if(airdrop) navigate(`/airdrops/${airdrop.airdropId}`); }}}}
                        titleText="Top 5 Airdrops by Cost"
                    />
                 </div>
            )}
             <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Click on chart bars or labels to navigate to the airdrop page.</p>
        </Card>
      </div>
      <CostDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={detailModalTitle}
        items={detailModalItems}
        itemTypeForNoItems={detailModalItemType}
      />
    </div>
  );
};
