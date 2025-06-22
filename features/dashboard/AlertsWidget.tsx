import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { AlertTriangle, Info, CheckCircle, XCircle, Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserAlertStore } from '../../stores/userAlertStore';
import { UserAlert, NotificationType } from '../../types';
import { formatRelativeDate } from '../../utils/formatting';

interface AlertsWidgetProps {
  alerts?: UserAlert[];
}

export const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts: propAlerts }) => {
  const { userAlerts, markUserAlertAsRead, deleteUserAlert } = useUserAlertStore();
  
  // Use prop alerts if provided, otherwise use store alerts
  const alerts = propAlerts || userAlerts;
  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  const getAlertIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ERROR:
        return <XCircle size={16} className="text-red-400" />;
      case NotificationType.WARNING:
        return <AlertTriangle size={16} className="text-yellow-400" />;
      case NotificationType.SUCCESS:
        return <CheckCircle size={16} className="text-green-400" />;
      case NotificationType.TASK_DUE:
        return <Bell size={16} className="text-blue-400" />;
      case NotificationType.STATUS_CHANGE:
        return <Info size={16} className="text-purple-400" />;
      default:
        return <Info size={16} className="text-gray-400" />;
    }
  };

  const getAlertBgColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ERROR:
        return 'bg-red-500/10 dark:bg-red-500/20 border-l-red-500';
      case NotificationType.WARNING:
        return 'bg-yellow-500/10 dark:bg-yellow-500/20 border-l-yellow-500';
      case NotificationType.SUCCESS:
        return 'bg-green-500/10 dark:bg-green-500/20 border-l-green-500';
      case NotificationType.TASK_DUE:
        return 'bg-blue-500/10 dark:bg-blue-500/20 border-l-blue-500';
      case NotificationType.STATUS_CHANGE:
        return 'bg-purple-500/10 dark:bg-purple-500/20 border-l-purple-500';
      default:
        return 'bg-gray-500/10 dark:bg-gray-500/20 border-l-gray-500';
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markUserAlertAsRead(alertId);
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await deleteUserAlert(alertId);
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  let mainContent;
  if (alerts.length === 0) {
    mainContent = (
      <div className="text-center py-8">
        <Bell size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">No alerts to show</p>
      </div>
    );
  } else {
    mainContent = (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border-l-4 ${getAlertBgColor(alert.type)} ${!alert.isRead ? 'ring-1 ring-blue-500/20' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  {alert.title && (
                    <p className={`text-sm font-medium ${!alert.isRead ? 'text-white' : 'text-gray-300'}`}>
                      {alert.title}
                    </p>
                  )}
                  <p className={`text-xs ${!alert.isRead ? 'text-gray-200' : 'text-gray-400'}`}>
                    {alert.body}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeDate(alert.date)}
                  </p>
                  {alert.relatedAirdropId && (
                    <Link
                      to={`/airdrops/${alert.relatedAirdropId}`}
                      className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
                    >
                      View Airdrop →
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="p-1 text-blue-400 hover:text-blue-300"
                    title="Mark as read"
                  >
                    <CheckCircle size={12} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-1 text-gray-400 hover:text-red-400"
                  title="Delete alert"
                >
                  <X size={12} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card title="Alerts & Notifications" className="h-full">
      {mainContent}
      {alerts.length > 5 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            Showing 5 of {alerts.length} alerts
          </p>
        </div>
      )}
      {unreadAlerts.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-blue-400 text-center">
            {unreadAlerts.length} unread alert{unreadAlerts.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </Card>
  );
};