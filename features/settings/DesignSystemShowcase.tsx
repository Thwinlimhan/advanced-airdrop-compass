import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { Textarea } from '../../design-system/components/Textarea';
import { Badge } from '../../design-system/components/Badge';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../design-system/components/Modal';
import { Navbar } from '../../design-system/components/Navbar';
import { Sidebar } from '../../design-system/components/Sidebar';
import { 
  Home, 
  Settings, 
  User, 
  Bell, 
  Search, 
  Plus, 
  Star, 
  Heart, 
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const navbarItems = [
    { id: 'home', label: 'Home', href: '#', icon: <Home size={16} /> },
    { id: 'settings', label: 'Settings', href: '#', icon: <Settings size={16} /> },
    { id: 'profile', label: 'Profile', href: '#', icon: <User size={16} /> },
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={16} />, href: '#' },
    { id: 'airdrops', label: 'Airdrops', icon: <Plus size={16} />, href: '#' },
    { id: 'wallets', label: 'Wallets', icon: <User size={16} />, href: '#' },
    { id: 'analytics', label: 'Analytics', icon: <Search size={16} />, href: '#' },
  ];

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const handleOptionChange = (value: string | number) => {
    setSelectedOption(value.toString());
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Design System Showcase
          </h1>
          <p className="text-secondary text-lg">
            Explore the new modern design system components
          </p>
        </div>

        {/* Navigation Components */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Navigation Components</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Navbar 
              title="Advanced Crypto Airdrop Compass"
              items={navbarItems}
              rightItems={<Bell size={20} className="text-secondary" />}
            />
            <div className="flex gap-4">
              <Sidebar 
                items={sidebarItems}
                className="h-64"
              />
              <div className="flex-1 p-4 bg-surface-secondary rounded-lg">
                <p className="text-secondary">Sidebar content area</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Components */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Button Components</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="primary" leftIcon={<Plus size={16} />}>
                Primary
              </Button>
              <Button variant="secondary" leftIcon={<Settings size={16} />}>
                Secondary
              </Button>
              <Button variant="outline" leftIcon={<Star size={16} />}>
                Outline
              </Button>
              <Button variant="ghost" leftIcon={<Heart size={16} />}>
                Ghost
              </Button>
              <Button variant="danger" leftIcon={<X size={16} />}>
                Danger
              </Button>
              <Button variant="success" leftIcon={<CheckCircle size={16} />}>
                Success
              </Button>
              <Button variant="warning" leftIcon={<AlertCircle size={16} />}>
                Warning
              </Button>
              <Button variant="primary" size="lg" isLoading>
                Loading
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Form Components</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Text Input"
                placeholder="Enter text..."
                leftIcon={<Search size={16} />}
              />
              <Select
                label="Select Option"
                options={selectOptions}
                placeholder="Choose an option..."
                onValueChange={handleOptionChange}
              />
            </div>
            <Textarea
              label="Text Area"
              placeholder="Enter description..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Badge Components */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Badge Components</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="primary" removable onRemove={() => console.log('removed')}>
                Removable
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Modal Component */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Modal Component</h3>
          </CardHeader>
          <CardContent>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Example Modal"
              size="md"
            >
              <ModalContent>
                <p className="text-secondary mb-4">
                  This is an example modal using the new design system.
                </p>
                <div className="space-y-4">
                  <Input label="Modal Input" placeholder="Enter value..." />
                  <Textarea label="Modal Textarea" placeholder="Enter description..." />
                </div>
              </ModalContent>
              <ModalFooter>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Save
                </Button>
              </ModalFooter>
            </Modal>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Color Palette</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-accent rounded-lg"></div>
                <p className="text-sm font-medium">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-surface rounded-lg border border-border"></div>
                <p className="text-sm font-medium">Surface</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-surface-secondary rounded-lg border border-border"></div>
                <p className="text-sm font-medium">Surface Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-success rounded-lg"></div>
                <p className="text-sm font-medium">Success</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-warning rounded-lg"></div>
                <p className="text-sm font-medium">Warning</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-error rounded-lg"></div>
                <p className="text-sm font-medium">Error</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-info rounded-lg"></div>
                <p className="text-sm font-medium">Info</p>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-border rounded-lg"></div>
                <p className="text-sm font-medium">Border</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Typography</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h1 className="text-primary">Heading 1 - Main Title</h1>
              <h2 className="text-primary">Heading 2 - Section Title</h2>
              <h3 className="text-primary">Heading 3 - Subsection Title</h3>
              <h4 className="text-primary">Heading 4 - Card Title</h4>
              <h5 className="text-primary">Heading 5 - Small Title</h5>
              <h6 className="text-primary">Heading 6 - Tiny Title</h6>
            </div>
            <div>
              <p className="text-primary">Primary text color for main content</p>
              <p className="text-secondary">Secondary text color for descriptions</p>
              <p className="text-tertiary">Tertiary text color for subtle information</p>
              <p className="text-accent">Accent text color for highlights</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 