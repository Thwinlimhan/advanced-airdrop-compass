import React, { useMemo, useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { useAppContext } from '../../contexts/AppContext';
import { Airdrop, PortfolioOverviewData, PortfolioAirdropPerformance, NftLogEntry } from '../../types';
import { DollarSign, TrendingUp, TrendingDown, Award, AlertOctagon, BarChart3, HelpCircle, ChevronsRight, PieChart, RefreshCw, Image as ImageIcon, Eye, ChevronDown, ChevronRight, Brain, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { parseMonetaryValue, formatCurrency } from '../../utils/formatting';
import { AIRDROP_POTENTIAL_OPTIONS, DISTINCT_COLORS } from '../../constants';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { EnhancedLineChart as LineChart } from '../../components/charts/LineChart';
import { EnhancedDoughnutChart as DoughnutChart } from '../../components/charts/DoughnutChart';
import { ChartData } from 'chart.js';


const NftCollectionGroup: React.FC<{collectionName: string; nfts: (NftLogEntry & {walletName: string, walletId: string})[]; t: (key: string, options?: any) => string;}> = ({ collectionName, nfts, t }) => {
  const [isOpen, setIsOpen] = useState(true);
  const collectionTotalFloorValue = useMemo(() => {
    return nfts.reduce((sum, nft) => sum + parseMonetaryValue(nft.estimatedFloorPrice), 0);
  }, [nfts]);

  return (
    <div className="mb-4">
      <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
        <span className="font-semibold text-text-light dark:text-text-dark">{collectionName} ({nfts.length})</span>
        <div className="flex items-center">
            {collectionTotalFloorValue > 0 && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400 mr-2">
                    {t('portfolio_nft_collection_value_label', {defaultValue: 'Est. Collection Value'})}: {formatCurrency(collectionTotalFloorValue)}
                </span>
            )}
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </Button>
      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 pl-2">
          {nfts.map(nft => (
            <Card key={`${nft.walletId}-${nft.id}`} className="bg-card-light dark:bg-card-dark shadow-sm">
              {nft.imageUrl ? (
                <img src={nft.imageUrl} alt={nft.name} className="w-full h-32 object-cover rounded-t-md mb-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 flex items-center justify-center rounded-t-md mb-2 text-gray-400">
                  <ImageIcon size={28} />
                </div>
              )}
              <h5 className="font-medium text-sm text-primary-light dark:text-primary-dark truncate" title={nft.name}>{nft.name}</h5>
              {nft.tokenId && <p className="text-xs text-muted-light dark:text-muted-dark">ID: {nft.tokenId}</p>}
              <p className="text-xs text-muted-light dark:text-muted-dark">Wallet: <Link to={`/wallets`} className="hover:underline">{nft.walletName}</Link></p> {/* Updated link to /wallets for general view */}
              {nft.purchasePrice && <p className="text-xs text-muted-light dark:text-muted-dark">Bought: {nft.purchasePrice} ({nft.purchaseDate ? new Date(nft.purchaseDate).toLocaleDateString() : 'N/A'})</p>}
              {nft.estimatedFloorPrice && <p className="text-xs text-green-600 dark:text-green-400">Est. Floor: {nft.estimatedFloorPrice}</p>}
              {nft.notes && <p className="text-xs italic mt-1 text-gray-500 dark:text-gray-400 line-clamp-2" title={nft.notes}>{nft.notes}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


export const PortfolioPage: React.FC = () => {
  const { appData, fetchTokenPricesAndUpdateLogs } = useAppContext();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'nfts' | 'aggregated_pl'>('overview');

  const handleRefreshPrices = async () => {
    setIsPriceLoading(true);
    addToast("Simulating fetching latest token prices...", "info", 2000);
    await fetchTokenPricesAndUpdateLogs(appData.airdrops);
    setIsPriceLoading(false);
    addToast("Token prices updated (simulated). Portfolio data re-calculated.", "success");
  };

  const portfolioData = useMemo((): PortfolioOverviewData => {
    let totalCosts = 0;
    let totalSales = 0;
    let totalUnrealizedValue = 0;
    const airdropPerformance: PortfolioAirdropPerformance[] = [];
    const potentialCounts: Record<string, number> = {};
    AIRDROP_POTENTIAL_OPTIONS.forEach(opt => potentialCounts[opt] = 0);
    const tokenValues: Record<string, {totalValue: number, totalQuantity: number}> = {};

    const activeAirdrops = appData.airdrops.filter(a => !a.isArchived);

    activeAirdrops.forEach((airdrop: Airdrop) => {
      let airdropTransactionCosts = 0;
      airdrop.transactions.forEach(tx => { airdropTransactionCosts += parseMonetaryValue(tx.cost); });

      let airdropAcquisitionValue = 0;
      let airdropSaleValue = 0;
      airdrop.claimedTokens.forEach(log => {
        const acqCostPerToken = parseMonetaryValue(log.acquisitionCostPerToken);
        airdropAcquisitionValue += (acqCostPerToken * log.quantity);

        if (log.salePricePerToken !== undefined && log.salePricePerToken !== null) {
          airdropSaleValue += (parseMonetaryValue(log.salePricePerToken) * log.quantity);
        } else if (log.currentMarketPricePerToken !== undefined && log.currentMarketPricePerToken !== null) {
            const currentVal = parseMonetaryValue(log.currentMarketPricePerToken) * log.quantity;
            totalUnrealizedValue += currentVal;
             if (!tokenValues[log.symbol.toUpperCase()]) tokenValues[log.symbol.toUpperCase()] = {totalValue: 0, totalQuantity: 0};
            tokenValues[log.symbol.toUpperCase()].totalValue += currentVal;
            tokenValues[log.symbol.toUpperCase()].totalQuantity += log.quantity;
        }
      });

      totalCosts += airdropTransactionCosts + airdropAcquisitionValue;
      totalSales += airdropSaleValue;
      const netPLForAirdrop = airdropSaleValue - airdropAcquisitionValue - airdropTransactionCosts;
      airdropPerformance.push({ id: airdrop.id, name: airdrop.projectName, netPL: netPLForAirdrop });

      if (airdrop.potential && potentialCounts[airdrop.potential] !== undefined) potentialCounts[airdrop.potential]++;
      else potentialCounts['Unknown'] = (potentialCounts['Unknown'] || 0) + 1;
    });

    const netProfitLoss = totalSales - totalCosts;
    airdropPerformance.sort((a, b) => b.netPL - a.netPL);
    const potentialDistribution = Object.entries(potentialCounts).map(([name, count]) => ({ name, count })).filter(item => item.count > 0).sort((a,b) => AIRDROP_POTENTIAL_OPTIONS.indexOf(a.name) - AIRDROP_POTENTIAL_OPTIONS.indexOf(b.name));

    const mockHistory: {date: string, value: number}[] = [];
    const currentPortfolioValue = totalSales + totalUnrealizedValue - totalCosts;
    let runningTotal = currentPortfolioValue * (0.3 + Math.random() * 0.4);

    for(let i=6; i>=0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i*30);
        let fluctuationFactor = (Math.random() - 0.45) * 0.3;
        if (i < 2) {
            runningTotal = runningTotal * (0.6 + Math.random() * 0.1) + currentPortfolioValue * (0.3 + Math.random() * 0.1);
        } else {
            runningTotal += runningTotal * fluctuationFactor;
        }
        mockHistory.push({ date: date.toISOString().split('T')[0], value: Math.max(0, parseFloat(runningTotal.toFixed(2))) });
    }
    if (mockHistory.length > 0 && mockHistory[mockHistory.length-1].value !== parseFloat(currentPortfolioValue.toFixed(2))) {
         mockHistory[mockHistory.length-1].value = parseFloat(currentPortfolioValue.toFixed(2));
    }

    const tokenAllocation = Object.entries(tokenValues)
        .map(([symbol, data]) => ({ symbol, value: data.totalValue, count: data.totalQuantity}))
        .sort((a,b) => b.value - a.value);


    return {
      totalCosts, totalSales, netProfitLoss, totalUnrealizedValue,
      topProfitableAirdrops: airdropPerformance.filter(a => a.netPL > 0).slice(0, 5),
      topLossAirdrops: airdropPerformance.filter(a => a.netPL < 0).sort((a,b) => a.netPL - b.netPL).slice(0, 5),
      potentialDistribution,
      historicalValue: mockHistory,
      tokenAllocation: tokenAllocation,
    };
  }, [appData.airdrops]);

  const allNftsByCollection = useMemo(() => {
    const collections: Record<string, (NftLogEntry & {walletName: string, walletId: string})[]> = {};
    appData.wallets.forEach(wallet => {
        (wallet.nftPortfolio || []).forEach(nft => {
            const collectionKey = nft.collectionName || 'Uncategorized';
            if (!collections[collectionKey]) {
                collections[collectionKey] = [];
            }
            collections[collectionKey].push({...nft, walletName: wallet.name, walletId: wallet.id });
        });
    });
    for (const key in collections) {
        collections[key].sort((a,b) => a.name.localeCompare(b.name));
    }
    return Object.entries(collections).sort((a,b) => a[0].localeCompare(b[0]));
  }, [appData.wallets]);

  const totalAllNftsValue = useMemo(() => {
    return allNftsByCollection.reduce((sum, [, nftsInCollection]) => {
        return sum + nftsInCollection.reduce((collectionSum, nft) => collectionSum + parseMonetaryValue(nft.estimatedFloorPrice), 0);
    }, 0);
  }, [allNftsByCollection]);


  const historicalChartData: ChartData<'line'> = {
    labels: (portfolioData.historicalValue || []).map(d => new Date(d.date).toLocaleDateString('en-US', {month:'short', day:'numeric'})),
    datasets: [{
        label: 'Portfolio Value (Simulated)',
        data: (portfolioData.historicalValue || []).map(d => d.value),
        fill: true,
        tension: 0.1,
    }]
  };

  const tokenAllocationChartData: ChartData<'doughnut'> = {
    labels: (portfolioData.tokenAllocation || []).slice(0,10).map(ta => ta.symbol),
    datasets: [{
        label: 'Token Allocation by Value',
        data: (portfolioData.tokenAllocation || []).slice(0,10).map(ta => ta.value),
        backgroundColor: DISTINCT_COLORS.slice(0, (portfolioData.tokenAllocation || []).slice(0,10).length),
        hoverOffset: 4,
    }]
  };

  const MetricCard: React.FC<{ title: string; value: number; icon: React.ElementType; colorClass?: string; isCurrency?: boolean; helpText?: string }> =
    ({ title, value, icon: Icon, colorClass = 'text-primary-light dark:text-primary-dark', isCurrency = true, helpText }) => (
    <Card className="flex-1 min-w-[200px] sm:min-w-[250px] bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className={`p-2 sm:p-3 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}> <Icon size={24} className={colorClass} /> </div>
        <div>
            <div className="flex items-center">
                <p className="text-xs sm:text-sm font-medium text-muted-light dark:text-muted-dark">{title}</p>
                {helpText && <span title={helpText}><HelpCircle size={12} className="ml-1.5 text-gray-400 cursor-help" /></span>}
            </div>
            <p className={`text-xl sm:text-3xl font-bold ${colorClass}`}> {isCurrency ? formatCurrency(value) : value.toLocaleString()} </p>
        </div>
      </div>
    </Card>
  );

  const PerformanceList: React.FC<{ title: string; items: PortfolioAirdropPerformance[]; icon: React.ElementType; itemColorClass: string }> =
    ({ title, items, icon: Icon, itemColorClass }) => (
    <Card className="h-full">
        <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3 flex items-center">
            <Icon size={20} className={`mr-2 ${itemColorClass}`} /> {title}
        </h4>
        {items.length === 0 ? <p className="text-sm text-muted-light dark:text-muted-dark">No airdrops fit this category yet.</p> : (
            <ul className="space-y-2">
                {items.map(item => (
                    <li key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                        <Link to={`/airdrops/${item.id}`} className="hover:underline text-primary-light dark:text-primary-dark truncate pr-2" title={item.name}>{item.name}</Link>
                        <span className={`font-semibold ${item.netPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(item.netPL)}
                        </span>
                    </li>
                ))}
            </ul>
        )}
    </Card>
  );

  const TabButton: React.FC<{tabId: 'overview' | 'nfts' | 'aggregated_pl', label: string, icon: React.ElementType}> = ({tabId, label, icon: Icon}) => (
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <BarChart3 size={28} className="mr-3 text-primary-light dark:text-primary-dark" />
          <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">{t('nav_portfolio_overview')}</h2>
        </div>
         <Button onClick={handleRefreshPrices} leftIcon={<RefreshCw size={16} className={isPriceLoading ? "animate-spin" : ""}/>} disabled={isPriceLoading}>
          {isPriceLoading ? "Refreshing Prices..." : "Refresh Prices (Simulated)"}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <TabButton tabId="overview" label="Airdrop P&L" icon={DollarSign}/>
        <TabButton tabId="aggregated_pl" label={t('portfolio_aggregated_pl_tab')} icon={PieChart}/>
        <TabButton tabId="nfts" label={t('portfolio_nft_holdings_tab')} icon={ImageIcon}/>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <MetricCard title="Total Costs (Gas & Acquisition)" value={portfolioData.totalCosts} icon={TrendingDown} colorClass="text-red-500 dark:text-red-400" helpText="Sum of all logged transaction costs for airdrops and token acquisition costs." />
                <MetricCard title="Total Realized Sales" value={portfolioData.totalSales} icon={TrendingUp} colorClass="text-green-500 dark:text-green-400" helpText="Total value from selling claimed tokens."/>
                <MetricCard title="Current Unrealized Value" value={portfolioData.totalUnrealizedValue || 0} icon={Eye} colorClass="text-blue-500 dark:text-blue-400" helpText="Estimated current market value of unsold claimed tokens."/>
                <MetricCard title="Overall Net P/L (Realized)" value={portfolioData.netProfitLoss} icon={DollarSign} colorClass={portfolioData.netProfitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} helpText="Total Sales minus Total Costs (Acquisition + Transaction). Does not include unrealized value." />
            </div>

            <p className="text-xs text-center text-muted-light dark:text-muted-dark p-2 bg-yellow-50 dark:bg-yellow-900/50 rounded-md">
              <strong>Note on P&L Calculation:</strong> Current Profit/Loss (P&L) calculations are based on simple sums of logged costs and sales. For precise tax reporting (e.g., FIFO/LIFO), utilize the 'Acquisition Lot ID' when logging claimed tokens and 'Purchase Lot ID' for NFTs. Full cost-basis tracking features will be enhanced in future updates.
            </p>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PerformanceList title="Top Profitable Airdrops" items={portfolioData.topProfitableAirdrops} icon={Award} itemColorClass="text-green-500" />
                <PerformanceList title="Top Loss-Making Airdrops" items={portfolioData.topLossAirdrops} icon={AlertOctagon} itemColorClass="text-red-500" />
                <Card className="h-full">
                    <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3 flex items-center"><ChevronsRight size={20} className="mr-2 text-purple-500"/>Airdrop Potential Distribution</h4>
                    {portfolioData.potentialDistribution && portfolioData.potentialDistribution.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                            {portfolioData.potentialDistribution.map(item => (
                                <li key={item.name} className="flex justify-between p-1.5 bg-gray-50 dark:bg-gray-800 rounded">
                                    <span>{item.name}</span>
                                    <span className="font-medium">{item.count} airdrop(s)</span>
                                </li>
                            ))}
                        </ul>
                    ): <p className="text-sm text-muted-light dark:text-muted-dark">No potential data logged for airdrops.</p>}
                </Card>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3 flex items-center"><PieChart size={20} className="mr-2 text-teal-500"/>Unsold Token Allocation (by Value)</h4>
                     <div className="h-64 sm:h-72">
                        {(portfolioData.tokenAllocation?.length || 0) > 0 ? (
                            <DoughnutChart data={tokenAllocationChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right'}}}} />
                        ) : <p className="text-sm text-muted-light dark:text-muted-dark text-center py-4">No token allocation data. Log claimed tokens and their market prices.</p>}
                    </div>
                     <p className="text-xs text-muted-light dark:text-muted-dark mt-2 text-center">Based on manually updated/simulated current market prices. Top 10 shown.</p>
                </Card>
                <Card>
                    <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3 flex items-center"><BarChart3 size={20} className="mr-2 text-orange-500"/>Portfolio Value Over Time (Simulated)</h4>
                     <div className="h-64 sm:h-72">
                        {(portfolioData.historicalValue?.length || 0) > 1 ? (
                            <LineChart data={historicalChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false }}}} />
                        ) : <p className="text-sm text-muted-light dark:text-muted-dark text-center py-4">Not enough historical data to display chart.</p>}
                    </div>
                    <p className="text-xs text-muted-light dark:text-muted-dark mt-2 text-center">This chart is for illustrative purposes only based on simulated historical data.</p>
                </Card>
            </div>

             <Card>
                <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3 flex items-center"><Brain size={20} className="mr-2 text-purple-500"/>AI Portfolio Insights (Conceptual)</h3>
                <p className="text-sm text-muted-light dark:text-muted-dark mb-2">Imagine asking your portfolio questions in plain language!</p>
                <ul className="list-disc list-inside text-sm text-text-light dark:text-text-dark space-y-1 pl-4 mb-3">
                    <li>"Which airdrops cost me the most in gas fees?"</li>
                    <li>"What's my unrealized P&L on Arbitrum airdrops?"</li>
                    <li>"Show me tokens I've held for more than 6 months."</li>
                    <li>"Which wallets have the highest interaction count this month?"</li>
                </ul>
                <p className="text-sm text-muted-light dark:text-muted-dark mb-3">
                    This conceptual feature would leverage AI to analyze your logged data (airdrops, wallets, transactions, P&L) to provide answers, helping you understand your crypto activities like never before.
                </p>
                <Link to="/learning/aiAnalyst">
                    <Button variant="outline" leftIcon={<Lightbulb size={16}/>}>
                        Explore Conceptual AI Analyst in Learning Hub
                    </Button>
                </Link>
            </Card>

        </div>
      )}

      {activeTab === 'nfts' && (
         <Card>
             <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Total Estimated NFT Portfolio Value: {formatCurrency(totalAllNftsValue)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                    Based on manually entered 'Estimated Floor Price' for each NFT.
                </p>
             </div>
            {allNftsByCollection.length === 0 ? (
                <p className="text-muted-light dark:text-muted-dark text-center py-6">No NFTs logged across your wallets yet. Add NFTs via the Wallet Manager.</p>
            ) : (
                <div className="space-y-4">
                    {allNftsByCollection.map(([collectionName, nftsInCollection]) => (
                       <NftCollectionGroup key={collectionName} collectionName={collectionName} nfts={nftsInCollection} t={t} />
                    ))}
                </div>
            )}
         </Card>
      )}

      {activeTab === 'aggregated_pl' && (
        <Card>
            <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3 flex items-center"><PieChart size={20} className="mr-2 text-teal-500"/>Aggregated Portfolio P&L (Simulated)</h4>
            <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
                This tab provides a simulated view of aggregated Profit & Loss across all your wallets and assets.
                True cross-wallet P&L tracking is complex and requires consistent cost-basis data for all assets.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-lg text-text-light dark:text-text-dark">Simulated Total Assets Value</h4>
                    <p className="text-2xl text-blue-500 dark:text-blue-400">{formatCurrency((portfolioData.totalSales + (portfolioData.totalUnrealizedValue || 0)))}</p>
                    <p className="text-xs text-muted-light dark:text-muted-dark">(Realized Sales + Current Unrealized Value)</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-lg text-text-light dark:text-text-dark">Simulated Total Investment Costs</h4>
                    <p className="text-2xl text-red-500 dark:text-red-400">{formatCurrency(portfolioData.totalCosts)}</p>
                    <p className="text-xs text-muted-light dark:text-muted-dark">(Sum of all transaction & acquisition costs)</p>
                </div>
                 <div className="md:col-span-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold text-lg text-text-light dark:text-text-dark">Simulated Net Portfolio P/L</h4>
                    <p className={`text-3xl font-bold ${((portfolioData.totalSales + (portfolioData.totalUnrealizedValue || 0)) - portfolioData.totalCosts) >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {formatCurrency(((portfolioData.totalSales + (portfolioData.totalUnrealizedValue || 0)) - portfolioData.totalCosts))}
                    </p>
                    <p className="text-xs text-muted-light dark:text-muted-dark">(Total Assets Value - Total Investment Costs)</p>
                </div>
            </div>
        </Card>
      )}
    </PageWrapper>
  );
};
