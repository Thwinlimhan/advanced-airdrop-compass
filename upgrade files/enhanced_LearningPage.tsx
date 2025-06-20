import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from './enhanced_ThemeContext';
import { Card, CardHeader, CardContent, FeatureCard } from './enhanced_Card';
import { Button, IconButton } from './enhanced_Button';
import { 
  BookOpen, 
  BookMarked, 
  NotebookPen, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Brain, 
  FileText, 
  Filter as FilterIcon, 
  Search,
  Lightbulb, 
  Bot,
  Star,
  Clock,
  User,
  ExternalLink,
  Download,
  Share2,
  Eye,
  Heart,
  MessageSquare,
  Tag
} from 'lucide-react';

// Mock data types (replace with actual types from your app)
interface LearningResource {
  id: string;
  type: 'guide' | 'glossary' | 'video' | 'article';
  title: string;
  description?: string;
  content?: string;
  author?: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  readTime?: number;
  rating?: number;
  views?: number;
  likes?: number;
  comments?: number;
  featured?: boolean;
  status?: 'published' | 'draft' | 'archived';
}

type LearningTab = 'guides' | 'glossary' | 'notebook' | 'ai-strategy' | 'news-analysis' | 'sybil-prevention' | 'ai-analyst';

interface LearningPageProps {
  // Mock props - replace with actual app context
  learningResources?: LearningResource[];
  onAddResource?: (resource: Omit<LearningResource, 'id'>) => void;
  onUpdateResource?: (id: string, updates: Partial<LearningResource>) => void;
  onDeleteResource?: (id: string) => void;
}

export const EnhancedLearningPage: React.FC<LearningPageProps> = ({
  learningResources = [],
  onAddResource,
  onUpdateResource,
  onDeleteResource
}) => {
  const { actualTheme } = useTheme();
  const navigate = useNavigate();
  const { subPage, itemId } = useParams<{ subPage?: LearningTab, itemId?: string }>();

  // State management
  const [activeTab, setActiveTab] = useState<LearningTab>(subPage || 'guides');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'rating' | 'views'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Tab configuration
  const tabs = [
    {
      id: 'guides' as LearningTab,
      label: 'Learning Guides',
      icon: BookOpen,
      description: 'Comprehensive guides and tutorials'
    },
    {
      id: 'glossary' as LearningTab,
      label: 'Glossary',
      icon: BookMarked,
      description: 'Crypto and DeFi terminology'
    },
    {
      id: 'notebook' as LearningTab,
      label: 'Strategy Notebook',
      icon: NotebookPen,
      description: 'Your personal strategy notes'
    },
    {
      id: 'ai-strategy' as LearningTab,
      label: 'AI Strategy',
      icon: Brain,
      description: 'AI-powered strategy recommendations'
    },
    {
      id: 'news-analysis' as LearningTab,
      label: 'News Analysis',
      icon: FileText,
      description: 'Latest news and market analysis'
    },
    {
      id: 'sybil-prevention' as LearningTab,
      label: 'Sybil Prevention',
      icon: Lightbulb,
      description: 'Learn about sybil attack prevention'
    },
    {
      id: 'ai-analyst' as LearningTab,
      label: 'AI Analyst',
      icon: Bot,
      description: 'AI-powered market insights'
    }
  ];

  // Filter resources based on current tab and filters
  const filteredResources = useMemo(() => {
    let filtered = learningResources.filter(resource => {
      // Filter by type based on active tab
      if (activeTab === 'guides' && resource.type !== 'guide') return false;
      if (activeTab === 'glossary' && resource.type !== 'glossary') return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          resource.title.toLowerCase().includes(searchLower) ||
          resource.description?.toLowerCase().includes(searchLower) ||
          resource.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Difficulty filter
      if (selectedFilter !== 'all' && resource.difficulty !== selectedFilter) {
        return false;
      }

      return true;
    });

    // Sort resources
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'views':
          comparison = (a.views || 0) - (b.views || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [learningResources, activeTab, searchTerm, selectedFilter, sortBy, sortOrder]);

  // URL handling
  useEffect(() => {
    if (subPage && tabs.find(tab => tab.id === subPage)) {
      setActiveTab(subPage);
    }
    
    if (itemId && activeTab === 'guides') {
      const resource = learningResources.find(r => r.id === itemId && r.type === 'guide');
      if (resource) {
        setSelectedResource(resource);
      }
    }
  }, [subPage, itemId, learningResources, activeTab]);

  // Tab change handler
  const handleTabChange = useCallback((tabId: LearningTab) => {
    setActiveTab(tabId);
    setSelectedResource(null);
    navigate(`/learning/${tabId}`);
  }, [navigate]);

  // Resource selection handler
  const handleResourceSelect = useCallback((resource: LearningResource) => {
    setSelectedResource(resource);
    if (resource.type === 'guide') {
      navigate(`/learning/guides/${resource.id}`);
    }
  }, [navigate]);

  // Create/Edit handlers
  const handleCreateResource = useCallback(() => {
    setEditingResource(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleEditResource = useCallback((resource: LearningResource) => {
    setEditingResource(resource);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteResource = useCallback((resource: LearningResource) => {
    if (window.confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      onDeleteResource?.(resource.id);
      if (selectedResource?.id === resource.id) {
        setSelectedResource(null);
      }
    }
  }, [onDeleteResource, selectedResource]);

  // Render resource card
  const renderResourceCard = (resource: LearningResource) => (
    <Card
      key={resource.id}
      variant="default"
      interactive
      className="h-full hover:shadow-xl transition-all duration-300"
      onClick={() => handleResourceSelect(resource)}
    >
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {resource.difficulty && (
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }
              `}>
                {resource.difficulty}
              </span>
            )}
            {resource.featured && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            <IconButton
              icon={<Edit3 />}
              label="Edit"
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleEditResource(resource);
              }}
            />
            <IconButton
              icon={<Trash2 />}
              label="Delete"
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteResource(resource);
              }}
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
            {resource.description}
          </p>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{resource.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {resource.readTime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{resource.readTime} min</span>
              </div>
            )}
            {resource.views && (
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{resource.views}</span>
              </div>
            )}
            {resource.likes && (
              <div className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{resource.likes}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{resource.author || 'Anonymous'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render main content based on active tab
  const renderTabContent = () => {
    if (selectedResource) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              leftIcon={<BookOpen />}
              onClick={() => setSelectedResource(null)}
            >
              Back to {tabs.find(t => t.id === activeTab)?.label}
            </Button>
            <div className="flex items-center space-x-2">
              <IconButton icon={<Share2 />} label="Share" variant="outline" />
              <IconButton icon={<Download />} label="Download" variant="outline" />
              <IconButton icon={<Heart />} label="Like" variant="outline" />
            </div>
          </div>

          <Card variant="elevated" padding="lg">
            <CardHeader
              title={selectedResource.title}
              subtitle={`By ${selectedResource.author || 'Anonymous'} • ${new Date(selectedResource.createdAt).toLocaleDateString()}`}
            />
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {selectedResource.content || selectedResource.description || 'No content available.'}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    switch (activeTab) {
      case 'guides':
      case 'glossary':
        return (
          <div className="space-y-6">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as any);
                    setSortOrder(order as any);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="views-desc">Most Viewed</option>
                </select>

                <Button
                  variant="primary"
                  leftIcon={<PlusCircle />}
                  onClick={handleCreateResource}
                >
                  Add {activeTab === 'guides' ? 'Guide' : 'Term'}
                </Button>
              </div>
            </div>

            {/* Resource grid */}
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(renderResourceCard)}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No {activeTab} found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Try adjusting your search criteria.' : `Get started by creating your first ${activeTab.slice(0, -1)}.`}
                </p>
                <Button
                  variant="primary"
                  leftIcon={<PlusCircle />}
                  onClick={handleCreateResource}
                >
                  Add {activeTab === 'guides' ? 'Guide' : 'Term'}
                </Button>
              </div>
            )}
          </div>
        );

      case 'notebook':
        return (
          <FeatureCard
            icon={<NotebookPen className="w-6 h-6 text-primary" />}
            title="Strategy Notebook"
            description="Keep track of your airdrop strategies, notes, and insights in your personal notebook."
            action={
              <Button variant="primary" leftIcon={<PlusCircle />}>
                Create New Note
              </Button>
            }
          />
        );

      case 'ai-strategy':
        return (
          <FeatureCard
            icon={<Brain className="w-6 h-6 text-primary" />}
            title="AI Strategy Advisor"
            description="Get personalized airdrop strategy recommendations powered by AI analysis."
            action={
              <Button variant="gradient" leftIcon={<Bot />}>
                Get AI Recommendations
              </Button>
            }
          />
        );

      case 'news-analysis':
        return (
          <FeatureCard
            icon={<FileText className="w-6 h-6 text-primary" />}
            title="News Analysis"
            description="Stay updated with the latest crypto news and AI-powered market analysis."
            action={
              <Button variant="primary" leftIcon={<ExternalLink />}>
                View Latest News
              </Button>
            }
          />
        );

      case 'sybil-prevention':
        return (
          <FeatureCard
            icon={<Lightbulb className="w-6 h-6 text-primary" />}
            title="Sybil Prevention Guide"
            description="Learn best practices to avoid sybil detection and maintain healthy wallet activities."
            action={
              <Button variant="warning" leftIcon={<BookOpen />}>
                Read Guide
              </Button>
            }
          />
        );

      case 'ai-analyst':
        return (
          <FeatureCard
            icon={<Bot className="w-6 h-6 text-primary" />}
            title="AI Market Analyst"
            description="Get real-time market insights and analysis powered by advanced AI algorithms."
            action={
              <Button variant="gradient" leftIcon={<Brain />}>
                Launch AI Analyst
              </Button>
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Learning Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Expand your crypto knowledge with guides, tools, and AI-powered insights.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      transition-colors duration-200
                      ${isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }
                    `}
                  >
                    <Icon className={`
                      mr-2 w-5 h-5
                      ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLearningPage;
