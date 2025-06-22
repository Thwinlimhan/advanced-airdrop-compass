import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createAnimation } from '../tokens/animations';
import { Button } from './Button';
import './Sidebar.css';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  children?: SidebarItem[];
  badge?: string | number;
  disabled?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
  activeItemId?: string;
  onItemClick?: (item: SidebarItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  collapsed = false,
  onCollapse,
  className = '',
  activeItemId,
  onItemClick,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (activeItemId) {
      const active = items.find(item => item.id === activeItemId && item.children?.length);
      if (active) {
        setExpandedItem(activeItemId);
      }
    }
  }, [activeItemId, items]);

  const isItemActive = (item: SidebarItem): boolean => {
    if (activeItemId) {
      return item.id === activeItemId;
    }
    if (item.href) {
      return location.pathname.startsWith(item.href);
    }
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children?.length) {
      setExpandedItem(prev => prev === item.id ? null : item.id);
    } else if (item.href) {
      navigate(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
    onItemClick?.(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: SidebarItem) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleItemClick(item);
        break;
      case 'ArrowRight':
        if (item.children?.length) {
          e.preventDefault();
          setExpandedItem(item.id);
        }
        break;
      case 'ArrowLeft':
        if (expandedItem === item.id) {
          e.preventDefault();
          setExpandedItem(null);
        }
        break;
    }
  };

  const setSectionRef = (itemId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(itemId, el);
      el.style.setProperty('--expanded-height', `${el.scrollHeight}px`);
    } else {
      sectionRefs.current.delete(itemId);
    }
  };

  // Update ref heights when children change
  useEffect(() => {
    sectionRefs.current.forEach((el, itemId) => {
      const item = items.find(i => i.id === itemId);
      if (item && item.children) {
        el.style.setProperty('--expanded-height', `${el.scrollHeight}px`);
      }
    });
  }, [items]);

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItem === item.id;
    const hasChildren = Boolean(item.children?.length);

    return (
      <div key={item.id} className="relative">
        <button
          onClick={() => handleItemClick(item)}
          onKeyDown={(e) => handleKeyDown(e, item)}
          disabled={item.disabled}
          tabIndex={0}
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-level={level + 1}
          aria-current={isActive ? 'page' : undefined}
          className={`
            w-full flex items-center justify-between p-3
            transition-all duration-200 ease-in-out rounded-lg
            ${isActive ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]' : 'hover:bg-[var(--color-surface-hover)]'}
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{
            paddingLeft: collapsed ? '1rem' : `${(level + 1) * 1}rem`,
            transition: createAnimation('standard'),
            backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
            color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
          }}
        >
          <div className="flex items-center min-w-0 flex-1">
            {item.icon && (
              <span className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'}`}>
                {item.icon}
              </span>
            )}
            {!collapsed && (
              <span className="truncate font-medium">{item.label}</span>
            )}
          </div>
          
          {!collapsed && (
            <div className="flex items-center ml-2">
              {item.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <svg
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          )}
        </button>

        {hasChildren && !collapsed && (
          <div
            ref={setSectionRef(item.id)}
            className="sidebar-section"
            data-expanded={isExpanded}
          >
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col
        ${collapsed ? 'w-16' : 'w-64'}
        transition-all duration-300 ease-in-out
        ${className}
      `}
      style={{
        transition: createAnimation('standard'),
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Navigation</h2>
        )}
        {onCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCollapse(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"}
              />
            </svg>
          </Button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map(item => renderSidebarItem(item))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-tertiary)]">
            Advanced Crypto Airdrop Compass
          </div>
        </div>
      )}
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';