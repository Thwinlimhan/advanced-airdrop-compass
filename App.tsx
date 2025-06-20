import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route as RouterRoute, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/ui/ToastContainer';
import { GlobalSearchModal } from './components/ui/GlobalSearchModal';
import { CommandPaletteModal } from './components/ui/CommandPaletteModal';
import { AIChatbotModal } from './components/ai/AIChatbotModal';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AirdropListPage } from './features/airdrops/AirdropListPage';
import { AirdropDetailPage } from './features/airdrops/AirdropDetailPage';
import { RecurringTasksPage } from './features/tasks/RecurringTasksPage';
import { EnhancedLearningPage as LearningPage } from './features/learning/LearningPage';
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
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserProfilePage } from './features/profile/UserProfilePage'; 
import { NAVIGATION_ITEMS, LEARNING_HUB_SUB_NAV, DEFAULT_SETTINGS } from './constants';
import { SearchResultItem, Command } from './types';
import { useTranslation } from './hooks/useTranslation';
import { useTheme } from './hooks/useTheme';
import { Button } from './design-system/components/Button';
import { PlusCircle, Cog as AutomationIcon, X as DismissIcon, MessageSquare, Search as SearchIcon, Palette, FileText } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useNavigate();
  const { appData, isAuthenticated } = useAppContext();
  const { t, currentLanguage, isLoading: isLangLoading } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [isGlobalSearchModalOpen, setIsGlobalSearchModalOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showPWAInstallBanner, setShowPWAInstallBanner] = useState(false);
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);


  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
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
            const airdrop = appData.airdrops.find(a => a.id === airdropId);
            titleKeyOrDynamic = airdrop ? `${airdrop.projectName} Details` : t(mainNavItem.label);
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
  }, [location, appData.airdrops, t, currentLanguage]);

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
      // Use event.detail if it's from the custom event, otherwise check global deferredInstallPrompt
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
        ...LEARNING_HUB_SUB_NAV.map(subItem => ({ id: `nav_learning_${subItem.id}`, name: t(subItem.label), category: 'Navigation (Learning)', icon: subItem.icon, action: () => { navigate(subItem.path); setIsCommandPaletteOpen(false); } })),
        { id: 'open_global_search', name: 'Open Global Search', category: 'Actions', icon: SearchIcon, action: () => { setIsGlobalSearchModalOpen(true); setIsCommandPaletteOpen(false); } },
        { id: 'toggle_theme', name: `Toggle Theme (Current: ${theme})`, category: 'Actions', icon: Palette, action: () => { toggleTheme(); setIsCommandPaletteOpen(false); } },
        { id: 'open_chatbot', name: "Open AI Chat Assistant", category: "AI Tools", icon: MessageSquare, action: () => { setIsChatbotModalOpen(true); setIsCommandPaletteOpen(false); }},
    ];
    if (isAuthenticated) {
        baseCommands.push(
            { id: 'nav_automation_settings', name: t('nav_automation_settings'), category: 'Navigation (Settings)', icon: AutomationIcon, action: () => { navigate('/settings/automation'); setIsCommandPaletteOpen(false); } },
            { id: 'add_airdrop', name: t('add_new_airdrop_button'), category: 'Actions', icon: PlusCircle, action: () => { navigate('/airdrops', {state: { openAddModal: true }}); setIsCommandPaletteOpen(false); } },
            { id: 'add_wallet', name: t('add_new_wallet_button'), category: 'Actions', icon: PlusCircle, action: () => { navigate('/wallets', {state: { openAddModal: true }}); setIsCommandPaletteOpen(false); } },
            { id: 'add_task', name: t('add_new_task_button'), category: 'Actions', icon: PlusCircle, action: () => { navigate('/tasks', {state: { openAddModal: true }}); setIsCommandPaletteOpen(false); } },
            { id: 'add_yield_position', name: 'Add Yield Position', category: 'Actions', icon: PlusCircle, action: () => { navigate('/yield-tracker', {state: { openAddModal: true }}); setIsCommandPaletteOpen(false); } },
            { id: 'add_airdrop_template', name: t('settings_create_template_button'), category: 'Actions', icon: FileText, action: () => { navigate('/settings', {state: { openTemplateModal: true }}); setIsCommandPaletteOpen(false); } },
        );
    }
    return baseCommands;
  }, [t, theme, navigate, isAuthenticated]);


  const GenericFallback = <div className="p-4 text-center text-red-500">{t('common_error_loading_section', {defaultValue: "An error occurred loading this section. Please try refreshing."})}</div>;

  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const settingsFontFamily = appData.settings.fontFamily || DEFAULT_SETTINGS.fontFamily!;
    const accentColorHex = appData.settings.accentColor || DEFAULT_SETTINGS.accentColor!;
    const themeColorMeta = document.getElementById('theme-color-meta') as HTMLMetaElement | null;

    const existingFontLink = document.getElementById('dynamic-google-font');
    if (existingFontLink) {
      existingFontLink.remove();
    }

    let fontToApply = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'; 

    if (settingsFontFamily !== "System Default") {
      const fontName = settingsFontFamily; 
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;500;600;700;800&display=swap`;
      const newLink = document.createElement('link');
      newLink.id = 'dynamic-google-font';
      newLink.rel = 'stylesheet';
      newLink.href = fontUrl;
      document.head.appendChild(newLink);
      fontToApply = `'${fontName}', ${fontToApply}`;
    }
    rootStyle.setProperty('--font-family-sans', fontToApply);

    const hexToRgbArray = (hex: string): [number, number, number] | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    };

    const rgbArray = hexToRgbArray(accentColorHex);
    if (rgbArray) {
      rootStyle.setProperty('--color-accent-rgb', rgbArray.join(', '));
    } else {
      rootStyle.setProperty('--color-accent-rgb', '136, 90, 248');
    }
    if(themeColorMeta) {
        themeColorMeta.content = accentColorHex;
    }
  }, [appData.settings.fontFamily, appData.settings.accentColor]);

  if (isLangLoading) {
      return <div className="flex h-full w-full items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">{t('common_loading', {defaultValue: 'Loading...'})} {t('loading_translations_suffix', {defaultValue: 'application and translations...'})}</div>;
  }

  return (
    <div className="flex h-full bg-background-light dark:bg-background-dark">
      {isAuthenticated && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && <Navbar toggleSidebar={toggleSidebar} currentPageTitle={pageTitle} onSearchIconClick={handleOpenGlobalSearch} isSearchVisible={isGlobalSearchModalOpen || globalSearchTerm.length > 0} searchTerm={globalSearchTerm} onSearchTermChange={setGlobalSearchTerm} onClearSearch={handleClearSearch} />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <RouterRoute path="/login" element={<LoginPage />} />
            <RouterRoute path="/register" element={<RegisterPage />} />
            
            <RouterRoute path="/" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><DashboardPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/profile" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><UserProfilePage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/watchlist" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><WatchlistPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/achievements" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><AchievementsPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/notifications" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><NotificationCenterPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/airdrops" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><AirdropListPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/airdrops/:airdropId" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><AirdropDetailPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/tasks" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><RecurringTasksPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/portfolio" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><PortfolioPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/yield-tracker" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><YieldTrackerPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/reports" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><ReportsPage /></ErrorBoundary></ProtectedRoute>} />

            <RouterRoute path="/learning" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/guides" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/guides/:itemId" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/glossary" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/glossary/:itemId" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/sybilPrevention" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><SybilPreventionGuidePage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/notebook" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/notebook/:itemId" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/aiStrategy" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><AIStrategyPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/aiAnalyst" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><AIAnalystPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/newsAnalysis" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/:subPage" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/learning/:subPage/:itemId" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><LearningPage /></ErrorBoundary></ProtectedRoute>} />

            <RouterRoute path="/analytics" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><AnalyticsHubPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/tools/aggregator" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><AggregatorPage /></ErrorBoundary></ProtectedRoute>} />

            <RouterRoute path="/wallets" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><WalletManagerPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/settings" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><SettingsPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/settings/automation" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><AutomationSettingsPage /></ErrorBoundary></ProtectedRoute>} />
            <RouterRoute path="/settings/designSystem" element={<ProtectedRoute><ErrorBoundary FallbackComponent={GenericFallback}><DesignSystemShowcase /></ErrorBoundary></ProtectedRoute>} />
            
            <RouterRoute path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />

          </Routes>
        </main>
      </div>
      <ToastContainer />
      {isAuthenticated && <GlobalSearchModal isOpen={isGlobalSearchModalOpen && !isCommandPaletteOpen} onClose={handleCloseGlobalSearch} searchTerm={globalSearchTerm} onResultClick={handleSearchResultClick} appData={appData} />}
      {isAuthenticated && <CommandPaletteModal isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} />}
       {showPWAInstallBanner && (
        <div className={`pwa-install-banner ${showPWAInstallBanner ? 'show' : ''}`}>
          <span>{t('pwa_install_banner_text', { defaultValue: 'Install Airdrop Compass for a better experience!' })}</span>
          <div>
            <Button onClick={handlePWAInstall} className="install-btn">{t('pwa_install_button', { defaultValue: 'Install' })}</Button>
            <button onClick={handleDismissPWAInstallBanner} className="dismiss-btn" aria-label={t('pwa_dismiss_button_aria', { defaultValue: 'Dismiss PWA install banner' })}>
                <DismissIcon size={20} />
            </button>
          </div>
        </div>
      )}
      {isAuthenticated && (
        <>
          <button
            onClick={() => setIsChatbotModalOpen(true)}
            className="fixed bottom-6 right-6 bg-primary text-white p-3.5 rounded-full shadow-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark transition-colors z-40"
            aria-label={t('chatbot_open_button_aria', { defaultValue: 'Open AI Chat Assistant' })}
            title={t('chatbot_open_button_aria', { defaultValue: 'Open AI Chat Assistant' })}
          >
            <MessageSquare size={24} />
          </button>
          <AIChatbotModal isOpen={isChatbotModalOpen} onClose={() => setIsChatbotModalOpen(false)} />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Service worker registration is now in index.html for earlier registration.
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export { App as default };
