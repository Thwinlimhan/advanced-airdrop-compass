import React, { useState, useEffect } from 'react';
import { Navbar as DesignSystemNavbar, NavbarItem } from '../../design-system/components/Navbar';
import { useAppContext } from '../../contexts/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { NotificationBell } from '../notifications/NotificationBell';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  User,
  Settings,
  Bell
} from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useTranslation } from '../../hooks/useTranslation';

interface NavbarProps {
  toggleSidebar: () => void;
  currentPageTitle: string;
  onSearchIconClick: () => void;
  isSearchVisible: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onClearSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  toggleSidebar,
  currentPageTitle,
  onSearchIconClick,
  isSearchVisible,
  searchTerm,
  onSearchTermChange,
  onClearSearch
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { currentUser } = useAppContext();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(e.target.value);
  };

  const navbarItems: NavbarItem[] = [
    {
      id: 'search',
      label: 'Search',
      icon: <Search size={20} />,
      onClick: onSearchIconClick
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={20} />,
      onClick: () => setIsNotificationPanelOpen(!isNotificationPanelOpen)
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      onClick: () => window.location.href = '/settings'
    }
  ];

  const rightItems = (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Sun size={18} className={theme === 'light' ? 'text-yellow-500' : 'text-muted-dark'} />
        <ToggleSwitch 
          id="theme-toggle-navbar" 
          checked={theme === 'dark'} 
          onChange={toggleTheme} 
          srLabel={t('toggle_dark_mode_aria', { defaultValue: 'Toggle dark mode' })} 
        />
        <Moon size={18} className={theme === 'dark' ? 'text-primary' : 'text-muted-dark'} />
      </div>
      
      {currentUser && (
        <div className="flex items-center gap-2 ml-2">
          <User size={20} className="text-muted-dark" />
          <span className="text-sm font-medium text-primary hidden sm:block">
            {currentUser.username || currentUser.email}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <DesignSystemNavbar
      title={currentPageTitle}
      items={navbarItems}
      rightItems={rightItems}
      onMenuToggle={toggleSidebar}
      className="h-16"
    />
  );
};
