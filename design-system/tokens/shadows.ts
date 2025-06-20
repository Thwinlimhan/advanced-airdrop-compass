// Design System Shadow Tokens
// Consistent shadow system for elevation and depth

export interface ShadowToken {
  light: string;
  dark: string;
  description: string;
}

// Shadow scale based on elevation levels
export const shadowScale: Record<string, ShadowToken> = {
  none: {
    light: 'none',
    dark: 'none',
    description: 'No shadow',
  },
  xs: {
    light: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    dark: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    description: 'Extra small shadow for subtle elevation',
  },
  sm: {
    light: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    dark: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    description: 'Small shadow for cards and buttons',
  },
  md: {
    light: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    dark: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    description: 'Medium shadow for elevated cards',
  },
  lg: {
    light: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    dark: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    description: 'Large shadow for modals and dropdowns',
  },
  xl: {
    light: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    dark: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    description: 'Extra large shadow for tooltips and popovers',
  },
  '2xl': {
    light: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    dark: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    description: '2XL shadow for high elevation elements',
  },
  inner: {
    light: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    dark: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
    description: 'Inner shadow for pressed states',
  },
};

// Accent shadows with primary color
export const accentShadows: Record<string, ShadowToken> = {
  sm: {
    light: '0 1px 3px 0 rgba(var(--color-accent-rgb), 0.2), 0 1px 2px 0 rgba(var(--color-accent-rgb), 0.1)',
    dark: '0 1px 3px 0 rgba(var(--color-accent-rgb), 0.3), 0 1px 2px 0 rgba(var(--color-accent-rgb), 0.2)',
    description: 'Small accent shadow',
  },
  md: {
    light: '0 4px 6px -1px rgba(var(--color-accent-rgb), 0.2), 0 2px 4px -1px rgba(var(--color-accent-rgb), 0.1)',
    dark: '0 4px 6px -1px rgba(var(--color-accent-rgb), 0.3), 0 2px 4px -1px rgba(var(--color-accent-rgb), 0.2)',
    description: 'Medium accent shadow',
  },
  lg: {
    light: '0 10px 15px -3px rgba(var(--color-accent-rgb), 0.2), 0 4px 6px -2px rgba(var(--color-accent-rgb), 0.1)',
    dark: '0 10px 15px -3px rgba(var(--color-accent-rgb), 0.3), 0 4px 6px -2px rgba(var(--color-accent-rgb), 0.2)',
    description: 'Large accent shadow',
  },
};

// Semantic shadow tokens
export const shadowTokens = {
  // Component shadows
  component: {
    button: shadowScale.sm,
    card: shadowScale.md,
    input: shadowScale.xs,
    badge: shadowScale.xs,
  },

  // Layout shadows
  layout: {
    sidebar: shadowScale.lg,
    navbar: shadowScale.md,
    footer: shadowScale.sm,
  },

  // Overlay shadows
  overlay: {
    modal: shadowScale['2xl'],
    dropdown: shadowScale.lg,
    tooltip: shadowScale.xl,
    popover: shadowScale.lg,
  },

  // Interactive shadows
  interactive: {
    hover: shadowScale.md,
    focus: accentShadows.md,
    pressed: shadowScale.inner,
  },
} as const;

// Utility function to get shadow based on theme
export const getShadow = (shadowToken: ShadowToken, theme: 'light' | 'dark'): string => {
  return theme === 'light' ? shadowToken.light : shadowToken.dark;
};

// Utility function to get shadow from scale
export const getShadowFromScale = (size: keyof typeof shadowScale, theme: 'light' | 'dark'): string => {
  return getShadow(shadowScale[size], theme);
};

// Utility function to get accent shadow
export const getAccentShadow = (size: keyof typeof accentShadows, theme: 'light' | 'dark'): string => {
  return getShadow(accentShadows[size], theme);
};

// CSS Custom Properties for shadows
export const generateShadowCSS = () => {
  const css: Record<string, string> = {};

  // Generate scale classes
  Object.entries(shadowScale).forEach(([key, value]) => {
    css[`shadow-${key}`] = value.light;
    css[`shadow-${key}-dark`] = value.dark;
  });

  // Generate accent shadow classes
  Object.entries(accentShadows).forEach(([key, value]) => {
    css[`shadow-accent-${key}`] = value.light;
    css[`shadow-accent-${key}-dark`] = value.dark;
  });

  return css;
}; 