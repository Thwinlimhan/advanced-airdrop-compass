import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = 'Loading...' }) => (
  <div className="flex items-center justify-center p-4">
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary ${size === 'sm' ? 'h-4 w-4' : 'h-8 w-8'}`} />
    {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
  </div>
);
