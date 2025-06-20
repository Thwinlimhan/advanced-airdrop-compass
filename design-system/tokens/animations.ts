// Design System Animation Tokens
// Consistent animation timing and easing functions

export interface AnimationToken {
  duration: string;
  easing: string;
  description: string;
}

// Duration scale
export const durationScale: Record<string, string> = {
  instant: '0ms',
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  slower: '500ms',
  slowest: '700ms',
};

// Easing functions
export const easingFunctions = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Animation tokens
export const animationTokens: Record<string, AnimationToken> = {
  // Micro-interactions
  micro: {
    duration: durationScale.fast,
    easing: easingFunctions.easeOut,
    description: 'Quick micro-interactions like button hovers',
  },

  // Standard interactions
  standard: {
    duration: durationScale.normal,
    easing: easingFunctions.easeInOut,
    description: 'Standard UI transitions',
  },

  // Complex animations
  complex: {
    duration: durationScale.slow,
    easing: easingFunctions.easeInOut,
    description: 'Complex animations like page transitions',
  },

  // Entrance animations
  entrance: {
    duration: durationScale.slow,
    easing: easingFunctions.easeOut,
    description: 'Elements entering the viewport',
  },

  // Exit animations
  exit: {
    duration: durationScale.fast,
    easing: easingFunctions.easeIn,
    description: 'Elements leaving the viewport',
  },

  // Loading animations
  loading: {
    duration: durationScale.slower,
    easing: easingFunctions.linear,
    description: 'Loading states and spinners',
  },

  // Attention-grabbing animations
  attention: {
    duration: durationScale.slow,
    easing: easingFunctions.easeOutBack,
    description: 'Attention-grabbing elements',
  },
} as const;

// Keyframe animations
export const keyframeAnimations: Record<string, Record<string, any>> = {
  // Fade animations
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },

  // Slide animations
  slideInUp: {
    from: { transform: 'translateY(100%)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  slideInDown: {
    from: { transform: 'translateY(-100%)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  slideInLeft: {
    from: { transform: 'translateX(-100%)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },
  slideInRight: {
    from: { transform: 'translateX(100%)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },

  // Scale animations
  scaleIn: {
    from: { transform: 'scale(0.9)', opacity: '0' },
    to: { transform: 'scale(1)', opacity: '1' },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: '1' },
    to: { transform: 'scale(0.9)', opacity: '0' },
  },

  // Rotate animations
  rotateIn: {
    from: { transform: 'rotate(-180deg)', opacity: '0' },
    to: { transform: 'rotate(0deg)', opacity: '1' },
  },
  rotateOut: {
    from: { transform: 'rotate(0deg)', opacity: '1' },
    to: { transform: 'rotate(180deg)', opacity: '0' },
  },

  // Bounce animations
  bounceIn: {
    from: { transform: 'scale(0.3)', opacity: '0' },
    '50%': { transform: 'scale(1.05)' },
    '70%': { transform: 'scale(0.9)' },
    to: { transform: 'scale(1)', opacity: '1' },
  },
  bounceOut: {
    from: { transform: 'scale(1)', opacity: '1' },
    '20%': { transform: 'scale(0.9)' },
    '50%': { transform: 'scale(1.05)', opacity: '1' },
    to: { transform: 'scale(0.3)', opacity: '0' },
  },

  // Pulse animation
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },

  // Spin animation
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },

  // Shake animation
  shake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
  },
} as const;

// Utility function to get animation token
export const getAnimationToken = (type: keyof typeof animationTokens): AnimationToken => {
  return animationTokens[type];
};

// Utility function to get duration
export const getDuration = (duration: keyof typeof durationScale): string => {
  return durationScale[duration];
};

// Utility function to get easing
export const getEasing = (easing: keyof typeof easingFunctions): string => {
  return easingFunctions[easing];
};

// Utility function to create animation string
export const createAnimation = (
  type: keyof typeof animationTokens,
  keyframe?: keyof typeof keyframeAnimations
): string => {
  const token = animationTokens[type];
  if (keyframe) {
    return `${keyframe} ${token.duration} ${token.easing}`;
  }
  return `all ${token.duration} ${token.easing}`;
};

// CSS Custom Properties for animations
export const generateAnimationCSS = () => {
  const css: Record<string, string> = {};

  // Generate animation classes
  Object.entries(animationTokens).forEach(([key, value]) => {
    css[`animate-${key}`] = `all ${value.duration} ${value.easing}`;
  });

  // Generate keyframe animations
  Object.entries(keyframeAnimations).forEach(([key, keyframes]) => {
    // Convert keyframes object to CSS string
    const keyframeCSS = Object.entries(keyframes)
      .map(([step, properties]) => {
        const propertyCSS = Object.entries(properties)
          .map(([prop, value]) => `${prop}: ${value};`)
          .join(' ');
        return `${step} { ${propertyCSS} }`;
      })
      .join('\n');
    
    css[`@keyframes ${key}`] = keyframeCSS;
  });

  return css;
}; 