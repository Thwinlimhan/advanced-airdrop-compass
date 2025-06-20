// Design System Spacing Tokens
// Consistent spacing scale based on 4px base unit

export interface SpacingToken {
  value: string;
  description: string;
}

// Base spacing unit: 4px
export const spacingScale: Record<string, SpacingToken> = {
  0: {
    value: '0',
    description: 'No spacing',
  },
  1: {
    value: '0.25rem', // 4px
    description: 'Extra small spacing',
  },
  2: {
    value: '0.5rem', // 8px
    description: 'Small spacing',
  },
  3: {
    value: '0.75rem', // 12px
    description: 'Medium-small spacing',
  },
  4: {
    value: '1rem', // 16px
    description: 'Base spacing',
  },
  5: {
    value: '1.25rem', // 20px
    description: 'Medium spacing',
  },
  6: {
    value: '1.5rem', // 24px
    description: 'Medium-large spacing',
  },
  8: {
    value: '2rem', // 32px
    description: 'Large spacing',
  },
  10: {
    value: '2.5rem', // 40px
    description: 'Extra large spacing',
  },
  12: {
    value: '3rem', // 48px
    description: '2XL spacing',
  },
  16: {
    value: '4rem', // 64px
    description: '3XL spacing',
  },
  20: {
    value: '5rem', // 80px
    description: '4XL spacing',
  },
  24: {
    value: '6rem', // 96px
    description: '5XL spacing',
  },
  32: {
    value: '8rem', // 128px
    description: '6XL spacing',
  },
  40: {
    value: '10rem', // 160px
    description: '7XL spacing',
  },
  48: {
    value: '12rem', // 192px
    description: '8XL spacing',
  },
  56: {
    value: '14rem', // 224px
    description: '9XL spacing',
  },
  64: {
    value: '16rem', // 256px
    description: '10XL spacing',
  },
};

// Semantic spacing tokens
export const spacingTokens = {
  // Component spacing
  component: {
    xs: spacingScale[2], // 8px
    sm: spacingScale[3], // 12px
    md: spacingScale[4], // 16px
    lg: spacingScale[6], // 24px
    xl: spacingScale[8], // 32px
  },

  // Layout spacing
  layout: {
    xs: spacingScale[4], // 16px
    sm: spacingScale[6], // 24px
    md: spacingScale[8], // 32px
    lg: spacingScale[12], // 48px
    xl: spacingScale[16], // 64px
  },

  // Section spacing
  section: {
    sm: spacingScale[8], // 32px
    md: spacingScale[12], // 48px
    lg: spacingScale[16], // 64px
    xl: spacingScale[24], // 96px
  },

  // Page spacing
  page: {
    sm: spacingScale[12], // 48px
    md: spacingScale[16], // 64px
    lg: spacingScale[24], // 96px
    xl: spacingScale[32], // 128px
  },
} as const;

// Utility function to get spacing value
export const getSpacing = (size: keyof typeof spacingScale): string => {
  return spacingScale[size].value;
};

// Utility function to get semantic spacing
export const getSemanticSpacing = (
  category: keyof typeof spacingTokens,
  size: keyof typeof spacingTokens[typeof category]
): string => {
  return spacingTokens[category][size].value;
};

// CSS Custom Properties for spacing
export const generateSpacingCSS = () => {
  const css: Record<string, string> = {};

  // Generate scale classes
  Object.entries(spacingScale).forEach(([key, value]) => {
    css[`space-${key}`] = value.value;
  });

  return css;
}; 