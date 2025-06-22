import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Link } from 'react-router-dom';
import { useAirdropStore } from '../../stores/airdropStore';
import { useWalletStore } from '../../stores/walletStore';
import { useRecurringTaskStore } from '../../stores/recurringTaskStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { AirdropStatus } from '../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Wallet,
  Target,
  Calendar
} from 'lucide-react';

export const SummaryWidget: React.FC = () => {
  const { airdrops } = useAirdropStore();
  const { wallets } = useWalletStore();
  const { recurringTasks } = useRecurringTaskStore();
  const { settings } = useSettingsStore();

  // Calculate summary statistics
  const totalAirdrops = airdrops.length;
  const claimedAirdrops = airdrops.filter(airdrop => airdrop.myStatus === AirdropStatus.COMPLETED).length;
  const pendingAirdrops = airdrops.filter(airdrop => airdrop.myStatus === AirdropStatus.IN_PROGRESS).length;
  const activeTasks = recurringTasks.filter(task => task.isActive).length;
  const completedTasks = recurringTasks.filter(task => task.completionHistory.length > 0).length;
  
  // Calculate estimated value (simplified) - using potential field
  const estimatedValue = airdrops
    .filter(airdrop => airdrop.myStatus === AirdropStatus.COMPLETED && airdrop.potential)
    .reduce((sum, airdrop) => {
      const potentialValue = parseFloat(airdrop.potential.replace(/[^0-9.]/g, '')) || 0;
      return sum + potentialValue;
    }, 0);

  const totalPoints = settings.userPoints || 0;
  const currentStreak = settings.currentStreak || 0;

  const summaryItems = [
    {
      title: 'Total Airdrops',
      value: totalAirdrops.toString(),
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      link: '/airdrops'
    },
    {
      title: 'Completed',
      value: claimedAirdrops.toString(),
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      link: '/airdrops?status=completed'
    },
    {
      title: 'In Progress',
      value: pendingAirdrops.toString(),
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      link: '/airdrops?status=in_progress'
    },
    {
      title: 'Est. Value',
      value: `$${estimatedValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      link: '/reports'
    },
    {
      title: 'Active Tasks',
      value: activeTasks.toString(),
      icon: Calendar,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      link: '/tasks'
    },
    {
      title: 'Wallets',
      value: wallets.length.toString(),
      icon: Wallet,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      link: '/wallets'
    }
  ];

  const getTrendIcon = (value: number, previousValue: number = 0) => {
    if (value > previousValue) {
      return <TrendingUp size={16} className="text-green-400" />;
    } else if (value < previousValue) {
      return <TrendingDown size={16} className="text-red-400" />;
    }
    return null;
  };

  return (
    <Card title="Dashboard Summary" className="h-full">
      <div className="space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {summaryItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.title}
                to={item.link}
                className="group block"
              >
                <div className={`p-4 rounded-lg ${item.bgColor} border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group-hover:scale-105`}>
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent size={20} className={item.color} />
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Points and Streak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {totalPoints.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <TrendingUp size={24} className="text-purple-500" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {currentStreak} days
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/airdrops/new">
              <Button variant="outline" className="w-full justify-start">
                <Target size={16} className="mr-2" />
                Add New Airdrop
              </Button>
            </Link>
            <Link to="/tasks/new">
              <Button variant="outline" className="w-full justify-start">
                <Calendar size={16} className="mr-2" />
                Create Task
              </Button>
            </Link>
            <Link to="/wallets/new">
              <Button variant="outline" className="w-full justify-start">
                <Wallet size={16} className="mr-2" />
                Add Wallet
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign size={16} className="mr-2" />
                View Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {claimedAirdrops > 0 && (
              <div className="flex items-center justify-between p-2 bg-green-500/5 rounded">
                <span className="text-sm text-green-600 dark:text-green-400">
                  {claimedAirdrops} airdrop{claimedAirdrops !== 1 ? 's' : ''} completed
                </span>
                <CheckCircle size={16} className="text-green-500" />
              </div>
            )}
            {pendingAirdrops > 0 && (
              <div className="flex items-center justify-between p-2 bg-yellow-500/5 rounded">
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  {pendingAirdrops} airdrop{pendingAirdrops !== 1 ? 's' : ''} in progress
                </span>
                <Clock size={16} className="text-yellow-500" />
              </div>
            )}
            {activeTasks > 0 && (
              <div className="flex items-center justify-between p-2 bg-blue-500/5 rounded">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {activeTasks} active task{activeTasks !== 1 ? 's' : ''}
                </span>
                <Calendar size={16} className="text-blue-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SummaryWidget;