import React from 'react';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { CheckCircle, Trash2, Bell } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const AlertsWidget: React.FC = () => {
  const { appData, markUserAlertAsRead, deleteUserAlert } = useAppContext();

  const handleAddAlert = async () => {
    // This would typically open a modal to add a new alert
    console.log('Add alert functionality would go here');
  };
  
  const unreadAlerts = appData.userAlerts.filter(alert => !alert.isRead);
  const readAlerts = appData.userAlerts.filter(alert => alert.isRead);

  return (
    <Card>
      <CardHeader 
        title="Alerts & Notifications" 
        action={
          <Button onClick={handleAddAlert} size="sm" variant="ghost" title="Add Alert">
            <Bell size={16} />
          </Button>
        }
      />
      <CardContent>
        {appData.userAlerts.length === 0 ? (
          <p className="text-muted-dark text-center py-4">No alerts yet. You're all caught up!</p>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {unreadAlerts.length > 0 && unreadAlerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20 border-l-4 border-yellow-500 flex justify-between items-start">
                <div>
                  <p className="text-sm text-white">{alert.body}</p>
                  <p className="text-xs text-muted-dark">{new Date(alert.date).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={async () => await markUserAlertAsRead(alert.id)} title="Mark as Read" className="text-green-400 hover:text-green-300">
                    <CheckCircle size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={async () => await deleteUserAlert(alert.id)} className="text-red-400 hover:text-red-300" title="Delete Alert">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            {readAlerts.length > 0 && unreadAlerts.length > 0 && <hr className="my-3 border-gray-700/50"/>}
            {readAlerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg bg-card-dark/50 dark:bg-background-dark/50 opacity-70 flex justify-between items-start">
                 <div>
                  <p className="text-sm text-muted-dark line-through">{alert.body}</p>
                  <p className="text-xs text-muted-dark/70">{new Date(alert.date).toLocaleDateString()}</p>
                </div>
                 <Button variant="ghost" size="sm" onClick={async () => await deleteUserAlert(alert.id)} className="text-red-400 hover:text-red-300" title="Delete Alert">
                    <Trash2 size={16} />
                  </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};