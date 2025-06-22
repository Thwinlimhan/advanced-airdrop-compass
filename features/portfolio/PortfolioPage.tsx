import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { useAirdropStore } from '../../stores/airdropStore';
import { useWalletStore } from '../../stores/walletStore';
import { useYieldPositionStore } from '../../stores/yieldPositionStore';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { Airdrop, Wallet, YieldPosition, WatchlistItem } from '../../types';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Eye,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  ExternalLink,
  MoreHorizontal,
  Settings,
  Download,
  Upload,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

export const PortfolioPage: React.FC = () => {
  const { airdrops } = useAirdropStore();
  const { wallets } = useWalletStore();
  const { yieldPositions } = useYieldPositionStore();
  const { watchlist } = useWatchlistStore();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlockchain, setSelectedBlockchain] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPotential, setSelectedPotential] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'potential' | 'timeSpent' | 'tasks'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Calculate portfolio metrics with validation
  const portfolioMetrics = useMemo(() => {
    const totalAirdrops = validatedAirdrops.length;
    const activeAirdrops = validatedAirdrops.filter(a => a.myStatus === 'In Progress').length;
    const completedAirdrops = validatedAirdrops.filter(a => a.myStatus === 'Completed').length;
    const totalWallets = validatedWallets.length;
    const totalYieldPositions = validatedYieldPositions.length;
    const totalWatchlistItems = watchlist.length;

    const totalTimeSpent = validatedAirdrops.reduce((sum, a) => sum + a.timeSpentHours, 0);
    const averageTimePerAirdrop = totalAirdrops > 0 ? totalTimeSpent / totalAirdrops : 0;

    const totalTasks = validatedAirdrops.reduce((sum, a) => sum + a.tasks.length, 0);
    const completedTasks = validatedAirdrops.reduce((sum, a) => sum + a.tasks.filter(t => t.completed).length, 0);
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const totalTransactions = validatedAirdrops.reduce((sum, a) => sum + a.transactions.length, 0);
    const totalClaimedTokens = validatedAirdrops.filter(a => a.claimedTokens.length > 0).length;

    // Calculate potential value distribution
    const potentialDistribution = {
      High: validatedAirdrops.filter(a => a.potential === 'High').length,
      Medium: validatedAirdrops.filter(a => a.potential === 'Medium').length,
      Low: validatedAirdrops.filter(a => a.potential === 'Low').length,
      Unknown: validatedAirdrops.filter(a => !a.potential || a.potential === 'Unknown').length
    };

    return {
      totalAirdrops,
      activeAirdrops,
      completedAirdrops,
      totalWallets,
      totalYieldPositions,
      totalWatchlistItems,
      totalTimeSpent,
      averageTimePerAirdrop,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      totalTransactions,
      totalClaimedTokens,
      potentialDistribution
    };
  }, [validatedAirdrops, validatedWallets, validatedYieldPositions, watchlist]);

  // Advanced filtering with validation
  const filteredAirdrops = useMemo(() => {
    let filtered = validatedAirdrops.filter(airdrop => {
      const matchesSearch = airdrop.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           airdrop.blockchain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           airdrop.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBlockchain = selectedBlockchain === 'all' || airdrop.blockchain === selectedBlockchain;
      const matchesStatus = selectedStatus === 'all' || airdrop.myStatus === selectedStatus;
      const matchesPotential = selectedPotential === 'all' || airdrop.potential === selectedPotential;
      
      return matchesSearch && matchesBlockchain && matchesStatus && matchesPotential;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.projectName.localeCompare(b.projectName);
          break;
        case 'status':
          comparison = a.myStatus.localeCompare(b.myStatus);
          break;
        case 'potential':
          comparison = a.potential.localeCompare(b.potential);
          break;
        case 'timeSpent':
          comparison = a.timeSpentHours - b.timeSpentHours;
          break;
        case 'tasks':
          comparison = a.tasks.length - b.tasks.length;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [validatedAirdrops, searchTerm, selectedBlockchain, selectedStatus, selectedPotential, sortBy, sortOrder]);

  const blockchains = useMemo(() => Array.from(new Set(validatedAirdrops.map(a => a.blockchain))).sort(), [validatedAirdrops]);
  const statuses = useMemo(() => Array.from(new Set(validatedAirdrops.map(a => a.myStatus))).sort(), [validatedAirdrops]);
  const potentials = useMemo(() => Array.from(new Set(validatedAirdrops.map(a => a.potential))).sort(), [validatedAirdrops]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'In Progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case 'Not Started': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
      case 'Abandoned': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'High': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'Low': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  // Quick actions
  const handleQuickAction = (action: string, airdropId: string) => {
    switch (action) {
      case 'view':
        navigate(`/airdrops/${airdropId}`);
        break;
      case 'edit':
        navigate(`/airdrops/${airdropId}/edit`);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this airdrop?')) {
          // Handle delete
          addToast('Delete functionality would be implemented here', 'info');
        }
        break;
      case 'duplicate':
        addToast('Duplicate functionality would be implemented here', 'info');
        break;
    }
  };

  const handleExportPortfolio = () => {
    const data = {
      airdrops: validatedAirdrops,
      wallets: validatedWallets,
      yieldPositions: validatedYieldPositions,
      watchlist,
      metrics: portfolioMetrics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast('Portfolio exported successfully', 'success');
  };

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon size={24} className="text-accent" />
                Portfolio Overview
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPortfolio}
                  leftIcon={<Download size={16} />}
                >
                  Export
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
              Comprehensive view of your crypto farming portfolio and assets.
            </p>
          </CardContent>
        </Card>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Airdrops</p>
                  <p className="text-2xl font-bold">{portfolioMetrics.totalAirdrops}</p>
                  <p className="text-xs text-gray-500">
                    {portfolioMetrics.activeAirdrops} active, {portfolioMetrics.completedAirdrops} completed
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
                  <p className="text-2xl font-bold">{portfolioMetrics.taskCompletionRate.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">
                    {portfolioMetrics.completedTasks}/{portfolioMetrics.totalTasks} tasks
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
                  <p className="text-2xl font-bold">{portfolioMetrics.totalTimeSpent.toFixed(1)}h</p>
                  <p className="text-xs text-gray-500">
                    {portfolioMetrics.averageTimePerAirdrop.toFixed(1)}h avg per airdrop
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assets</p>
                  <p className="text-2xl font-bold">{portfolioMetrics.totalWallets + portfolioMetrics.totalYieldPositions}</p>
                  <p className="text-xs text-gray-500">
                    {portfolioMetrics.totalWallets} wallets, {portfolioMetrics.totalYieldPositions} yield positions
                  </p>
                </div>
                <DollarSign size={24} className="text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search airdrops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select
                  value={selectedBlockchain}
                  onValueChange={(value) => setSelectedBlockchain(value as string)}
                  options={[
                    { value: 'all', label: 'All Blockchains' },
                    ...blockchains.map(bc => ({ value: bc, label: bc }))
                  ]}
                />
                
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as string)}
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    ...statuses.map(status => ({ value: status, label: status }))
                  ]}
                />

                <Select
                  value={selectedPotential}
                  onValueChange={(value) => setSelectedPotential(value as string)}
                  options={[
                    { value: 'all', label: 'All Potentials' },
                    ...potentials.map(potential => ({ value: potential, label: potential }))
                  ]}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    leftIcon={<Filter size={16} />}
                  >
                    {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
                  </Button>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as any)}
                      options={[
                        { value: 'name', label: 'Name' },
                        { value: 'status', label: 'Status' },
                        { value: 'potential', label: 'Potential' },
                        { value: 'timeSpent', label: 'Time Spent' },
                        { value: 'tasks', label: 'Task Count' }
                      ]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort Order
                    </label>
                    <Select
                      value={sortOrder}
                      onValueChange={(value) => setSortOrder(value as any)}
                      options={[
                        { value: 'asc', label: 'Ascending' },
                        { value: 'desc', label: 'Descending' }
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Airdrops Grid/List */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h4 className="text-md font-semibold flex items-center gap-2">
              <Target size={16} />
              Airdrops ({filteredAirdrops.length})
            </h4>
          </CardHeader>
          <CardContent>
            {filteredAirdrops.length === 0 ? (
              <div className="text-center py-8">
                <Target size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No airdrops found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || selectedBlockchain !== 'all' || selectedStatus !== 'all' || selectedPotential !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'No airdrops in your portfolio yet.'}
                </p>
                {!searchTerm && selectedBlockchain === 'all' && selectedStatus === 'all' && selectedPotential === 'all' && (
                  <Button
                    variant="primary"
                    onClick={() => navigate('/airdrops/new')}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Your First Airdrop
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAirdrops.map(airdrop => (
                  <Card key={airdrop.id} variant="outlined" padding="md" className="hover:shadow-md transition-shadow">
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium truncate">{airdrop.projectName}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{airdrop.blockchain}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(airdrop.myStatus)}`}>
                              {airdrop.myStatus}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPotentialColor(airdrop.potential)}`}>
                              {airdrop.potential}
                            </span>
                          </div>
                        </div>
                        
                        {airdrop.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {airdrop.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Tasks:</span>
                            <span>{airdrop.tasks.filter(t => t.completed).length}/{airdrop.tasks.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Time Spent:</span>
                            <span>{airdrop.timeSpentHours}h</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Transactions:</span>
                            <span>{airdrop.transactions.length}</span>
                          </div>
                          {airdrop.claimedTokens.length > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Claimed Tokens:</span>
                              <span>{airdrop.claimedTokens.length}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleQuickAction('view', airdrop.id)}
                          >
                            View Details
                          </Button>
                          <div className="relative">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleQuickAction('edit', airdrop.id)}
                            >
                              <Edit size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAirdrops.map(airdrop => (
                  <div key={airdrop.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium truncate">{airdrop.projectName}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{airdrop.blockchain}</p>
                        {airdrop.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                            {airdrop.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(airdrop.myStatus)}`}>
                          {airdrop.myStatus}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPotentialColor(airdrop.potential)}`}>
                          {airdrop.potential}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm">{airdrop.tasks.filter(t => t.completed).length}/{airdrop.tasks.length} tasks</p>
                        <p className="text-xs text-gray-500">{airdrop.timeSpentHours}h spent</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuickAction('view', airdrop.id)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuickAction('edit', airdrop.id)}
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Portfolio Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallets Summary */}
          <Card variant="default" padding="md">
            <CardHeader>
              <h4 className="text-md font-semibold flex items-center gap-2">
                <WalletIcon size={16} />
                Wallets ({portfolioMetrics.totalWallets})
              </h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validatedWallets.slice(0, 5).map(wallet => (
                  <div key={wallet.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="font-medium">{wallet.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{wallet.blockchain}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</p>
                      <p className="text-xs text-gray-500">{wallet.group || 'No group'}</p>
                    </div>
                  </div>
                ))}
                {validatedWallets.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{validatedWallets.length - 5} more wallets
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Yield Positions Summary */}
          <Card variant="default" padding="md">
            <CardHeader>
              <h4 className="text-md font-semibold flex items-center gap-2">
                <TrendingUp size={16} />
                Yield Positions ({portfolioMetrics.totalYieldPositions})
              </h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validatedYieldPositions.slice(0, 5).map(position => (
                  <div key={position.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="font-medium">{position.platformName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{position.assetSymbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{position.currentApy || 0}% APY</p>
                      <p className="text-xs text-gray-500">{position.platformName}</p>
                    </div>
                  </div>
                ))}
                {validatedYieldPositions.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{validatedYieldPositions.length - 5} more positions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};
