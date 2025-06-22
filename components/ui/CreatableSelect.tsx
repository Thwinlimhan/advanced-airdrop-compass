import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

export interface CreatableSelectOption {
  value: string;
  label: string;
  isNew?: boolean;
}

export interface CreatableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CreatableSelectOption[];
  placeholder?: string;
  label?: string;
  error?: boolean;
  disabled?: boolean;
  allowCreate?: boolean;
  onCreateOption?: (value: string) => void;
  className?: string;
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  label,
  error = false,
  disabled = false,
  allowCreate = true,
  onCreateOption,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<CreatableSelectOption[]>(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInputValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Add "Create new" option if input value doesn't match any existing option
    if (allowCreate && inputValue.trim() && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase())) {
      filtered.push({
        value: inputValue.trim(),
        label: `Create "${inputValue.trim()}"`,
        isNew: true
      });
    }

    setFilteredOptions(filtered);
  }, [options, inputValue, allowCreate]);

  const handleSelect = (option: CreatableSelectOption) => {
    if (option.isNew && onCreateOption) {
      onCreateOption(option.value);
    }
    onChange(option.value);
    setIsOpen(false);
    setInputValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (allowCreate && onCreateOption) {
        onCreateOption(inputValue.trim());
        onChange(inputValue.trim());
      }
      setIsOpen(false);
      setInputValue('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setInputValue('');
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
    setInputValue('');
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center space-x-1">
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Type to search or create..."
                className="w-full px-2 py-1 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                      ${option.value === value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}
                      ${option.isNew ? 'text-green-600 dark:text-green-400' : ''}
                    `}
                  >
                    <div className="flex items-center">
                      {option.isNew && <Plus size={14} className="mr-2" />}
                      {option.label}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 