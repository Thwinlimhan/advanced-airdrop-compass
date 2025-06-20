import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Modal } from '../../design-system/components/Modal';
import { PlusCircle, Trash2 } from 'lucide-react';
import { UserAlert, NotificationType } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

// Refined CheckCircle icon to properly use size prop
interface CheckCircleProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}
const CheckCircle: React.FC<CheckCircleProps> = ({ size = 24, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);


export const AlertsWidget: React.FC = () => {
  const { appData, addUserAlert, markUserAlertAsRead, deleteUserAlert } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAlertBody, setNewAlertBody] = useState('');

  const handleAddAlert = async () => {
    if (newAlertBody.trim()) {
      await addUserAlert({ body: newAlertBody.trim(), type: NotificationType.INFO });
      setNewAlertBody('');
      setIsModalOpen(false);
    }
  };
  
  const unreadAlerts = appData.userAlerts.filter(alert => !alert.isRead);
  const readAlerts = appData.userAlerts.filter(alert => alert.isRead);


  return (
    <Card title="Airdrop Alerts & News" actions={
      <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<PlusCircle size={16}/>}>
        Add Alert
      </Button>
    }>
      {appData.userAlerts.length === 0 && (
        <p className="text-muted-dark">No alerts. Add important news or reminders here.</p>
      )}
      {appData.userAlerts.length > 0 && (
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Alert">
        <Input
          label="Alert Message"
          id="new-alert-message"
          value={newAlertBody}
          onChange={(e) => setNewAlertBody(e.target.value)}
          placeholder="e.g., Potential snapshot for XYZ project next week"
        />
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAlert}>Add Alert</Button>
        </div>
      </Modal>
    </Card>
  );
};