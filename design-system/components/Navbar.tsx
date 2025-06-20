import React, { useState } from 'react';
import { createAnimation } from '../tokens/animations';
import { Button } from './Button';

export interface NavbarItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface NavbarProps {
  title?: string;
  logo?: React.ReactNode;
  items?: NavbarItem[];
  rightItems?: React.ReactNode;
  onMenuToggle?: (isOpen: boolean) => void;
  className?: string;
  variant?: 'default' | 'elevated' | 'transparent';
}

const navbarVariants = {
  default: 'bg-surface border-b border-border',
  elevated: 'bg-surface shadow-md border-b border-border',
  transparent: 'bg-transparent',
};

export const Navbar: React.FC<NavbarProps> = React.memo(({
  title,
  logo,
  items = [],
  rightItems,
  onMenuToggle,
  className = '',
  variant = 'default',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  const baseClasses = `
    flex items-center justify-between px-4 py-3
    transition-all duration-200 ease-in-out
    ${navbarVariants[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <nav className={baseClasses} style={{ 
      transition: createAnimation('standard'),
      backgroundColor: `var(--color-${variant === 'transparent' ? 'transparent' : 'surface'})`,
      borderColor: `var(--color-${variant === 'transparent' ? 'transparent' : 'border'})`,
      boxShadow: variant === 'elevated' ? 'var(--color-shadow-md)' : 'none',
    }}>
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {logo && <div className="flex-shrink-0">{logo}</div>}
        {title && (
          <h1 className="text-xl font-semibold text-primary">{title}</h1>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={item.disabled ? 'ghost' : 'ghost'}
            size="sm"
            onClick={item.onClick}
            disabled={item.disabled}
            className="flex items-center space-x-2"
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
            {item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-white">
                {item.badge}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        {rightItems}
        
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMobileMenuToggle}
          className="md:hidden"
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-surface border-b border-border shadow-lg md:hidden">
          <div className="px-4 py-2 space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                disabled={item.disabled}
                className="w-full flex items-center justify-between px-3 py-2 text-left rounded-md text-secondary hover:text-primary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  transition: createAnimation('standard'),
                  color: 'var(--color-text-secondary)',
                }}
              >
                <div className="flex items-center space-x-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar'; 