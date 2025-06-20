import React from 'react';
import { Airdrop, AirdropTask, RoadmapEvent } from '../../types';
import { Card } from '../../design-system/components/Card';
import { AlertCircle, CheckCircle, Calendar, ListChecks, MapPin } from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatting';

interface TimelineItem {
  id: string;
  date: Date;
  type: 'task' | 'roadmap';
  title: string;
  description?: string;
  status?: string; // For roadmap events or task status
  isCompleted?: boolean; // For tasks
}

export const AirdropTimelineView: React.FC<{ airdrop: Airdrop }> = ({ airdrop }) => {
  const timelineItems: TimelineItem[] = [];

  // Add tasks to timeline
  const processTasks = (tasks: AirdropTask[], prefix: string = '') => {
    tasks.forEach(task => {
      if (task.dueDate) {
        timelineItems.push({
          id: `task-${task.id}`,
          date: new Date(task.dueDate),
          type: 'task',
          title: `${prefix}${task.description}`,
          isCompleted: task.completed,
          status: task.completed ? 'Completed' : 'Pending',
        });
      }
      if (task.subTasks) {
        processTasks(task.subTasks, `${prefix}${task.description} -> `);
      }
    });
  };
  processTasks(airdrop.tasks);

  // Add roadmap events to timeline
  (airdrop.roadmapEvents || []).forEach(event => {
    // Attempt to parse dateEstimate, this might be complex if format varies wildly
    // For simplicity, assuming dateEstimate can be somewhat parsed or is a clear date string
    let eventDate = new Date(event.dateEstimate);
    if (isNaN(eventDate.getTime())) {
        // If dateEstimate is not a valid date string (e.g., "Q3 2024"), try to find a representative date or skip
        // For this simple version, we might skip or use a placeholder like start of quarter.
        // Here, we'll just use new Date() if parsing fails, which will result in an "Invalid Date" or today.
        // A more robust solution would handle various dateEstimate formats.
        // For now, let's try to make it work for YYYY-MM-DD
        const match = event.dateEstimate.match(/(\d{4}-\d{2}-\d{2})/);
        if (match) eventDate = new Date(match[0]);
        else return; // Skip if unparsable for this simple timeline
    }

    timelineItems.push({
      id: `roadmap-${event.id}`,
      date: eventDate,
      type: 'roadmap',
      title: event.description,
      status: event.status,
    });
  });

  // Sort items by date
  timelineItems.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4 text-primary">Airdrop Timeline</h2>
      {timelineItems.length === 0 ? (
        <p className="text-text-secondary">No dated tasks or roadmap events to display on the timeline.</p>
      ) : (
        <div className="space-y-4">
          {timelineItems.map(item => (
            <div key={item.id} className="flex items-start space-x-3 p-3 bg-surface-secondary rounded-md">
              <div className="flex-shrink-0 mt-1">
                {item.type === 'task' ? (
                  item.isCompleted ? <CheckCircle size={20} className="text-success" /> : <ListChecks size={20} className="text-info" />
                ) : (
                  <MapPin size={20} className="text-accent" />
                )}
              </div>
              <div>
                <p className="font-semibold text-primary">{item.title}</p>
                <p className="text-sm text-text-secondary">
                  {formatRelativeDate(item.date.toISOString())} ({item.date.toLocaleDateString()})
                </p>
                {item.description && <p className="text-xs text-tertiary mt-0.5">{item.description}</p>}
                {item.status && <p className="text-xs mt-0.5"><span className="font-medium">{item.type === 'task' ? 'Task Status' : 'Event Status'}:</span> {item.status}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
