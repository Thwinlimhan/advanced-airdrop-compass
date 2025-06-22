import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserAlert, NotificationType } from '../../types';
import { useUserAlertStore } from '../../stores/userAlertStore';
import { Button } from '../../design-system/components/Button';
import { formatRelativeDate } from '../../utils/formatting';
import { Info, AlertTriangle, CheckCircle, XCircle, BellOff, Trash2, CheckCheck, CircleSlash } from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationIcons: Record<NotificationType, React.ElementType> = {
  [NotificationType.INFO]: Info,
  [NotificationType.WARNING]: AlertTriangle,
  [NotificationType.ERROR]: XCircle,
  [NotificationType.SUCCESS]: CheckCircle,
  [NotificationType.TASK_DUE]: CheckCircle, // Example, adjust as needed
  [NotificationType.STATUS_CHANGE]: Info, // Example
};

const NotificationIconColors: Record<NotificationType, string> = {
  [NotificationType.INFO]: 'text-blue-500 dark:text-blue-400',
  [NotificationType.WARNING]: 'text-yellow-500 dark:text-yellow-400',
  [NotificationType.ERROR]: 'text-red-500 dark:text-red-400',
  [NotificationType.SUCCESS]: 'text-green-500 dark:text-green-400',
  [NotificationType.TASK_DUE]: 'text-teal-500 dark:text-teal-400',
  [NotificationType.STATUS_CHANGE]: 'text-purple-500 dark:text-purple-400',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { userAlerts, markUserAlertAsRead, markAllAlertsAsRead, clearReadAlerts, clearAllAlerts } = useUserAlertStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const sortedAlerts = [...userAlerts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const bellButton = document.querySelector('button[aria-label="Open notifications panel"]');
        if (bellButton && !bellButton.contains(event.target as Node)) {
           onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear ALL notifications? This cannot be undone.")) {
      await clearAllAlerts();
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAlertsAsRead();
  };

  const handleClearRead = async () => {
    await clearReadAlerts();
  }


  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-card-light dark:bg-card-dark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col"
      style={{ maxHeight: 'calc(100vh - 80px)' }} // Prevent panel from being too tall
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-600">
        <h4 className="text-md font-semibold text-text-light dark:text-text-dark">Notifications</h4>
      </div>

      {sortedAlerts.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-light dark:text-muted-dark">
          <BellOff size={32} className="mx-auto mb-2 opacity-50" />
          No new notifications.
        </div>
      ) : (
        <div className="overflow-y-auto flex-grow p-1">
          {sortedAlerts.map((alert) => {
            const IconComponent = NotificationIcons[alert.type] || Info;
            const iconColor = NotificationIconColors[alert.type] || 'text-gray-500 dark:text-gray-400';
            return (
              <div
                key={alert.id}
                className={`p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${alert.isRead ? 'opacity-70' : ''}`}
              >
                <Link to={alert.relatedAirdropId ? `/airdrops/${alert.relatedAirdropId}` : '#'} onClick={alert.relatedAirdropId ? onClose : undefined} className="block">
                  <div className="flex items-start space-x-2.5">
                    <IconComponent size={18} className={`${iconColor} mt-0.5 flex-shrink-0`} />
                    <div className="flex-grow min-w-0">
                      {alert.title && <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">{alert.title}</p>}
                      <p className={`text-xs ${alert.title ? 'text-muted-light dark:text-muted-dark' : 'text-text-light dark:text-text-dark'} break-words`}>{alert.body}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatRelativeDate(alert.date)}</p>
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={async (e) => { e.preventDefault(); e.stopPropagation(); await markUserAlertAsRead(alert.id); }}
                        className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-700 text-green-500"
                        title="Mark as read"
                      >
                        <CircleSlash size={16} />
                      </button>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {sortedAlerts.length > 0 && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-600 flex flex-wrap gap-1.5 justify-end">
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={userAlerts.every(a => a.isRead)}>
            <CheckCheck size={14} className="mr-1"/> Mark All Read
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearRead} disabled={!userAlerts.some(a => a.isRead)}>
            <Trash2 size={14} className="mr-1"/> Clear Read
          </Button>
           <Button variant="danger" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};