import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum ColorScheme {
  BLUE = 'blue',
  PURPLE = 'purple',
  GREEN = 'green',
  ORANGE = 'orange',
  RED = 'red',
  TEAL = 'teal',
  PINK = 'pink',
  INDIGO = 'indigo'
}

export interface ThemeConfig {
  theme: Theme;
  colorScheme: ColorScheme;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
}

export interface ThemeContextType {
  config: ThemeConfig;
  actualTheme: 'light' | 'dark'; // The resolved theme
  updateTheme: (theme: Theme) => void;
  updateColorScheme: (scheme: ColorScheme) => void;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
  toggleTheme: () => void;
}

const defaultConfig: ThemeConfig = {
  theme: Theme.LIGHT,
  colorScheme: ColorScheme.PURPLE,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  borderRadius: 'medium'
};

const colorSchemes = {
  [ColorScheme.BLUE]: {
    primary: '#3b82f6',
    primaryRgb: '59, 130, 246',
    secondary: '#1e40af',
    accent: '#60a5fa'
  },
  [ColorScheme.PURPLE]: {
    primary: '#8b5cf6',
    primaryRgb: '139, 92, 246',
    secondary: '#6d28d9',
    accent: '#a78bfa'
  },
  [ColorScheme.GREEN]: {
    primary: '#10b981',
    primaryRgb: '16, 185, 129',
    secondary: '#047857',
    accent: '#34d399'
  },
  [ColorScheme.ORANGE]: {
    primary: '#f59e0b',
    primaryRgb: '245, 158, 11',
    secondary: '#d97706',
    accent: '#fbbf24'
  },
  [ColorScheme.RED]: {
    primary: '#ef4444',
    primaryRgb: '239, 68, 68',
    secondary: '#dc2626',
    accent: '#f87171'
  },
  [ColorScheme.TEAL]: {
    primary: '#14b8a6',
    primaryRgb: '20, 184, 166',
    secondary: '#0f766e',
    accent: '#2dd4bf'
  },
  [ColorScheme.PINK]: {
    primary: '#ec4899',
    primaryRgb: '236, 72, 153',
    secondary: '#be185d',
    accent: '#f472b6'
  },
  [ColorScheme.INDIGO]: {
    primary: '#6366f1',
    primaryRgb: '99, 102, 241',
    secondary: '#4338ca',
    accent: '#818cf8'
  }
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    try {
      const stored = localStorage.getItem('themeConfig');
      return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
    } catch {
      return defaultConfig;
    }
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const actualTheme = config.theme === Theme.AUTO ? systemTheme : config.theme as 'light' | 'dark';

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !config.reducedMotion) {
        setConfig(prev => ({ ...prev, reducedMotion: true }));
      }
    };

    // Set initial value
    if (mediaQuery.matches) {
      setConfig(prev => ({ ...prev, reducedMotion: true }));
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [config.reducedMotion]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme class
    root.classList.toggle('dark', actualTheme === 'dark');
    
    // Apply color scheme
    const colors = colorSchemes[config.colorScheme];
    root.style.setProperty('--color-primary-500', colors.primary);
    root.style.setProperty('--color-primary-600', colors.secondary);
    root.style.setProperty('--color-primary-400', colors.accent);
    root.style.setProperty('--color-primary-rgb', colors.primaryRgb);
    
    // Apply accessibility preferences
    root.classList.toggle('reduce-motion', config.reducedMotion);
    root.classList.toggle('high-contrast', config.highContrast);
    
    // Apply font size
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizes[config.fontSize]);
    
    // Apply border radius
    const radiusValues = {
      none: '0px',
      small: '0.25rem',
      medium: '0.5rem',
      large: '1rem'
    };
    root.style.setProperty('--default-radius', radiusValues[config.borderRadius]);
    
    // Update meta theme color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', colors.primary);
    }
    
    // Save to localStorage
    localStorage.setItem('themeConfig', JSON.stringify(config));
  }, [config, actualTheme]);

  const updateTheme = useCallback((theme: Theme) => {
    setConfig(prev => ({ ...prev, theme }));
  }, []);

  const updateColorScheme = useCallback((colorScheme: ColorScheme) => {
    setConfig(prev => ({ ...prev, colorScheme }));
  }, []);

  const updateConfig = useCallback((updates: Partial<ThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleTheme = useCallback(() => {
    if (config.theme === Theme.AUTO) {
      setConfig(prev => ({ ...prev, theme: actualTheme === 'dark' ? Theme.LIGHT : Theme.DARK }));
    } else {
      setConfig(prev => ({ 
        ...prev, 
        theme: prev.theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT 
      }));
    }
  }, [config.theme, actualTheme]);

  const value: ThemeContextType = {
    config,
    actualTheme,
    updateTheme,
    updateColorScheme,
    updateConfig,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Enhanced theme hook
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility function to get theme-aware colors
export const getThemeColors = (theme: 'light' | 'dark', colorScheme: ColorScheme) => {
  const schemeColors = colorSchemes[colorScheme];
  // Map to CSS variables for semantic colors
  const getVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name) || undefined;

  return {
    primary: schemeColors.primary,
    primaryRgb: schemeColors.primaryRgb,
    secondary: schemeColors.secondary,
    accent: schemeColors.accent,
    text: {
      primary: getVar('--color-text-primary') || '#0f172a',
      secondary: getVar('--color-text-secondary') || '#475569',
      tertiary: getVar('--color-text-tertiary') || '#64748b',
      placeholder: getVar('--color-text-placeholder') || '#94a3b8',
    },
    surface: getVar('--color-surface') || '#ffffff',
    surfaceAlt: getVar('--color-surface-alt') || '#f1f5f9',
    background: getVar('--color-background') || '#ffffff',
    backgroundAlt: getVar('--color-background-alt') || '#f8fafc',
    border: getVar('--color-border') || '#e2e8f0',
    borderAlt: getVar('--color-border-alt') || '#cbd5e1',
    success: getVar('--color-success') || '#10b981',
    successBg: getVar('--color-success-bg') || '#dcfce7',
    warning: getVar('--color-warning') || '#f59e0b',
    warningBg: getVar('--color-warning-bg') || '#fef3c7',
    error: getVar('--color-error') || '#ef4444',
    errorBg: getVar('--color-error-bg') || '#fee2e2',
    info: getVar('--color-info') || '#3b82f6',
    infoBg: getVar('--color-info-bg') || '#dbeafe',
    shadow: {
      xs: getVar('--shadow-xs'),
      sm: getVar('--shadow-sm'),
      md: getVar('--shadow-md'),
      lg: getVar('--shadow-lg'),
      xl: getVar('--shadow-xl'),
      glow: getVar('--shadow-glow'),
      cardHover: getVar('--shadow-card-hover'),
    },
    radius: {
      xs: getVar('--radius-xs'),
      sm: getVar('--radius-sm'),
      md: getVar('--radius-md'),
      lg: getVar('--radius-lg'),
      xl: getVar('--radius-xl'),
      full: getVar('--radius-full'),
    },
  };
};
