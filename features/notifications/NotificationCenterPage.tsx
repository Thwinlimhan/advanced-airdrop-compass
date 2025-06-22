import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { useUserAlertStore } from '../../stores/userAlertStore';
import { useAirdropStore } from '../../stores/airdropStore';
import { useWalletStore } from '../../stores/walletStore';
import { UserAlert, Airdrop, Wallet, NotificationType } from '../../types';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  RefreshCw,
  Trash2,
  Edit,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Tag,
  Info,
  XCircle
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

export const NotificationCenterPage: React.FC = () => {
  const { userAlerts, markUserAlertAsRead, deleteUserAlert, markAllAlertsAsRead, clearReadAlerts, clearAllAlerts } = useUserAlertStore();
  const { airdrops } = useAirdropStore();
  const { wallets } = useWalletStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filterReadStatus, setFilterReadStatus] = useState<'all' | 'read' | 'unread'>('all');

  // Filter alerts based on search and filters
  const filteredAlerts = userAlerts.filter(alert => {
    const matchesSearch = (alert.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.body.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || alert.type === selectedType;
    const matchesReadStatus = filterReadStatus === 'all' || 
                             (filterReadStatus === 'read' && alert.isRead) || 
                             (filterReadStatus === 'unread' && !alert.isRead);
    
    return matchesSearch && matchesType && matchesReadStatus;
  });

  const alertTypes = Array.from(new Set(userAlerts.map(a => a.type)));

  const getAlertTypeColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INFO: return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case NotificationType.WARNING: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case NotificationType.ERROR: return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case NotificationType.SUCCESS: return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case NotificationType.TASK_DUE: return 'text-teal-600 bg-teal-100 dark:bg-teal-900 dark:text-teal-400';
      case NotificationType.STATUS_CHANGE: return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getAlertIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INFO: return <Info size={16} />;
      case NotificationType.WARNING: return <AlertTriangle size={16} />;
      case NotificationType.ERROR: return <XCircle size={16} />;
      case NotificationType.SUCCESS: return <CheckCircle size={16} />;
      case NotificationType.TASK_DUE: return <Clock size={16} />;
      case NotificationType.STATUS_CHANGE: return <Settings size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markUserAlertAsRead(alertId);
      addToast('Alert marked as read.', 'success');
    } catch (error) {
      addToast('Failed to mark alert as read.', 'error');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await deleteUserAlert(alertId);
      addToast('Alert deleted successfully.', 'success');
    } catch (error) {
      addToast('Failed to delete alert.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsAsRead();
      addToast('All alerts marked as read.', 'success');
    } catch (error) {
      addToast('Failed to mark all alerts as read.', 'error');
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadAlerts();
      addToast('Read alerts cleared.', 'success');
    } catch (error) {
      addToast('Failed to clear read alerts.', 'error');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear ALL notifications? This action cannot be undone.")) {
      try {
        await clearAllAlerts();
        addToast('All alerts cleared.', 'success');
      } catch (error) {
        addToast('Failed to clear all alerts.', 'error');
      }
    }
  };

  const getRelatedData = (alert: UserAlert) => {
    if (alert.relatedAirdropId) {
      const airdrop = airdrops.find(a => a.id === alert.relatedAirdropId);
      return airdrop ? { type: 'airdrop', name: airdrop.projectName } : null;
    }
    return null;
  };

  const unreadAlerts = userAlerts.filter(a => !a.isRead);
  const readAlerts = userAlerts.filter(a => a.isRead);

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={24} className="text-accent" />
                Notification Center
              </div>
              <div className="flex items-center gap-2">
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
              Manage your alerts and notifications for airdrops, wallets, and system events.
            </p>
          </CardContent>
        </Card>

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</p>
                  <p className="text-2xl font-bold">{userAlerts.length}</p>
                </div>
                <Bell size={24} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unread Alerts</p>
                  <p className="text-2xl font-bold text-yellow-600">{unreadAlerts.length}</p>
                </div>
                <AlertTriangle size={24} className="text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Read Alerts</p>
                  <p className="text-2xl font-bold text-green-600">{readAlerts.length}</p>
                </div>
                <CheckCircle size={24} className="text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  ...alertTypes.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ') }))
                ]}
              />
              
              <Select
                value={filterReadStatus}
                onChange={(e) => setFilterReadStatus(e.target.value as 'all' | 'read' | 'unread')}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'unread', label: 'Unread Only' },
                  { value: 'read', label: 'Read Only' }
                ]}
              />
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  disabled={unreadAlerts.length === 0}
                >
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearRead}
                  disabled={readAlerts.length === 0}
                >
                  Clear Read
                </Button>
              </div>
            </div>
            
            <div className="mt-3 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={userAlerts.length === 0}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h4 className="text-md font-semibold flex items-center gap-2">
              <Bell size={16} />
              Alerts ({filteredAlerts.length})
            </h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No alerts found matching your criteria.</p>
                </div>
              ) : (
                filteredAlerts.map(alert => {
                  const relatedData = getRelatedData(alert);
                  
                  return (
                    <div key={alert.id} className={`p-4 rounded-lg border ${alert.isRead ? 'bg-gray-50 dark:bg-gray-800 opacity-75' : 'bg-white dark:bg-gray-900'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-full ${getAlertTypeColor(alert.type)}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {alert.title && <h5 className="font-medium">{alert.title}</h5>}
                              <span className={`px-2 py-1 text-xs rounded-full ${getAlertTypeColor(alert.type)}`}>
                                {alert.type.replace('_', ' ')}
                              </span>
                              {!alert.isRead && (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">
                                  Unread
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {alert.body}
                            </p>
                            
                            {relatedData && (
                              <p className="text-xs text-gray-500">
                                Related {relatedData.type}: {relatedData.name}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{new Date(alert.date).toLocaleDateString()}</span>
                              <span>{new Date(alert.date).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!alert.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(alert.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                            leftIcon={<Trash2 size={14} />}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};