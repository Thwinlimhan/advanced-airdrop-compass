import React, { useState } from 'react';
import { useTheme, ColorScheme } from './enhanced_ThemeContext';
import { Card, CardHeader, CardContent, CardFooter, StatCard, FeatureCard } from './enhanced_Card';
import { Button, IconButton, ButtonGroup } from './enhanced_Button';
import { EnhancedLineChart } from './enhanced_LineChart';
import { EnhancedDoughnutChart } from './enhanced_DoughnutChart';
import { EnhancedBarChart } from './enhanced_BarChart';
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Star,
  Heart,
  Share2,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  User,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Calendar,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

// Sample data for charts
const lineChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Portfolio Value',
      data: [12000, 15000, 13500, 18000, 22000, 25000],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
    }
  ]
};

const doughnutChartData = {
  labels: ['ETH', 'BTC', 'SOL', 'MATIC', 'Others'],
  datasets: [
    {
      data: [40, 25, 15, 12, 8],
      backgroundColor: [
        '#8b5cf6',
        '#06b6d4',
        '#10b981',
        '#f59e0b',
        '#ef4444'
      ]
    }
  ]
};

const barChartData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Airdrop Value',
      data: [3200, 4800, 6200, 7800],
      backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
    }
  ]
};

export const ComponentShowcase: React.FC = () => {
  const { config, actualTheme, updateTheme, updateColorScheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleAsyncAction = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const colorSchemes = [
    { name: 'Purple', value: ColorScheme.PURPLE, color: '#8b5cf6' },
    { name: 'Blue', value: ColorScheme.BLUE, color: '#3b82f6' },
    { name: 'Green', value: ColorScheme.GREEN, color: '#10b981' },
    { name: 'Orange', value: ColorScheme.ORANGE, color: '#f59e0b' },
    { name: 'Red', value: ColorScheme.RED, color: '#ef4444' },
    { name: 'Teal', value: ColorScheme.TEAL, color: '#14b8a6' },
    { name: 'Pink', value: ColorScheme.PINK, color: '#ec4899' },
    { name: 'Indigo', value: ColorScheme.INDIGO, color: '#6366f1' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            🎨 Enhanced UI Component Showcase
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore the new and improved components for your Crypto Airdrop Compass. 
            Each component is now theme-aware, accessible, and beautifully animated.
          </p>
        </div>

        {/* Theme Controls */}
        <Card variant="glass" padding="lg">
          <CardHeader title="🎨 Theme Configuration" subtitle="Customize your experience" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme Selector */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Theme Mode
                </h3>
                <ButtonGroup>
                  <Button
                    variant={config.theme === 'light' ? 'primary' : 'outline'}
                    leftIcon={<Sun />}
                    onClick={() => updateTheme('light' as any)}
                  >
                    Light
                  </Button>
                  <Button
                    variant={config.theme === 'dark' ? 'primary' : 'outline'}
                    leftIcon={<Moon />}
                    onClick={() => updateTheme('dark' as any)}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={config.theme === 'auto' ? 'primary' : 'outline'}
                    leftIcon={<Monitor />}
                    onClick={() => updateTheme('auto' as any)}
                  >
                    Auto
                  </Button>
                </ButtonGroup>
              </div>

              {/* Color Scheme Selector */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Color Scheme
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.value}
                      onClick={() => updateColorScheme(scheme.value)}
                      className={`
                        p-2 rounded-lg border-2 transition-all duration-200
                        ${config.colorScheme === scheme.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <div
                        className="w-6 h-6 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: scheme.color }}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {scheme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Showcase */}
        <Card>
          <CardHeader title="🔘 Enhanced Buttons" subtitle="All button variants and states" />
          <CardContent>
            <div className="space-y-6">
              {/* Button Variants */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Button Variants
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" leftIcon={<Star />}>Primary</Button>
                  <Button variant="secondary" leftIcon={<Heart />}>Secondary</Button>
                  <Button variant="tertiary" leftIcon={<Share2 />}>Tertiary</Button>
                  <Button variant="danger" leftIcon={<Trash2 />}>Danger</Button>
                  <Button variant="success" leftIcon={<Shield />}>Success</Button>
                  <Button variant="warning" leftIcon={<Bell />}>Warning</Button>
                  <Button variant="ghost" leftIcon={<Eye />}>Ghost</Button>
                  <Button variant="outline" leftIcon={<Download />}>Outline</Button>
                  <Button variant="gradient" leftIcon={<Zap />}>Gradient</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Button Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Button States & Features
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    isLoading={isLoading}
                    loadingText="Processing..."
                    onClick={handleAsyncAction}
                  >
                    {isLoading ? 'Loading...' : 'Click to Load'}
                  </Button>
                  <Button disabled>Disabled</Button>
                  <Button animation="scale" leftIcon={<TrendingUp />}>Scale Animation</Button>
                  <Button animation="bounce" rightIcon={<Star />}>Bounce Animation</Button>
                  <Button glow shadow>Glowing Button</Button>
                  <Button rounded fullWidth={false}>Rounded</Button>
                </div>
              </div>

              {/* Icon Buttons */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Icon Buttons
                </h3>
                <div className="flex flex-wrap gap-3">
                  <IconButton icon={<Settings />} label="Settings" />
                  <IconButton icon={<Bell />} label="Notifications" variant="outline" />
                  <IconButton icon={<User />} label="Profile" variant="ghost" />
                  <IconButton icon={<Search />} label="Search" variant="primary" />
                  <IconButton icon={<Plus />} label="Add" variant="success" />
                  <IconButton icon={<Edit />} label="Edit" variant="secondary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <Card>
            <CardHeader title="📈 Enhanced Line Chart" subtitle="Interactive with statistics" />
            <CardContent>
              <EnhancedLineChart
                data={lineChartData}
                title="Portfolio Performance"
                height={300}
                showStats={true}
                interactive={true}
                animated={true}
              />
            </CardContent>
          </Card>

          {/* Doughnut Chart */}
          <Card>
            <CardHeader title="🍩 Enhanced Doughnut Chart" subtitle="With center text and hover effects" />
            <CardContent>
              <EnhancedDoughnutChart
                data={doughnutChartData}
                title="Asset Allocation"
                size={300}
                showCenter={true}
                centerText="$25,420"
                centerSubtext="Total Portfolio"
                showStats={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart */}
        <Card>
          <CardHeader title="📊 Enhanced Bar Chart" subtitle="Multiple variants and animations" />
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Default</h4>
                <EnhancedBarChart
                  data={barChartData}
                  height={200}
                  variant="default"
                  showStats={false}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Gradient</h4>
                <EnhancedBarChart
                  data={barChartData}
                  height={200}
                  variant="gradient"
                  showStats={false}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Rounded</h4>
                <EnhancedBarChart
                  data={barChartData}
                  height={200}
                  variant="rounded"
                  showStats={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stat Cards */}
          <StatCard
            title="Total Portfolio Value"
            value="$42,350"
            change={12.5}
            changeType="positive"
            trend="up"
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
          />

          <StatCard
            title="Active Airdrops"
            value={23}
            change={-3.2}
            changeType="negative"
            trend="down"
            icon={<Globe className="w-5 h-5 text-blue-500" />}
          />

          <StatCard
            title="Completed Tasks"
            value={156}
            change={8.7}
            changeType="positive"
            trend="up"
            icon={<BarChart3 className="w-5 h-5 text-purple-500" />}
          />

          {/* Feature Cards */}
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-primary" />}
            title="AI-Powered Analysis"
            description="Get intelligent insights and recommendations for your airdrop strategy."
            action={<Button variant="gradient">Try AI Analysis</Button>}
            featured={true}
          />

          <FeatureCard
            icon={<Shield className="w-6 h-6 text-green-500" />}
            title="Secure Wallet Management"
            description="Manage multiple wallets with enterprise-grade security features."
            action={<Button variant="success">Manage Wallets</Button>}
          />

          <FeatureCard
            icon={<Calendar className="w-6 h-6 text-blue-500" />}
            title="Smart Scheduling"
            description="Never miss an airdrop deadline with intelligent task scheduling."
            action={<Button variant="primary">View Schedule</Button>}
          />
        </div>

        {/* Card Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default" padding="md">
            <CardContent>
              <h3 className="font-semibold mb-2">Default Card</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Standard card with border and background.
              </p>
            </CardContent>
          </Card>

          <Card variant="outlined" padding="md">
            <CardContent>
              <h3 className="font-semibold mb-2">Outlined Card</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transparent background with prominent border.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" padding="md">
            <CardContent>
              <h3 className="font-semibold mb-2">Elevated Card</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No border, enhanced shadow for depth.
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" padding="md">
            <CardContent>
              <h3 className="font-semibold mb-2">Glass Card</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Frosted glass effect with backdrop blur.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loading States */}
        <Card>
          <CardHeader title="⏳ Loading States" subtitle="Beautiful loading animations" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card loading />
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/5"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card variant="gradient" padding="lg">
          <CardContent>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎉 Your UI is Now Enhanced!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                All components are now theme-aware, accessible, and beautifully animated. 
                Your users will love the improved experience across all devices.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="primary" size="lg" leftIcon={<Star />}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg" leftIcon={<MessageSquare />}>
                  Give Feedback
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComponentShowcase;
