import React, { useState, useEffect, DragEvent } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader } from '../../design-system/components/Card';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Modal } from '../../design-system/components/Modal';
import { useTheme } from '../../hooks/useTheme';
import { useAppContext } from '../../contexts/AppContext';
import { Theme, AppSettings, WidgetKey, AirdropTemplate, AirdropTask, AirdropCardLayoutSettings, AirdropNotificationSettings, WidgetType, WidgetSize, DashboardWidgetConfig } from '../../types';
import { DataManagement } from './DataManagement';
import { Sun, Moon, Check, Palette, AlertTriangle, LayoutDashboard, Zap, ListChecks, MessageCircle, Type, PlusCircle, Edit3, Trash2, FileText, UserCircle, Settings as PageCogIcon, Tag, Percent, Brain, DollarSign, Download as InstallIcon, Languages, KeyRound, Webhook, GripVertical, Cloud, Share2 as ShareIcon, Users as UsersIcon } from 'lucide-react';
import { BLOCKCHAIN_OPTIONS, DEFAULT_SETTINGS, DEFAULT_AIRDROP_CARD_LAYOUT, DEFAULT_TRANSACTION_CATEGORIES, DEFAULT_AIRDROP_NOTIFICATION_SETTINGS } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../hooks/useToast';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDeferredInstallPrompt, clearDeferredInstallPrompt } from '../../App';

const TemplateTaskItem: React.FC<{ task: Omit<AirdropTask, 'id' | 'completed' | 'subTasks' | 'timeSpentMinutes' | 'notes' | 'cost' | 'linkedGasLogId' | 'completionDate' | 'dependsOnTaskIds'> & {tempId?: string}, onRemove: () => void }> = ({ task, onRemove }) => (
    <div className="flex items-center justify-between p-2 bg-background-dark/50 dark:bg-card-dark/60 rounded-lg text-sm">
        <span className="text-muted-dark truncate" title={task.description}>{task.description}</span>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14}/></Button>
    </div>
);

interface AirdropTemplateFormProps {
  onSubmit: (templateData: Omit<AirdropTemplate, 'id'> | AirdropTemplate) => Promise<void>; // Updated
  initialData?: AirdropTemplate;
  onClose: () => void;
}

const AirdropTemplateForm: React.FC<AirdropTemplateFormProps> = ({ onSubmit, initialData, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [blockchain, setBlockchain] = useState(initialData?.blockchain || '');
  const [tasks, setTasks] = useState<(Omit<AirdropTask, 'id' | 'completed' | 'subTasks' | 'timeSpentMinutes' | 'notes' | 'cost' | 'linkedGasLogId' | 'completionDate' | 'dependsOnTaskIds'> & {tempId?: string})[]>(
    initialData?.tasks.map(t => ({...t, tempId: crypto.randomUUID() })) || []
  );
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const handleAddTask = () => {
    if (newTaskDescription.trim()) {
      setTasks(prev => [...prev, { tempId: crypto.randomUUID(), description: newTaskDescription.trim() }]);
      setNewTaskDescription('');
    }
  };

  const handleRemoveTask = (tempIdToRemove?: string) => {
    if(!tempIdToRemove) return;
    setTasks(prev => prev.filter(task => task.tempId !== tempIdToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Template name is required.");
      return;
    }
    const finalTasks = tasks.map(({tempId, ...taskData}) => taskData);

    if (initialData?.id) {
      await onSubmit({ id: initialData.id, name, description, blockchain, tasks: finalTasks });
    } else {
      await onSubmit({ name, description, blockchain, tasks: finalTasks });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Input id="templateName" label="Template Name" value={name} onChange={e => setName(e.target.value)} required />
      <Textarea id="templateDescription" label="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
      <Select id="templateBlockchain" label="Default Blockchain (Optional)" value={blockchain} onChange={e => setBlockchain(e.target.value)} options={[{value: '', label:'Any/Not Set'}, ...BLOCKCHAIN_OPTIONS.map(b => ({value: b, label: b}))]} />

      <fieldset className="border border-gray-700/50 p-3 rounded-lg">
        <legend className="text-sm font-medium px-1 text-muted-dark">Tasks</legend>
        <div className="space-y-2 mb-2 max-h-48 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <TemplateTaskItem key={task.tempId} task={task} onRemove={() => handleRemoveTask(task.tempId)} />
          ))}
          {tasks.length === 0 && <p className="text-xs text-center text-muted-dark py-1">No tasks added yet.</p>}
        </div>
        <div className="flex items-center space-x-2">
          <Input id="newTemplateTask" placeholder="New task description" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} wrapperClassName="flex-grow mb-0" />
          <Button type="button" size="sm" variant="outline" onClick={handleAddTask} leftIcon={<PlusCircle size={16}/>}>Add Task</Button>
        </div>
      </fieldset>

      <div className="flex justify-end space-x-2 pt-2 sticky bottom-0 bg-card-dark py-3">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">{initialData ? 'Save Template' : 'Create Template'}</Button>
      </div>
    </form>
  );
};


export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { appData, updateSettings, addAirdropTemplate, updateAirdropTemplate, deleteAirdropTemplate, addCustomTransactionCategory, deleteCustomTransactionCategory } = useAppContext();
  const { t, setLanguage: i18nSetLanguage, currentLanguage, isLoading: isLangLoading } = useTranslation();
  const { addToast } = useToast();
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(appData.settings);
  const [notificationPermission, setNotificationPermission] = useState( typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AirdropTemplate | undefined>(undefined);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTaskKeyword, setNewTaskKeyword] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [widgetOrderState, setWidgetOrderState] = useState<WidgetKey[]>(appData.settings.dashboardWidgetOrder || DEFAULT_SETTINGS.dashboardWidgetOrder!);
  const [mockApiKey, setMockApiKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');


  const accentColorOptions = [
    { name: 'Indigo (Default)', value: '#4f46e5' }, // Original Tailwind primary
    { name: 'Compass Purple', value: '#885AF8' },   // New theme primary
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Sky Blue', value: '#0ea5e9' },
    { name: 'Orange', value: '#f97316' },
  ];
  const fontFamilyOptions = [
    { value: 'System Default', label: 'System Default' },
    { value: 'Inter', label: 'Inter' },
    { value: 'Manrope', label: 'Manrope' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
  ];

  const languageOptions = [
      { value: 'en', label: 'English (US)'},
      { value: 'es', label: 'Español (Spanish)'},
  ];

  const dashboardWidgetsConfigList: { key: WidgetKey; label: string; icon: React.ElementType }[] = [
    { key: 'summary', label: t('settings_widget_summary'), icon: LayoutDashboard },
    { key: 'userStats', label: t('settings_widget_user_stats'), icon: UserCircle },
    { key: 'aiDiscovery', label: t('settings_widget_ai_discovery'), icon: Brain },
    { key: 'gas', label: t('settings_widget_gas'), icon: Zap },
    { key: 'priorityTasks', label: t('settings_widget_priority_tasks'), icon: ListChecks },
    { key: 'alerts', label: t('settings_widget_alerts'), icon: MessageCircle },
  ];
  
  const getAvailableTypesForWidget = (key: WidgetKey): {value: WidgetType, label: string}[] => {
    switch(key) {
        case 'summary': return [
            {value: 'summary-standard', label: 'Standard Summary'}, 
            {value: 'summary-compact', label: 'Compact Summary'}
        ];
        case 'gas': return [
            {value: 'gas-chart', label: 'Gas Price Chart'}, 
            {value: 'gas-list', label: 'Gas Price List'}
        ];
        case 'priorityTasks': return [
            {value: 'tasks-detailed', label: 'Detailed Tasks'}, 
            {value: 'tasks-compact', label: 'Compact Tasks'}
        ];
        case 'alerts': return [{value: 'alerts', label: 'Alerts List'}];
        case 'userStats': return [{value: 'userStats', label: 'User Stats Card'}];
        case 'aiDiscovery': return [{value: 'aiDiscovery', label: 'AI Discovery Panel'}];
        default: 
            return [
                {value: 'summary-standard', label: 'Standard Summary'}, {value: 'summary-compact', label: 'Compact Summary'},
                {value: 'gas-chart', label: 'Gas Price Chart'}, {value: 'gas-list', label: 'Gas Price List'},
                {value: 'tasks-detailed', label: 'Detailed Tasks'}, {value: 'tasks-compact', label: 'Compact Tasks'},
                {value: 'alerts', label: 'Alerts List'}, {value: 'userStats', label: 'User Stats Card'},
                {value: 'aiDiscovery', label: 'AI Discovery Panel'},
            ];
    }
  };


  const widgetSizeOptions: {value: WidgetSize, label:string}[] = [
    {value: '1x1', label: 'Small Square (1x1)'},
    {value: '1x2', label: 'Wide Rectangle (1x2)'},
    {value: '2x1', label: 'Tall Rectangle (2x1)'},
    {value: '2x2', label: 'Large Square (2x2)'},
  ];


  useEffect(() => {
    if (
      JSON.stringify(currentSettings) !== JSON.stringify(appData.settings) ||
      JSON.stringify(widgetOrderState) !== JSON.stringify(appData.settings.dashboardWidgetOrder || DEFAULT_SETTINGS.dashboardWidgetOrder)
    ) {
      setCurrentSettings(appData.settings);
      setWidgetOrderState(appData.settings.dashboardWidgetOrder || DEFAULT_SETTINGS.dashboardWidgetOrder!);
    }
  }, [appData.settings]);

  useEffect(() => {
    if (location.state?.openTemplateModal) {
      openTemplateModal();
      navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const prompt = getDeferredInstallPrompt();
    if (prompt) {
      setCanInstallPWA(true);
    }
    const handleBeforeInstallPrompt = (event: Event) => {
        event.preventDefault();
        setCanInstallPWA(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);


  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().then(async permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          await updateSettings({ notificationsEnabled: true });
          addToast("Desktop notifications enabled.", "success");
        } else {
          addToast("Desktop notifications denied by browser.", "warning");
        }
      });
    } else if (enabled && typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        addToast("Notifications are blocked by your browser. Please enable them in browser settings.", "error");
        return;
    } else {
       await updateSettings({ notificationsEnabled: enabled });
       addToast(`Notifications ${enabled ? 'enabled' : 'disabled'}.`, "info");
    }
  };

  const handleDefaultAirdropNotificationToggle = async (key: keyof AirdropNotificationSettings, value: boolean) => {
    await updateSettings({
        defaultAirdropNotificationSettings: {
            ...(currentSettings.defaultAirdropNotificationSettings || DEFAULT_AIRDROP_NOTIFICATION_SETTINGS),
            [key]: value,
        }
    });
  };

  const handleTaskKeywordNotificationToggle = async (keyword: string, enabled: boolean) => {
    const currentKeywords = currentSettings.taskKeywordNotificationSettings || {};
    await updateSettings({
      taskKeywordNotificationSettings: { ...currentKeywords, [keyword]: enabled }
    });
  };

  const handleAddTaskKeyword = async () => {
    if (newTaskKeyword.trim()) {
      const keyword = newTaskKeyword.trim().toLowerCase();
      const currentKeywords = currentSettings.taskKeywordNotificationSettings || {};
      if (!currentKeywords.hasOwnProperty(keyword)) {
        await updateSettings({
          taskKeywordNotificationSettings: { ...currentKeywords, [keyword]: true }
        });
        addToast(`Keyword "${keyword}" added for task notifications.`, "success");
        setNewTaskKeyword('');
      } else {
        addToast(`Keyword "${keyword}" already exists.`, "warning");
      }
    }
  };

  const handleRemoveTaskKeyword = async (keyword: string) => {
    const currentKeywords = { ...(currentSettings.taskKeywordNotificationSettings || {}) };
    delete currentKeywords[keyword];
    await updateSettings({ taskKeywordNotificationSettings: currentKeywords });
    addToast(`Keyword "${keyword}" removed from task notifications.`, "success");
  };


  const handleGasNetworkChange = async (network: string) => {
    const currentNetworks = currentSettings.defaultGasNetworks || [];
    const newNetworks = currentNetworks.includes(network)
      ? currentNetworks.filter(n => n !== network)
      : [...currentNetworks, network];
    await updateSettings({ defaultGasNetworks: newNetworks });
  };

  const handleWidgetVisibilityChange = async (widgetKey: WidgetKey, isVisible: boolean) => {
    const defaultVisibility = DEFAULT_SETTINGS.dashboardWidgetVisibility || {
      summary: true, gas: true, priorityTasks: true, alerts: true, userStats: true, aiDiscovery: true
    };
    const mergedVisibility: Record<WidgetKey, boolean> = {
      ...defaultVisibility,
      ...(currentSettings.dashboardWidgetVisibility || {}),
      [widgetKey]: isVisible,
    };
    (Object.keys(defaultVisibility) as WidgetKey[]).forEach(key => {
      if (typeof mergedVisibility[key] !== 'boolean') {
        mergedVisibility[key] = defaultVisibility[key];
      }
    });
    await updateSettings({ dashboardWidgetVisibility: mergedVisibility });
  };

  const handleWidgetConfigChange = async (widgetKey: WidgetKey, newConfig: Partial<DashboardWidgetConfig>) => {
    const oldConfig = currentSettings.dashboardWidgetConfigs?.[widgetKey] || DEFAULT_SETTINGS.dashboardWidgetConfigs?.[widgetKey];
    const updatedConfig = { ...oldConfig, ...newConfig };
    const defaultConfigs = DEFAULT_SETTINGS.dashboardWidgetConfigs || {
      summary: { type: 'summary-standard', size: '2x1'},
      gas: { type: 'gas-list', size: '1x1' },
      priorityTasks: { type: 'tasks-detailed', size: '2x2'},
      alerts: { type: 'alerts', size: '1x1'},
      userStats: {type: 'userStats', size: '1x1'},
      aiDiscovery: {type: 'aiDiscovery', size: '1x1'},
    };
    const mergedConfigs: Record<WidgetKey, DashboardWidgetConfig> = {
      ...defaultConfigs,
      ...(currentSettings.dashboardWidgetConfigs || {}),
      [widgetKey]: updatedConfig
    };
    (Object.keys(defaultConfigs) as WidgetKey[]).forEach(key => {
      if (!mergedConfigs[key]) {
        mergedConfigs[key] = defaultConfigs[key];
      }
    });
    await updateSettings({ dashboardWidgetConfigs: mergedConfigs });
    addToast(`Widget '${widgetKey}' configuration updated.`, "info");
  };

  const handleAirdropCardLayoutChange = async (key: keyof AirdropCardLayoutSettings, value: boolean) => {
    await updateSettings({
        airdropCardLayout: {
            ...(currentSettings.airdropCardLayout || DEFAULT_AIRDROP_CARD_LAYOUT),
            [key]: value,
        }
    });
  };

  const handleFontFamilyChange = async (fontFamily: string) => {
    await updateSettings({ fontFamily });
    addToast("Font family updated.", "info");
  };

  const handleAccentColorChange = async (colorValue: string) => {
    await updateSettings({ accentColor: colorValue });
    addToast("Accent color updated.", "info");
  };

  const handleLanguageChange = async (langCode: string) => {
    await i18nSetLanguage(langCode);
    // updateSettings({ language: langCode }) is called within i18nSetLanguage's implementation (useAppContext)
    addToast(t('settings_language_updated_toast'), "success");
  };

  const resetSettings = async () => {
    if (window.confirm(t('settings_reset_confirm_message'))) {
        const newDefaultAccent = '#885AF8'; // New theme's purple
        await updateSettings({
            theme: DEFAULT_SETTINGS.theme, // Assuming dark is default for new theme
            defaultGasNetworks: DEFAULT_SETTINGS.defaultGasNetworks,
            notificationsEnabled: DEFAULT_SETTINGS.notificationsEnabled,
            dashboardWidgetVisibility: DEFAULT_SETTINGS.dashboardWidgetVisibility,
            dashboardWidgetOrder: DEFAULT_SETTINGS.dashboardWidgetOrder,
            dashboardWidgetConfigs: DEFAULT_SETTINGS.dashboardWidgetConfigs,
            taskKeywordNotificationSettings: DEFAULT_SETTINGS.taskKeywordNotificationSettings,
            language: DEFAULT_SETTINGS.language,
            fontFamily: 'Inter', // New default font
            airdropCardLayout: DEFAULT_AIRDROP_CARD_LAYOUT,
            customTransactionCategories: [...DEFAULT_TRANSACTION_CATEGORIES],
            defaultAirdropNotificationSettings: DEFAULT_SETTINGS.defaultAirdropNotificationSettings,
            accentColor: newDefaultAccent, 
            currentStreak: DEFAULT_SETTINGS.currentStreak,
            lastTaskCompletionDate: DEFAULT_SETTINGS.lastTaskCompletionDate,
        });
        
        document.documentElement.classList.add('dark'); // Enforce dark if that's the new default
        localStorage.setItem('theme', Theme.DARK); // Enforce dark if that's the new default
        
        setWidgetOrderState(DEFAULT_SETTINGS.dashboardWidgetOrder!);
        await i18nSetLanguage(DEFAULT_SETTINGS.language || 'en');
        addToast(t('settings_reset_success_toast'), "success");
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
        const currentCategories = currentSettings.customTransactionCategories || [];
        if (currentCategories.map(c=>c.toLowerCase()).includes(newCategoryName.trim().toLowerCase())) {
            addToast(t('settings_category_exists_toast', {category: newCategoryName.trim()}), 'warning');
        } else {
            await addCustomTransactionCategory(newCategoryName.trim());
            addToast(t('settings_category_added_toast', {category: newCategoryName.trim()}), 'success');
            setNewCategoryName('');
        }
    }
  };
  const handleDeleteCategory = async (category: string) => {
    if(window.confirm(t('settings_category_delete_confirm', {category}))){
        await deleteCustomTransactionCategory(category);
        addToast(t('settings_category_deleted_toast', {category}), 'success');
    }
  };

  const airdropCardLayoutOptions: { key: keyof AirdropCardLayoutSettings; label: string; icon: React.ElementType }[] = [
    { key: 'showTags', label: t('settings_card_opt_showTags'), icon: Tag },
    { key: 'showDescriptionSnippet', label: t('settings_card_opt_show_desc'), icon: FileText },
    { key: 'showPriority', label: t('settings_card_opt_show_priority'), icon: AlertTriangle },
    { key: 'showMyStatus', label: t('settings_card_opt_show_my_status'), icon: UserCircle },
    { key: 'showOfficialStatus', label: t('settings_card_opt_show_official_status'), icon: Check },
    { key: 'showPotential', label: t('settings_card_opt_show_potential'), icon: DollarSign },
    { key: 'showProgressBar', label: t('settings_card_opt_show_progress'), icon: Percent },
  ];

  const openTemplateModal = (template?: AirdropTemplate) => {
    setEditingTemplate(template);
    setIsTemplateModalOpen(true);
  };

  const handleTemplateSubmit = async (templateData: Omit<AirdropTemplate, 'id'> | AirdropTemplate) => {
    if ('id' in templateData) {
      await updateAirdropTemplate(templateData as AirdropTemplate);
      addToast(t('settings_template_updated_toast'), 'success');
    } else {
      await addAirdropTemplate(templateData as Omit<AirdropTemplate, 'id'>);
      addToast(t('settings_template_created_toast'), 'success');
    }
    setIsTemplateModalOpen(false);
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if(window.confirm(t('settings_template_delete_confirm', {templateName}))){
        await deleteAirdropTemplate(templateId);
        addToast(t('settings_template_deleted_toast', {templateName}), 'success');
    }
  };

  const handleInstallPWA = async () => {
    const promptEvent = getDeferredInstallPrompt();
    if (!promptEvent) {
      addToast("App cannot be installed right now. You might have already installed it, or your browser doesn't support this method. Try your browser's 'Add to Home Screen' or 'Install App' option.", "info");
      return;
    }
    (promptEvent as any).prompt();
    const { outcome } = await (promptEvent as any).userChoice;
    if (outcome === 'accepted') {
      addToast('Airdrop Compass installed!', 'success');
    } else {
      addToast('Installation dismissed.', 'info');
    }
    clearDeferredInstallPrompt();
    setCanInstallPWA(false);
  };

  const handleWidgetDragStart = (e: DragEvent<HTMLDivElement>, key: WidgetKey) => {
    e.dataTransfer.setData('widgetKey', key);
  };
  const handleWidgetDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleWidgetDrop = async (e: DragEvent<HTMLDivElement>, targetKey: WidgetKey) => {
    e.preventDefault();
    const sourceKey = e.dataTransfer.getData('widgetKey') as WidgetKey;

    if (sourceKey && sourceKey !== targetKey) {
      const currentOrder = [...widgetOrderState];
      const sourceIndex = currentOrder.indexOf(sourceKey);
      const targetIndex = currentOrder.indexOf(targetKey);

      currentOrder.splice(sourceIndex, 1);
      currentOrder.splice(targetIndex, 0, sourceKey);

      setWidgetOrderState(currentOrder);
      await updateSettings({ dashboardWidgetOrder: currentOrder });
      addToast("Widget order updated.", "success");
    }
  };

  const handleGenerateApiKey = () => {
    setMockApiKey(`compass_mock_api_key_${crypto.randomUUID().substring(0,16)}`);
    addToast("Mock API Key generated (conceptual).", "info");
  }

  const handleAddWebhook = () => {
    if (!webhookUrl.trim()) {
      addToast("Webhook URL cannot be empty.", "warning");
      return;
    }
    addToast(`Conceptual Webhook to ${webhookUrl} 'added'.`, "success");
    setWebhookUrl('');
  }


  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <PageCogIcon size={28} className="mr-3 text-[var(--color-text-primary)]" />
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{t('settings_title')}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Appearance</h3></CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">{t('theme_label')}</span>
                <div className="flex items-center">
                    <Sun size={18} className={`mr-2 ${theme === 'light' ? 'text-yellow-500' : 'text-[var(--color-text-tertiary)]'}`} />
                    <ToggleSwitch id="theme-toggle-settings" checked={theme === 'dark'} onChange={toggleTheme} srLabel="Toggle dark mode" />
                    <Moon size={18} className={`ml-2 ${theme === 'dark' ? 'text-blue-400' : 'text-[var(--color-text-tertiary)]'}`} />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <label htmlFor="font-family-select" className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center"><Type size={16} className="mr-1.5"/>{t('settings_font_family_label')}</label>
                <Select id="font-family-select" value={currentSettings.fontFamily || 'System Default'} onChange={(e) => handleFontFamilyChange(e.target.value)} options={fontFamilyOptions} wrapperClassName="mb-0 w-1/2 sm:w-auto" />
            </div>
             <div>
                <label htmlFor="accent-color-select" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1 flex items-center">
                    <Palette size={16} className="mr-1.5"/>{t('settings_accent_color_label')}
                </label>
                <div className="flex flex-wrap gap-2">
                    {accentColorOptions.map(color => (
                        <button
                            key={color.value}
                            title={color.name}
                            onClick={() => handleAccentColorChange(color.value)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${currentSettings.accentColor === color.value ? 'ring-2 ring-offset-2 dark:ring-offset-card-dark ring-white' : 'border-gray-700/50'}`}
                            style={{ backgroundColor: color.value }}
                            aria-label={`Set accent color to ${color.name}`}
                        />
                    ))}
                </div>
            </div>
            <div className="pt-3 border-t dark:border-gray-700/50">
                <label htmlFor="language-select" className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center"><Languages size={16} className="mr-1.5"/>{t('settings_language_label')}</label>
                <Select
                    id="language-select"
                    value={currentLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    options={languageOptions}
                    wrapperClassName="mb-0 mt-1"
                    disabled={isLangLoading}
                />
                {isLangLoading && <p className="text-xs text-[var(--color-text-secondary)] mt-1">Loading translations...</p>}
            </div>
          </div>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Notifications</h3></CardHeader>
          <div className="space-y-3">
              <ToggleSwitch
                  id="notificationsEnabled"
                  label={t('settings_enable_reminders')}
                  checked={currentSettings.notificationsEnabled || false}
                  onChange={handleNotificationToggle}
              />
              {currentSettings.notificationsEnabled && notificationPermission === 'denied' && (
                  <p className="text-xs text-red-400">{t('settings_notifications_blocked')}</p>
              )}
              {currentSettings.notificationsEnabled && notificationPermission === 'default' && (
                  <p className="text-xs text-yellow-400">{t('settings_notifications_request_permission')}</p>
              )}
              <div className="pt-2 border-t dark:border-gray-700/50">
                <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1">Default Airdrop Notifications:</h4>
                <ToggleSwitch
                  id="defaultAirdropTaskDueDateNotif"
                  label="Notify for Task Due Dates"
                  checked={currentSettings.defaultAirdropNotificationSettings?.taskDueDate ?? DEFAULT_AIRDROP_NOTIFICATION_SETTINGS.taskDueDate}
                  onChange={(checked) => handleDefaultAirdropNotificationToggle('taskDueDate', checked)}
                />
                <div className="mt-2">
                  <ToggleSwitch
                      id="defaultAirdropStatusChangeNotif"
                      label="Notify for Airdrop Status Changes"
                      checked={currentSettings.defaultAirdropNotificationSettings?.statusChange ?? DEFAULT_AIRDROP_NOTIFICATION_SETTINGS.statusChange}
                      onChange={(checked) => handleDefaultAirdropNotificationToggle('statusChange', checked)}
                  />
                </div>
              </div>
               <div className="pt-2 border-t dark:border-gray-700/50">
                <h4 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Task Keyword Notifications:</h4>
                 <p className="text-xs text-[var(--color-text-secondary)] mb-2">Enable notifications if these keywords appear in task descriptions (conceptual).</p>
                <div className="flex items-center space-x-2 mb-2">
                  <Input id="newTaskKeyword" placeholder="e.g., urgent, snapshot" value={newTaskKeyword} onChange={e=>setNewTaskKeyword(e.target.value)} wrapperClassName="flex-grow mb-0"/>
                  <Button size="sm" variant="outline" onClick={handleAddTaskKeyword} leftIcon={<PlusCircle size={16}/>}>Add Keyword</Button>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {Object.entries(currentSettings.taskKeywordNotificationSettings || {}).map(([keyword, enabled]) => (
                      <div key={keyword} className="flex items-center justify-between p-1.5 bg-card-dark/60 rounded-md">
                          <span className="text-xs text-[var(--color-text-secondary)]">{keyword}</span>
                          <div className="flex items-center">
                              <ToggleSwitch id={`task-keyword-${keyword}`} checked={enabled} onChange={(checked) => handleTaskKeywordNotificationToggle(keyword, checked)} srLabel={`Toggle notifications for keyword ${keyword}`}/>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveTaskKeyword(keyword)} className="text-red-400 hover:text-red-300 p-0.5 ml-1.5" title="Remove Keyword"><Trash2 size={12}/></Button>
                          </div>
                      </div>
                  ))}
                   {Object.keys(currentSettings.taskKeywordNotificationSettings || {}).length === 0 && <p className="text-xs text-center text-[var(--color-text-secondary)] py-1">No keywords added.</p>}
                </div>
              </div>
          </div>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Application Installation</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">
              Install this application to your device for easier access, like a native app.
          </p>
          <Button onClick={handleInstallPWA} leftIcon={<InstallIcon size={16} />} disabled={!canInstallPWA}>
              {canInstallPWA ? 'Install App / Add to Home Screen' : 'App Installed or Prompt Unavailable'}
          </Button>
          {!canInstallPWA && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  If the button is disabled, you may have already installed the app, or your browser doesn't support direct installation via this button. Try your browser's "Add to Home Screen" or "Install App" menu option.
              </p>
          )}
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Card Display</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{t('settings_card_display_desc')}</p>
          <div className="space-y-3">
             {airdropCardLayoutOptions.map(opt => (
                 <ToggleSwitch
                     key={opt.key}
                     id={`card-layout-${opt.key}`}
                     label={opt.label}
                     checked={currentSettings.airdropCardLayout?.[opt.key] ?? DEFAULT_AIRDROP_CARD_LAYOUT[opt.key]}
                     onChange={(checked) => handleAirdropCardLayoutChange(opt.key, checked)}
                 />
             ))}
         </div>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Dashboard Widgets</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{t('settings_dashboard_widgets_desc')}</p>
          <div className="space-y-3">
            {dashboardWidgetsConfigList.map(widget => (
              <ToggleSwitch
                key={widget.key}
                id={`widget-toggle-${widget.key}`}
                label={widget.label}
                checked={currentSettings.dashboardWidgetVisibility?.[widget.key] ?? DEFAULT_SETTINGS.dashboardWidgetVisibility![widget.key]}
                onChange={(checked) => handleWidgetVisibilityChange(widget.key, checked)}
              />
            ))}
          </div>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Dashboard Widget Order & Appearance</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">Drag and drop to reorder. Configure type and size.</p>
          <div className="space-y-3">
              {widgetOrderState.map(widgetKey => {
                  const widgetDisplayConfig = dashboardWidgetsConfigList.find(w => w.key === widgetKey);
                  const currentWidgetCustomConfig = currentSettings.dashboardWidgetConfigs?.[widgetKey] || DEFAULT_SETTINGS.dashboardWidgetConfigs![widgetKey];
                  if (!widgetDisplayConfig) return null;
                  const isVisible = currentSettings.dashboardWidgetVisibility?.[widgetKey] ?? DEFAULT_SETTINGS.dashboardWidgetVisibility![widgetKey];
                  return (
                      <div key={`display-${widgetKey}`} className={`p-3 border border-gray-700/50 rounded-lg ${isVisible ? 'bg-card-dark/70' : 'bg-card-dark/40 opacity-60'}`}>
                          <div
                              draggable={isVisible} 
                              onDragStart={(e) => isVisible && handleWidgetDragStart(e, widgetKey)}
                              onDragOver={handleWidgetDragOver}
                              onDrop={(e) => handleWidgetDrop(e, widgetKey)}
                              className={`flex items-center justify-between ${isVisible ? 'cursor-grab' : 'cursor-not-allowed'}`}
                          >
                              <div className="flex items-center">
                                  {isVisible && <GripVertical size={16} className="mr-2 text-[var(--color-text-secondary)]"/>}
                                  <widgetDisplayConfig.icon size={16} className="mr-2 text-[var(--color-text-secondary)]" />
                                  <span className={`text-sm text-[var(--color-text-primary)] ${!isVisible ? 'line-through text-[var(--color-text-secondary)]' : ''}`}>{widgetDisplayConfig.label}</span>
                              </div>
                              {!isVisible && <span className="text-xs text-red-400">Hidden</span>}
                          </div>
                           {isVisible && (
                              <div className="mt-2 pt-2 border-t dark:border-gray-700/50 grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                      <label htmlFor={`widget-type-${widgetKey}`} className="block text-xs font-medium text-[var(--color-text-secondary)] mb-0.5">Type:</label>
                                      <Select
                                          id={`widget-type-${widgetKey}`}
                                          value={currentWidgetCustomConfig.type}
                                          onChange={(e) => handleWidgetConfigChange(widgetKey, { type: e.target.value as WidgetType })}
                                          options={getAvailableTypesForWidget(widgetKey)}
                                          className="h-8 text-xs py-1"
                                          wrapperClassName="mb-0"
                                      />
                                  </div>
                                  <div>
                                      <label htmlFor={`widget-size-${widgetKey}`} className="block text-xs font-medium text-[var(--color-text-secondary)] mb-0.5">Size:</label>
                                      <Select
                                          id={`widget-size-${widgetKey}`}
                                          value={currentWidgetCustomConfig.size}
                                          onChange={(e) => handleWidgetConfigChange(widgetKey, { size: e.target.value as WidgetSize })}
                                          options={widgetSizeOptions}
                                          className="h-8 text-xs py-1"
                                          wrapperClassName="mb-0"
                                      />
                                  </div>
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
        </Card>


        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Gas Tracker</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{t('settings_gas_tracker_desc')}</p>
          <div className="grid grid-cols-2 gap-3">
             {BLOCKCHAIN_OPTIONS.slice(0, 8).map(network => ( 
                 <ToggleSwitch
                     key={network}
                     id={`gas-network-${network.replace(/\s+/g, '-')}`}
                     label={network}
                     checked={(currentSettings.defaultGasNetworks || []).includes(network)}
                     onChange={() => handleGasNetworkChange(network)}
                 />
             ))}
         </div>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Transaction Categories</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">{t('settings_tx_categories_desc')}</p>
          <div className="flex items-center space-x-2 mb-3">
              <Input id="newCategoryName" placeholder={t('settings_new_category_placeholder')} value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} wrapperClassName="flex-grow mb-0" />
              <Button size="sm" variant="outline" onClick={handleAddCategory} leftIcon={<PlusCircle size={16}/>}>{t('settings_add_category_button')}</Button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {(currentSettings.customTransactionCategories || DEFAULT_TRANSACTION_CATEGORIES).sort().map(cat => (
                  <div key={cat} className="flex items-center justify-between p-1.5 bg-card-dark/60 rounded-md text-xs">
                      <span className="text-[var(--color-text-secondary)]">{cat}</span>
                      {!DEFAULT_TRANSACTION_CATEGORIES.map(dc => dc.toLowerCase()).includes(cat.toLowerCase()) && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(cat)} className="text-red-400 hover:text-red-300 p-0.5" title="Delete Category"><Trash2 size={12}/></Button>
                      )}
                  </div>
              ))}
              {(currentSettings.customTransactionCategories || []).length === 0 && <p className="text-xs text-center text-[var(--color-text-secondary)] py-1">{t('settings_no_custom_categories')}</p>}
          </div>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><h3 className="text-lg font-semibold">Airdrop Templates</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-2">{t('settings_airdrop_templates_desc')}</p>
          <Button size="sm" onClick={() => openTemplateModal()} leftIcon={<PlusCircle size={16} />} className="mb-3">
              {t('settings_create_template_button')}
          </Button>
          {(appData.airdropTemplates || []).length === 0 ? (
              <p className="text-[var(--color-text-secondary)]">{t('settings_no_templates_message')}</p>
          ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(appData.airdropTemplates || []).map(template => (
                      <div key={template.id} className="p-3 border border-gray-700/50 rounded-lg bg-card-dark/70">
                          <div className="flex justify-between items-start">
                              <div>
                                  <h5 className="font-semibold text-[var(--color-text-primary)]">{template.name}</h5>
                                  <p className="text-xs text-[var(--color-text-secondary)]">{template.tasks.length} task(s){template.blockchain && ` | Default Chain: ${template.blockchain}`}</p>
                                  {template.description && <p className="text-xs italic text-[var(--color-text-secondary)]/80 mt-0.5 line-clamp-2" title={template.description}>{template.description}</p>}
                              </div>
                              <div className="flex space-x-1 flex-shrink-0">
                                  <Button variant="ghost" size="sm" onClick={() => openTemplateModal(template)} title="Edit Template" className="text-[var(--color-text-primary)] hover:text-[var(--color-text-primary)]"><Edit3 size={14}/></Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id, template.name)} className="text-red-400 hover:text-red-300" title="Delete Template"><Trash2 size={14}/></Button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">API & Webhooks</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{t('settings_api_webhooks_desc')}</p>
          <div className="space-y-3">
              <div>
                  <Button onClick={handleGenerateApiKey} leftIcon={<KeyRound size={16}/>} variant="outline" size="sm">Generate Mock API Key</Button>
                  {mockApiKey && <Input readOnly value={mockApiKey} wrapperClassName="mt-2 mb-0" />}
              </div>
              <div>
                   <label htmlFor="webhook-url" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-0.5">Webhook URL (Conceptual):</label>
                  <div className="flex items-center space-x-2">
                      <Input id="webhook-url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://yourserver.com/webhook" wrapperClassName="flex-grow mb-0" />
                      <Button size="sm" variant="outline" onClick={handleAddWebhook} leftIcon={<Webhook size={16}/>}>Add</Button>
                  </div>
              </div>
          </div>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Cloud Sync & Backup (Conceptual)</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">Securely sync or backup your data to a cloud service. This is a UI placeholder; no actual connections are made.</p>
           <div className="space-y-3">
              <Button variant="outline" leftIcon={<Cloud size={16}/>} disabled>Connect Google Drive (Conceptual)</Button>
              <Button variant="outline" leftIcon={<Cloud size={16}/>} disabled>Connect Dropbox (Conceptual)</Button>
              <Select label="Sync Frequency (Conceptual)" options={[{value:'manual', label:'Manual Only'}, {value:'daily', label:'Daily'}, {value:'weekly', label:'Weekly'}]} disabled wrapperClassName="mb-0"/>
              <Button variant="primary" leftIcon={<ShareIcon size={16}/>} disabled>Sync Now (Conceptual)</Button>
          </div>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader><h3 className="text-lg font-semibold">Collaboration (Conceptual)</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">Share watchlists or specific airdrop data with friends or a team (conceptual).</p>
           <div className="space-y-3">
              <Input label="Share Watchlist with User Email (Conceptual):" placeholder="friend@example.com" disabled wrapperClassName="mb-0"/>
              <Button variant="outline" leftIcon={<UsersIcon size={16}/>} disabled>Invite Friend (Conceptual)</Button>
               <ToggleSwitch id="publicProfileToggle" label="Make Profile Public (Conceptual)" checked={false} onChange={()=>{}} disabled/>
          </div>
        </Card>

        <DataManagement />

        <Card className="md:col-span-2">
          <CardHeader><h3 className="text-lg font-semibold">Reset Settings</h3></CardHeader>
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">{t('settings_reset_desc')}</p>
          <Button variant="danger" onClick={resetSettings} leftIcon={<AlertTriangle size={16}/>}>
              {t('settings_reset_button')}
          </Button>
        </Card>
      </div>

      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title={editingTemplate ? t('settings_edit_template_title') : t('settings_create_template_title')} size="lg">
        <AirdropTemplateForm onSubmit={handleTemplateSubmit} initialData={editingTemplate} onClose={() => setIsTemplateModalOpen(false)} />
      </Modal>
    </PageWrapper>
  );
};