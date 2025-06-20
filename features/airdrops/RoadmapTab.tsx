import React from 'react';
import { Airdrop, RoadmapEvent } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { PlusCircle, Edit3, Trash2, Calendar, CheckCircle, AlertTriangle, Clock, Layers } from 'lucide-react';
import { ROADMAP_EVENT_STATUSES } from '../../constants'; // For status icons/colors if needed

interface RoadmapTabProps {
  airdrop: Airdrop;
  onOpenModal: (event?: RoadmapEvent) => void;
  onDeleteEvent: (airdropId: string, eventId: string) => void;
  isArchived: boolean;
}

const getStatusIconAndColor = (status: RoadmapEvent['status']): { icon: React.ElementType, color: string } => {
  switch (status) {
    case 'Completed': return { icon: CheckCircle, color: 'text-green-500 dark:text-green-400' };
    case 'Confirmed': return { icon: Calendar, color: 'text-blue-500 dark:text-blue-400' };
    case 'Rumored': return { icon: AlertTriangle, color: 'text-yellow-500 dark:text-yellow-400' };
    case 'Delayed': return { icon: Clock, color: 'text-orange-500 dark:text-orange-400' };
    case 'Speculation': return { icon: Layers, color: 'text-purple-500 dark:text-purple-400' }; // Changed icon
    default: return { icon: Calendar, color: 'text-gray-500 dark:text-gray-400' };
  }
};

export const RoadmapTab: React.FC<RoadmapTabProps> = ({ airdrop, onOpenModal, onDeleteEvent, isArchived }) => {
  
  const handleDelete = (eventId: string, eventDescription: string) => {
    if (isArchived) return;
    if (window.confirm(`Are you sure you want to delete the roadmap event "${eventDescription}"?`)) {
      onDeleteEvent(airdrop.id, eventId);
    }
  };

  const sortedEvents = (airdrop.roadmapEvents || []).slice().sort((a,b) => {
    // Basic sort by dateEstimate string - can be improved with actual date parsing
    return a.dateEstimate.localeCompare(b.dateEstimate);
  });

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-text-light dark:text-text-dark">Project Roadmap & Key Dates</h4>
        {!isArchived && (
            <Button size="sm" onClick={() => onOpenModal()} leftIcon={<PlusCircle size={16}/>} disabled={isArchived}>
            Add Roadmap Event
            </Button>
        )}
      </div>

      {(sortedEvents || []).length === 0 ? (
        <p className="text-muted-light dark:text-muted-dark">No roadmap events logged for this airdrop yet.</p>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map(event => {
            const { icon: Icon, color } = getStatusIconAndColor(event.status);
            return (
              <div key={event.id} className={`p-4 border rounded-lg shadow-sm ${isArchived ? 'bg-gray-100 dark:bg-gray-800 opacity-70' : 'bg-white dark:bg-gray-700'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="text-lg font-medium text-primary-light dark:text-primary-dark">{event.description}</h5>
                    <div className={`flex items-center text-sm ${color} mt-1`}>
                      <Icon size={16} className="mr-1.5" />
                      <span>{event.status} - Est. Date: {event.dateEstimate}</span>
                    </div>
                  </div>
                  {!isArchived && (
                      <div className="flex space-x-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => onOpenModal(event)} title="Edit Event" disabled={isArchived}><Edit3 size={16}/></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id, event.description)} className="text-red-500 hover:text-red-700 dark:text-red-400" title="Delete Event" disabled={isArchived}><Trash2 size={16}/></Button>
                      </div>
                  )}
                </div>
                {event.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap italic">
                    Note: {event.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
