import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { useAirdropStore } from '../../stores/airdropStore';
import { useWalletStore } from '../../stores/walletStore';
import { useYieldPositionStore } from '../../stores/yieldPositionStore';
import { Airdrop, Wallet, YieldPosition } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  PieChart,
  Activity,
  TrendingDown,
  Users,
  Star,
  FileText,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

export const ReportsPage: React.FC = () => {
  const { airdrops } = useAirdropStore();
  const { wallets } = useWalletStore();
  const { yieldPositions } = useYieldPositionStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('all');
  const [reportType, setReportType] = useState<'overview' | 'time' | 'cost' | 'performance'>('overview');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');

  // Data validation and sanitization
  const validatedAirdrops = useMemo(() => {
    return airdrops.map(airdrop => ({
      ...airdrop,
      projectName: airdrop.projectName || 'Unnamed Project',
      blockchain: airdrop.blockchain || 'Unknown',
      myStatus: airdrop.myStatus || 'Not Started',
      potential: airdrop.potential || 'Unknown',
      timeSpentHours: Math.max(0, airdrop.timeSpentHours || 0),
      tasks: airdrop.tasks || [],
      transactions: airdrop.transactions || [],
      claimedTokens: airdrop.claimedTokens || [],
      notes: airdrop.notes || '',
      description: airdrop.description || ''
    }));
  }, [airdrops]);

  const validatedWallets = useMemo(() => {
    return wallets.map(wallet => ({
      ...wallet,
      name: wallet.name || 'Unnamed Wallet',
      address: wallet.address || 'No address',
      blockchain: wallet.blockchain || 'Unknown',
      group: wallet.group || 'No group',
      balanceSnapshots: wallet.balanceSnapshots || [],
      gasLogs: wallet.gasLogs || [],
      interactionLogs: wallet.interactionLogs || [],
      nftPortfolio: wallet.nftPortfolio || []
    }));
  }, [wallets]);

  const validatedYieldPositions = useMemo(() => {
    return yieldPositions.map(position => ({
      ...position,
      platformName: position.platformName || 'Unknown Platform',
      assetSymbol: position.assetSymbol || 'Unknown Asset',
      currentApy: Math.max(0, position.currentApy || 0),
      amountStaked: Math.max(0, position.amountStaked || 0),
      currentValue: Math.max(0, position.currentValue || 0)
    }));
  }, [yieldPositions]);

  // Calculate report data with validation
  const calculatedReportData = useMemo(() => {
    const totalAirdrops = validatedAirdrops.length;
    const activeAirdrops = validatedAirdrops.filter(a => a.myStatus === 'In Progress').length;
    const completedAirdrops = validatedAirdrops.filter(a => a.myStatus === 'Completed').length;
    const totalWallets = validatedWallets.length;
    const totalYieldPositions = validatedYieldPositions.length;

    const totalTimeSpent = validatedAirdrops.reduce((sum, a) => sum + a.timeSpentHours, 0);
    const averageTimePerAirdrop = totalAirdrops > 0 ? totalTimeSpent / totalAirdrops : 0;

    const totalTasks = validatedAirdrops.reduce((sum, a) => sum + a.tasks.length, 0);
    const completedTasks = validatedAirdrops.reduce((sum, a) => sum + a.tasks.filter(t => t.completed).length, 0);
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalTransactions = validatedAirdrops.reduce((sum, a) => sum + a.transactions.length, 0);
    const totalClaimedTokens = validatedAirdrops.filter(a => a.claimedTokens.length > 0).length;

    // Calculate costs with validation
    const totalGasCosts = validatedAirdrops.reduce((sum, a) => {
      return sum + a.transactions.reduce((txSum, tx) => {
        const cost = parseFloat(tx.cost?.toString() || '0') || 0;
        return txSum + cost;
      }, 0);
    }, 0);

    // Blockchain distribution
    const blockchainDistribution = validatedAirdrops.reduce((acc, airdrop) => {
      acc[airdrop.blockchain] = (acc[airdrop.blockchain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusDistribution = validatedAirdrops.reduce((acc, airdrop) => {
      acc[airdrop.myStatus] = (acc[airdrop.myStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Potential distribution
    const potentialDistribution = validatedAirdrops.reduce((acc, airdrop) => {
      acc[airdrop.potential] = (acc[airdrop.potential] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top performing airdrops by time efficiency
    const topTimeEfficientAirdrops = validatedAirdrops
      .filter(a => a.timeSpentHours > 0)
      .sort((a, b) => a.timeSpentHours - b.timeSpentHours)
      .slice(0, 5);

    // Most active wallets
    const mostActiveWallets = validatedWallets
      .map(wallet => ({
        ...wallet,
        activityCount: (wallet.gasLogs?.length || 0) + (wallet.interactionLogs?.length || 0)
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 5);

    // Calculate yield performance
    const totalYieldValue = validatedYieldPositions.reduce((sum, pos) => sum + (pos.currentValue || 0), 0);
    const averageApy = validatedYieldPositions.length > 0 
      ? validatedYieldPositions.reduce((sum, pos) => sum + (pos.currentApy || 0), 0) / validatedYieldPositions.length 
      : 0;

    return {
      summary: {
        totalAirdrops,
        activeAirdrops,
        completedAirdrops,
        totalWallets,
        totalYieldPositions,
        totalTimeSpent,
        averageTimePerAirdrop,
        taskCompletionRate,
        totalTasks,
        completedTasks,
        totalTransactions,
        totalClaimedTokens,
        totalGasCosts,
        totalYieldValue,
        averageApy
      },
      distributions: {
        blockchain: blockchainDistribution,
        status: statusDistribution,
        potential: potentialDistribution
      },
      topPerformers: {
        timeEfficient: topTimeEfficientAirdrops,
        activeWallets: mostActiveWallets
      }
    };
  }, [validatedAirdrops, validatedWallets, validatedYieldPositions]);

  const filteredAirdrops = useMemo(() => {
    return selectedBlockchain === 'all' 
      ? validatedAirdrops 
      : validatedAirdrops.filter(a => a.blockchain === selectedBlockchain);
  }, [validatedAirdrops, selectedBlockchain]);

  const blockchains = useMemo(() => Array.from(new Set(validatedAirdrops.map(a => a.blockchain))).sort(), [validatedAirdrops]);

  const handleExportReport = () => {
    try {
      const exportData = {
        timeRange,
        selectedBlockchain,
        reportType,
        ...calculatedReportData,
        generatedAt: new Date().toISOString()
      };

      let blob: Blob;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'csv':
          const csvData = convertToCSV(exportData);
          blob = new Blob([csvData], { type: 'text/csv' });
          filename = `crypto-farming-report-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
        case 'pdf':
          // For now, export as JSON with PDF extension (would need PDF library)
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `crypto-farming-report-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          addToast('PDF export would require additional library. Exporting as JSON.', 'info');
          break;
        default: // json
          blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          filename = `crypto-farming-report-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast(`Report exported successfully as ${exportFormat.toUpperCase()}.`, 'success');
    } catch (error) {
      addToast('Failed to export report. Please try again.', 'error');
      console.error('Export error:', error);
    }
  };

  const convertToCSV = (data: any): string => {
    // Simple CSV conversion for key metrics
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Airdrops', data.summary.totalAirdrops],
      ['Active Airdrops', data.summary.activeAirdrops],
      ['Completed Airdrops', data.summary.completedAirdrops],
      ['Total Wallets', data.summary.totalWallets],
      ['Total Yield Positions', data.summary.totalYieldPositions],
      ['Total Time Spent (hours)', data.summary.totalTimeSpent],
      ['Average Time Per Airdrop (hours)', data.summary.averageTimePerAirdrop],
      ['Task Completion Rate (%)', data.summary.taskCompletionRate],
      ['Total Transactions', data.summary.totalTransactions],
      ['Total Claimed Tokens', data.summary.totalClaimedTokens],
      ['Total Gas Costs', data.summary.totalGasCosts],
      ['Total Yield Value', data.summary.totalYieldValue],
      ['Average APY (%)', data.summary.averageApy],
      ['', ''],
      ['Blockchain Distribution', ''],
      ...Object.entries(data.distributions.blockchain).map(([chain, count]) => [chain, count]),
      ['', ''],
      ['Status Distribution', ''],
      ...Object.entries(data.distributions.status).map(([status, count]) => [status, count])
    ];

    return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={24} className="text-accent" />
                Reports & Analytics
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={exportFormat}
                  onValueChange={(value) => setExportFormat(value as any)}
                  options={[
                    { value: 'json', label: 'JSON' },
                    { value: 'csv', label: 'CSV' },
                    { value: 'pdf', label: 'PDF' }
                  ]}
                  className="w-24"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportReport}
                  leftIcon={<Download size={16} />}
                >
                  Export {exportFormat.toUpperCase()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  leftIcon={<RefreshCw size={16} />}
                >
                  Refresh
                </Button>
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Comprehensive reports and analytics for your crypto farming activities.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as any)}
                options={[
                  { value: '7d', label: 'Last 7 Days' },
                  { value: '30d', label: 'Last 30 Days' },
                  { value: '90d', label: 'Last 90 Days' },
                  { value: '1y', label: 'Last Year' },
                  { value: 'all', label: 'All Time' }
                ]}
              />
              <Select
                value={selectedBlockchain}
                onValueChange={(value) => setSelectedBlockchain(value as string)}
                options={[
                  { value: 'all', label: 'All Blockchains' },
                  ...blockchains.map(bc => ({ value: bc, label: bc }))
                ]}
              />
              <Select
                value={reportType}
                onValueChange={(value) => setReportType(value as any)}
                options={[
                  { value: 'overview', label: 'Overview' },
                  { value: 'time', label: 'Time Analysis' },
                  { value: 'cost', label: 'Cost Analysis' },
                  { value: 'performance', label: 'Performance' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Overview */}
        {reportType === 'overview' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="default" padding="md">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Airdrops</p>
                      <p className="text-2xl font-bold">{calculatedReportData.summary.totalAirdrops}</p>
                      <p className="text-xs text-gray-500">
                        {calculatedReportData.summary.activeAirdrops} active, {calculatedReportData.summary.completedAirdrops} completed
                      </p>
                    </div>
                    <BarChart3 size={24} className="text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Task Completion</p>
                      <p className="text-2xl font-bold">{calculatedReportData.summary.taskCompletionRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">
                        {calculatedReportData.summary.completedTasks}/{calculatedReportData.summary.totalTasks} tasks
                      </p>
                    </div>
                    <Target size={24} className="text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
                      <p className="text-2xl font-bold">{calculatedReportData.summary.totalTimeSpent.toFixed(1)}h</p>
                      <p className="text-xs text-gray-500">
                        {calculatedReportData.summary.averageTimePerAirdrop.toFixed(1)}h avg per airdrop
                      </p>
                    </div>
                    <Clock size={24} className="text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Assets</p>
                      <p className="text-2xl font-bold">{calculatedReportData.summary.totalWallets + calculatedReportData.summary.totalYieldPositions}</p>
                      <p className="text-xs text-gray-500">
                        {calculatedReportData.summary.totalWallets} wallets, {calculatedReportData.summary.totalYieldPositions} yield positions
                      </p>
                    </div>
                    <DollarSign size={24} className="text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="default" padding="md">
                <CardHeader>
                  <h4 className="text-md font-semibold flex items-center gap-2">
                    <PieChart size={16} />
                    Blockchain Distribution
                  </h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(calculatedReportData.distributions.blockchain)
                      .sort(([,a], [,b]) => b - a)
                      .map(([blockchain, count]) => (
                        <div key={blockchain} className="flex items-center justify-between">
                          <span className="text-sm">{blockchain}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardHeader>
                  <h4 className="text-md font-semibold flex items-center gap-2">
                    <PieChart size={16} />
                    Status Distribution
                  </h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(calculatedReportData.distributions.status)
                      .sort(([,a], [,b]) => b - a)
                      .map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm">{status}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card variant="default" padding="md">
                <CardHeader>
                  <h4 className="text-md font-semibold flex items-center gap-2">
                    <PieChart size={16} />
                    Potential Distribution
                  </h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(calculatedReportData.distributions.potential)
                      .sort(([,a], [,b]) => b - a)
                      .map(([potential, count]) => (
                        <div key={potential} className="flex items-center justify-between">
                          <span className="text-sm">{potential}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Time Analysis */}
        {reportType === 'time' && (
          <div className="space-y-6">
            <Card variant="default" padding="md">
              <CardHeader>
                <h4 className="text-md font-semibold flex items-center gap-2">
                  <Clock size={16} />
                  Time Analysis Summary
                </h4>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{calculatedReportData.summary.totalTimeSpent.toFixed(1)}h</p>
                    <p className="text-sm text-gray-600">Total Time Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{calculatedReportData.summary.averageTimePerAirdrop.toFixed(1)}h</p>
                    <p className="text-sm text-gray-600">Average per Airdrop</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{calculatedReportData.summary.totalAirdrops}</p>
                    <p className="text-sm text-gray-600">Total Airdrops</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="md">
              <CardHeader>
                <h4 className="text-md font-semibold flex items-center gap-2">
                  <TrendingUp size={16} />
                  Most Time-Efficient Airdrops
                </h4>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {calculatedReportData.topPerformers.timeEfficient.map(airdrop => (
                    <div key={airdrop.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <p className="font-medium">{airdrop.projectName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{airdrop.blockchain}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{airdrop.timeSpentHours.toFixed(1)}h</p>
                        <p className="text-xs text-gray-500">{airdrop.myStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cost Analysis */}
        {reportType === 'cost' && (
          <div className="space-y-6">
            <Card variant="default" padding="md">
              <CardHeader>
                <h4 className="text-md font-semibold flex items-center gap-2">
                  <DollarSign size={16} />
                  Cost Analysis Summary
                </h4>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">${calculatedReportData.summary.totalGasCosts.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Gas Costs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{calculatedReportData.summary.totalTransactions}</p>
                    <p className="text-sm text-gray-600">Total Transactions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{calculatedReportData.summary.totalClaimedTokens}</p>
                    <p className="text-sm text-gray-600">Tokens Claimed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Analysis */}
        {reportType === 'performance' && (
          <div className="space-y-6">
            <Card variant="default" padding="md">
              <CardHeader>
                <h4 className="text-md font-semibold flex items-center gap-2">
                  <Activity size={16} />
                  Performance Metrics
                </h4>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{calculatedReportData.summary.taskCompletionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Task Completion Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{calculatedReportData.summary.completedAirdrops}</p>
                    <p className="text-sm text-gray-600">Completed Airdrops</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="md">
              <CardHeader>
                <h4 className="text-md font-semibold flex items-center gap-2">
                  <Users size={16} />
                  Most Active Wallets
                </h4>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {calculatedReportData.topPerformers.activeWallets.map(wallet => (
                    <div key={wallet.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{wallet.blockchain}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{wallet.activityCount}</p>
                        <p className="text-xs text-gray-500">activities</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

