import React, { useMemo, useState, useCallback, DragEvent, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { DashboardSummarySection } from './SummaryWidget';
import { GasTrackerWidget } from './GasTrackerWidget';
import { PriorityTasksWidget } from './PriorityTasksWidget';
import { AlertsWidget } from './AlertsWidget';
import { UserStatsWidget } from './UserStatsWidget';
import { AirdropDiscoveryWidget } from '../discovery/AirdropDiscoveryWidget'; // New
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useAppContext } from '../../contexts/AppContext';
import { AirdropStatus, RecurringTask, AirdropTask as SingleAirdropTask, WidgetKey, AirdropPriority } from '../../types';
import { DEFAULT_SETTINGS } from '../../constants';
import { DashboardTour } from './DashboardTour';
import { Card, CardContent, CardHeader } from '../../design-system/components/Card';
import { SummaryWidget } from './SummaryWidget';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../hooks/useToast';
import { 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Droplets,
  Search,
  Trophy,
  Settings
} from 'lucide-react';

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
  onDragStart: (e: DragEvent<HTMLDivElement>, key: WidgetKey) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>, key: WidgetKey) => void;
  isDragging?: boolean;
}

const DraggableWidgetWrapper: React.FC<DraggableWidgetProps> = ({ widgetKey, children, onDragStart, onDragOver, onDrop, isDragging }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, widgetKey)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, widgetKey)}
      className={`transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {children}
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { appData, updateSettings, markTutorialAsCompleted } = useAppContext();
  const { settings } = appData;
  const [draggedWidgetKey, setDraggedWidgetKey] = useState<WidgetKey | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (settings.tutorialsCompleted && !settings.tutorialsCompleted.dashboardTourCompleted) {
      setIsTourOpen(true);
    }
  }, [settings.tutorialsCompleted]);

  const handleTourClose = () => {
    markTutorialAsCompleted('dashboardTourCompleted');
    setIsTourOpen(false);
  };

  const activeAirdrops = useMemo(() => {
    return appData.airdrops.filter(a => !a.isArchived);
  }, [appData.airdrops]);

  const activeAirdropsCount = useMemo(() => {
    return activeAirdrops.filter(a =>
      a.myStatus === AirdropStatus.IN_PROGRESS ||
      (a.myStatus === AirdropStatus.NOT_STARTED && (a.status === AirdropStatus.LIVE || a.status === AirdropStatus.CONFIRMED))
    ).length;
  }, [activeAirdrops]);

  const totalTasksCompleted = useMemo(() => {
    let count = 0;
    activeAirdrops.forEach(airdrop => {
      const countCompletedTasksRecursive = (tasks: SingleAirdropTask[]): number => {
        let completedCount = 0;
        tasks.forEach(task => {
          if (task.completed) completedCount++;
          if (task.subTasks && task.subTasks.length > 0) {
            completedCount += countCompletedTasksRecursive(task.subTasks);
          }
        });
        return completedCount;
      };
      count += countCompletedTasksRecursive(airdrop.tasks);
    });
    count += appData.recurringTasks.reduce((acc, task) => acc + (task.completionHistory?.length || 0), 0);
    return count;
  }, [activeAirdrops, appData.recurringTasks]);

  const upcomingPriorityTasks = useMemo((): PriorityTaskItem[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tasks: PriorityTaskItem[] = [];

    appData.recurringTasks.forEach((task: RecurringTask) => {
      if (task.isActive) {
        const dueDate = new Date(task.nextDueDate);
        dueDate.setHours(0,0,0,0);
        const isOverdue = dueDate < today;
        if (isOverdue || (dueDate >= today && dueDate <= sevenDaysFromNow)) {
           tasks.push({
            id: task.id, name: task.name, dueDate: task.nextDueDate, type: 'recurring',
            airdropName: task.associatedAirdropId ? activeAirdrops.find(a => a.id === task.associatedAirdropId)?.projectName : undefined,
            airdropId: task.associatedAirdropId, isOverdue: isOverdue,
            airdropPriority: task.associatedAirdropId ? activeAirdrops.find(a => a.id === task.associatedAirdropId)?.priority : undefined,
          });
        }
      }
    });

    activeAirdrops.forEach(airdrop => {
        if (airdrop.myStatus === AirdropStatus.IN_PROGRESS || airdrop.myStatus === AirdropStatus.NOT_STARTED) {
            const gatherAirdropTasks = (tasksToScan: SingleAirdropTask[], parentAirdrop: typeof airdrop) => {
                tasksToScan.forEach((task: SingleAirdropTask) => {
                    if (!task.completed) {
                        const dueDate = task.dueDate ? new Date(task.dueDate) : undefined;
                        if(dueDate) dueDate.setHours(0,0,0,0);
                        const isOverdue = dueDate ? dueDate < today : false;
                        if (isOverdue || !dueDate || (dueDate && dueDate >= today && dueDate <= sevenDaysFromNow)) {
                            tasks.push({
                                id: task.id, name: task.description, dueDate: task.dueDate, type: 'airdrop',
                                airdropName: parentAirdrop.projectName, airdropId: parentAirdrop.id, isOverdue: isOverdue,
                                airdropPriority: parentAirdrop.priority,
                            });
                        }
                    }
                    if (task.subTasks && task.subTasks.length > 0) {
                        gatherAirdropTasks(task.subTasks, parentAirdrop);
                    }
                });
            };
            gatherAirdropTasks(airdrop.tasks, airdrop);
        }
    });

    const priorityOrder: Record<AirdropPriority, number> = {
      [AirdropPriority.HIGH]: 3,
      [AirdropPriority.MEDIUM]: 2,
      [AirdropPriority.LOW]: 1,
    };

    return tasks.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;

        const priorityA = a.airdropPriority ? priorityOrder[a.airdropPriority] : 0;
        const priorityB = b.airdropPriority ? priorityOrder[b.airdropPriority] : 0;
        if (priorityA !== priorityB) return priorityB - priorityA;

        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (dateA === Infinity && dateB !== Infinity) return 1;
        if (dateA !== Infinity && dateB === Infinity) return -1;
        return dateA - dateB;
    });
  }, [appData.recurringTasks, activeAirdrops]);

  const estimatedPotentialValue = useMemo(() => {
    let total = 0;
    activeAirdrops.forEach(a => {
        if (a.potential && !isNaN(parseFloat(a.potential.replace(/[^0-9.-]+/g,"")))) {
           total += parseFloat(a.potential.replace(/[^0-9.-]+/g,""));
        } else if (a.potential?.toLowerCase().includes('high')) total += 1000;
        else if (a.potential?.toLowerCase().includes('medium')) total += 500;
        else if (a.potential?.toLowerCase().includes('low')) total += 100;
    });
    return `$${total.toLocaleString()}`;
  }, [activeAirdrops]);

  const widgetVisibility = settings.dashboardWidgetVisibility || DEFAULT_SETTINGS.dashboardWidgetVisibility!;
  const widgetOrder = settings.dashboardWidgetOrder || DEFAULT_SETTINGS.dashboardWidgetOrder!;
  const userPoints = settings.userPoints || 0;

  const handleDragStart = (e: DragEvent<HTMLDivElement>, key: WidgetKey) => {
    e.dataTransfer.setData('widgetKey', key);
    setDraggedWidgetKey(key);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetKey: WidgetKey) => {
    e.preventDefault();
    const sourceKey = e.dataTransfer.getData('widgetKey') as WidgetKey;
    setDraggedWidgetKey(null);

    if (sourceKey && sourceKey !== targetKey) {
      const currentOrder = [...widgetOrder];
      const sourceIndex = currentOrder.indexOf(sourceKey);
      const targetIndex = currentOrder.indexOf(targetKey);

      currentOrder.splice(sourceIndex, 1);
      currentOrder.splice(targetIndex, 0, sourceKey);

      updateSettings({ dashboardWidgetOrder: currentOrder });
    }
  };

  const widgets: Record<WidgetKey, React.ReactNode> = {
    summary: widgetVisibility.summary ? (
      <DashboardSummarySection
        activeAirdrops={activeAirdropsCount}
        tasksCompleted={totalTasksCompleted}
        upcomingTasks={upcomingPriorityTasks.length}
        estimatedValue={estimatedPotentialValue}
      />
    ) : null,
    priorityTasks: widgetVisibility.priorityTasks ? <PriorityTasksWidget tasks={upcomingPriorityTasks} /> : null,
    gas: widgetVisibility.gas ? <GasTrackerWidget /> : null,
    alerts: widgetVisibility.alerts ? <AlertsWidget /> : null,
    userStats: widgetVisibility.userStats ? <UserStatsWidget points={userPoints} /> : null,
    aiDiscovery: widgetVisibility.aiDiscovery ? <AirdropDiscoveryWidget /> : null, // New widget
  };

  const orderedVisibleWidgetKeys = widgetOrder.filter(key => widgetVisibility[key] && widgets[key]);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy size={24} className="text-accent" />
            Welcome to Advanced Crypto Airdrop Compass
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-secondary">
            Track your airdrops, manage tasks, and optimize your crypto strategy with AI-powered insights.
          </p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryWidget
          title="Active Airdrops"
          value={activeAirdropsCount}
          icon={TrendingUp}
          iconBgClass="bg-blue-100 dark:bg-blue-900/30"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <SummaryWidget
          title="Tasks Completed"
          value={totalTasksCompleted}
          icon={CheckCircle}
          iconBgClass="bg-green-100 dark:bg-green-900/30"
          iconColorClass="text-green-600 dark:text-green-400"
        />
        <SummaryWidget
          title="Upcoming Tasks"
          value={upcomingPriorityTasks.length}
          icon={Clock}
          iconBgClass="bg-yellow-100 dark:bg-yellow-900/30"
          iconColorClass="text-yellow-600 dark:text-yellow-400"
        />
        <SummaryWidget
          title="Estimated Value"
          value={estimatedPotentialValue}
          icon={DollarSign}
          iconBgClass="bg-purple-100 dark:bg-purple-900/30"
          iconColorClass="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {widgetVisibility.priorityTasks && (
            <DraggableWidgetWrapper
              widgetKey="priorityTasks"
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedWidgetKey === 'priorityTasks'}
            >
              <Card variant="elevated" padding="md" className="h-full">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle size={20} className="text-warning" />
                    Priority Tasks
                  </h3>
                </CardHeader>
                <CardContent>
                  <PriorityTasksWidget tasks={upcomingPriorityTasks} />
                </CardContent>
              </Card>
            </DraggableWidgetWrapper>
          )}

          {widgetVisibility.alerts && (
            <DraggableWidgetWrapper
              widgetKey="alerts"
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedWidgetKey === 'alerts'}
            >
              <Card variant="elevated" padding="md" className="h-full">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle size={20} className="text-error" />
                    Alerts
                  </h3>
                </CardHeader>
                <CardContent>
                  <AlertsWidget />
                </CardContent>
              </Card>
            </DraggableWidgetWrapper>
          )}
        </div>

        {/* Center Column */}
        <div className="space-y-6">
          {widgetVisibility.userStats && (
            <DraggableWidgetWrapper
              widgetKey="userStats"
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedWidgetKey === 'userStats'}
            >
              <Card variant="elevated" padding="md" className="h-full">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy size={20} className="text-accent" />
                    Your Progress
                  </h3>
                </CardHeader>
                <CardContent>
                  <UserStatsWidget points={userPoints} />
                </CardContent>
              </Card>
            </DraggableWidgetWrapper>
          )}

          {widgetVisibility.gas && (
            <DraggableWidgetWrapper
              widgetKey="gas"
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedWidgetKey === 'gas'}
            >
              <Card variant="elevated" padding="md" className="h-full">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Droplets size={20} className="text-info" />
                    Gas Tracker
                  </h3>
                </CardHeader>
                <CardContent>
                  <GasTrackerWidget />
                </CardContent>
              </Card>
            </DraggableWidgetWrapper>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {widgetVisibility.aiDiscovery && (
            <DraggableWidgetWrapper
              widgetKey="aiDiscovery"
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedWidgetKey === 'aiDiscovery'}
            >
              <Card variant="elevated" padding="md" className="h-full">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Search size={20} className="text-success" />
                    Airdrop Discovery
                  </h3>
                </CardHeader>
                <CardContent>
                  <AirdropDiscoveryWidget />
                </CardContent>
              </Card>
            </DraggableWidgetWrapper>
          )}
        </div>
      </div>

      {/* Dashboard Tour */}
      <DashboardTour isOpen={isTourOpen} onClose={handleTourClose} />
    </div>
  );
};