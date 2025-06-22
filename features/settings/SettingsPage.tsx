import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import { AppSettings, Theme } from '../../types';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Shield, 
  Database, 
  Download, 
  Upload, 
  Trash2,
  Eye,
  EyeOff,
  Brain,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Save,
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { DEFAULT_SETTINGS } from '../../constants';
import { testOllamaConnection } from '../../utils/aiService';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { currentUser } = useAuthStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'ai' | 'privacy' | 'data'>('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<{
    available: boolean;
    models: string[];
    error?: string;
  }>({ available: false, models: [] });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Check Ollama availability on component mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const result = await testOllamaConnection();
      setOllamaStatus({
        available: result.success,
        models: result.models || [],
        error: result.error
      });
      
      if (result.success && settings.aiProvider !== 'ollama') {
        // Auto-switch to Ollama if it's available and not currently selected
        updateSettings({ aiProvider: 'ollama' });
        addToast('Ollama detected and automatically selected', 'success');
      }
    } catch (error) {
      setOllamaStatus({
        available: false,
        models: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const handleSettingChange = async (key: keyof AppSettings, value: any) => {
    try {
      await updateSettings({ [key]: value });
      addToast('Setting updated successfully.', 'success');
    } catch (error) {
      addToast('Failed to update setting.', 'error');
    }
  };

  const handleExportData = () => {
    const data = {
      settings,
      user: currentUser,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crypto-compass-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addToast('Settings exported successfully.', 'success');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          await updateSettings(data.settings);
          addToast('Settings imported successfully.', 'success');
        }
      } catch (error) {
        addToast('Failed to import settings. Invalid file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      try {
        await resetSettings();
        addToast('Settings reset to default successfully.', 'success');
      } catch (error) {
        addToast('Failed to reset settings.', 'error');
      }
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings(settings);
      addToast('Settings saved successfully', 'success');
    } catch (error) {
      addToast('Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'airdrop-compass-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    addToast('Settings exported successfully', 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        updateSettings(importedSettings);
        addToast('Settings imported successfully', 'success');
      } catch (error) {
        addToast('Failed to import settings: Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Settings', icon: Brain },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database }
  ] as const;

  const aiProviders = [
    { value: 'ollama', label: 'Ollama (Local)' },
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'deepseek', label: 'DeepSeek' }
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'System' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' }
  ];

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <SettingsIcon size={24} className="text-accent" />
              Settings
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Customize your experience and manage your preferences.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="default" padding="md">
              <CardContent>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-accent text-accent-foreground'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card variant="default" padding="lg">
              <CardContent>
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold">General Settings</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Theme
                        </label>
                        <Select
                          value={settings.theme}
                          onValueChange={(value) => handleSettingChange('theme', value)}
                          options={themes}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) => handleSettingChange('language', value)}
                          options={languages}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable browser notifications
                          </p>
                        </div>
                        <ToggleSwitch
                          id="notifications-enabled"
                          checked={settings.notificationsEnabled}
                          onChange={(checked) => handleSettingChange('notificationsEnabled', checked)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold">Notification Settings</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Task Due Date Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Get notified about upcoming task deadlines
                          </p>
                        </div>
                        <ToggleSwitch
                          id="task-due-date-notifications"
                          checked={settings.defaultAirdropNotificationSettings.taskDueDate}
                          onChange={(checked) => handleSettingChange('defaultAirdropNotificationSettings', { ...settings.defaultAirdropNotificationSettings, taskDueDate: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status Change Notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Get notified about airdrop status changes
                          </p>
                        </div>
                        <ToggleSwitch
                          id="status-change-notifications"
                          checked={settings.defaultAirdropNotificationSettings.statusChange}
                          onChange={(checked) => handleSettingChange('defaultAirdropNotificationSettings', { ...settings.defaultAirdropNotificationSettings, statusChange: checked })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold">AI Settings</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          AI Provider
                        </label>
                        <Select
                          value={settings.aiProvider || 'ollama'}
                          onValueChange={(value) => handleSettingChange('aiProvider', value)}
                          options={aiProviders}
                        />
                      </div>

                      {/* Ollama Status */}
                      {settings.aiProvider === 'ollama' && (
                        <div className="p-3 rounded-lg border">
                          <div className="flex items-center space-x-2 mb-2">
                            {ollamaStatus.available ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              Ollama Status: {ollamaStatus.available ? 'Available' : 'Not Available'}
                            </span>
                          </div>
                          
                          {ollamaStatus.available && ollamaStatus.models.length > 0 && (
                            <div className="space-y-3">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Available models: {ollamaStatus.models.join(', ')}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Select Model
                                </label>
                                <Select
                                  value={settings.aiModel || 'auto'}
                                  onValueChange={(value) => handleSettingChange('aiModel', value)}
                                  options={[
                                    { value: 'auto', label: 'Auto-select (Recommended)' },
                                    ...ollamaStatus.models.map(model => ({ value: model, label: model }))
                                  ]}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Auto-select will choose the best available model automatically
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {ollamaStatus.error && (
                            <div className="text-sm text-red-600 dark:text-red-400">
                              Error: {ollamaStatus.error}
                            </div>
                          )}
                          
                          <Button
                            onClick={checkOllamaStatus}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            Check Status
                          </Button>
                        </div>
                      )}

                      {/* API Key Input - Only show for non-Ollama providers */}
                      {settings.aiProvider !== 'ollama' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <Key className="h-4 w-4 inline mr-1" />
                            API Key
                          </label>
                          <Input
                            type="password"
                            value={settings.aiApiKey || ''}
                            onChange={(e) => handleSettingChange('aiApiKey', e.target.value)}
                            placeholder="Enter your API key"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold">Privacy Settings</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Analytics
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Allow anonymous usage analytics
                          </p>
                        </div>
                        <ToggleSwitch
                          id="analytics-enabled"
                          checked={false}
                          onChange={() => {
                            // Handle analytics toggle
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Data Sharing
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Share data for research purposes
                          </p>
                        </div>
                        <ToggleSwitch
                          id="data-sharing-enabled"
                          checked={false}
                          onChange={() => {
                            // Handle data sharing toggle
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold">Data Management</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={handleExport}
                          leftIcon={<Download size={16} />}
                        >
                          Export Settings
                        </Button>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Button
                            variant="outline"
                            leftIcon={<Upload size={16} />}
                          >
                            Import Settings
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          onClick={handleResetSettings}
                          leftIcon={<Trash2 size={16} />}
                          className="text-red-600 hover:text-red-700"
                        >
                          Reset All Settings
                        </Button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          This will reset all settings to their default values. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};