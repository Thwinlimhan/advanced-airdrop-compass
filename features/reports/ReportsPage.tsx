import React, { useMemo, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { useAppContext } from '../../contexts/AppContext';
import { Airdrop, AirdropTask, ReportTimeAnalysisItem, ReportCostAnalysisItem, Wallet, CostByCategoryItem, CostByNetworkItem, CostByWalletItem } from '../../types';
import { BarChart3, Clock, DollarSign, Briefcase, PieChart, Layers, Network, WalletCards as WalletIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { parseMonetaryValue, formatMinutesToHoursAndMinutes, formatCurrency } from '../../utils/formatting';
import { Button } from '../../design-system/components/Button';
import { EnhancedBarChart as BarChart } from '../../components/charts/BarChart';
import { ChartData } from 'chart.js';
import { DISTINCT_COLORS, CATEGORY_COLORS, NETWORK_COLORS } from '../../constants';
import { CostDetailModal } from './CostDetailModal';

const calculateAirdropTimes = (airdrops: Airdrop[]): ReportTimeAnalysisItem[] => {
  return airdrops.map(airdrop => {
    let totalMinutes = (airdrop.timeSpentHours || 0) * 60;
    const sumTaskTime = (tasks: AirdropTask[]): number => {
      return tasks.reduce((sum, task) => {
        let currentTaskTime = sum + (task.timeSpentMinutes || 0);
        if (task.subTasks && task.subTasks.length > 0) {
          currentTaskTime += sumTaskTime(task.subTasks);
        }
        return currentTaskTime;
      }, 0);
    };
    totalMinutes += sumTaskTime(airdrop.tasks);
    return {
      airdropId: airdrop.id,
      airdropName: airdrop.projectName,
      totalTimeMinutes: totalMinutes,
    };
  }).filter(item => item.totalTimeMinutes > 0)
    .sort((a,b) => b.totalTimeMinutes - a.totalTimeMinutes);
};

const parseAirdropPotential = (potential: string): number => {
    if (!potential) return 0;
    const potentialLower = potential.toLowerCase();
    
    const monetaryMatch = potentialLower.match(/(\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+\s*usd)/);
    if (monetaryMatch && monetaryMatch[0]) {
        return parseMonetaryValue(monetaryMatch[0]);
    }

    if (potentialLower.includes('very high') || potentialLower.includes('veryhigh')) return 1000;
    if (potentialLower.includes('high')) return 500;
    if (potentialLower.includes('medium')) return 250;
    if (potentialLower.includes('low')) return 50;
    
    return 0;
};


const calculateAirdropCostsAndPotential = (airdrops: Airdrop[], wallets: Wallet[]): ReportCostAnalysisItem[] => {
  return airdrops.map(airdrop => {
    let gasCost = 0;
    let transactionCost = airdrop.transactions.reduce((sum, tx) => sum + parseMonetaryValue(tx.cost), 0);
    let taskCost = 0;

    const sumTaskSpecificCosts = (tasks: AirdropTask[]): void => {
      tasks.forEach(task => {
        taskCost += parseMonetaryValue(task.cost);
        if (task.linkedGasLogId && task.associatedWalletId) {
          const wallet = wallets.find(w => w.id === task.associatedWalletId);
          const gasLog = wallet?.gasLogs?.find(gl => gl.id === task.linkedGasLogId);
          if (gasLog) {
            gasCost += parseMonetaryValue(gasLog.amount); 
          }
        }
        if (task.subTasks && task.subTasks.length > 0) {
          sumTaskSpecificCosts(task.subTasks);
        }
      });
    };
    sumTaskSpecificCosts(airdrop.tasks);
    
    const totalCost = gasCost + transactionCost + taskCost;
    const potentialRewardValue = parseAirdropPotential(airdrop.potential);
    const netPotential = potentialRewardValue - totalCost;


    return {
      airdropId: airdrop.id,
      airdropName: airdrop.projectName,
      totalCost,
      gasCost,
      transactionCost,
      taskCost,
      potentialRewardValue,
      netPotential,
    };
  }).filter(item => item.totalCost > 0 || item.potentialRewardValue > 0)
    .sort((a,b) => b.netPotential - a.netPotential);
};

type ReportTab = 'cost_roi' | 'time' | 'cost_analyzer';


export const ReportsPage: React.FC = () => {
  const { appData } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReportTab>('cost_roi');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalTitle, setDetailModalTitle] = useState('');
  const [detailModalItems, setDetailModalItems] = useState<any[]>([]); // Using 'any' for simplicity, ideally type this
  const [detailModalItemType, setDetailModalItemType] = useState<'category'|'network'|'wallet'>('category');


  const timeAnalysisData = useMemo(() => calculateAirdropTimes(appData.airdrops), [appData.airdrops]);
  const costAndPotentialData = useMemo(() => calculateAirdropCostsAndPotential(appData.airdrops, appData.wallets), [appData.airdrops, appData.wallets]);

  const overallCosts = useMemo(() => {
    let total = 0;
    appData.wallets.forEach(wallet => {
        (wallet.gasLogs || []).forEach(log => total += parseMonetaryValue(log.amount)); 
        (wallet.interactionLogs || []).forEach(log => total += parseMonetaryValue(log.cost));
    });
    appData.airdrops.forEach(airdrop => {
        airdrop.transactions.forEach(tx => total += parseMonetaryValue(tx.cost));
        const sumTaskCosts = (tasks: AirdropTask[]): void => {
            tasks.forEach(task => {
                total += parseMonetaryValue(task.cost);
                if (task.subTasks) sumTaskCosts(task.subTasks);
            });
        };
        sumTaskCosts(airdrop.tasks);
    });
    return total;
  }, [appData]);

  const costsByCategory = useMemo((): CostByCategoryItem[] => {
    const categories: Record<string, { totalCost: number, count: number }> = {};
    const defaultCategory = 'Uncategorized';

    appData.airdrops.forEach(airdrop => {
        airdrop.transactions.forEach(tx => {
            const category = tx.category || defaultCategory;
            if (!categories[category]) categories[category] = { totalCost: 0, count: 0 };
            categories[category].totalCost += parseMonetaryValue(tx.cost);
            categories[category].count++;
        });
    });
    appData.wallets.forEach(wallet => {
        (wallet.interactionLogs || []).forEach(log => {
            const category = log.category || log.type || defaultCategory; 
             if (!categories[category]) categories[category] = { totalCost: 0, count: 0 };
            categories[category].totalCost += parseMonetaryValue(log.cost);
            categories[category].count++;
        });
        (wallet.gasLogs || []).forEach(log => {
            const category = log.description && log.description.toLowerCase().includes('gas') ? 'Gas Fee' : (log.description || 'Gas Fee');
            if (!categories[category]) categories[category] = { totalCost: 0, count: 0 };
            categories[category].totalCost += parseMonetaryValue(log.amount);
            categories[category].count++;
        });
    });
     return Object.entries(categories).map(([category, data]) => ({category, ...data})).sort((a,b) => b.totalCost - a.totalCost);
  }, [appData]);


  const costsByNetwork = useMemo((): CostByNetworkItem[] => {
    const networks: Record<string, { totalCost: number, count: number }> = {};
    const defaultNetwork = 'Unknown/Other';

    appData.wallets.forEach(wallet => {
        (wallet.gasLogs || []).forEach(log => {
            const network = log.network || wallet.blockchain || defaultNetwork;
            if (!networks[network]) networks[network] = { totalCost: 0, count: 0 };
            networks[network].totalCost += parseMonetaryValue(log.amount);
            networks[network].count++;
        });
        (wallet.interactionLogs || []).forEach(log => {
            const network = log.network || wallet.blockchain || defaultNetwork;
             if (!networks[network]) networks[network] = { totalCost: 0, count: 0 };
            networks[network].totalCost += parseMonetaryValue(log.cost);
            networks[network].count++;
        });
    });
     appData.airdrops.forEach(airdrop => {
        airdrop.transactions.forEach(tx => {
            const network = airdrop.blockchain || defaultNetwork; 
            if (!networks[network]) networks[network] = { totalCost: 0, count: 0 };
            networks[network].totalCost += parseMonetaryValue(tx.cost);
            networks[network].count++;
        });
         const sumTaskCosts = (tasks: AirdropTask[]): void => {
            tasks.forEach(task => {
                const cost = parseMonetaryValue(task.cost);
                if (cost > 0) {
                    const network = airdrop.blockchain || defaultNetwork;
                    if(!networks[network]) networks[network] = {totalCost: 0, count: 0};
                    networks[network].totalCost += cost;
                    networks[network].count++;
                }
                if (task.subTasks) sumTaskCosts(task.subTasks);
            });
        };
        sumTaskCosts(airdrop.tasks);
    });
    return Object.entries(networks).map(([network, data]) => ({network, ...data})).sort((a,b) => b.totalCost - a.totalCost);
  }, [appData]);

  const costsByWallet = useMemo((): CostByWalletItem[] => {
    const walletsMap: Record<string, CostByWalletItem> = {};
    appData.wallets.forEach(wallet => {
        if(!walletsMap[wallet.id]) walletsMap[wallet.id] = { walletId: wallet.id, walletName: wallet.name, totalCost: 0, count: 0};
        
        (wallet.gasLogs || []).forEach(log => {
            walletsMap[wallet.id].totalCost += parseMonetaryValue(log.amount);
            walletsMap[wallet.id].count++;
        });
        (wallet.interactionLogs || []).forEach(log => {
            walletsMap[wallet.id].totalCost += parseMonetaryValue(log.cost);
            walletsMap[wallet.id].count++;
        });
    });
    appData.airdrops.forEach(ad => {
        const processTasks = (tasks: AirdropTask[]) => {
            tasks.forEach(task => {
                if (task.associatedWalletId) {
                    if(!walletsMap[task.associatedWalletId]) {
                        const w = appData.wallets.find(wal => wal.id === task.associatedWalletId);
                        if (w) walletsMap[task.associatedWalletId] = {walletId: w.id, walletName: w.name, totalCost: 0, count: 0};
                    }
                    if(walletsMap[task.associatedWalletId]){
                        // Only count task.cost if NOT linked to a gas log to avoid double counting
                        if (task.cost && !task.linkedGasLogId) { 
                             walletsMap[task.associatedWalletId].totalCost += parseMonetaryValue(task.cost);
                             walletsMap[task.associatedWalletId].count++;
                        }
                    }
                }
                if (task.subTasks) processTasks(task.subTasks);
            });
        };
        processTasks(ad.tasks);
    });
    return Object.values(walletsMap).filter(w => w.totalCost > 0 || w.count > 0).sort((a,b) => b.totalCost - a.totalCost);
  }, [appData]);


  const timeAnalysisChartData: ChartData<'bar'> = {
    labels: timeAnalysisData.slice(0, 10).map(item => item.airdropName),
    datasets: [{
      label: 'Time Spent (Minutes)',
      data: timeAnalysisData.slice(0, 10).map(item => item.totalTimeMinutes),
      backgroundColor: DISTINCT_COLORS.slice(0,10).map(color => `${color}B3`), // Add alpha
      borderColor: DISTINCT_COLORS.slice(0,10),
      borderWidth: 1,
    }]
  };

  const costRoiChartData: ChartData<'bar'> = {
    labels: costAndPotentialData.slice(0, 10).map(item => item.airdropName),
    datasets: [
      {
        label: 'Total Cost',
        data: costAndPotentialData.slice(0, 10).map(item => item.totalCost),
        backgroundColor: 'rgba(239, 68, 68, 0.7)', 
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Est. Potential Reward',
        data: costAndPotentialData.slice(0, 10).map(item => item.potentialRewardValue),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Net Potential',
        data: costAndPotentialData.slice(0, 10).map(item => item.netPotential),
        backgroundColor: 'rgba(16, 185, 129, 0.7)', 
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      }
    ]
  };
  
  const getChartData = (items: any[], labelKey: string, valueKey: string, colorMapping?: Record<string,string>, topN: number = 7): ChartData<'bar'> => {
    const sortedItems = [...items].sort((a,b) => b[valueKey] - a[valueKey]).slice(0, topN);
    return {
        labels: sortedItems.map(item => item[labelKey]),
        datasets: [{
            label: `Cost by ${labelKey.charAt(0).toUpperCase() + labelKey.slice(1)}`,
            data: sortedItems.map(item => item[valueKey]),
            backgroundColor: sortedItems.map((item, idx) => (colorMapping?.[item[labelKey]] || DISTINCT_COLORS[idx % DISTINCT_COLORS.length]) + 'B3'),
            borderColor: sortedItems.map((item, idx) => colorMapping?.[item[labelKey]] || DISTINCT_COLORS[idx % DISTINCT_COLORS.length]),
            borderWidth: 1,
        }]
    };
  };

  const categoryChartData = getChartData(costsByCategory, 'category', 'totalCost', CATEGORY_COLORS);
  const networkChartData = getChartData(costsByNetwork, 'network', 'totalCost', NETWORK_COLORS);
  const walletChartData = getChartData(costsByWallet, 'walletName', 'totalCost', undefined, 5);

  const openCostDetailModal = (item: CostByCategoryItem | CostByNetworkItem | CostByWalletItem, type: 'category' | 'network' | 'wallet') => {
    let title = '';
    let itemsToDisplay: any[] = []; // Define more specific type later if needed
    const defaultCategory = 'Uncategorized';

    if (type === 'category') {
        const categoryItem = item as CostByCategoryItem;
        title = `Cost Details for Category: ${categoryItem.category}`;
        // Logic to populate itemsToDisplay based on categoryItem.category
        appData.airdrops.forEach(ad => {
            ad.transactions.forEach(tx => {
                if ((tx.category || defaultCategory) === categoryItem.category) {
                    itemsToDisplay.push({ id: tx.id, date: tx.date, description: tx.notes || `Tx: ${tx.hash.substring(0,10)}...`, cost: parseMonetaryValue(tx.cost), type: 'Airdrop Tx', relatedItem: ad.projectName });
                }
            });
        });
        appData.wallets.forEach(w => {
            (w.interactionLogs || []).forEach(log => {
                if ((log.category || log.type || defaultCategory) === categoryItem.category) {
                     itemsToDisplay.push({ id: log.id, date: log.date, description: log.description, cost: parseMonetaryValue(log.cost), type: 'Interaction Log', relatedItem: w.name });
                }
            });
            (w.gasLogs || []).forEach(log => {
                const logCat = log.description && log.description.toLowerCase().includes('gas') ? 'Gas Fee' : (log.description || 'Gas Fee');
                if (logCat === categoryItem.category) {
                     itemsToDisplay.push({ id: log.id, date: log.date, description: log.description || 'Gas Fee', cost: parseMonetaryValue(log.amount), type: 'Gas Log', relatedItem: w.name });
                }
            });
        });


    } else if (type === 'network') {
        const networkItem = item as CostByNetworkItem;
        title = `Cost Details for Network: ${networkItem.network}`;
        // Logic to populate itemsToDisplay based on networkItem.network
         appData.wallets.forEach(w => {
            (w.gasLogs || []).filter(gl => (gl.network || w.blockchain || 'Unknown/Other') === networkItem.network).forEach(log => {
                itemsToDisplay.push({id: log.id, date: log.date, description: log.description || 'Gas Fee', cost: parseMonetaryValue(log.amount), type: 'Gas Log', relatedItem: w.name});
            });
            (w.interactionLogs || []).filter(il => (il.network || w.blockchain || 'Unknown/Other') === networkItem.network).forEach(log => {
                itemsToDisplay.push({id: log.id, date: log.date, description: log.description, cost: parseMonetaryValue(log.cost), type: 'Interaction Log', relatedItem: w.name});
            });
        });
        appData.airdrops.forEach(ad => {
            if((ad.blockchain || 'Unknown/Other') === networkItem.network) {
                ad.transactions.forEach(tx => {
                     itemsToDisplay.push({id: tx.id, date: tx.date, description: tx.notes || `Tx: ${tx.hash.substring(0,10)}...`, cost: parseMonetaryValue(tx.cost), type: 'Airdrop Tx', relatedItem: ad.projectName});
                });
                const processTasks = (tasks: AirdropTask[]) => {
                  tasks.forEach(task => {
                    if (task.cost && parseMonetaryValue(task.cost) > 0) {
                      itemsToDisplay.push({id: task.id, date: task.completionDate || task.dueDate || new Date().toISOString(), description: task.description, cost: parseMonetaryValue(task.cost), type: 'Task Cost', relatedItem: ad.projectName });
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
        // Logic to populate itemsToDisplay based on walletItem.walletId
        const wallet = appData.wallets.find(w => w.id === walletItem.walletId);
        if(wallet) {
            (wallet.gasLogs || []).forEach(log => {
                itemsToDisplay.push({id: log.id, date: log.date, description: log.description || 'Gas Fee', cost: parseMonetaryValue(log.amount), type: 'Gas Log'});
            });
            (wallet.interactionLogs || []).forEach(log => {
                itemsToDisplay.push({id: log.id, date: log.date, description: log.description, cost: parseMonetaryValue(log.cost), type: 'Interaction Log'});
            });
             appData.airdrops.forEach(ad => {
                ad.tasks.forEach(task => {
                    // Only include task.cost if NOT linked to a gasLog to avoid double count with wallet's gas logs
                    if(task.associatedWalletId === wallet.id && task.cost && parseMonetaryValue(task.cost) > 0 && !task.linkedGasLogId) { 
                        itemsToDisplay.push({ id: task.id, date: task.completionDate || task.dueDate || new Date().toISOString(), description: task.description, cost: parseMonetaryValue(task.cost), type: 'Task Cost', relatedItem: ad.projectName });
                    }
                })
            })
        }
    }
    setDetailModalTitle(title);
    setDetailModalItems(itemsToDisplay.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setDetailModalItemType(type);
    setIsDetailModalOpen(true);
  };

  const TabButton: React.FC<{tabId: ReportTab, label: string, icon: React.ElementType}> = ({tabId, label, icon: Icon}) => (
    <Button
        variant={activeTab === tabId ? 'primary' : 'outline'}
        onClick={() => setActiveTab(tabId)}
        leftIcon={<Icon size={16}/>}
        className="flex-1 sm:flex-none"
    >
        {label}
    </Button>
  );

  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <Briefcase size={28} className="mr-3 text-primary-light dark:text-primary-dark" />
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">Reports & Analysis</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-600 pb-2">
        <TabButton tabId="cost_roi" label="Cost & Potential ROI" icon={DollarSign} />
        <TabButton tabId="time" label="Time Analysis" icon={Clock} />
        <TabButton tabId="cost_analyzer" label="Aggregated Cost Analyzer" icon={PieChart} />
      </div>

      {activeTab === 'cost_roi' && (
        <Card>
          <h3 className="text-lg font-semibold mb-3">Airdrop Cost vs. Potential ROI Analysis</h3>
          {costAndPotentialData.length === 0 ? (
            <p className="text-muted-light dark:text-muted-dark">No cost or potential data logged for airdrops yet.</p>
          ) : (
            <>
              <div className="h-96 mb-6">
                <h4 className="text-lg font-semibold mb-2">Top 10 Airdrops by Net Potential</h4>
                <BarChart 
                     data={costRoiChartData}
                     options={{ maintainAspectRatio: false, indexAxis: 'x', plugins: { legend: { display: true}}, onClick: (_, elements) => { if(elements.length > 0) { const index = elements[0].index; const airdrop = costAndPotentialData[index]; if(airdrop) navigate(`/airdrops/${airdrop.airdropId}`); }}}}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['Project', 'Total Cost', 'Potential Reward', 'Net Potential'].map(header => (
                        <th key={header} scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-750 divide-y divide-gray-200 dark:divide-gray-700">
                    {costAndPotentialData.map(item => (
                      <tr key={item.airdropId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-light dark:text-primary-dark"><Link to={`/airdrops/${item.airdropId}`}>{item.airdropName}</Link></td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-500">{formatCurrency(item.totalCost)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-500">{formatCurrency(item.potentialRewardValue)}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${item.netPotential >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(item.netPotential)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}

      {activeTab === 'time' && (
        <Card>
          <h3 className="text-lg font-semibold mb-3">Time Spent Analysis per Airdrop</h3>
          {timeAnalysisData.length === 0 ? (
            <p className="text-muted-light dark:text-muted-dark">No time logged for airdrops yet.</p>
          ) : (
            <>
              <div className="h-96 mb-6">
                <h4 className="text-lg font-semibold mb-2">Top 10 Airdrops by Time Spent</h4>
                <BarChart 
                     data={timeAnalysisChartData}
                     options={{ maintainAspectRatio: false, indexAxis: 'x', plugins: { legend: { display: false }}, scales: {y: {title: {display: true, text: 'Minutes'}}}, onClick: (_, elements) => { if(elements.length > 0) { const index = elements[0].index; const airdrop = timeAnalysisData[index]; if(airdrop) navigate(`/airdrops/${airdrop.airdropId}`); }}}}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {['Project', 'Total Time Spent'].map(header => (
                        <th key={header} scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-muted-light dark:text-muted-dark uppercase tracking-wider">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-750 divide-y divide-gray-200 dark:divide-gray-700">
                    {timeAnalysisData.map(item => (
                      <tr key={item.airdropId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary-light dark:text-primary-dark"><Link to={`/airdrops/${item.airdropId}`}>{item.airdropName}</Link></td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-text-light dark:text-text-dark">{formatMinutesToHoursAndMinutes(item.totalTimeMinutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      )}

      {activeTab === 'cost_analyzer' && (
        <div className="space-y-6">
            <Card>
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3 flex items-center">
                <BarChart3 size={24} className="mr-2 text-primary-light dark:text-primary-dark" />
                Overall Cost Summary
                </h3>
                <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                Total Logged Costs: {formatCurrency(overallCosts)}
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
                        <h4 className="text-md font-semibold mb-2">Top Categories by Cost</h4>
                        <BarChart 
                            data={categoryChartData}
                            options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, onClick: (_, elements) => { if(elements.length > 0) {const index = elements[0].index; openCostDetailModal(costsByCategory[index], 'category');}} }}
                        />
                        </div>
                    )}
                    <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Click on chart bars for drill-down.</p>
                </Card>
                <Card>
                    <h4 className="text-lg font-semibold mb-3 flex items-center"><Network size={18} className="mr-2 text-cyan-500"/>Costs by Network</h4>
                    {costsByNetwork.length === 0 ? <p className="text-sm text-muted-light dark:text-muted-dark">No costs logged by network.</p> : (
                        <div className="h-80">
                        <h4 className="text-md font-semibold mb-2">Top Networks by Cost</h4>
                        <BarChart
                            data={networkChartData}
                            options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, onClick: (_, elements) => { if(elements.length > 0) {const index = elements[0].index; openCostDetailModal(costsByNetwork[index], 'network');}} }}
                        />
                        </div>
                    )}
                    <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Click on chart bars for drill-down.</p>
                </Card>
            </div>
             <Card>
                <h4 className="text-lg font-semibold mb-3 flex items-center"><WalletIcon size={18} className="mr-2 text-orange-500"/>Costs by Wallet</h4>
                {costsByWallet.length === 0 ? <p className="text-sm text-muted-light dark:text-muted-dark">No costs associated with specific wallets yet.</p> : (
                    <div className="h-80">
                        <h4 className="text-md font-semibold mb-2">Top 5 Wallets by Cost</h4>
                        <BarChart
                            data={walletChartData}
                            options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, onClick: (_, elements) => { if(elements.length > 0) {const index = elements[0].index; openCostDetailModal(costsByWallet[index], 'wallet');}} }}
                        />
                    </div>
                )}
                <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Click on chart bars for drill-down.</p>
            </Card>
        </div>
      )}
      <CostDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={detailModalTitle}
        items={detailModalItems}
        itemTypeForNoItems={detailModalItemType}
      />
    </PageWrapper>
  );
};

