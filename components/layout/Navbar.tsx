import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useUserAlertStore } from '../../stores/userAlertStore';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../../design-system/components/Button';
import { NotificationBell } from '../notifications/NotificationBell';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { CommandPaletteModal } from '../ui/CommandPaletteModal';
import { Theme } from '../../types';
import { 
  Menu, 
  Search, 
  Command, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  X
} from 'lucide-react';

const Navbar: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const { currentUser, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { settings, updateSettings } = useSettingsStore();
  const { userAlerts } = useUserAlertStore();
  const { addToast } = useToast();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
    updateSettings({ theme: newTheme });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setShowGlobalSearch(true);
    }
    if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setShowCommandPalette(true);
    }
  };

  // Mock data for modals - these would need to be properly implemented
  const mockAppData = {
    wallets: [],
    airdrops: [],
    recurringTasks: [],
    learningResources: [],
    strategyNotes: [],
    userAlerts: userAlerts,
    settings: settings,
    watchlist: [],
    airdropTemplates: [],
    yieldPositions: [],
    userBadges: [],
    savedAiStrategies: []
  };

  const mockCommands = [
    {
      id: 'search',
      name: 'Search',
      category: 'Navigation',
      action: () => setShowGlobalSearch(true)
    },
    {
      id: 'settings',
      name: 'Settings',
      category: 'Navigation',
      action: () => window.location.href = '/settings'
    }
  ];

  return (
    <>
      <nav 
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between relative"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden p-1 sm:p-2"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {t('app_name', { defaultValue: 'Crypto Airdrop Compass' })}
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {/* Global Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGlobalSearch(true)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden xl:inline-flex items-center rounded border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 text-xs font-mono text-gray-500 dark:text-gray-400">
              ⌘K
            </kbd>
          </Button>

          {/* Command Palette Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Command className="h-4 w-4" />
            <span className="hidden lg:inline">Commands</span>
            <kbd className="hidden xl:inline-flex items-center rounded border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 text-xs font-mono text-gray-500 dark:text-gray-400">
              ⌘P
            </kbd>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1 sm:p-2"
          >
            {settings.theme === Theme.DARK ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notifications */}
          <NotificationBell onTogglePanel={() => setShowNotifications(!showNotifications)} />

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline truncate max-w-24 lg:max-w-32">
                {currentUser?.username || currentUser?.email}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-medium truncate">{currentUser?.username || 'User'}</div>
                  <div className="text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to profile page
                  }}
                  className="w-full justify-start text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUserMenu(false);
                    // Navigate to settings page
                  }}
                  className="w-full justify-start text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-1"
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50 md:hidden">
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowGlobalSearch(true);
                  setShowMobileMenu(false);
                }}
                className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              {/* Mobile Commands */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCommandPalette(true);
                  setShowMobileMenu(false);
                }}
                className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Command className="h-4 w-4 mr-2" />
                Commands
              </Button>

              {/* Mobile Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {settings.theme === Theme.DARK ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {settings.theme === Theme.DARK ? 'Light Mode' : 'Dark Mode'}
              </Button>

              {/* Mobile User Info */}
              <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="font-medium truncate">{currentUser?.username || 'User'}</div>
                <div className="text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</div>
              </div>

              {/* Mobile User Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMobileMenu(false);
                  // Navigate to profile page
                }}
                className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMobileMenu(false);
                  // Navigate to settings page
                }}
                className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        searchTerm=""
        onResultClick={() => {}}
        appData={mockAppData}
      />

      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={mockCommands}
      />
    </>
  );
};

export default Navbar;
