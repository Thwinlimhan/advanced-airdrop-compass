import React, { forwardRef, useState } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  rounded?: boolean;
  shadow?: boolean;
  glow?: boolean;
  animation?: 'none' | 'pulse' | 'bounce' | 'scale' | 'slide';
  dropdown?: boolean;
}

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg'
};

const iconSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20
};

const variantClasses = {
  primary: `
    bg-primary text-white border-primary
    hover:bg-primary/90 hover:border-primary/90
    focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
    active:scale-95
    disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-gray-100 text-gray-900 border-gray-200
    hover:bg-gray-200 hover:border-gray-300
    focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2
    active:scale-95
    disabled:bg-gray-50 disabled:border-gray-200 disabled:cursor-not-allowed
    dark:bg-gray-800 dark:text-white dark:border-gray-700
    dark:hover:bg-gray-700 dark:hover:border-gray-600
    dark:disabled:bg-gray-900 dark:disabled:border-gray-800
  `,
  tertiary: `
    bg-transparent text-gray-700 border-gray-300
    hover:bg-gray-50 hover:border-gray-400
    focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2
    active:scale-95
    disabled:bg-transparent disabled:border-gray-200 disabled:cursor-not-allowed
    dark:text-gray-300 dark:border-gray-600
    dark:hover:bg-gray-800 dark:hover:border-gray-500
    dark:disabled:border-gray-700
  `,
  danger: `
    bg-red-600 text-white border-red-600
    hover:bg-red-700 hover:border-red-700
    focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2
    active:scale-95
    disabled:bg-red-300 disabled:border-red-300 disabled:cursor-not-allowed
  `,
  success: `
    bg-green-600 text-white border-green-600
    hover:bg-green-700 hover:border-green-700
    focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2
    active:scale-95
    disabled:bg-green-300 disabled:border-green-300 disabled:cursor-not-allowed
  `,
  warning: `
    bg-yellow-600 text-white border-yellow-600
    hover:bg-yellow-700 hover:border-yellow-700
    focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2
    active:scale-95
    disabled:bg-yellow-300 disabled:border-yellow-300 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-gray-700 border-transparent
    hover:bg-gray-100 hover:text-gray-900
    focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2
    active:scale-95
    disabled:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed
    dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white
    dark:disabled:text-gray-600
  `,
  outline: `
    bg-transparent text-gray-700 border-gray-300
    hover:bg-gray-50 hover:border-gray-400
    focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2
    active:scale-95
    disabled:bg-transparent disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed
    dark:text-gray-300 dark:border-gray-600
    dark:hover:bg-gray-800 dark:hover:border-gray-500
    dark:disabled:text-gray-600 dark:disabled:border-gray-700
  `,
  gradient: `
    bg-gradient-to-r from-primary to-purple-600 text-white border-transparent
    hover:from-primary/90 hover:to-purple-600/90 hover:shadow-xl
    focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
    active:scale-95
    disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
  `
};

const animationClasses = {
  none: '',
  pulse: 'animate-pulse',
  bounce: 'hover:animate-bounce',
  scale: 'hover:scale-105 transition-transform duration-200',
  slide: 'hover:translate-x-1 transition-transform duration-200'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingText,
  fullWidth = false,
  rounded = false,
  shadow = false,
  glow = false,
  animation = 'none',
  dropdown = false,
  className = '',
  disabled,
  onClick,
  ...props
}, ref) => {
  // Use theme context with fallback to prevent errors when used outside ThemeProvider
  let themeConfig;
  try {
    const theme = useTheme();
    themeConfig = theme.config;
  } catch (error) {
    // Fallback when theme context is not available
    themeConfig = { reducedMotion: false };
  }
  
  const [isPressed, setIsPressed] = useState(false);
  
  const isDisabled = disabled || isLoading;
  const iconSize = iconSizes[size];

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-medium transition-all duration-200 ease-in-out
    focus:outline-none focus-visible:outline-none
    border
    ${rounded ? 'rounded-full' : 'rounded-lg'}
    ${fullWidth ? 'w-full' : ''}
    ${shadow ? 'shadow-md hover:shadow-lg' : ''}
    ${glow ? 'hover:shadow-glow' : ''}
    ${themeConfig.reducedMotion ? '' : 'transition-all duration-200'}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${animationClasses[animation]}
  `;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) {
      onClick(e);
    }
  };

  const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
    if (!icon) return null;
    
    return (
      <span className={`
        flex items-center justify-center
        ${position === 'left' ? 'mr-2' : 'ml-2'}
        ${isLoading && position === 'left' ? 'opacity-0' : ''}
      `}>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement, { 
              size: iconSize,
              className: `w-${iconSize/4} h-${iconSize/4}`
            })
          : icon
        }
      </span>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={iconSize} className="animate-spin" />
          </span>
          <span className="opacity-0 flex items-center">
            {leftIcon && renderIcon(leftIcon, 'left')}
            {loadingText || children}
            {rightIcon && renderIcon(rightIcon, 'right')}
            {dropdown && <ChevronDown size={iconSize} className="ml-1" />}
          </span>
        </>
      );
    }

    return (
      <>
        {leftIcon && renderIcon(leftIcon, 'left')}
        <span className="flex-1">{children}</span>
        {rightIcon && renderIcon(rightIcon, 'right')}
        {dropdown && (
          <ChevronDown 
            size={iconSize} 
            className={`ml-1 transition-transform duration-200 ${isPressed ? 'rotate-180' : ''}`} 
          />
        )}
      </>
    );
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

Button.displayName = 'Button';

// Button group component for related actions
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className = ''
}) => {
  return (
    <div
      className={`inline-flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${className}`.trim()}
      role="group"
    >
      {children}
    </div>
  );
};

// IconButton component
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  label: string; // For accessibility
}

function isLucideIconWithSize(element: React.ReactElement): element is React.ReactElement<{ size?: number }> {
  return (
    typeof element.type === 'function' &&
    // @ts-expect-error displayName is not typed
    typeof element.type.displayName === 'string' &&
    // @ts-expect-error displayName is not typed
    element.type.displayName.startsWith('Lucide')
  );
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  size = 'md',
  className = '',
  ...props
}) => {
  const iconSize = iconSizes[size as keyof typeof iconSizes] || 16;
  let iconElement = icon;
  if (React.isValidElement(icon) && isLucideIconWithSize(icon)) {
    iconElement = React.cloneElement(icon, { size: iconSize });
  }
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
      {...props}
    >
      {iconElement}
    </button>
  );
}; 