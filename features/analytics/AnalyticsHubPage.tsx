import React, { useState, useEffect } from 'react';
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
  Users, 
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  Download,
  PieChart,
  Activity
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { TrendingContractsWidget } from './TrendingContractsWidget';
import { WhaleWatcherWidget } from './WhaleWatcherWidget';

export const AnalyticsHubPage: React.FC = () => {
  const { airdrops } = useAirdropStore();
  const { wallets } = useWalletStore();
  const { yieldPositions } = useYieldPositionStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('all');

  // Calculate analytics data
  const totalAirdrops = airdrops.length;
  const activeAirdrops = airdrops.filter(a => a.myStatus === 'In Progress').length;
  const completedAirdrops = airdrops.filter(a => a.myStatus === 'Completed').length;
  const totalWallets = wallets.length;
  const totalYieldPositions = yieldPositions.length;

  const totalTimeSpent = airdrops.reduce((sum, a) => sum + (a.timeSpentHours || 0), 0);
  const averageTimePerAirdrop = totalAirdrops > 0 ? totalTimeSpent / totalAirdrops : 0;

  const totalTasks = airdrops.reduce((sum, a) => sum + a.tasks.length, 0);
  const completedTasks = airdrops.reduce((sum, a) => sum + a.tasks.filter(t => t.completed).length, 0);
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalTransactions = airdrops.reduce((sum, a) => sum + a.transactions.length, 0);
  const totalClaimedTokens = airdrops.reduce((sum, a) => sum + a.claimedTokens.length, 0);

  const blockchainDistribution = airdrops.reduce((acc, airdrop) => {
    acc[airdrop.blockchain] = (acc[airdrop.blockchain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusDistribution = airdrops.reduce((acc, airdrop) => {
    acc[airdrop.myStatus] = (acc[airdrop.myStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const potentialDistribution = airdrops.reduce((acc, airdrop) => {
    acc[airdrop.potential] = (acc[airdrop.potential] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExportData = () => {
    const data = {
      airdrops: airdrops,
      wallets: wallets,
      yieldPositions: yieldPositions,
      analytics: {
        totalAirdrops,
        activeAirdrops,
        completedAirdrops,
        totalWallets,
        totalYieldPositions,
        totalTimeSpent,
        averageTimePerAirdrop,
        taskCompletionRate,
        totalTransactions,
        totalClaimedTokens,
        blockchainDistribution,
        statusDistribution,
        potentialDistribution
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast('Analytics data exported successfully.', 'success');
  };

  const filteredAirdrops = selectedBlockchain === 'all' 
    ? airdrops 
    : airdrops.filter(a => a.blockchain === selectedBlockchain);

  const blockchains = Array.from(new Set(airdrops.map(a => a.blockchain)));

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={24} className="text-accent" />
                Analytics Hub
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  leftIcon={<Download size={16} />}
                >
                  Export Data
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
              Comprehensive analytics and insights about your crypto farming activities.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                options={[
                  { value: '7d', label: 'Last 7 Days' },
                  { value: '30d', label: 'Last 30 Days' },
                  { value: '90d', label: 'Last 90 Days' },
                  { value: '1y', label: 'Last Year' }
                ]}
              />
              <Select
                value={selectedBlockchain}
                onChange={(e) => setSelectedBlockchain(e.target.value)}
                options={[
                  { value: 'all', label: 'All Blockchains' },
                  ...blockchains.map(bc => ({ value: bc, label: bc }))
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Airdrops</p>
                  <p className="text-2xl font-bold">{totalAirdrops}</p>
                  <p className="text-xs text-gray-500">
                    {activeAirdrops} active, {completedAirdrops} completed
                  </p>
                </div>
                <Target size={24} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Task Completion</p>
                  <p className="text-2xl font-bold">{taskCompletionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">
                    {completedTasks}/{totalTasks} tasks
                  </p>
                </div>
                <CheckCircle size={24} className="text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
                  <p className="text-2xl font-bold">{totalTimeSpent.toFixed(1)}h</p>
                  <p className="text-xs text-gray-500">
                    {averageTimePerAirdrop.toFixed(1)}h avg per airdrop
                  </p>
                </div>
                <Clock size={24} className="text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
                  <p className="text-2xl font-bold">{totalTransactions}</p>
                  <p className="text-xs text-gray-500">
                    {totalClaimedTokens} tokens claimed
                  </p>
                </div>
                <Activity size={24} className="text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card variant="default" padding="md">
            <CardHeader>
              <h4 className="text-md font-semibold flex items-center gap-2">
                <PieChart size={16} />
                Blockchain Distribution
              </h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(blockchainDistribution)
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
                {Object.entries(statusDistribution)
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
                {Object.entries(potentialDistribution)
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

        {/* External Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendingContractsWidget />
          <WhaleWatcherWidget />
        </div>

        {/* Recent Activity */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h4 className="text-md font-semibold flex items-center gap-2">
              <Activity size={16} />
              Recent Activity
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAirdrops
                .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                .slice(0, 5)
                .map(airdrop => (
                  <div key={airdrop.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h5 className="font-medium">{airdrop.projectName}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {airdrop.blockchain} • {airdrop.myStatus}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{airdrop.potential}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(airdrop.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};
