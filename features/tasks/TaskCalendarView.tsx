import React, { useState } from 'react';
import { RecurringTask, AirdropTask as SingleAirdropTask } from '../../types';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react'; // Added Circle
import { useAirdropStore } from '../../stores/airdropStore'; // Added to get all airdrop tasks

interface TaskCalendarViewProps {
  tasks: RecurringTask[]; // Only recurring tasks are passed now for main view
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ tasks: recurringTasks }) => {
  const { airdrops } = useAirdropStore(); // Get all airdrops
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Combine recurring tasks and airdrop tasks for the calendar view
  const allTasksForCalendar: { date: Date, type: 'recurring' | 'airdrop', task: RecurringTask | SingleAirdropTask, isOverdue: boolean, isCompleted: boolean }[] = [];
  
  // Process recurring tasks
  recurringTasks.forEach(task => {
    if (task.isActive) {
      const taskDueDate = new Date(task.nextDueDate);
      if (taskDueDate.getFullYear() === year && taskDueDate.getMonth() === month) {
        const today = new Date(); today.setHours(0,0,0,0);
        const isOverdue = taskDueDate < today;
        allTasksForCalendar.push({ date: taskDueDate, type: 'recurring', task, isOverdue, isCompleted: false /* Recurring tasks don't have a simple 'completed' state here, rely on nextDueDate */ });
      }
    }
  });

  // Process airdrop tasks
  airdrops.forEach(airdrop => {
    if (!airdrop.isArchived) {
      const processAirdropTasksRecursive = (tasks: SingleAirdropTask[]) => {
        tasks.forEach(task => {
          if (task.dueDate) {
            const taskDueDate = new Date(task.dueDate);
            if (taskDueDate.getFullYear() === year && taskDueDate.getMonth() === month) {
              const today = new Date(); today.setHours(0,0,0,0);
              const isOverdue = taskDueDate < today && !task.completed;
              allTasksForCalendar.push({ date: taskDueDate, type: 'airdrop', task, isOverdue, isCompleted: task.completed });
            }
          }
          if (task.subTasks) processAirdropTasksRecursive(task.subTasks);
        });
      };
      processAirdropTasksRecursive(airdrop.tasks);
    }
  });


  const tasksByDate: { [dateStr: string]: { count: number; hasOverdueUncompleted: boolean } } = {};
  allTasksForCalendar.forEach(item => {
    const dateStr = item.date.toISOString().split('T')[0];
    if (!tasksByDate[dateStr]) {
      tasksByDate[dateStr] = { count: 0, hasOverdueUncompleted: false };
    }
    tasksByDate[dateStr].count++;
    if (item.isOverdue && !item.isCompleted) {
      tasksByDate[dateStr].hasOverdueUncompleted = true;
    }
  });


  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null); 
  }
  for (let i = 1; i <= numDays; i++) {
    calendarDays.push(i);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayDate = new Date();


  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="sm" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft size={20} />
        </Button>
        <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
          {monthNames[month]} {year}
        </h3>
        <Button variant="ghost" size="sm" onClick={nextMonth} aria-label="Next month">
          <ChevronRight size={20} />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {dayNames.map(day => (
          <div key={day} className="font-medium text-muted-light dark:text-muted-dark pb-2">{day}</div>
        ))}
        {calendarDays.map((day, index) => {
          const dayDateStr = day ? new Date(year, month, day).toISOString().split('T')[0] : '';
          const dayData = tasksByDate[dayDateStr];
          const isToday = day && todayDate.getFullYear() === year && todayDate.getMonth() === month && todayDate.getDate() === day;

          return (
            <div
              key={index}
              className={`
                p-1.5 h-12 flex flex-col items-center justify-center rounded-md relative
                ${day === null ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-800'}
                ${isToday ? 'ring-2 ring-primary-light dark:ring-primary-dark' : ''}
              `}
            >
              <span>{day}</span>
              {dayData && dayData.count > 0 && (
                <div className="absolute bottom-1 right-1 flex items-center space-x-0.5">
                    {dayData.hasOverdueUncompleted && (
                        <span title="Overdue tasks">
                           <Circle fill="red" strokeWidth={0} className="text-red-500 w-1.5 h-1.5" />
                        </span>
                    )}
                    <span className="text-xs px-1 bg-secondary-light/70 dark:bg-secondary-dark/70 text-white rounded-full leading-tight" title={`${dayData.count} task(s)`}>
                        {dayData.count > 9 ? '9+' : dayData.count}
                    </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
