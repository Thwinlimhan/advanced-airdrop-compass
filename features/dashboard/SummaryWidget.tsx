import React from 'react';
import { Card, CardContent } from '../../design-system/components/Card';

interface SummaryWidgetProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgClass: string; // Tailwind color class for icon background e.g. bg-accent_blue
  iconColorClass: string; // Tailwind color class for icon color e.g. text-white or text-blue-700
}

export const SummaryWidget: React.FC<SummaryWidgetProps> = ({ title, value, icon: Icon, iconBgClass, iconColorClass }) => {
  return (
    <Card variant="elevated" padding="md" className="h-full">
      <CardContent className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBgClass}`}>
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardSummaryProps {
    activeAirdrops: number;
    tasksCompleted: number;
    upcomingTasks: number;
    estimatedValue: string;
}

export const DashboardSummarySection: React.FC<DashboardSummaryProps> = ({activeAirdrops, tasksCompleted, upcomingTasks, estimatedValue}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryWidget
        title="Active Airdrops"
        value={activeAirdrops}
        icon={require('lucide-react').Target}
        iconBgClass="bg-blue-100 dark:bg-blue-900"
        iconColorClass="text-blue-600 dark:text-blue-400"
      />
      <SummaryWidget
        title="Tasks Completed"
        value={tasksCompleted}
        icon={require('lucide-react').CheckCircle}
        iconBgClass="bg-green-100 dark:bg-green-900"
        iconColorClass="text-green-600 dark:text-green-400"
      />
      <SummaryWidget
        title="Upcoming Tasks"
        value={upcomingTasks}
        icon={require('lucide-react').Clock}
        iconBgClass="bg-yellow-100 dark:bg-yellow-900"
        iconColorClass="text-yellow-600 dark:text-yellow-400"
      />
      <SummaryWidget
        title="Estimated Value"
        value={estimatedValue}
        icon={require('lucide-react').DollarSign}
        iconBgClass="bg-purple-100 dark:bg-purple-900"
        iconColorClass="text-purple-600 dark:text-purple-400"
      />
    </div>
  );
};