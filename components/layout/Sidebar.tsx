import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar as DesignSystemSidebar, SidebarItem } from '../../design-system/components/Sidebar';
import { useAppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import {
  LayoutDashboard,
  Target,
  CalendarCheck,
  FlaskConical,
  BookOpen,
  History,
  Settings,
  HelpCircle,
  Eye,
  Award,
  LogOut,
  Brain,
  Bot,
  Lightbulb
} from 'lucide-react';
import { NavItem } from '../../types';

export const Sidebar: React.FC = () => {
    const { logout, isSidebarOpen, toggleSidebar } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems: NavItem[] = [
        { id: 'dashboard', label: t('nav_dashboard', { defaultValue: 'Dashboard' }), path: '/', icon: LayoutDashboard },
        { id: 'airdrops', label: t('nav_airdrops', { defaultValue: 'Airdrops' }), path: '/airdrops', icon: Target },
        { id: 'tasks', label: t('nav_tasks', { defaultValue: 'Tasks' }), path: '/tasks', icon: CalendarCheck },
        { id: 'yield', label: t('nav_yield', { defaultValue: 'Yield' }), path: '/yield-tracker', icon: FlaskConical },
        { id: 'learning', label: t('nav_learning', { defaultValue: 'Learning' }), path: '/learning', icon: BookOpen },
        { id: 'portfolio', label: t('nav_portfolio', { defaultValue: 'Portfolio' }), path: '/portfolio', icon: History },
        { id: 'watchlist', label: t('nav_watchlist', { defaultValue: 'Watchlist' }), path: '/watchlist', icon: Eye },
        { id: 'achievements', label: t('nav_achievements', { defaultValue: 'Achievements' }), path: '/achievements', icon: Award },
        { id: 'settings', label: t('nav_settings', { defaultValue: 'Settings' }), path: '/settings', icon: Settings },
        { id: 'help', label: t('nav_help', { defaultValue: 'Help' }), path: '/help', icon: HelpCircle },
    ];

    // Build sidebar items with AI section inserted after 'learning'
    const sidebarItems: SidebarItem[] = [
      ...navItems.slice(0, 5).map(item => ({
        id: item.id,
        label: item.label,
        icon: <item.icon />,
        href: item.path,
      })),
      {
        id: 'ai',
        label: t('nav_ai', { defaultValue: 'AI' }),
        icon: <Brain />,
        children: [
          {
            id: 'ai-strategy',
            label: t('nav_ai_strategy', { defaultValue: 'AI Strategy' }),
            icon: <Lightbulb />,
            href: '/learning/aiStrategy',
          },
          {
            id: 'ai-analyst',
            label: t('nav_ai_analyst', { defaultValue: 'AI Analyst' }),
            icon: <Bot />,
            href: '/learning/aiAnalyst',
          },
        ],
      },
      ...navItems.slice(5).map(item => ({
        id: item.id,
        label: item.label,
        icon: <item.icon />,
        href: item.path,
      })),
    ];

    sidebarItems.push({
      id: 'logout',
      label: 'Logout',
      icon: <LogOut />,
      onClick: handleLogout,
    });

    // Update getActiveItemId to support nested AI children
    const getActiveItemId = () => {
      const currentPath = location.pathname;
      if (currentPath === '/') return 'dashboard';
      if (currentPath.startsWith('/learning/aiStrategy')) return 'ai-strategy';
      if (currentPath.startsWith('/learning/aiAnalyst')) return 'ai-analyst';
      for (let i = navItems.length - 1; i >= 0; i--) {
        if (navItems[i].path !== '/' && currentPath.startsWith(navItems[i].path)) {
          return navItems[i].id;
        }
      }
      return 'dashboard';
    };

    return (
      <DesignSystemSidebar
        items={sidebarItems}
        collapsed={!isSidebarOpen}
        onCollapse={toggleSidebar}
        activeItemId={getActiveItemId()}
        className="h-screen"
      />
    );
};
