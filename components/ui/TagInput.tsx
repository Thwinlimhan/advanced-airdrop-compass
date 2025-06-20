
import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation'; // Added

interface TagInputProps {
  id: string;
  label?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[]; // Optional: for autocomplete/suggestions
  wrapperClassName?: string;
  maxTags?: number;
  disabled?: boolean; // Added disabled prop
}

export const TagInput: React.FC<TagInputProps> = ({
  id,
  label,
  tags,
  onTagsChange,
  placeholder, // Default will be handled by t function
  suggestions = [],
  wrapperClassName = '',
  maxTags,
  disabled = false, // Default to false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { t } = useTranslation(); // Added

  const defaultPlaceholder = placeholder || t('tag_input_default_placeholder', { defaultValue: "Add a tag..." });

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
      onTagsChange([...tags, newTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const filteredSuggestions = suggestions.filter(
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
          // onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click on suggestion
          placeholder={finalPlaceholder}
          className="flex-grow p-1 text-sm bg-transparent focus:outline-none text-text-light dark:text-text-dark placeholder-gray-400 dark:placeholder-gray-500 min-w-[100px]"
          disabled={isInputDisabled}
        />
      </div>
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && !isInputDisabled && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map(suggestion => (
            <li key={suggestion}>
              <button
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
