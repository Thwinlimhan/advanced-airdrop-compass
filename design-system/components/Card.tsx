import React, { forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

const variantClasses = {
  default: `
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
  `,
  outlined: `
    bg-transparent
    border-2 border-gray-300 dark:border-gray-600
  `,
  elevated: `
    bg-white dark:bg-gray-800
    border-0
    shadow-lg
  `,
  glass: `
    bg-white/80 dark:bg-gray-800/80
    backdrop-blur-md
    border border-white/20 dark:border-gray-700/50
  `,
  gradient: `
    bg-gradient-to-br from-white to-gray-50
    dark:from-gray-800 dark:to-gray-900
    border border-gray-200 dark:border-gray-700
  `
};

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'default',
  padding = 'md',
  rounded = 'md',
  shadow = 'md',
  interactive = false,
  loading = false,
  className = '',
  children,
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

  const baseClasses = `
    relative overflow-hidden
    transition-all duration-200 ease-in-out
    ${interactive ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''}
    ${themeConfig.reducedMotion ? '' : 'transition-all duration-200'}
    ${loading ? 'pointer-events-none' : ''}
  `;

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${roundedClasses[rounded]}
    ${shadowClasses[shadow]}
    ${className}
  `;

  if (loading) {
    return (
      <div ref={ref} className={classes} {...props}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-4/5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card Header Component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  border?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  border = true,
  className = '',
  children,
  ...props
}) => {
  const classes = `
    flex items-center justify-between
    ${border ? 'pb-4 border-b border-gray-200 dark:border-gray-700 mb-4' : ''}
    ${className}
  `;

  return (
    <div className={classes} {...props}>
      <div className="min-w-0 flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// Card Content Component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`flex-1 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  border = true,
  justify = 'end',
  className = '',
  children,
  ...props
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  const classes = `
    flex items-center
    ${justifyClasses[justify]}
    ${border ? 'pt-4 border-t border-gray-200 dark:border-gray-700 mt-4' : ''}
    ${className}
  `;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Stat Card Component for displaying metrics
interface StatCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
  ...cardProps
}) => {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  const trendIcons = {
    up: '\u2197',
    down: '\u2198',
    stable: '\u2192'
  };

  return (
    <Card {...cardProps}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        {change && (
          <div className="flex-shrink-0">
            <span className={`text-sm font-medium ${changeColors[changeType]}`}>
              {change > 0 ? trendIcons.up : change < 0 ? trendIcons.down : trendIcons.stable}
            </span>
            <span className={`text-sm font-medium ${changeColors[changeType]}`}>
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}; 