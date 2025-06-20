import React, { forwardRef } from 'react';
import { createAnimation } from '../tokens/animations';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  success?: boolean;
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  wrapperClassName?: string;
}

const inputVariants = {
  default: 'bg-surface border border-border focus:border-accent focus:ring-2 focus:ring-accent/20',
  outlined: 'bg-transparent border-2 border-border focus:border-accent focus:ring-2 focus:ring-accent/20',
  filled: 'bg-surface-secondary border border-border focus:border-accent focus:ring-2 focus:ring-accent/20',
};

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-xl',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  error = false,
  success = false,
  fullWidth = false,
  label,
  helperText,
  errorText,
  wrapperClassName = '',
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    w-full transition-all duration-200 ease-in-out
    focus:outline-none placeholder:text-tertiary
    disabled:opacity-50 disabled:cursor-not-allowed
    ${inputVariants[variant]}
    ${inputSizes[size]}
    ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
    ${success ? 'border-success focus:border-success focus:ring-success/20' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={baseClasses}
          style={{
            transition: createAnimation('standard'),
            backgroundColor: `var(--color-${variant === 'filled' ? 'surface-secondary' : variant === 'outlined' ? 'transparent' : 'surface'})`,
            borderColor: `var(--color-${error ? 'error' : success ? 'success' : variant === 'outlined' ? 'border-strong' : 'border'})`,
            color: 'var(--color-text-primary)',
            paddingLeft: leftIcon ? '2.5rem' : undefined,
            paddingRight: rightIcon ? '2.5rem' : undefined,
          }}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary">
            {rightIcon}
          </div>
        )}
      </div>
      {errorText && error && (
        <p className="mt-1 text-sm text-error">{errorText}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input'; 