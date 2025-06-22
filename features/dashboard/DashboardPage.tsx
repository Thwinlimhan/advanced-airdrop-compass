import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useAirdropStore } from '../../stores/airdropStore';
import { useRecurringTaskStore } from '../../stores/recurringTaskStore';
import { useUserAlertStore } from '../../stores/userAlertStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUIStore } from '../../stores/uiStore';
import { useYieldPositionStore } from '../../stores/yieldPositionStore';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { SummaryWidget } from './SummaryWidget';
import { PriorityTasksWidget } from './PriorityTasksWidget';
import { AlertsWidget } from './AlertsWidget';
import { GasTrackerWidget } from './GasTrackerWidget';
import { UserStatsWidget } from './UserStatsWidget';
import { AirdropDiscoveryWidget } from '../discovery/AirdropDiscoveryWidget';
import { DashboardTour } from './DashboardTour';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  Target,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  Calendar,
  Zap,
  TrendingDown,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DashboardMetrics {
  totalAirdrops: number;
  activeAirdrops: number;
  completedAirdrops: number;
  totalWallets: number;
  totalYieldPositions: number;
  totalTasksCompleted: number;
  totalTasksPending: number;
  estimatedPotentialValue: number;
  totalGasSpent: number;
  averageCompletionTime: number;
  successRate: number;
  recentActivity: Array<{
    id: string;
    type: 'airdrop' | 'wallet' | 'task' | 'yield';
    action: string;
    timestamp: Date;
    details: string;
  }>;
}

const DashboardPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const { wallets, fetchWallets } = useWalletStore();
  const { airdrops, fetchAirdrops } = useAirdropStore();
  const { recurringTasks, fetchRecurringTasks } = useRecurringTaskStore();
  const { userAlerts, fetchUserAlerts } = useUserAlertStore();
  const { yieldPositions, fetchYieldPositions } = useYieldPositionStore();
  const { settings } = useSettingsStore();
  const { setIsLoading } = useUIStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  // Memoized dashboard metrics calculation
  const dashboardMetrics = useMemo((): DashboardMetrics => {
    const activeAirdrops = airdrops.filter(airdrop => !airdrop.isArchived);
    const activeWallets = wallets.filter(wallet => !wallet.isArchived);
    const activeYieldPositions = yieldPositions.filter(position => true); // YieldPosition doesn't have isArchived

    // Calculate task completion recursively
    const countTasksRecursive = (tasks: any[], countCompleted = true): number => {
      return tasks.reduce((sum, task) => {
        let count = countCompleted ? (task.completed ? 1 : 0) : (task.completed ? 0 : 1);
        if (task.subTasks && task.subTasks.length > 0) {
          count += countTasksRecursive(task.subTasks, countCompleted);
        }
        return sum + count;
      }, 0);
    };

    const totalTasksCompleted = airdrops.reduce((total, airdrop) => {
      return total + countTasksRecursive(airdrop.tasks, true);
    }, 0);

    const totalTasksPending = airdrops.reduce((total, airdrop) => {
      return total + countTasksRecursive(airdrop.tasks, false);
    }, 0);

    // Calculate gas costs
    const totalGasSpent = airdrops.reduce((total, airdrop) => {
      return total + airdrop.transactions.reduce((txTotal, tx) => {
        return txTotal + (parseFloat(tx.cost?.toString() || '0') || 0);
      }, 0);
    }, 0);

    // Calculate average completion time
    const completedAirdropsWithTime = airdrops.filter(a => 
      a.myStatus === 'Completed' && a.timeSpentHours && a.timeSpentHours > 0
    );
    const averageCompletionTime = completedAirdropsWithTime.length > 0
      ? completedAirdropsWithTime.reduce((sum, a) => sum + (a.timeSpentHours || 0), 0) / completedAirdropsWithTime.length
      : 0;

    // Calculate success rate
    const successRate = airdrops.length > 0 
      ? (airdrops.filter(a => a.myStatus === 'Completed').length / airdrops.length) * 100
      : 0;

    // Calculate potential value
    const estimatedPotentialValue = activeAirdrops.reduce((total, airdrop) => {
      const potential = airdrop.potential ? parseFloat(airdrop.potential.replace(/[^0-9.]/g, '')) || 0 : 0;
      return total + potential;
    }, 0);

    // Generate recent activity (using current time since updatedAt doesn't exist)
    const recentActivity: DashboardMetrics['recentActivity'] = [];
    const now = new Date();
    
    // Add airdrop activities
    airdrops.slice(0, 5).forEach((airdrop, index) => {
      recentActivity.push({
        id: airdrop.id,
        type: 'airdrop',
        action: airdrop.myStatus === 'Completed' ? 'Completed' : 'Updated',
        timestamp: new Date(now.getTime() - index * 60000), // Simulate recent activity
        details: `${airdrop.projectName} - ${airdrop.myStatus}`
      });
    });

    // Add wallet activities
    wallets.slice(0, 3).forEach((wallet, index) => {
      recentActivity.push({
        id: wallet.id,
        type: 'wallet',
        action: 'Updated',
        timestamp: new Date(now.getTime() - (index + 5) * 60000), // Simulate recent activity
        details: `${wallet.name} - ${wallet.blockchain}`
      });
    });

    // Sort by timestamp
    recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      totalAirdrops: airdrops.length,
      activeAirdrops: activeAirdrops.length,
      completedAirdrops: airdrops.filter(a => a.myStatus === 'Completed').length,
      totalWallets: activeWallets.length,
      totalYieldPositions: activeYieldPositions.length,
      totalTasksCompleted,
      totalTasksPending,
      estimatedPotentialValue,
      totalGasSpent,
      averageCompletionTime,
      successRate,
      recentActivity: recentActivity.slice(0, 8)
    };
  }, [airdrops, wallets, yieldPositions]);

  // Memoized priority tasks calculation
  const priorityTasks = useMemo(() => {
    const tasks: Array<{
      id: string;
      name: string;
      dueDate?: string;
      type: 'recurring' | 'airdrop';
      airdropName?: string;
      airdropId?: string;
      isOverdue: boolean;
      priority: 'high' | 'medium' | 'low';
    }> = [];
    
    // Add airdrop tasks
    airdrops.forEach(airdrop => {
      const gatherAirdropTasks = (tasks: any[], parentAirdrop: any) => {
        tasks.forEach(task => {
          if (!task.completed && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const isOverdue = dueDate < now;
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            let priority: 'high' | 'medium' | 'low' = 'low';
            if (isOverdue || daysUntilDue <= 1) priority = 'high';
            else if (daysUntilDue <= 3) priority = 'medium';
            
            tasks.push({
              id: task.id,
              name: task.description,
              dueDate: task.dueDate,
              type: 'airdrop' as const,
              airdropName: parentAirdrop.projectName,
              airdropId: parentAirdrop.id,
              isOverdue,
              priority
            });
          }
          if (task.subTasks && task.subTasks.length > 0) {
            gatherAirdropTasks(task.subTasks, parentAirdrop);
          }
        });
      };
      gatherAirdropTasks(airdrop.tasks, airdrop);
    });

    // Add recurring tasks
    recurringTasks.forEach(task => {
      if (task.nextDueDate && task.isActive) {
        const dueDate = new Date(task.nextDueDate);
        const now = new Date();
        const isOverdue = dueDate < now;
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (isOverdue || daysUntilDue <= 1) priority = 'high';
        else if (daysUntilDue <= 3) priority = 'medium';
        
        tasks.push({
          id: task.id,
          name: task.name,
          dueDate: task.nextDueDate,
          type: 'recurring' as const,
          isOverdue,
          priority
        });
      }
    });

    // Sort by priority and due date
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return 0;
    });
  }, [airdrops, recurringTasks]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading('wallets', true);
    setIsLoading('airdrops', true);
    setIsLoading('recurringTasks', true);
    
    try {
      await Promise.all([
        fetchWallets(),
        fetchAirdrops(),
        fetchRecurringTasks(),
        fetchUserAlerts(),
        fetchYieldPositions()
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      addToast('Failed to load dashboard data', 'error');
      console.error('Dashboard data loading error:', error);
    } finally {
      setIsLoading('wallets', false);
      setIsLoading('airdrops', false);
      setIsLoading('recurringTasks', false);
    }
  }, [fetchWallets, fetchAirdrops, fetchRecurringTasks, fetchUserAlerts, fetchYieldPositions, setIsLoading, addToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardData();
      addToast('Dashboard refreshed successfully', 'success');
    } catch (error) {
      addToast('Failed to refresh dashboard', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleQuickAdd = (type: 'airdrop' | 'wallet' | 'task' | 'yield') => {
    switch (type) {
      case 'airdrop':
        window.location.href = '/airdrops';
        break;
      case 'wallet':
        window.location.href = '/wallets';
        break;
      case 'task':
        window.location.href = '/recurring-tasks';
        break;
      case 'yield':
        window.location.href = '/yield';
        break;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'airdrop': return <Target className="h-4 w-4" />;
      case 'wallet': return <Users className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'yield': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'airdrop': return 'text-blue-600';
      case 'wallet': return 'text-green-600';
      case 'task': return 'text-purple-600';
      case 'yield': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
            {t('dashboard_title', { defaultValue: 'Dashboard' })}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {t('dashboard_subtitle', { defaultValue: 'Track your airdrop progress and manage your crypto activities' })}
          </p>
          {lastRefresh && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTour(true)}
            leftIcon={<BarChart3 className="h-4 w-4" />}
          >
            Tour
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="default" padding="md">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Actions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd('airdrop')}
              leftIcon={<Plus className="h-4 w-4" />}
              className="justify-start"
            >
              Add Airdrop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd('wallet')}
              leftIcon={<Users className="h-4 w-4" />}
              className="justify-start"
            >
              Add Wallet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd('task')}
              leftIcon={<CheckCircle className="h-4 w-4" />}
              className="justify-start"
            >
              Add Task
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd('yield')}
              leftIcon={<TrendingUp className="h-4 w-4" />}
              className="justify-start"
            >
              Add Yield
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Airdrops</p>
              <p className="text-2xl font-bold">{dashboardMetrics.totalAirdrops}</p>
              <p className="text-xs text-gray-500">
                {dashboardMetrics.activeAirdrops} active, {dashboardMetrics.completedAirdrops} completed
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Task Completion</p>
              <p className="text-2xl font-bold">
                {dashboardMetrics.totalTasksCompleted + dashboardMetrics.totalTasksPending > 0 
                  ? Math.round((dashboardMetrics.totalTasksCompleted / (dashboardMetrics.totalTasksCompleted + dashboardMetrics.totalTasksPending)) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-500">
                {dashboardMetrics.totalTasksCompleted}/{dashboardMetrics.totalTasksCompleted + dashboardMetrics.totalTasksPending} tasks
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold">{dashboardMetrics.successRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">
                {dashboardMetrics.completedAirdrops}/{dashboardMetrics.totalAirdrops} completed
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card variant="default" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-bold">{dashboardMetrics.totalWallets + dashboardMetrics.totalYieldPositions}</p>
              <p className="text-xs text-gray-500">
                {dashboardMetrics.totalWallets} wallets, {dashboardMetrics.totalYieldPositions} yield positions
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <SummaryWidget />
          <PriorityTasksWidget tasks={priorityTasks} />
          <GasTrackerWidget />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AlertsWidget />
          <UserStatsWidget points={settings.userPoints || 0} />
          
          {/* Recent Activity */}
          <Card variant="default" padding="md">
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardMetrics.recentActivity.length > 0 ? (
                  dashboardMetrics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.action}</p>
                        <p className="text-xs text-gray-500 truncate">{activity.details}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discovery Widget */}
      <AirdropDiscoveryWidget />

      {/* Dashboard Tour */}
      {showTour && <DashboardTour isOpen={showTour} onClose={() => setShowTour(false)} />}
    </div>
  );
};

export default DashboardPage;