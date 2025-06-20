import React, { forwardRef } from 'react';
import { createAnimation } from '../tokens/animations';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
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
  characterCount?: boolean;
  maxLength?: number;
  resizable?: boolean;
}

const textareaVariants = {
  default: 'bg-primary border border-border-primary focus:border-accent',
  outlined: 'bg-transparent border-2 border-border-primary focus:border-accent',
  filled: 'bg-secondary border border-border-secondary focus:border-accent',
};

const textareaSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
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
  characterCount = false,
  maxLength,
  resizable = true,
  className = '',
  id,
  disabled,
  rows = 3,
  ...props
}, ref) => {
  const hasError = error || !!errorText;
  const hasSuccess = success;
  const isDisabled = disabled;
  const currentLength = props.value?.toString().length || 0;

  const variantStyles = textareaVariants[variant];
  const sizeStyles = textareaSizes[size];

  const baseClasses = [
    'w-full rounded-lg transition-all',
    'focus:outline-none focus:ring-2 focus:ring-accent/20',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeStyles,
    fullWidth ? 'w-full' : '',
    hasError ? 'border-error focus:border-error focus:ring-error/20' : '',
    hasSuccess ? 'border-success focus:border-success focus:ring-success/20' : '',
    !hasError && !hasSuccess ? variantStyles : '',
    !resizable ? 'resize-none' : '',
    className,
  ].filter(Boolean).join(' ');

  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-primary mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute top-3 left-3 flex items-start pointer-events-none">
            <span className="text-tertiary">{leftIcon}</span>
          </div>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={baseClasses}
          style={{ 
            transition: createAnimation('standard'),
            paddingLeft: leftIcon ? '2.5rem' : undefined,
            paddingRight: rightIcon ? '2.5rem' : undefined,
          }}
          disabled={isDisabled}
          maxLength={maxLength}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute top-3 right-3 flex items-start pointer-events-none">
            <span className="text-tertiary">{rightIcon}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-1">
        {(helperText || errorText) && (
          <p className={`text-sm ${hasError ? 'text-error' : 'text-secondary'}`}>
            {errorText || helperText}
          </p>
        )}
        
        {characterCount && maxLength && (
          <span className={`text-xs ml-auto ${currentLength > maxLength * 0.9 ? 'text-warning' : 'text-tertiary'}`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea'; 