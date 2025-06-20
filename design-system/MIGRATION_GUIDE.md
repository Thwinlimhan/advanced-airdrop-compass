# Design System Migration Guide

## Overview

This guide will help you migrate from the old UI components to the new design system for the Advanced Crypto Airdrop Compass application.

## What's New

### 🎨 **Modern Design Tokens**
- **Color System**: Dynamic theming with user-configurable accent colors
- **Typography**: Consistent font scales and weights
- **Spacing**: 4px-based spacing system
- **Shadows**: Elevation-based shadow system
- **Animations**: Consistent timing and easing functions

### 🧩 **Component Library**
- **Button**: 7 variants, 4 sizes, loading states, icons
- **Card**: 4 variants, 5 padding options, interactive states
- **Input**: 3 variants, 3 sizes, validation states, icons
- **Modal**: 5 sizes, focus management, accessibility
- **Sidebar**: Collapsible, nested navigation, badges
- **Navbar**: Responsive, mobile menu, customizable

### ♿ **Accessibility Features**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast ratios

## Migration Steps

### 1. **Update Imports**

#### Old Way:
```tsx
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
```

#### New Way:
```tsx
import { Button, Card, Input } from '../design-system';
```

### 2. **Component Updates**

#### Button Component

**Old:**
```tsx
<Button 
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
  onClick={handleClick}
>
  Click me
</Button>
```

**New:**
```tsx
<Button 
  variant="primary"
  size="md"
  onClick={handleClick}
>
  Click me
</Button>
```

**Available Variants:**
- `primary` - Main action buttons
- `secondary` - Secondary actions
- `outline` - Bordered buttons
- `ghost` - Minimal styling
- `danger` - Destructive actions
- `success` - Positive actions
- `warning` - Caution actions

**Available Sizes:**
- `sm` - Small buttons
- `md` - Default size
- `lg` - Large buttons
- `xl` - Extra large buttons

#### Card Component

**Old:**
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-4 shadow">
  <h3 className="text-lg font-semibold mb-2">Title</h3>
  <p>Content</p>
</div>
```

**New:**
```tsx
<Card variant="elevated" padding="md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

**Available Variants:**
- `default` - Basic card
- `elevated` - With shadow
- `outlined` - Bordered only
- `interactive` - Hover effects

#### Input Component

**Old:**
```tsx
<input 
  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter text"
/>
```

**New:**
```tsx
<Input 
  variant="default"
  size="md"
  placeholder="Enter text"
  label="Input Label"
  helperText="Optional helper text"
/>
```

**Available Variants:**
- `default` - Standard input
- `outlined` - Bordered input
- `filled` - Background filled

#### Modal Component

**Old:**
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  <div className="bg-white rounded-lg p-6 max-w-md">
    <h2>Modal Title</h2>
    <p>Modal content</p>
  </div>
</div>
```

**New:**
```tsx
<Modal 
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="md"
>
  <ModalContent>
    <p>Modal content</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </ModalFooter>
</Modal>
```

### 3. **CSS Class Updates**

#### Old Utility Classes:
```css
.bg-blue-500 → .bg-accent
.text-gray-600 → .text-secondary
.border-gray-200 → .border-border-primary
.shadow-md → .shadow-md
```

#### New Design System Classes:
```css
/* Colors */
.text-primary, .text-secondary, .text-tertiary
.bg-primary, .bg-secondary, .bg-tertiary
.border-border-primary, .border-border-secondary

/* Spacing */
.p-4 → .p-4 (same, but now uses CSS variables)
.m-6 → .m-6 (same, but now uses CSS variables)

/* Typography */
.text-lg → .text-lg (same, but now uses CSS variables)
.font-semibold → .font-semibold (same, but now uses CSS variables)
```

### 4. **Theme Integration**

#### Update Theme Context:
```tsx
// Old theme context
const theme = {
  isDark: true,
  toggleTheme: () => {}
};

// New theme context with design system
const theme = {
  isDark: true,
  toggleTheme: () => {},
  accentColor: '#885AF8',
  setAccentColor: (color: string) => {}
};
```

#### Apply Theme to Body:
```tsx
// In your main App component
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.isDark ? 'dark' : 'light');
}, [theme.isDark]);
```

### 5. **Responsive Design**

#### Old Responsive Classes:
```css
@media (max-width: 768px) {
  .hidden-mobile { display: none; }
}
```

#### New Responsive Classes:
```css
.mobile-hidden { /* Hidden on mobile */ }
.desktop-hidden { /* Hidden on desktop */ }
```

### 6. **Animation Updates**

#### Old Animations:
```css
transition: all 0.3s ease;
```

#### New Animations:
```tsx
import { createAnimation } from '../design-system';

// Use design system animations
style={{ transition: createAnimation('standard') }}
```

## Benefits of Migration

### 🚀 **Performance**
- Reduced CSS bundle size
- Optimized animations
- Better tree-shaking

### 🎯 **Consistency**
- Unified design language
- Consistent spacing and typography
- Standardized component behavior

### ♿ **Accessibility**
- WCAG 2.1 AA compliance
- Better keyboard navigation
- Screen reader support

### 🔧 **Maintainability**
- Centralized design tokens
- Type-safe components
- Easy theme customization

### 📱 **Responsive**
- Mobile-first design
- Consistent breakpoints
- Touch-friendly interactions

## Testing Checklist

After migration, verify:

- [ ] All components render correctly
- [ ] Dark/light theme switching works
- [ ] Keyboard navigation functions
- [ ] Screen reader compatibility
- [ ] Mobile responsiveness
- [ ] Animation performance
- [ ] Focus management
- [ ] Error states display properly
- [ ] Loading states work
- [ ] Form validation works

## Troubleshooting

### Common Issues:

1. **CSS Variables Not Working**
   - Ensure the design system CSS is imported
   - Check that `data-theme` attribute is set on `html` element

2. **Component Styling Conflicts**
   - Remove old CSS classes
   - Use design system variants instead of custom classes

3. **Theme Not Switching**
   - Verify theme context is properly set up
   - Check that `data-theme` attribute updates correctly

4. **Animations Not Working**
   - Ensure animation tokens are imported
   - Check that `createAnimation` function is used correctly

## Support

For questions or issues during migration:

1. Check the design system documentation
2. Review component examples in the codebase
3. Test with the design system playground (if available)
4. Create an issue in the project repository

## Next Steps

After completing the migration:

1. **Audit**: Review all components for consistency
2. **Optimize**: Remove unused CSS and components
3. **Document**: Update component documentation
4. **Test**: Comprehensive testing across devices
5. **Deploy**: Gradual rollout with monitoring 