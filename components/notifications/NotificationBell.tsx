import React from 'react';
import { Bell } from 'lucide-react';
import { useUserAlertStore } from '../../stores/userAlertStore';

interface NotificationBellProps {
  onTogglePanel: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onTogglePanel }) => {
  const { userAlerts } = useUserAlertStore();
  const unreadCount = userAlerts.filter(alert => !alert.isRead).length;

  return (
    <button
      onClick={onTogglePanel}
      className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-dark focus:outline-none rounded-full"
      aria-label="Open notifications panel"
    >
      <Bell size={22} />
      {unreadCount > 0 && (
        <span
          className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-background-light dark:ring-background-dark"
          aria-label={`${unreadCount} unread notifications`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
