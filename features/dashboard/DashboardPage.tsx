import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { useAppContext } from '../../contexts/AppContext';
import { Airdrop, AirdropTask, AirdropPriority, RecurringTask } from '../../types';
import { DashboardSummarySection } from './SummaryWidget';
import { PriorityTasksWidget } from './PriorityTasksWidget';
import { GasTrackerWidget } from './GasTrackerWidget';
import { AlertsWidget } from './AlertsWidget';
import { UserStatsWidget } from './UserStatsWidget';
import { AirdropDiscoveryWidget } from '../discovery/AirdropDiscoveryWidget';
import { DashboardTour } from './DashboardTour';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { WidgetKey, WidgetType, DashboardWidgetConfig } from '../../types';

interface PriorityTaskItem {
  id: string;
  name: string;
  dueDate?: string;
  type: 'recurring' | 'airdrop';
  airdropName?: string;
  airdropId?: string;
  isOverdue: boolean;
  airdropPriority?: AirdropPriority;
}

interface DraggableWidgetProps {
  widgetKey: WidgetKey;
  children: React.ReactNode;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, key: WidgetKey) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, key: WidgetKey) => void;
  isDragging?: boolean;
}

const DraggableWidgetWrapper: React.FC<DraggableWidgetProps> = ({ widgetKey, children, onDragStart, onDragOver, onDrop, isDragging }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, widgetKey)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, widgetKey)}
      className={`cursor-move transition-opacity ${isDragging ? 'opacity-50' : ''}`}
    >
      {children}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { appData, markTutorialAsCompleted, completeRecurringTask, updateDashboardWidgetOrder } = useAppContext();
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [draggedWidgetKey, setDraggedWidgetKey] = useState<WidgetKey | null>(null);

  useEffect(() => {
    const settings = appData.settings;
    if (settings.tutorialsCompleted && !settings.tutorialsCompleted.dashboardTourCompleted) {
      setIsTourOpen(true);
    }
  }, [appData.settings.tutorialsCompleted]);

  const handleTourClose = () => {
    markTutorialAsCompleted('dashboardTourCompleted');
    setIsTourOpen(false);
  };

  // Calculate dashboard metrics
  const activeAirdropsCount = appData.airdrops.filter(a => !a.isArchived).length;
  
  const totalTasksCompleted = appData.airdrops.reduce((total, airdrop) => {
    const countCompletedTasksRecursive = (tasks: AirdropTask[]): number => {
      return tasks.reduce((sum, task) => {
        let completed = task.completed ? 1 : 0;
        if (task.subTasks && task.subTasks.length > 0) {
          completed += countCompletedTasksRecursive(task.subTasks);
        }
        return sum + completed;
      }, 0);
    };
    return total + countCompletedTasksRecursive(airdrop.tasks);
  }, 0);

  const upcomingPriorityTasks: PriorityTaskItem[] = [];

  // Gather airdrop tasks
  appData.airdrops.forEach(airdrop => {
    if (airdrop.isArchived) return;
    
    const gatherAirdropTasks = (tasksToScan: AirdropTask[], parentAirdrop: typeof airdrop) => {
      tasksToScan.forEach(task => {
        if (!task.completed && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const now = new Date();
          const isOverdue = dueDate < now;
          
          upcomingPriorityTasks.push({
            id: task.id,
            name: task.description,
            dueDate: task.dueDate,
            type: 'airdrop' as const,
            airdropName: parentAirdrop.projectName,
            airdropId: parentAirdrop.id,
            isOverdue,
            airdropPriority: parentAirdrop.priority,
          });
        }
        if (task.subTasks && task.subTasks.length > 0) {
          gatherAirdropTasks(task.subTasks, parentAirdrop);
        }
      });
    };
    gatherAirdropTasks(airdrop.tasks, airdrop);
  });

  // Gather recurring tasks
  appData.recurringTasks.forEach(task => {
    if (task.isActive && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const isOverdue = dueDate < now;
      
      upcomingPriorityTasks.push({
        id: task.id,
        name: task.name,
        dueDate: task.dueDate,
        type: 'recurring' as const,
        isOverdue,
      });
    }
  });

  // Sort by priority and due date
  upcomingPriorityTasks.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    
    if (a.airdropPriority && b.airdropPriority) {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityOrder[a.airdropPriority] || 0;
      const bPriority = priorityOrder[b.airdropPriority] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
    }
    
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    return 0;
  });

  const estimatedPotentialValue = appData.airdrops
    .filter(a => !a.isArchived)
    .reduce((total, airdrop) => {
      const potential = airdrop.potential ? parseFloat(airdrop.potential.replace(/[^0-9.]/g, '')) || 0 : 0;
      return total + potential;
    }, 0);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, key: WidgetKey) => {
    setDraggedWidgetKey(key);
    e.dataTransfer.setData('text/plain', key);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetKey: WidgetKey) => {
    e.preventDefault();
    const draggedKey = e.dataTransfer.getData('text/plain') as WidgetKey;
    
    if (draggedKey && draggedKey !== targetKey) {
      const currentOrder = appData.settings.dashboardWidgetOrder || [];
      const newOrder = [...currentOrder];
      
      const draggedIndex = newOrder.indexOf(draggedKey);
      const targetIndex = newOrder.indexOf(targetKey);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedKey);
        updateDashboardWidgetOrder(newOrder);
      }
    }
    
    setDraggedWidgetKey(null);
  };

  const widgetOrder = appData.settings.dashboardWidgetOrder || ['summary', 'userStats', 'aiDiscovery', 'priorityTasks', 'gasTracker', 'alerts'];
  const orderedVisibleWidgetKeys = widgetOrder.filter(key => {
    const widgetConfig = appData.settings.dashboardWidgets?.[key as WidgetKey];
    return widgetConfig?.isVisible !== false;
  });

  const widgets = {
    summary: <DashboardSummarySection
      activeAirdrops={activeAirdropsCount}
      tasksCompleted={totalTasksCompleted}
      upcomingTasks={upcomingPriorityTasks.length}
      estimatedValue={`$${estimatedPotentialValue.toLocaleString()}`}
    />,
    userStats: <UserStatsWidget points={appData.settings.userPoints || 0} />,
    aiDiscovery: <AirdropDiscoveryWidget />,
    priorityTasks: <PriorityTasksWidget tasks={upcomingPriorityTasks} />,
    gasTracker: <GasTrackerWidget />,
    alerts: <AlertsWidget />
  };

  return (
    <PageWrapper>
      <DashboardTour isOpen={isTourOpen} onClose={handleTourClose} />
      {orderedVisibleWidgetKeys.includes('summary') && (
        <ErrorBoundary FallbackComponent={<div>Error loading Summary widget.</div>}>
          <DraggableWidgetWrapper
              widgetKey="summary"
              onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
              isDragging={draggedWidgetKey === 'summary'}
          >
            {widgets.summary}
          </DraggableWidgetWrapper>
        </ErrorBoundary>
      )}
      {orderedVisibleWidgetKeys.includes('userStats') && (
        <div className="mt-6">
          <ErrorBoundary FallbackComponent={<div>Error loading User Stats widget.</div>}>
            <DraggableWidgetWrapper
                widgetKey="userStats"
                onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                isDragging={draggedWidgetKey === 'userStats'}
            >
              {widgets.userStats}
            </DraggableWidgetWrapper>
          </ErrorBoundary>
        </div>
      )}

      {orderedVisibleWidgetKeys.includes('aiDiscovery') && ( 
        <div className="mt-6">
          <ErrorBoundary FallbackComponent={<div>Error loading AI Discovery widget.</div>}>
            <DraggableWidgetWrapper
                widgetKey="aiDiscovery"
                onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                isDragging={draggedWidgetKey === 'aiDiscovery'}
            >
              {widgets.aiDiscovery}
            </DraggableWidgetWrapper>
          </ErrorBoundary>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
           {orderedVisibleWidgetKeys.includes('priorityTasks') && (
            <ErrorBoundary FallbackComponent={<div>Error loading Priority Tasks widget.</div>}>
              <DraggableWidgetWrapper
                  widgetKey="priorityTasks"
                  onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                  isDragging={draggedWidgetKey === 'priorityTasks'}
              >
                {widgets.priorityTasks}
              </DraggableWidgetWrapper>
            </ErrorBoundary>
           )}
        </div>
        <div className="lg:col-span-1 space-y-6">
          {orderedVisibleWidgetKeys
            .filter(key => key !== 'summary' && key !== 'priorityTasks' && key !== 'userStats' && key !== 'aiDiscovery')
            .map(key => (
              <ErrorBoundary key={key} FallbackComponent={<div>Error loading widget.</div>}>
                <DraggableWidgetWrapper
                  widgetKey={key}
                  onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
                  isDragging={draggedWidgetKey === key}
                >
                  {widgets[key]}
                </DraggableWidgetWrapper>
              </ErrorBoundary>
            )
          )}
        </div>
      </div>
      <p className="text-xs text-center mt-4 text-muted-light dark:text-muted-dark">
        Tip: You can drag and drop widgets to reorder them on the dashboard. Widget visibility can be changed in Settings.
      </p>
    </PageWrapper>
  );
};