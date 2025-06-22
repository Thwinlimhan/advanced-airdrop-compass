// Design System Main Exports
// Advanced Crypto Airdrop Compass

// Design Tokens
export * from './tokens/colors';
export * from './tokens/typography';
export * from './tokens/spacing';
export * from './tokens/shadows';
export * from './tokens/animations';

// Foundation Components
export * from './components/Button';
export * from './components/Input';
export * from './components/Select';
export * from './components/Textarea';
export * from './components/Badge';
export * from './components/Card';
export * from './components/Modal';
export * from './components/DraggableModal';
export * from './components/Sidebar';
export * from './components/Navbar';

// Utility Functions
export const createTheme = (accentColor: string = '#885AF8') => {
  // Generate CSS variables for the theme
  const root = document.documentElement;
  const rgb = hexToRgb(accentColor);
  
  if (rgb) {
    root.style.setProperty('--color-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty('--color-accent', accentColor);
  }
};

export const setTheme = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const getTheme = (): 'light' | 'dark' => {
  return document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
};

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Design System Version
export const DESIGN_SYSTEM_VERSION = '1.0.0'; 