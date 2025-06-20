// Design System Color Tokens
// Supports dynamic theming with user-configurable accent colors

export interface ColorToken {
  light: string;
  dark: string;
  description: string;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// Primary Colors (Dynamic - user configurable)
export const primaryColors: ColorScale = {
  50: 'rgba(var(--color-accent-rgb), 0.05)',
  100: 'rgba(var(--color-accent-rgb), 0.1)',
  200: 'rgba(var(--color-accent-rgb), 0.2)',
  300: 'rgba(var(--color-accent-rgb), 0.3)',
  400: 'rgba(var(--color-accent-rgb), 0.4)',
  500: 'rgba(var(--color-accent-rgb), 0.5)',
  600: 'rgba(var(--color-accent-rgb), 0.6)',
  700: 'rgba(var(--color-accent-rgb), 0.7)',
  800: 'rgba(var(--color-accent-rgb), 0.8)',
  900: 'rgba(var(--color-accent-rgb), 0.9)',
};

// Neutral Colors
export const neutralColors: ColorScale = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
};

export const neutralColorsDark: ColorScale = {
  50: '#1F2937',
  100: '#374151',
  200: '#4B5563',
  300: '#6B7280',
  400: '#9CA3AF',
  500: '#D1D5DB',
  600: '#E5E7EB',
  700: '#F3F4F6',
  800: '#F9FAFB',
  900: '#FFFFFF',
};

// Semantic Colors
export const semanticColors = {
  success: {
    light: '#10B981',
    dark: '#34D399',
    description: 'Success states, confirmations, positive actions',
  },
  warning: {
    light: '#F59E0B',
    dark: '#FBBF24',
    description: 'Warning states, caution messages',
  },
  error: {
    light: '#EF4444',
    dark: '#F87171',
    description: 'Error states, destructive actions',
  },
  info: {
    light: '#3B82F6',
    dark: '#60A5FA',
    description: 'Information states, neutral messages',
  },
} as const;

// Background Colors
export const backgroundColors: Record<string, ColorToken> = {
  primary: {
    light: '#FFFFFF',
    dark: '#1E1E2D',
    description: 'Main application background',
  },
  secondary: {
    light: '#F9FAFB',
    dark: '#27293E',
    description: 'Secondary background for cards and sections',
  },
  tertiary: {
    light: '#F3F4F6',
    dark: '#2D2F45',
    description: 'Tertiary background for nested elements',
  },
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
    description: 'Overlay backgrounds for modals and dropdowns',
  },
};

// Text Colors
export const textColors: Record<string, ColorToken> = {
  primary: {
    light: '#111827',
    dark: '#FFFFFF',
    description: 'Primary text color',
  },
  secondary: {
    light: '#6B7280',
    dark: '#A7A7A7',
    description: 'Secondary text color',
  },
  tertiary: {
    light: '#9CA3AF',
    dark: '#6B7280',
    description: 'Tertiary text color',
  },
  inverse: {
    light: '#FFFFFF',
    dark: '#111827',
    description: 'Inverse text color for dark backgrounds',
  },
  accent: {
    light: 'rgba(var(--color-accent-rgb), 1)',
    dark: 'rgba(var(--color-accent-rgb), 1)',
    description: 'Accent text color',
  },
};

// Border Colors
export const borderColors: Record<string, ColorToken> = {
  primary: {
    light: '#E5E7EB',
    dark: '#374151',
    description: 'Primary border color',
  },
  secondary: {
    light: '#F3F4F6',
    dark: '#4B5563',
    description: 'Secondary border color',
  },
  accent: {
    light: 'rgba(var(--color-accent-rgb), 0.3)',
    dark: 'rgba(var(--color-accent-rgb), 0.3)',
    description: 'Accent border color',
  },
  focus: {
    light: 'rgba(var(--color-accent-rgb), 0.5)',
    dark: 'rgba(var(--color-accent-rgb), 0.5)',
    description: 'Focus state border color',
  },
};

// Shadow Colors
export const shadowColors = {
  light: {
    small: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    large: 'rgba(0, 0, 0, 0.15)',
    accent: 'rgba(var(--color-accent-rgb), 0.2)',
  },
  dark: {
    small: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.4)',
    large: 'rgba(0, 0, 0, 0.5)',
    accent: 'rgba(var(--color-accent-rgb), 0.3)',
  },
};

// Utility function to get color based on theme
export const getColor = (colorToken: ColorToken, theme: 'light' | 'dark'): string => {
  return theme === 'light' ? colorToken.light : colorToken.dark;
};

// Utility function to get semantic color
export const getSemanticColor = (type: keyof typeof semanticColors, theme: 'light' | 'dark'): string => {
  return theme === 'light' ? semanticColors[type].light : semanticColors[type].dark;
};

// CSS Custom Properties for dynamic theming
export const generateCSSVariables = (accentColor: string = '#885AF8') => {
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '136, 90, 248'; // Default fallback
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  };

  return {
    '--color-accent-rgb': hexToRgb(accentColor),
    '--color-accent': accentColor,
  };
}; 