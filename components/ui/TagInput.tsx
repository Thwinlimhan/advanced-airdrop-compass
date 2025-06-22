import React, { useState, KeyboardEvent, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface TagInputProps {
  id: string;
  label?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[]; // Optional: for autocomplete/suggestions
  wrapperClassName?: string;
  maxTags?: number;
  disabled?: boolean;
  storageKey?: string; // Key for storing custom tags in localStorage
  allowCustomTags?: boolean; // Whether to allow creating new tags
}

export const TagInput: React.FC<TagInputProps> = ({
  id,
  label,
  tags,
  onTagsChange,
  placeholder,
  suggestions = [],
  wrapperClassName = '',
  maxTags,
  disabled = false,
  storageKey,
  allowCustomTags = true,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder || t('tag_input_default_placeholder', { defaultValue: "Add a tag..." });

  // Load custom tags from localStorage on component mount
  useEffect(() => {
    if (storageKey) {
      try {
        const stored = localStorage.getItem(`custom_tags_${storageKey}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCustomTags(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load custom tags from localStorage:', error);
      }
    }
  }, [storageKey]);

  // Save custom tags to localStorage
  const saveCustomTags = (newCustomTags: string[]) => {
    if (storageKey) {
      try {
        localStorage.setItem(`custom_tags_${storageKey}`, JSON.stringify(newCustomTags));
      } catch (error) {
        console.warn('Failed to save custom tags to localStorage:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addTag = (tagToAdd: string) => {
    const newTag = tagToAdd.trim();
    if (newTag && !tags.includes(newTag) && (!maxTags || tags.length < maxTags)) {
      const updatedTags = [...tags, newTag];
      onTagsChange(updatedTags);
      
      // If this is a new custom tag, add it to custom tags
      if (allowCustomTags && !suggestions.includes(newTag) && !customTags.includes(newTag)) {
        const updatedCustomTags = [...customTags, newTag];
        setCustomTags(updatedCustomTags);
        saveCustomTags(updatedCustomTags);
      }
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  // Combine suggestions with custom tags
  const allSuggestions = [...new Set([...suggestions, ...customTags])];
  
  const filteredSuggestions = allSuggestions.filter(
    suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  const isInputDisabled = disabled || (maxTags !== undefined && tags.length >= maxTags);
  const finalPlaceholder = isInputDisabled && maxTags !== undefined && tags.length >= maxTags 
    ? t('tag_input_limit_reached_placeholder', { defaultValue: "Tag limit reached" }) 
    : defaultPlaceholder;

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {maxTags && `(Max ${maxTags})`}
        </label>
      )}
      <div className={`relative flex flex-wrap items-center gap-2 p-2 border rounded-md 
                      ${isInputDisabled ? 'bg-gray-100 dark:bg-gray-800 opacity-70' : 'bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 focus-within:border-indigo-500 dark:focus-within:border-indigo-400'}`}>
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-1 text-sm bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-md">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-100 disabled:opacity-50"
              aria-label={`Remove tag ${tag}`}
              disabled={disabled}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={finalPlaceholder}
          className="flex-grow p-1 text-sm bg-transparent focus:outline-none text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 min-w-[100px]"
          disabled={isInputDisabled}
        />
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && !isInputDisabled && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map(suggestion => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
              >
                <span>{suggestion}</span>
                {customTags.includes(suggestion) && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">Custom</span>
                )}
              </button>
            </li>
          ))}
          
          {/* Add new tag option */}
          {allowCustomTags && inputValue.trim() && !allSuggestions.includes(inputValue.trim()) && (
            <li>
              <button
                type="button"
                onClick={() => addTag(inputValue)}
                className="w-full text-left px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center"
              >
                <Plus size={14} className="mr-2" />
                Add "{inputValue.trim()}"
              </button>
            </li>
          )}
        </ul>
      )}
      
      {/* Help text */}
      {allowCustomTags && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('tag_input_help', { defaultValue: "Press Enter or comma to add tags. New tags will be saved for future use." })}
        </p>
      )}
    </div>
  );
};
