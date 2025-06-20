# Design System Component Guide

## Overview

This guide provides comprehensive documentation for all design system components, including usage examples, best practices, and design patterns.

## Component Categories

### 🎯 **Foundation Components**

#### Design Tokens
- **Colors**: Dynamic theming with semantic color system
- **Typography**: Consistent font scales and weights
- **Spacing**: 4px-based spacing system
- **Shadows**: Elevation-based shadow system
- **Animations**: Consistent timing and easing functions

### 🧩 **Basic Components**

#### Button
```tsx
import { Button } from '../design-system/components/Button';

// Primary action button
<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>

// Secondary action with icon
<Button variant="secondary" size="sm" leftIcon={<Plus size={16} />}>
  Add Item
</Button>

// Loading state
<Button variant="primary" loading>
  Processing...
</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`, `warning`
**Sizes**: `sm`, `md`, `lg`, `xl`
**Features**: Loading states, icons, full width, disabled states

#### Input
```tsx
import { Input } from '../design-system/components/Input';

// Basic input with label
<Input
  label="Email Address"
  placeholder="Enter your email"
  helperText="We'll never share your email"
/>

// Input with validation
<Input
  label="Password"
  type="password"
  errorText="Password must be at least 8 characters"
  error
/>

// Input with icons
<Input
  label="Search"
  leftIcon={<Search size={16} />}
  rightIcon={<Filter size={16} />}
  placeholder="Search items..."
/>
```

**Variants**: `default`, `outlined`, `filled`
**Sizes**: `sm`, `md`, `lg`
**Features**: Validation states, icons, labels, helper text

#### Select
```tsx
import { Select } from '../design-system/components/Select';

// Basic select
<Select
  label="Choose Category"
  placeholder="Select a category"
  options={[
    { value: 'tech', label: 'Technology' },
    { value: 'finance', label: 'Finance' },
    { value: 'health', label: 'Healthcare' }
  ]}
  onValueChange={handleCategoryChange}
/>

// Searchable multi-select
<Select
  label="Select Tags"
  multiSelect
  searchable
  options={tagOptions}
  selectedValues={selectedTags}
  onSelectionChange={setSelectedTags}
/>
```

**Features**: Searchable, multi-select, icons, validation states

#### Textarea
```tsx
import { Textarea } from '../design-system/components/Textarea';

// Basic textarea
<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={4}
/>

// Textarea with character count
<Textarea
  label="Bio"
  maxLength={500}
  characterCount
  placeholder="Tell us about yourself..."
/>
```

**Features**: Character count, resizable, validation states

#### Badge
```tsx
import { Badge } from '../design-system/components/Badge';

// Status badge
<Badge variant="success">Active</Badge>

// Removable badge
<Badge variant="primary" removable onRemove={handleRemove}>
  Tag Name
</Badge>

// Interactive badge
<Badge variant="outline" interactive onClick={handleClick}>
  Clickable Badge
</Badge>
```

**Variants**: `default`, `primary`, `secondary`, `success`, `warning`, `error`, `info`, `outline`
**Sizes**: `sm`, `md`, `lg`

### 🎨 **Layout Components**

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../design-system/components/Card';

// Basic card
<Card variant="elevated" padding="md">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here...</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>

// Interactive card
<Card variant="interactive" hoverable onClick={handleCardClick}>
  <CardContent>
    <h3>Clickable Card</h3>
    <p>This card is clickable</p>
  </CardContent>
</Card>
```

**Variants**: `default`, `elevated`, `outlined`, `interactive`
**Padding**: `none`, `sm`, `md`, `lg`, `xl`

#### Modal
```tsx
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../design-system/components/Modal';

<Modal isOpen={isOpen} onClose={handleClose} size="lg">
  <ModalHeader>
    <ModalTitle>Modal Title</ModalTitle>
  </ModalHeader>
  <ModalContent>
    <p>Modal content goes here...</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </ModalFooter>
</Modal>
```

**Sizes**: `sm`, `md`, `lg`, `xl`, `full`
**Features**: Focus management, keyboard navigation, accessibility

### 🧭 **Navigation Components**

#### Sidebar
```tsx
import { Sidebar } from '../design-system/components/Sidebar';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home size={16} />, href: '/' },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} />, href: '/settings' },
  {
    id: 'tools',
    label: 'Tools',
    icon: <Tool size={16} />,
    children: [
      { id: 'analytics', label: 'Analytics', href: '/tools/analytics' },
      { id: 'reports', label: 'Reports', href: '/tools/reports' }
    ]
  }
];

<Sidebar
  items={sidebarItems}
  collapsed={collapsed}
  onCollapse={setCollapsed}
  activeItemId={activeItem}
  onItemClick={handleItemClick}
/>
```

**Features**: Collapsible, nested navigation, badges, icons

#### Navbar
```tsx
import { Navbar } from '../design-system/components/Navbar';

const navbarItems = [
  { id: 'home', label: 'Home', href: '/', icon: <Home size={16} /> },
  { id: 'profile', label: 'Profile', href: '/profile', icon: <User size={16} /> }
];

<Navbar
  title="App Name"
  logo={<Logo />}
  items={navbarItems}
  rightItems={<UserMenu />}
  variant="elevated"
/>
```

**Variants**: `default`, `elevated`, `transparent`
**Features**: Responsive, mobile menu, badges

## 🎨 **Design Patterns**

### Color Usage
```tsx
// Primary actions
<Button variant="primary">Primary Action</Button>

// Secondary actions
<Button variant="secondary">Secondary Action</Button>

// Destructive actions
<Button variant="danger">Delete</Button>

// Success states
<Badge variant="success">Completed</Badge>

// Warning states
<Badge variant="warning">Pending</Badge>

// Error states
<Input error errorText="This field is required" />
```

### Typography Hierarchy
```tsx
// Page titles
<h1 className="text-4xl font-bold">Page Title</h1>

// Section headers
<h2 className="text-2xl font-semibold">Section Header</h2>

// Card titles
<h3 className="text-lg font-medium">Card Title</h3>

// Body text
<p className="text-base">Regular body text</p>

// Caption text
<span className="text-sm text-secondary">Caption text</span>
```

### Spacing Patterns
```tsx
// Component spacing
<div className="space-y-4">
  <Input label="Field 1" />
  <Input label="Field 2" />
</div>

// Layout spacing
<div className="p-6">
  <div className="mb-4">
    <h2>Section Title</h2>
  </div>
  <div className="space-y-3">
    {/* Content */}
  </div>
</div>

// Grid spacing
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

## ♿ **Accessibility Guidelines**

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use proper focus management in modals and dropdowns
- Provide visible focus indicators

### Screen Reader Support
- Use semantic HTML elements
- Provide proper ARIA labels and roles
- Announce dynamic content changes

### Color and Contrast
- Maintain WCAG 2.1 AA contrast ratios
- Don't rely solely on color to convey information
- Support high contrast mode

## 📱 **Responsive Design**

### Mobile-First Approach
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Content</Card>
</div>

// Responsive typography
<h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">Content</div>
```

### Touch Targets
- Minimum 44px touch targets for mobile
- Adequate spacing between interactive elements
- Consider thumb-friendly navigation patterns

## 🚀 **Performance Best Practices**

### Component Optimization
```tsx
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Component content */}</div>
});

// Lazy load components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Optimize re-renders
const [state, setState] = useState(initialState);
const memoizedValue = useMemo(() => expensiveCalculation(state), [state]);
```

### CSS Optimization
- Use CSS custom properties for theming
- Minimize CSS bundle size
- Use efficient selectors
- Leverage hardware acceleration for animations

## 🧪 **Testing Guidelines**

### Component Testing
```tsx
// Test component rendering
test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});

// Test accessibility
test('button is accessible', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

// Test user interactions
test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Visual Regression Testing
- Capture screenshots of components in different states
- Compare against baseline images
- Test across different screen sizes and themes

## 🔧 **Development Workflow**

### Component Development
1. **Plan**: Define component requirements and API
2. **Design**: Create component with proper TypeScript interfaces
3. **Implement**: Build component with accessibility and performance in mind
4. **Test**: Write comprehensive tests
5. **Document**: Update component documentation
6. **Review**: Code review and accessibility audit

### Design Token Updates
1. **Identify**: Determine what tokens need to be added or modified
2. **Update**: Modify token files and regenerate CSS
3. **Test**: Verify changes across all components
4. **Document**: Update design token documentation

## 📚 **Resources**

### Design System Tools
- **Storybook**: Component development and documentation
- **Figma**: Design token management
- **Chromatic**: Visual regression testing
- **axe-core**: Accessibility testing

### References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [Ant Design](https://ant.design/)
- [Chakra UI](https://chakra-ui.com/)

## 🎯 **Next Steps**

### Immediate Actions
1. **Complete Component Library**: Add missing components (Table, DatePicker, etc.)
2. **Enhance Documentation**: Create interactive component playground
3. **Improve Testing**: Add comprehensive test coverage
4. **Performance Audit**: Optimize bundle size and rendering performance

### Long-term Goals
1. **Design System Website**: Create dedicated documentation site
2. **Component Analytics**: Track component usage and performance
3. **Design Token Automation**: Sync with design tools
4. **Community Contribution**: Establish contribution guidelines 