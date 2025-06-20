import React, { useState, useMemo } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { useAppContext } from '../../contexts/AppContext';
import { UserAlert, NotificationType } from '../../types';
import { Link } from 'react-router-dom';
import { formatRelativeDate } from '../../utils/formatting';
import { Bell, CheckCheck, Trash2, Filter, Info, AlertTriangle, CheckCircle as CheckCircleIcon, XCircle, CircleSlash } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const NotificationIcons: Record<NotificationType, React.ElementType> = {
  [NotificationType.INFO]: Info,
  [NotificationType.WARNING]: AlertTriangle,
  [NotificationType.ERROR]: XCircle,
  [NotificationType.SUCCESS]: CheckCircleIcon,
  [NotificationType.TASK_DUE]: CheckCircleIcon,
  [NotificationType.STATUS_CHANGE]: Info,
};

const NotificationIconColors: Record<NotificationType, string> = {
  [NotificationType.INFO]: 'text-blue-500 dark:text-blue-400',
  [NotificationType.WARNING]: 'text-yellow-500 dark:text-yellow-400',
  [NotificationType.ERROR]: 'text-red-500 dark:text-red-400',
  [NotificationType.SUCCESS]: 'text-green-500 dark:text-green-400',
  [NotificationType.TASK_DUE]: 'text-teal-500 dark:text-teal-400',
  [NotificationType.STATUS_CHANGE]: 'text-purple-500 dark:text-purple-400',
};

export const NotificationCenterPage: React.FC = () => {
  const { appData, markUserAlertAsRead, deleteUserAlert, markAllAlertsAsRead, clearReadAlerts, clearAllAlerts } = useAppContext();
  const { t } = useTranslation();

  const [filterReadStatus, setFilterReadStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');

  const filteredAlerts = useMemo(() => {
    return [...appData.userAlerts]
      .filter(alert => {
        const readMatch = filterReadStatus === 'all' || (filterReadStatus === 'read' && alert.isRead) || (filterReadStatus === 'unread' && !alert.isRead);
        const typeMatch = filterType === 'all' || alert.type === filterType;
        return readMatch && typeMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appData.userAlerts, filterReadStatus, filterType]);

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear ALL notifications? This action cannot be undone.")) {
      await clearAllAlerts();
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAlertsAsRead();
  };

  const handleClearRead = async () => {
    await clearReadAlerts();
  }

  const notificationTypeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.values(NotificationType).map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
    }))
  ];

  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <Bell size={28} className="mr-3 text-primary-light dark:text-primary-dark" />
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">
          {t('notification_center', { defaultValue: 'Notification Center' })}
        </h2>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select
            label="Filter by Status"
            value={filterReadStatus}
            onChange={(e) => setFilterReadStatus(e.target.value as 'all' | 'read' | 'unread')}
            options={[
              { value: 'all', label: 'All Notifications' },
              { value: 'unread', label: 'Unread Only' },
              { value: 'read', label: 'Read Only' },
            ]}
          />
          <Select
            label="Filter by Type"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as NotificationType | 'all')}
            options={notificationTypeOptions}
          />
          <div className="flex flex-col sm:flex-row gap-2 md:col-start-3 md:justify-end">
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={filteredAlerts.every(a => a.isRead)}>
              <CheckCheck size={16} className="mr-1.5" /> Mark All Displayed Read
            </Button>
             <Button variant="outline" size="sm" onClick={handleClearRead} disabled={!appData.userAlerts.some(a => a.isRead)}>
              <Trash2 size={16} className="mr-1.5" /> Clear Read
            </Button>
          </div>
        </div>
         <div className="mt-3 text-right">
             <Button variant="danger" size="sm" onClick={handleClearAll} disabled={appData.userAlerts.length === 0}>
              Clear All Notifications
            </Button>
        </div>
      </Card>

      {filteredAlerts.length === 0 ? (
        <Card>
          <div className="p-6 text-center text-muted-light dark:text-muted-dark">
            <Filter size={48} className="mx-auto mb-3 opacity-50" />
            No notifications match your current filters.
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const IconComponent = NotificationIcons[alert.type] || Info;
            const iconColor = NotificationIconColors[alert.type] || 'text-gray-500 dark:text-gray-400';
            return (
              <Card key={alert.id} className={`transition-all ${alert.isRead ? 'opacity-60 bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}>
                <div className="flex items-start space-x-3">
                  <IconComponent size={24} className={`${iconColor} mt-1 flex-shrink-0`} />
                  <div className="flex-grow min-w-0">
                    {alert.title && <h4 className="text-md font-semibold text-text-light dark:text-text-dark truncate">{alert.title}</h4>}
                    <p className={`text-sm ${alert.title ? 'text-muted-light dark:text-muted-dark' : 'text-text-light dark:text-text-dark'} break-words`}>{alert.body}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatRelativeDate(alert.date)} ({new Date(alert.date).toLocaleString()})
                    </p>
                    {alert.relatedAirdropId && (
                      <Link to={`/airdrops/${alert.relatedAirdropId}`} className="text-xs text-primary-light dark:text-primary-dark hover:underline mt-1 block">
                        View Related Airdrop
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                    {!alert.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await markUserAlertAsRead(alert.id); }}
                        className="text-green-500 hover:text-green-600 p-1"
                        title="Mark as read"
                      >
                        <CircleSlash size={18} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await deleteUserAlert(alert.id); }}
                      className="text-red-500 hover:text-red-600 p-1"
                      title="Delete notification"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
};