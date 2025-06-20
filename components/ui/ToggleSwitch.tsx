
import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  srLabel?: string; // Screen reader label
  disabled?: boolean; // Added disabled prop
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, srLabel, disabled = false }) => {
  const actualLabel = srLabel || label || 'Toggle';
  const cursorClass = disabled ? 'cursor-not-allowed' : 'cursor-pointer';
  const opacityClass = disabled ? 'opacity-50' : '';

  return (
    <div className={`flex items-center ${opacityClass}`}>
      {label && <span className={`mr-3 text-sm font-medium text-text-light dark:text-muted-dark ${disabled ? 'opacity-70' : ''}`}>{label}</span>} {/* Label light gray */}
      <label htmlFor={id} className={`relative inline-flex items-center ${cursorClass}`}>
        <input 
          type="checkbox" 
          id={id}
          className="sr-only peer" 
          checked={checked}
          onChange={(e) => { if (!disabled) onChange(e.target.checked); }}
          disabled={disabled}
        />
        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 ${disabled ? '' : 'peer-focus:ring-primary/50 dark:peer-focus:ring-primary/50'} rounded-full peer dark:bg-gray-700/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 ${checked && !disabled ? 'peer-checked:bg-primary' : checked && disabled ? 'peer-checked:bg-gray-400 dark:peer-checked:bg-gray-500' : '' }`}></div> {/* Use primary accent for checked state */}
        <span className="sr-only">{actualLabel}</span>
      </label>
    </div>
  );
};