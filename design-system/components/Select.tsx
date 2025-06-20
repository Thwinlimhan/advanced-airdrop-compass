import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { createAnimation } from '../tokens/animations';
import { ChevronDown, Check } from 'lucide-react';
import ReactDOM from 'react-dom';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
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
  placeholder?: string;
  options?: SelectOption[];
  children?: React.ReactNode;
  onValueChange?: (value: string | number) => void;
  searchable?: boolean;
  multiSelect?: boolean;
  selectedValues?: (string | number)[];
  onSelectionChange?: (values: (string | number)[]) => void;
  wrapperClassName?: string;
}

const selectVariants = {
  default: 'bg-primary border border-border-primary focus:border-accent',
  outlined: 'bg-transparent border-2 border-border-primary focus:border-accent',
  filled: 'bg-secondary border border-border-secondary focus:border-accent',
};

const selectSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
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
  placeholder,
  options = [],
  children,
  onValueChange,
  searchable = false,
  multiSelect = false,
  selectedValues = [],
  onSelectionChange,
  className = '',
  id,
  disabled,
  wrapperClassName = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalValue, setInternalValue] = useState<string | number>('');
  const [internalSelectedValues, setInternalSelectedValues] = useState<(string | number)[]>(selectedValues);
  const selectRef = useRef<HTMLDivElement>(null);
  const inputId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

  const hasError = error || !!errorText;
  const hasSuccess = success;
  const isDisabled = disabled;

  const variantStyles = selectVariants[variant];
  const sizeStyles = selectSizes[size];

  const baseClasses = [
    'relative w-full rounded-lg transition-all',
    'focus:outline-none focus:ring-2 focus:ring-accent/20',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeStyles,
    fullWidth ? 'w-full' : '',
    hasError ? 'border-error focus:border-error focus:ring-error/20' : '',
    hasSuccess ? 'border-success focus:border-success focus:ring-success/20' : '',
    !hasError && !hasSuccess ? variantStyles : '',
    className,
  ].filter(Boolean).join(' ');

  const filteredOptions = options.filter(option =>
    searchable && searchTerm
      ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const selectedOption = options.find(opt => opt.value === internalValue);
  const selectedOptions = options.filter(opt => internalSelectedValues.includes(opt.value));

  const handleSelect = (value: string | number) => {
    if (multiSelect) {
      const newValues = internalSelectedValues.includes(value)
        ? internalSelectedValues.filter(v => v !== value)
        : [...internalSelectedValues, value];
      
      setInternalSelectedValues(newValues);
      onSelectionChange?.(newValues);
    } else {
      setInternalValue(value);
      onValueChange?.(value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleToggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (
      selectedValues &&
      (selectedValues.length !== internalSelectedValues.length ||
        !selectedValues.every((v, i) => v === internalSelectedValues[i]))
    ) {
      setInternalSelectedValues(selectedValues);
    }
  }, [selectedValues, internalSelectedValues]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyles({
        position: 'absolute',
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-primary mb-2"
        >
          {label}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-tertiary">{leftIcon}</span>
          </div>
        )}
        
        <button
          ref={buttonRef}
          type="button"
          className={baseClasses}
          onClick={handleToggle}
          disabled={isDisabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${inputId}-label` : undefined}
          style={{ transition: createAnimation('standard') }}
        >
          <div className="flex items-center justify-between min-h-0">
            <div className="flex items-center min-w-0 flex-1">
              {leftIcon && <div className="w-5 h-5 mr-2 flex-shrink-0" />}
              
              <div className="min-w-0 flex-1 text-left">
                {multiSelect ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedOptions.length > 0 ? (
                      selectedOptions.map(option => (
                        <span
                          key={option.value}
                          className="inline-flex items-center px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full"
                        >
                          {option.label}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(option.value);
                            }}
                            className="ml-1 hover:bg-accent/20 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-tertiary">{placeholder || 'Select options...'}</span>
                    )}
                  </div>
                ) : (
                  <span className={selectedOption ? 'text-primary' : 'text-tertiary'}>
                    {selectedOption?.label || placeholder || 'Select an option...'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center ml-2">
              {rightIcon && <span className="text-tertiary mr-1">{rightIcon}</span>}
              <ChevronDown
                size={16}
                className={`text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </button>

        {isOpen && typeof window !== 'undefined' && ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            className="z-dropdown bg-surface text-primary border border-border rounded-lg shadow-lg max-h-60 overflow-auto"
            style={dropdownStyles}
          >
            {searchable && (
              <div className="p-2 border-b border-border">
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-surface-secondary text-primary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20"
                  autoFocus
                />
              </div>
            )}
            
            <div role="listbox" className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = multiSelect
                    ? internalSelectedValues.includes(option.value)
                    : internalValue === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className={`
                        w-full px-4 py-2 text-left flex items-center justify-between
                        bg-surface text-primary
                        hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none
                        ${isSelected ? 'bg-accent/10 text-accent' : ''}
                        ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        {option.icon && (
                          <span className="mr-2 flex-shrink-0">{option.icon}</span>
                        )}
                        <span className="truncate">{option.label}</span>
                      </div>
                      
                      {isSelected && (
                        <Check size={16} className="flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-2 text-sm text-tertiary">
                  {searchTerm ? 'No options found' : 'No options available'}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
      
      {(helperText || errorText) && (
        <p className={`mt-1 text-sm ${hasError ? 'text-error' : 'text-secondary'}`}>
          {errorText || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select'; 