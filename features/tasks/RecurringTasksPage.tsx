import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
import { TaskCalendarView } from './TaskCalendarView'; 
import { useRecurringTaskStore } from '../../stores/recurringTaskStore';
import { useAirdropStore } from '../../stores/airdropStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { RecurringTask } from '../../types';
import { PlusCircle, Loader2, ListChecks, RefreshCw, Bell } from 'lucide-react'; 
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';

export const RecurringTasksPage: React.FC = () => {
  const { 
    recurringTasks, 
    addRecurringTask, 
    updateRecurringTask, 
    deleteRecurringTask, 
    completeRecurringTask, 
    fetchRecurringTasks,
    isLoading 
  } = useRecurringTaskStore();
  const { airdrops } = useAirdropStore();
  const { settings } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | undefined>(undefined);
  const [notificationPermission, setNotificationPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const { addToast } = useToast();
  const { t } = useTranslation();
  

  useEffect(() => {
    // Initial data fetch could be handled by AppContext or here
    // if (appData.recurringTasks.length === 0 && !isDataLoading.recurringTasks) {
    //  internalFetchRecurringTasksFromApi();
    // }
  }, []);

  const handleRefreshData = async () => {
    await fetchRecurringTasks(); 
  };


  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          addToast(t('notifications_enabled_toast', {defaultValue:"Desktop notifications enabled for task reminders."}), "info");
        } else if (permission === 'denied') {
          addToast(t('notifications_denied_toast', {defaultValue:"Desktop notifications denied. You won't receive task reminders."}), "warning");
        }
      });
    }
  }, [addToast, t]);

  const openModalForCreate = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const openModalForEdit = (task: RecurringTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleFormSubmit = async (taskData: Omit<RecurringTask, 'id'> | RecurringTask) => {
    if ('id' in taskData) { 
      await updateRecurringTask(taskData as RecurringTask);
      addToast(t('task_updated_toast', {taskName: taskData.name, defaultValue: `Task "${taskData.name}" updated.`}), 'success');
    } else { 
      await addRecurringTask(taskData as Omit<RecurringTask, 'id'>);
      addToast(t('task_added_toast', {taskName: taskData.name, defaultValue: `Task "${taskData.name}" added.`}), 'success');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = recurringTasks.find(t=>t.id === taskId);
    if (window.confirm(t('task_delete_confirm', {taskName: taskToDelete?.name, defaultValue: `Are you sure you want to delete the task "${taskToDelete?.name}"? This action cannot be undone.`}))) {
        await deleteRecurringTask(taskId);
        addToast(t('task_deleted_toast', {taskName: taskToDelete?.name, defaultValue: `Task "${taskToDelete?.name}" deleted.`}), 'success');
    }
  };
  
  const handleCompleteTask = async (taskId: string) => {
    const task = recurringTasks.find(t => t.id === taskId);
    if (!task) return;
    await completeRecurringTask(taskId); 
    // Toast is now handled by store after API call returns updatedTask
  };
  
  useEffect(() => {
    const checkDueTasks = () => {
      if (!settings.notificationsEnabled || (typeof Notification !== 'undefined' && Notification.permission !== "granted")) return;
      const today = new Date();
      today.setHours(0,0,0,0);

      recurringTasks.forEach(task => {
        if (task.isActive) {
          const dueDate = new Date(task.nextDueDate);
          dueDate.setHours(0,0,0,0);
          if (dueDate.getTime() <= today.getTime()) { 
            // Desktop notifications handled by completeRecurringTask/settings
          }
        }
      });
    };

    checkDueTasks(); 
    const intervalId = setInterval(checkDueTasks, 60 * 60 * 1000); 
    return () => clearInterval(intervalId);
  }, [recurringTasks, settings.notificationsEnabled, notificationPermission]);


  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark flex items-center">
            <ListChecks size={26} className="mr-2 text-primary-light dark:text-primary-dark"/>
            {t('nav_recurring_tasks')}
        </h2>
        <div className="flex gap-2">
             <Button onClick={handleRefreshData} variant="outline" leftIcon={isLoading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} disabled={isLoading}>
                {isLoading ? t('recurring_tasks_refreshing_button', {defaultValue:"Refreshing..."}) : t('recurring_tasks_refresh_button', {defaultValue:"Refresh Tasks"})}
            </Button>
            <Button onClick={openModalForCreate} leftIcon={<PlusCircle size={18}/>}>
            {t('add_new_task_button')}
            </Button>
        </div>
      </div>

      {notificationPermission === 'denied' && settings.notificationsEnabled && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 rounded-md flex items-center">
            <Bell size={20} className="mr-2"/>
            {t('notifications_denied_message')}
        </div>
      )}
       {notificationPermission === 'default' && settings.notificationsEnabled && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-md flex items-center">
            <Bell size={20} className="mr-2"/>
            {t('notifications_request_permission_message')}
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => Notification.requestPermission().then(setNotificationPermission)}>{t('notifications_enable_button')}</Button>
        </div>
      )}
      
      <div className="mb-6">
        <TaskCalendarView tasks={recurringTasks} />
      </div>

      {isLoading && recurringTasks.length === 0 && (
           <div className="text-center py-10">
              <Loader2 size={48} className="mx-auto text-primary animate-spin mb-4" />
              <p className="text-xl font-semibold text-text-light dark:text-text-dark">
                  {t('recurring_tasks_loading', {defaultValue: 'Loading Recurring Tasks...'})}
              </p>
          </div>
      )}
      
      <TaskList
        tasks={recurringTasks}
        airdrops={airdrops}
        onEdit={openModalForEdit}
        onDelete={handleDeleteTask}
        onComplete={handleCompleteTask}
      />


      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTask ? t('recurring_task_edit_title', {defaultValue:'Edit Recurring Task'}) : t('recurring_task_add_title', {defaultValue:'Add New Recurring Task'})}
        size="lg"
      >
        <TaskForm
          onSubmit={handleFormSubmit}
          initialData={editingTask}
          airdrops={airdrops}
          onClose={closeModal}
        />
      </Modal>
    </PageWrapper>
  );
};
