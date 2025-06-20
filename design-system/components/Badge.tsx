import React from 'react';
import { createAnimation } from '../tokens/animations';
import { X } from 'lucide-react';

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  removable?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

const badgeVariants = {
  default: 'bg-secondary text-primary border border-border-primary',
  primary: 'bg-accent text-white border border-accent',
  secondary: 'bg-tertiary text-primary border border-border-secondary',
  success: 'bg-success text-white border border-success',
  warning: 'bg-warning text-white border border-warning',
  error: 'bg-error text-white border border-error',
  info: 'bg-info text-white border border-info',
  outline: 'bg-transparent text-accent border border-accent',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = React.memo(({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  removable = false,
  onRemove,
  icon,
  fullWidth = false,
  interactive = false,
  onClick,
}) => {
  const variantStyles = badgeVariants[variant];
  const sizeStyles = badgeSizes[size];

  const baseClasses = [
    'inline-flex items-center justify-center font-medium rounded-full transition-all',
    'focus:outline-none focus:ring-2 focus:ring-accent/20',
    sizeStyles,
    fullWidth ? 'w-full' : '',
    interactive ? 'cursor-pointer hover:shadow-sm' : '',
    variantStyles,
    className,
  ].filter(Boolean).join(' ');

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={baseClasses}
      onClick={handleClick}
      style={{ transition: createAnimation('standard') }}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {icon && (
        <span className="mr-1.5 flex-shrink-0">
          {icon}
        </span>
      )}
      
      <span className="truncate">
        {children}
      </span>
      
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1.5 flex-shrink-0 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove badge"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
});

Badge.displayName = 'Badge'; 