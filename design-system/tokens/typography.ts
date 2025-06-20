// Design System Typography Tokens
// Consistent typography scale and font definitions

export interface TypographyToken {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing?: string;
  fontFamily?: string;
  fontStyle?: string;
  description: string;
}

export interface FontWeight {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
}

// Font Weights
export const fontWeights: FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Font Families
export const fontFamilies = {
  sans: [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    '"Noto Sans"',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
  ].join(', '),
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace',
  ].join(', '),
};

// Typography Scale
export const typographyScale: Record<string, TypographyToken> = {
  xs: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1rem', // 16px
    fontWeight: fontWeights.regular,
    description: 'Extra small text for captions, labels',
  },
  sm: {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem', // 20px
    fontWeight: fontWeights.regular,
    description: 'Small text for secondary information',
  },
  base: {
    fontSize: '1rem', // 16px
    lineHeight: '1.5rem', // 24px
    fontWeight: fontWeights.regular,
    description: 'Base text size for body content',
  },
  lg: {
    fontSize: '1.125rem', // 18px
    lineHeight: '1.75rem', // 28px
    fontWeight: fontWeights.regular,
    description: 'Large text for emphasized content',
  },
  xl: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.75rem', // 28px
    fontWeight: fontWeights.semibold,
    description: 'Extra large text for headings',
  },
  '2xl': {
    fontSize: '1.5rem', // 24px
    lineHeight: '2rem', // 32px
    fontWeight: fontWeights.semibold,
    description: '2XL text for section headings',
  },
  '3xl': {
    fontSize: '1.875rem', // 30px
    lineHeight: '2.25rem', // 36px
    fontWeight: fontWeights.bold,
    description: '3XL text for page headings',
  },
  '4xl': {
    fontSize: '2.25rem', // 36px
    lineHeight: '2.5rem', // 40px
    fontWeight: fontWeights.bold,
    description: '4XL text for large headings',
  },
  '5xl': {
    fontSize: '3rem', // 48px
    lineHeight: '1',
    fontWeight: fontWeights.bold,
    description: '5XL text for hero headings',
  },
  '6xl': {
    fontSize: '3.75rem', // 60px
    lineHeight: '1',
    fontWeight: fontWeights.bold,
    description: '6XL text for display headings',
  },
};

// Semantic Typography Styles
export const typographyStyles = {
  // Headings
  h1: {
    ...typographyScale['4xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: '-0.025em',
    description: 'Main page heading',
  },
  h2: {
    ...typographyScale['3xl'],
    fontWeight: fontWeights.semibold,
    letterSpacing: '-0.025em',
    description: 'Section heading',
  },
  h3: {
    ...typographyScale['2xl'],
    fontWeight: fontWeights.semibold,
    description: 'Subsection heading',
  },
  h4: {
    ...typographyScale['xl'],
    fontWeight: fontWeights.semibold,
    description: 'Card heading',
  },
  h5: {
    ...typographyScale['lg'],
    fontWeight: fontWeights.medium,
    description: 'Small heading',
  },
  h6: {
    ...typographyScale['base'],
    fontWeight: fontWeights.medium,
    description: 'Tiny heading',
  },

  // Body Text
  body: {
    ...typographyScale.base,
    description: 'Default body text',
  },
  bodySmall: {
    ...typographyScale.sm,
    description: 'Small body text',
  },
  bodyLarge: {
    ...typographyScale.lg,
    description: 'Large body text',
  },

  // UI Elements
  label: {
    ...typographyScale.sm,
    fontWeight: fontWeights.medium,
    description: 'Form labels',
  },
  caption: {
    ...typographyScale.xs,
    description: 'Captions and metadata',
  },
  button: {
    ...typographyScale.sm,
    fontWeight: fontWeights.medium,
    description: 'Button text',
  },
  input: {
    ...typographyScale.base,
    description: 'Input field text',
  },

  // Specialized
  code: {
    ...typographyScale.sm,
    fontFamily: fontFamilies.mono,
    description: 'Inline code',
  },
  codeBlock: {
    ...typographyScale.sm,
    fontFamily: fontFamilies.mono,
    lineHeight: '1.5rem',
    description: 'Code blocks',
  },
  quote: {
    ...typographyScale.lg,
    fontStyle: 'italic',
    description: 'Blockquotes',
  },
} as const;

// Utility function to generate CSS classes
export const generateTypographyCSS = () => {
  const css: Record<string, string> = {};

  // Generate scale classes
  Object.entries(typographyScale).forEach(([key, value]) => {
    css[`text-${key}`] = `
      font-size: ${value.fontSize};
      line-height: ${value.lineHeight};
      font-weight: ${value.fontWeight};
      ${value.letterSpacing ? `letter-spacing: ${value.letterSpacing};` : ''}
    `;
  });

  // Generate semantic classes
  Object.entries(typographyStyles).forEach(([key, value]) => {
    css[`text-${key}`] = `
      font-size: ${value.fontSize};
      line-height: ${value.lineHeight};
      font-weight: ${value.fontWeight};
      ${value.letterSpacing ? `letter-spacing: ${value.letterSpacing};` : ''}
      ${value.fontFamily ? `font-family: ${value.fontFamily};` : ''}
      ${value.fontStyle ? `font-style: ${value.fontStyle};` : ''}
    `;
  });

  return css;
};

// Utility function to get typography token
export const getTypographyToken = (size: keyof typeof typographyScale): TypographyToken => {
  return typographyScale[size];
};

// Utility function to get semantic typography style
export const getTypographyStyle = (style: keyof typeof typographyStyles): TypographyToken => {
  return typographyStyles[style];
}; 