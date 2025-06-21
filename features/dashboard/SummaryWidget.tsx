import React from 'react';
import { Card } from '../../design-system/components/Card';
import { TrendingUp, CheckSquare, ListTodo, DollarSign } from 'lucide-react';

interface SummaryWidgetProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBgClass: string; // Tailwind color class for icon background e.g. bg-accent_blue
  iconColorClass: string; // Tailwind color class for icon color e.g. text-white or text-blue-700
}

export const SummaryWidget: React.FC<SummaryWidgetProps> = ({ title, value, icon: Icon, iconBgClass, iconColorClass }) => {
  return (
    <Card className="flex-1 min-w-[200px]">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${iconBgClass}`}>
           <Icon size={24} className={iconColorClass} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-light dark:text-muted-dark">{title}</p>
          <p className="text-3xl font-bold text-text-light dark:text-white">{value}</p>
        </div>
      </div>
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
    const summaryData = [
        { title: 'Active Airdrops', value: activeAirdrops, icon: TrendingUp, iconBg: 'bg-accent_blue', iconColor: 'text-white' },
        { title: 'Total Tasks Done', value: tasksCompleted, icon: CheckSquare, iconBg: 'bg-accent_teal', iconColor: 'text-white' },
        { title: 'Upcoming Tasks', value: upcomingTasks, icon: ListTodo, iconBg: 'bg-accent_yellow', iconColor: 'text-card-dark' },
        { title: 'Est. Potential Value', value: estimatedValue, icon: DollarSign, iconBg: 'bg-accent_pink', iconColor: 'text-white' },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summaryData.map(item => (
                <SummaryWidget 
                    key={item.title}
                    title={item.title}
                    value={item.value}
                    icon={item.icon}
                    iconBgClass={item.iconBg}
                    iconColorClass={item.iconColor}
                />
            ))}
        </div>
    );
};