import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { StoreProvider } from './stores/StoreProvider';
import { Sidebar } from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import { ToastContainer } from './components/ui/ToastContainer';
import { GlobalSearchModal } from './components/ui/GlobalSearchModal';
import { CommandPaletteModal } from './components/ui/CommandPaletteModal';
import { AIChatbotModal } from './components/ai/AIChatbotModal';
import DashboardPage from './features/dashboard/DashboardPage';
import { AirdropListPage } from './features/airdrops/AirdropListPage';
import { AirdropDetailPage } from './features/airdrops/AirdropDetailPage';
import { RecurringTasksPage } from './features/tasks/RecurringTasksPage';
import { LearningPage } from './features/learning/LearningPage';
import { SybilPreventionGuidePage } from './features/learning/SybilPreventionGuide';
import { AIStrategyPage } from './features/ai/AIStrategyPage';
import { AIAnalystPage } from './features/ai/AIAnalystPage';
import { WalletManagerPage } from './features/wallets/WalletManagerPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AutomationSettingsPage } from './features/settings/AutomationSettingsPage';
import { DesignSystemShowcase } from './features/settings/DesignSystemShowcase';
import { PortfolioPage } from './features/portfolio/PortfolioPage';
import { WatchlistPage } from './features/watchlist/WatchlistPage';
import { YieldTrackerPage } from './features/yield/YieldTrackerPage';
import { AchievementsPage } from './features/achievements/AchievementsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { AnalyticsHubPage } from './features/analytics/AnalyticsHubPage';
import { AggregatorPage } from './features/tools/AggregatorPage';
import { NotificationCenterPage } from './features/notifications/NotificationCenterPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserProfilePage } from './features/profile/UserProfilePage';
import HelpPage from './features/help/HelpPage';
import { NAVIGATION_ITEMS, LEARNING_HUB_SUB_NAV, DEFAULT_SETTINGS } from './constants';
import { SearchResultItem, Command } from './types';
import { useTranslation } from './hooks/useTranslation';
import { useTheme } from './contexts/ThemeContext';
import { Button } from './design-system/components/Button';
import { PlusCircle, Cog as AutomationIcon, X as DismissIcon, MessageSquare, Search as SearchIcon, Palette, FileText } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { useWalletStore } from './stores/walletStore';
import { useAirdropStore } from './stores/airdropStore';
import { useRecurringTaskStore } from './stores/recurringTaskStore';
import { useLearningResourceStore } from './stores/learningResourceStore';
import { useStrategyNoteStore } from './stores/strategyNoteStore';
import { useUserAlertStore } from './stores/userAlertStore';
import { useSettingsStore } from './stores/settingsStore';
import { useWatchlistStore } from './stores/watchlistStore';
import { useAirdropTemplateStore } from './stores/airdropTemplateStore';
import { useYieldPositionStore } from './stores/yieldPositionStore';
import { useAiStrategyStore } from './stores/aiStrategyStore';

let deferredInstallPrompt: Event | null = null;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  window.dispatchEvent(new CustomEvent('pwaInstallReady', { detail: event }));
});

export function getDeferredInstallPrompt(): Event | null {
    return deferredInstallPrompt;
}
export function clearDeferredInstallPrompt(): void {
    deferredInstallPrompt = null;
}

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { wallets } = useWalletStore();
  const { airdrops } = useAirdropStore();
  const { recurringTasks } = useRecurringTaskStore();
  const { learningResources } = useLearningResourceStore();
  const { strategyNotes } = useStrategyNoteStore();
  const { userAlerts } = useUserAlertStore();
  const { settings } = useSettingsStore();
  const { watchlist } = useWatchlistStore();
  const { airdropTemplates } = useAirdropTemplateStore();
  const { yieldPositions } = useYieldPositionStore();
  const { savedAiStrategies } = useAiStrategyStore();
  
  const { t, currentLanguage, isLoading: isLangLoading } = useTranslation();
  const { actualTheme, toggleTheme } = useTheme();

  const [isGlobalSearchModalOpen, setIsGlobalSearchModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showPWAInstallBanner, setShowPWAInstallBanner] = useState(false);
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        // Sidebar will be handled by the UI store
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageTitle = useMemo(() => {
    const currentPath = location.pathname;
    let titleKeyOrDynamic = t('app_name'); 

    if (currentPath === '/login') return t('login_title', { defaultValue: 'Login' });
    if (currentPath === '/register') return t('register_title', { defaultValue: 'Register' });
    if (currentPath === '/profile') return t('profile_page_title', {defaultValue: 'User Profile'});

    const mainNavItem = NAVIGATION_ITEMS.find(item => {
        if (item.path === '/') return currentPath === '/';
        return currentPath.startsWith(item.path) && (currentPath === item.path || currentPath.charAt(item.path.length) === '/');
    });

    if (mainNavItem) {
        titleKeyOrDynamic = t(mainNavItem.label);

        if (mainNavItem.id === 'airdrop_tracker' && currentPath.startsWith('/airdrops/') && currentPath !== '/airdrops') {
            const pathParts = currentPath.split('/');
            const airdropId = pathParts[2];
            // Note: We'll need to get airdrops from the store when needed
            titleKeyOrDynamic = t(mainNavItem.label);
        }
        else if (mainNavItem.id === 'learning_platform' && currentPath.startsWith('/learning/')) {
            const subPathKey = currentPath.split('/')[2];
            const subNavItem = LEARNING_HUB_SUB_NAV.find(sub => sub.id === subPathKey);
            if (subNavItem) {
              titleKeyOrDynamic = t(subNavItem.label, { defaultValue: subNavItem.label });
            } else {
              titleKeyOrDynamic = t(mainNavItem.label);
            }
        } else if (mainNavItem.id === 'notification_center') {
            titleKeyOrDynamic = t(mainNavItem.label, { defaultValue: "Notification Center"});
        }
    } else if (currentPath.startsWith('/settings/automation')) {
        titleKeyOrDynamic = t('nav_automation_settings', {defaultValue: "Automation Settings"});
    }
    document.title = `${titleKeyOrDynamic} | ${t('app_name')}`;
    return titleKeyOrDynamic;
  }, [location, t, currentLanguage]);

  const handleOpenGlobalSearch = useCallback(() => setIsGlobalSearchModalOpen(true), []);
  const handleCloseGlobalSearch = useCallback(() => setIsGlobalSearchModalOpen(false), []);
  const handleClearSearch = useCallback(() => setGlobalSearchTerm(''), []);

  const handleSearchResultClick = (item: SearchResultItem) => {
    navigate(item.path);
    setIsGlobalSearchModalOpen(false);
    setGlobalSearchTerm('');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (event.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const checkPWAInstallReady = (event?: Event) => { 
      const currentPrompt = event && (event as CustomEvent).detail ? (event as CustomEvent).detail : getDeferredInstallPrompt();
      if (currentPrompt) {
        const dismissedPreviously = localStorage.getItem('pwaInstallDismissed') === 'true';
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        
        if (!dismissedPreviously && !isStandalone) {
          setShowPWAInstallBanner(true);
        }
      }
    };
    checkPWAInstallReady(); 
    window.addEventListener('pwaInstallReady', checkPWAInstallReady as EventListener);
    return () => window.removeEventListener('pwaInstallReady', checkPWAInstallReady as EventListener);
  }, []); 

  const handlePWAInstall = async () => {
    const promptEvent = getDeferredInstallPrompt();
    if (promptEvent) {
      (promptEvent as any).prompt();
      const { outcome } = await (promptEvent as any).userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the PWA installation prompt');
      } else {
        console.log('User dismissed the PWA installation prompt');
      }
      clearDeferredInstallPrompt(); 
      setShowPWAInstallBanner(false); 
    } else {
      alert("To install, please use your browser's 'Add to Home Screen' or 'Install App' option.");
    }
  };
  
  const handleDismissPWAInstallBanner = () => {
    setShowPWAInstallBanner(false);
    localStorage.setItem('pwaInstallDismissed', 'true'); 
  };

  const commands: Command[] = useMemo(() => {
    const baseCommands = [
        ...NAVIGATION_ITEMS.filter(item => (item.authRequired && isAuthenticated) || (!item.authRequired && !item.publicOnly) || (item.publicOnly && !isAuthenticated) ).map(navItem => ({
            id: navItem.id,
            name: t(navItem.label, {defaultValue: navItem.label.replace(/_/g, ' ')}), 
            category: 'Navigation',
            icon: navItem.icon,
            action: () => { navigate(navItem.path); setIsCommandPaletteOpen(false); }
        })),
        {
            id: 'toggle_theme',
            name: t('toggle_theme', {defaultValue: 'Toggle Theme'}),
            category: 'Settings',
            icon: Palette,
            action: toggleTheme
        },
        {
            id: 'global_search',
            name: t('global_search', {defaultValue: 'Global Search'}),
            category: 'Search',
            icon: SearchIcon,
            action: handleOpenGlobalSearch
        },
        {
            id: 'ai_chatbot',
            name: t('ai_chatbot', {defaultValue: 'AI Chatbot'}),
            category: 'AI',
            icon: MessageSquare,
            action: () => setIsChatbotModalOpen(true)
        }
    ];

    return baseCommands;
  }, [isAuthenticated, t, navigate, toggleTheme, handleOpenGlobalSearch]);

  if (isLangLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      {/* PWA Install Banner */}
      {showPWAInstallBanner && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Install {t('app_name')} for a better experience
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePWAInstall}
              variant="secondary"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Install
            </Button>
            <button
              onClick={handleDismissPWAInstallBanner}
              className="text-white hover:text-gray-200"
            >
              <DismissIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Navbar />
          
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/airdrops" element={<ProtectedRoute><AirdropListPage /></ProtectedRoute>} />
                <Route path="/airdrops/:id" element={<ProtectedRoute><AirdropDetailPage /></ProtectedRoute>} />
                <Route path="/recurring-tasks" element={<ProtectedRoute><RecurringTasksPage /></ProtectedRoute>} />
                <Route path="/learning" element={<ProtectedRoute><LearningPage /></ProtectedRoute>} />
                <Route path="/learning/sybil-prevention" element={<ProtectedRoute><SybilPreventionGuidePage /></ProtectedRoute>} />
                <Route path="/ai-strategy" element={<ProtectedRoute><AIStrategyPage /></ProtectedRoute>} />
                <Route path="/ai-analyst" element={<ProtectedRoute><AIAnalystPage /></ProtectedRoute>} />
                <Route path="/wallets" element={<ProtectedRoute><WalletManagerPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/settings/automation" element={<ProtectedRoute><AutomationSettingsPage /></ProtectedRoute>} />
                <Route path="/settings/design-system" element={<ProtectedRoute><DesignSystemShowcase /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
                <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
                <Route path="/yield" element={<ProtectedRoute><YieldTrackerPage /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsHubPage /></ProtectedRoute>} />
                <Route path="/tools" element={<ProtectedRoute><AggregatorPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationCenterPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </div>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isGlobalSearchModalOpen}
        onClose={handleCloseGlobalSearch}
        searchTerm={globalSearchTerm}
        onResultClick={handleSearchResultClick}
        appData={{
          wallets: wallets,
          airdrops: airdrops,
          recurringTasks: recurringTasks,
          learningResources: learningResources,
          strategyNotes: strategyNotes,
          userAlerts: userAlerts,
          settings: settings || DEFAULT_SETTINGS,
          watchlist: watchlist,
          airdropTemplates: airdropTemplates,
          yieldPositions: yieldPositions,
          userBadges: [],
          savedAiStrategies: savedAiStrategies
        }}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />

      <AIChatbotModal
        isOpen={isChatbotModalOpen}
        onClose={() => setIsChatbotModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <StoreProvider>
              <AppContent />
            </StoreProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
