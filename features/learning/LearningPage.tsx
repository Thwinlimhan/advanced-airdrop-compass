import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button, IconButton } from '../../design-system/components/Button';
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
  Tag,
  SortAsc,
  SortDesc,
  RefreshCw,
  Plus,
  Calendar,
  TrendingUp,
  Target,
  Shield,
  Zap,
  Users,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Modal } from '../../design-system/components/Modal';
import { GuideReader } from './GuideReader';
import { GlossaryList } from './GlossaryList';
import { StrategyNotebook } from './StrategyNotebook';
import { AIStrategyAdvisor } from './AIStrategyAdvisor';
import { AIAnalystPage } from '../ai/AIAnalystPage';
import { NewsSummarizer } from './NewsSummarizer';
import { GuideForm } from './GuideForm';
import { GlossaryForm } from './GlossaryForm';
import { GuideSubmissionForm } from './GuideSubmissionForm';
import { SybilPreventionGuidePage } from './SybilPreventionGuide';
import { LearningResource, LearningTab, StrategyNote, LearningSubTask } from '../../types';
import { useToast } from '../../hooks/useToast';
import { LEARNING_HUB_SUB_NAV } from '../../constants';
import { AddAirdropTutorial } from '../tutorials/AddAirdropTutorial';
import { useLearningResourceStore } from '../../stores/learningResourceStore';
import { useStrategyNoteStore } from '../../stores/strategyNoteStore';
import { Input } from '../../design-system/components/Input';
import { Select } from '../../design-system/components/Select';
import { formatDate } from '../../utils/formatting';
import { useTranslation } from '../../hooks/useTranslation';

interface LearningPageProps {
  learningResources?: LearningResource[];
  onAddResource?: (resource: Omit<LearningResource, 'id'>) => void;
  onUpdateResource?: (id: string, updates: Partial<LearningResource>) => void;
  onDeleteResource?: (id: string) => void;
  initialNotebookId?: string;
}

export const LearningPage: React.FC<LearningPageProps> = ({
  learningResources = [],
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  initialNotebookId
}) => {
  const { learningResources: zustandLearningResources, addLearningResource, updateLearningResource, deleteLearningResource, fetchLearningResources, isLoading } = useLearningResourceStore();
  const { strategyNotes, addStrategyNote, updateStrategyNote, deleteStrategyNote, fetchStrategyNotes } = useStrategyNoteStore();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { subPage, itemId } = useParams<{ subPage?: LearningTab, itemId?: string }>();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<LearningTab>(subPage || 'guides');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [editingNote, setEditingNote] = useState<StrategyNote | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<LearningResource | null>(null);

  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [editingGlossaryTerm, setEditingGlossaryTerm] = useState<LearningResource | null>(null);
  
  const [initialNotebookIdState, setInitialNotebookIdState] = useState<string | undefined>(initialNotebookId);
  const [isGuideSubmissionModalOpen, setIsGuideSubmissionModalOpen] = useState(false);
  const [showUserSubmittedOnly, setShowUserSubmittedOnly] = useState(false);

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
      id: 'sybilPrevention' as LearningTab,
      label: 'Sybil Prevention',
      icon: Lightbulb,
      description: 'Learn about sybil attack prevention'
    },
    {
      id: 'notebook' as LearningTab,
      label: 'Strategy Notebook',
      icon: NotebookPen,
      description: 'Your personal strategy notes'
    },
    {
      id: 'aiStrategy' as LearningTab,
      label: 'AI Farming Strategist',
      icon: Brain,
      description: 'AI-powered strategy recommendations'
    },
    {
      id: 'aiAnalyst' as LearningTab,
      label: 'AI Data Analyst',
      icon: Bot,
      description: 'AI-powered market insights'
    },
    {
      id: 'newsAnalysis' as LearningTab,
      label: 'AI News Summarizer',
      icon: FileText,
      description: 'Latest news and market analysis'
    },
    {
      id: 'tutorials' as LearningTab,
      label: 'Interactive Tutorials',
      icon: User,
      description: 'Step-by-step interactive tutorials'
    },
  ];

  const filteredResources = useMemo(() => {
    let filtered = zustandLearningResources.filter(resource => {
      if (activeTab === 'guides' && resource.type !== 'guide') return false;
      if (activeTab === 'glossary' && resource.type !== 'glossary') return false;
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          resource.title.toLowerCase().includes(searchLower) ||
          resource.content?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filterCategory && filterCategory !== 'all') {
        if (resource.category !== filterCategory) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.submissionDate || '').getTime() - new Date(b.submissionDate || '').getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [zustandLearningResources, activeTab, searchQuery, filterCategory, sortBy, sortOrder]);

  useEffect(() => {
    if (subPage && tabs.find(tab => tab.id === subPage)) {
      setActiveTab(subPage);
    }
    
    if (itemId && activeTab === 'guides') {
      const resource = zustandLearningResources.find(r => r.id === itemId && r.type === 'guide');
      if (resource) {
        setSelectedResource(resource);
      }
    }
  }, [subPage, itemId, zustandLearningResources, activeTab]);

  const handleTabChange = useCallback((tabId: LearningTab) => {
    setActiveTab(tabId);
    setSelectedResource(null);
    navigate(`/learning/${tabId}`);
  }, [navigate]);

  const handleResourceSelect = useCallback((resource: LearningResource) => {
    setSelectedResource(resource);
    if (resource.type === 'guide') {
      navigate(`/learning/guides/${resource.id}`);
    }
  }, [navigate]);

  const handleAddResource = async (resourceData: Omit<LearningResource, 'id'>) => {
    try {
      await addLearningResource(resourceData);
      addToast('Learning resource added successfully.', 'success');
      setIsAddModalOpen(false);
    } catch (error) {
      addToast('Failed to add learning resource.', 'error');
    }
  };

  const handleUpdateResource = async (resource: LearningResource) => {
    try {
      await updateLearningResource(resource);
      addToast('Learning resource updated successfully.', 'success');
      setEditingResource(null);
    } catch (error) {
      addToast('Failed to update learning resource.', 'error');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const resourceToDelete = zustandLearningResources.find(r => r.id === resourceId);
    if (resourceToDelete && window.confirm(`Are you sure you want to delete "${resourceToDelete.title}"?`)) {
      try {
        await deleteLearningResource(resourceId);
        addToast('Learning resource deleted successfully.', 'success');
      } catch (error) {
        addToast('Failed to delete learning resource.', 'error');
      }
    }
  };

  const handleAddNote = async (noteData: Omit<StrategyNote, 'id' | 'lastModified'>) => {
    try {
      await addStrategyNote(noteData);
      addToast('Strategy note added successfully.', 'success');
      setEditingNote(null);
    } catch (error) {
      addToast('Failed to add strategy note.', 'error');
    }
  };

  const handleUpdateNote = async (note: StrategyNote) => {
    try {
      await updateStrategyNote(note);
      addToast('Strategy note updated successfully.', 'success');
      setEditingNote(null);
    } catch (error) {
      addToast('Failed to update strategy note.', 'error');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const noteToDelete = strategyNotes.find(n => n.id === noteId);
    if (noteToDelete && window.confirm(`Are you sure you want to delete "${noteToDelete.title}"?`)) {
      try {
        await deleteStrategyNote(noteId);
        addToast('Strategy note deleted successfully.', 'success');
      } catch (error) {
        addToast('Failed to delete strategy note.', 'error');
      }
    }
  };

  const guides = useMemo(() => {
    let allGuides = zustandLearningResources.filter(r => r.type === 'guide').sort((a,b) => a.title.localeCompare(b.title));
    if (showUserSubmittedOnly) {
        allGuides = allGuides.filter(g => g.author === "User Submission");
    }
    return allGuides;
  }, [zustandLearningResources, showUserSubmittedOnly]);
  
  const glossaryTerms = zustandLearningResources.filter(r => r.type === 'glossary').sort((a,b) => a.title.localeCompare(b.title));

  const handleSelectGuide = (guide: LearningResource) => {
    setSelectedResource(guide);
    navigate(`/learning/guides/${guide.id}`); 
  };
  
  const handleBackToGuidesList = () => {
    setSelectedResource(null);
    navigate('/learning/guides');
  }

  const openGuideModalForCreate = () => {
    setEditingGuide(null);
    setIsGuideModalOpen(true);
  };

  const openGuideModalForEdit = (guide: LearningResource) => {
    setEditingGuide(guide);
    setIsGuideModalOpen(true);
  };

  const handleGuideFormSubmit = async (guideData: Omit<LearningResource, 'id'> | LearningResource) => {
    let newOrUpdatedGuide: LearningResource | null = null;
    if ('id' in guideData) {
      await updateLearningResource(guideData as LearningResource);
      newOrUpdatedGuide = guideData as LearningResource;
      addToast('Guide updated successfully!', 'success');
    } else {
      const addedGuide = await addLearningResource(guideData as Omit<LearningResource, 'id'>);
      if (addedGuide) {
        newOrUpdatedGuide = addedGuide;
        addToast('Guide added successfully!', 'success');
      } else {
        addToast('Failed to add guide (simulated API error).', 'error');
      }
    }
    setIsGuideModalOpen(false);
    setEditingGuide(null);
    if(newOrUpdatedGuide && activeTab === 'guides') {
      setSelectedResource(newOrUpdatedGuide);
      navigate(`/learning/guides/${newOrUpdatedGuide.id}`);
    }
  };

  const handleGuideSubmissionFormSubmit = async (guideData: Omit<LearningResource, 'id' | 'type' | 'author' | 'submissionDate'>) => {
    const newGuideData: Omit<LearningResource, 'id'> = {
        ...guideData,
        type: 'guide',
        author: "User Submission",
        submissionDate: new Date().toISOString(),
    };
    const addedGuide = await addLearningResource(newGuideData);
    if (addedGuide) {
      addToast('Your guide has been submitted and added!', 'success');
      setIsGuideSubmissionModalOpen(false);
      if (activeTab === 'guides') {
          setSelectedResource(addedGuide);
          navigate(`/learning/guides/${addedGuide.id}`);
      }
    } else {
      addToast('Failed to submit guide (simulated API error).', 'error');
    }
  };

  const handleDeleteGuide = async (guideId: string, guideTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the guide "${guideTitle}"?`)) {
      await deleteLearningResource(guideId);
      addToast('Guide deleted successfully!', 'success');
      if (selectedResource?.id === guideId) {
        setSelectedResource(null);
        navigate('/learning/guides');
      }
    }
  };

  const openGlossaryModalForCreate = () => {
    setEditingGlossaryTerm(null);
    setIsGlossaryModalOpen(true);
  };

  const openGlossaryModalForEdit = (term: LearningResource) => {
    setEditingGlossaryTerm(term);
    setIsGlossaryModalOpen(true);
  };

  const handleGlossaryFormSubmit = async (termData: Omit<LearningResource, 'id' | 'category'> | LearningResource) => {
    if ('id' in termData) {
      await updateLearningResource(termData as LearningResource);
      addToast('Glossary term updated successfully!', 'success');
    } else {
      const addedTerm = await addLearningResource(termData as Omit<LearningResource, 'id'>);
      if (addedTerm) {
        addToast('Glossary term added successfully!', 'success');
      } else {
        addToast('Failed to add glossary term (simulated API error).', 'error');
      }
    }
    setIsGlossaryModalOpen(false);
    setEditingGlossaryTerm(null);
  };

  const handleDeleteGlossaryTerm = async (termId: string, termTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the glossary term "${termTitle}"?`)) {
      await deleteLearningResource(termId);
      addToast('Glossary term deleted successfully!', 'success');
    }
  };
  
  const TabButton: React.FC<{tabId: LearningTab, label: string, icon: React.ElementType}> = ({tabId, label, icon: Icon}) => (
    <Button
        variant={activeTab === tabId ? 'primary' : 'outline'}
        onClick={() => { 
            setInitialNotebookIdState(undefined);
            setSelectedResource(null);
            navigate(`/learning/${tabId}`);
        }}
        leftIcon={<Icon size={16}/>}
        className="flex-1 sm:flex-none whitespace-nowrap"
    >
        {label}
    </Button>
  );

  const filteredAndSortedResources = zustandLearningResources
    .filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || resource.category === filterCategory;
      const matchesType = resource.type === activeTab;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.submissionDate || '').getTime() - new Date(b.submissionDate || '').getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const filteredAndSortedNotes = strategyNotes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      const comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    zustandLearningResources.forEach(resource => {
      if (resource.category) {
        uniqueCategories.add(resource.category);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [zustandLearningResources]);

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={24} className="text-accent" />
                Learning Center
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLearningResources()}
                  leftIcon={<RefreshCw size={16} />}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </Button>
                {activeTab !== 'notebook' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddModalOpen(true)}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Resource
                  </Button>
                )}
                {activeTab === 'notebook' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setEditingNote({ id: '', title: '', content: '', lastModified: new Date().toISOString() })}
                    leftIcon={<Plus size={16} />}
                  >
                    Add Note
                  </Button>
                )}
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Access guides, tutorials, and strategic insights to improve your airdrop farming.
            </p>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search size={16} />}
              />
              {activeTab !== 'notebook' && categories.length > 0 && (
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...categories.map(cat => ({ value: cat, label: cat }))
                  ]}
                />
              )}
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'title' | 'date' | 'type')}
                options={[
                  { value: 'date', label: 'Sort by Date' },
                  { value: 'title', label: 'Sort by Title' },
                  { value: 'type', label: 'Sort by Type' }
                ]}
              />
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                leftIcon={sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === 'notebook' ? (
          <div className="space-y-4">
            {filteredAndSortedNotes.map((note) => (
              <Card key={note.id} variant="default" padding="md">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{note.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Modified: {formatDate(note.lastModified)}</span>
                        </div>
                        {note.linkedAirdropIds && note.linkedAirdropIds.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag size={14} />
                            <span>{note.linkedAirdropIds.length} linked airdrop(s)</span>
                          </div>
                        )}
                        {note.subTasks && note.subTasks.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Target size={14} />
                            <span>
                              {note.subTasks.filter(st => st.completed).length}/{note.subTasks.length} subtasks
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingNote(note)}
                        leftIcon={<Edit3 size={14} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        leftIcon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedResources.map((resource) => (
              <Card key={resource.id} variant="default" padding="md">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{resource.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          resource.type === 'guide' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          resource.type === 'glossary' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                        }`}>
                          {resource.type}
                        </span>
                        {resource.category && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full">
                            {resource.category}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                        {resource.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {resource.author && (
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{resource.author}</span>
                          </div>
                        )}
                        {resource.submissionDate && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(resource.submissionDate)}</span>
                          </div>
                        )}
                        {resource.sourceUrl && (
                          <div className="flex items-center gap-1">
                            <Tag size={14} />
                            <span>Has source</span>
                          </div>
                        )}
                        {resource.subTasks && resource.subTasks.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Target size={14} />
                            <span>
                              {resource.subTasks.filter(st => st.completed).length}/{resource.subTasks.length} subtasks
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingResource(resource)}
                        leftIcon={<Edit3 size={14} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                        leftIcon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'notebook' && filteredAndSortedNotes.length === 0) ||
          (activeTab !== 'notebook' && filteredAndSortedResources.length === 0)) && (
          <Card variant="default" padding="xl">
            <CardContent className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content found</h3>
              <p className="text-secondary mb-4">
                {searchQuery || filterCategory
                  ? 'Try adjusting your search or filters.'
                  : `No ${activeTab === 'notebook' ? 'strategy notes' : 'learning resources'} yet.`}
              </p>
              {!searchQuery && !filterCategory && (
                <Button
                  variant="primary"
                  onClick={() => activeTab === 'notebook' ? setEditingNote({ id: '', title: '', content: '', lastModified: new Date().toISOString() }) : setIsAddModalOpen(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Add Your First {activeTab === 'notebook' ? 'Note' : 'Resource'}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Learning Resource">
          <LearningResourceForm
            onSubmit={handleAddResource}
            onClose={() => setIsAddModalOpen(false)}
            resourceType={activeTab}
            categories={categories}
          />
        </Modal>

        <Modal isOpen={!!editingResource} onClose={() => setEditingResource(null)} title="Edit Learning Resource">
          {editingResource && (
            <LearningResourceForm
              onSubmit={async (resourceData) => {
                const updatedResource: LearningResource = {
                  ...editingResource,
                  ...resourceData,
                };
                await handleUpdateResource(updatedResource);
              }}
              onClose={() => setEditingResource(null)}
              initialData={editingResource}
              resourceType={activeTab}
              categories={categories}
            />
          )}
        </Modal>

        <Modal isOpen={!!editingNote} onClose={() => setEditingNote(null)} title={editingNote?.id ? "Edit Strategy Note" : "Add Strategy Note"}>
          {editingNote && (
            <StrategyNoteForm
              onSubmit={async (noteData) => {
                if (editingNote.id) {
                  // Edit existing note
                  const updatedNote: StrategyNote = {
                    ...editingNote,
                    ...noteData,
                    lastModified: new Date().toISOString(),
                  };
                  await handleUpdateNote(updatedNote);
                } else {
                  // Add new note
                  await handleAddNote(noteData);
                }
              }}
              onClose={() => setEditingNote(null)}
              initialData={editingNote.id ? editingNote : undefined}
            />
          )}
        </Modal>
      </div>
    </PageWrapper>
  );
};

// Placeholder components for forms
const LearningSubTaskForm: React.FC<{
  onSubmit: (subtaskData: Omit<LearningSubTask, 'id'>) => void;
  onClose: () => void;
  initialData?: LearningSubTask;
  parentId?: string;
}> = ({ onSubmit, onClose, initialData, parentId }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      addToast('Title and description are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const subtaskData: Omit<LearningSubTask, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        completed: false,
        dueDate: dueDate.trim() || undefined,
        notes: notes.trim() || undefined,
        parentId: parentId,
      };

      onSubmit(subtaskData);
      addToast(initialData ? 'Subtask updated successfully' : 'Subtask added successfully', 'success');
      onClose();
    } catch (error) {
      addToast((error as Error).message || 'Failed to save subtask', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="subtask-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <Input
          id="subtask-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter subtask title"
          required
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="subtask-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          id="subtask-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter subtask description"
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="subtask-due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Due Date
        </label>
        <Input
          id="subtask-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="subtask-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          id="subtask-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            initialData ? 'Update Subtask' : 'Add Subtask'
          )}
        </Button>
      </div>
    </form>
  );
};

const LearningResourceForm: React.FC<{
  onSubmit: (resourceData: Omit<LearningResource, 'id'>) => Promise<void>;
  onClose: () => void;
  initialData?: LearningResource;
  resourceType: string;
  categories: string[];
}> = ({ onSubmit, onClose, initialData, resourceType, categories }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl || '');
  const [explanation, setExplanation] = useState(initialData?.explanation || '');
  const [author, setAuthor] = useState(initialData?.author || '');
  const [subTasks, setSubTasks] = useState<LearningSubTask[]>(initialData?.subTasks || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<LearningSubTask | null>(null);
  const { addToast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast('Title and content are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const resourceData: Omit<LearningResource, 'id'> = {
        type: resourceType as 'guide' | 'glossary' | 'news_summary',
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        explanation: explanation.trim() || undefined,
        author: author.trim() || undefined,
        submissionDate: new Date().toISOString(),
        subTasks: subTasks,
      };

      await onSubmit(resourceData);
      addToast(initialData ? 'Resource updated successfully' : 'Resource added successfully', 'success');
      onClose();
    } catch (error) {
      addToast((error as Error).message || 'Failed to save resource', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubtask = (subtaskData: Omit<LearningSubTask, 'id'>) => {
    const newSubtask: LearningSubTask = {
      ...subtaskData,
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setSubTasks([...subTasks, newSubtask]);
    setShowSubtaskForm(false);
  };

  const handleUpdateSubtask = (subtaskData: Omit<LearningSubTask, 'id'>) => {
    if (editingSubtask) {
      const updatedSubtask: LearningSubTask = {
        ...editingSubtask,
        ...subtaskData,
      };
      setSubTasks(subTasks.map(st => st.id === editingSubtask.id ? updatedSubtask : st));
      setEditingSubtask(null);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      setSubTasks(subTasks.filter(st => st.id !== subtaskId));
      addToast('Subtask deleted successfully', 'success');
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubTasks(subTasks.map(st => 
      st.id === subtaskId 
        ? { 
            ...st, 
            completed: !st.completed,
            completionDate: !st.completed ? new Date().toISOString() : undefined
          }
        : st
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter resource title"
          required
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter resource content"
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as string)}
          options={[
            { value: '', label: 'Select a category' },
            ...categories.map(cat => ({ value: cat, label: cat }))
          ]}
          placeholder="Select category"
        />
      </div>

      <div>
        <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Source URL
        </label>
        <Input
          id="sourceUrl"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Explanation
        </label>
        <textarea
          id="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Additional explanation or context"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Author
        </label>
        <Input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Enter author name"
          className="w-full"
        />
      </div>

      {/* Subtasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subtasks ({subTasks.length})
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSubtaskForm(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Subtask
          </Button>
        </div>
        
        {subTasks.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
            {subTasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleSubtask(subtask.id)}
                  className={`p-1 ${subtask.completed ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {subtask.completed ? <CheckCheck size={16} /> : <Check size={16} />}
                </Button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                    {subtask.title}
                  </div>
                  <div className={`text-sm ${subtask.completed ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {subtask.description}
                  </div>
                  {subtask.dueDate && (
                    <div className="text-xs text-gray-500">
                      Due: {formatDate(subtask.dueDate)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSubtask(subtask)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            initialData ? 'Update Resource' : 'Add Resource'
          )}
        </Button>
      </div>

      {/* Subtask Form Modal */}
      <Modal 
        isOpen={showSubtaskForm} 
        onClose={() => setShowSubtaskForm(false)} 
        title="Add Subtask"
      >
        <LearningSubTaskForm
          onSubmit={handleAddSubtask}
          onClose={() => setShowSubtaskForm(false)}
        />
      </Modal>

      <Modal 
        isOpen={!!editingSubtask} 
        onClose={() => setEditingSubtask(null)} 
        title="Edit Subtask"
      >
        {editingSubtask && (
          <LearningSubTaskForm
            onSubmit={handleUpdateSubtask}
            onClose={() => setEditingSubtask(null)}
            initialData={editingSubtask}
          />
        )}
      </Modal>
    </form>
  );
};

const StrategyNoteForm: React.FC<{
  onSubmit: (noteData: Omit<StrategyNote, 'id' | 'lastModified'>) => Promise<void>;
  onClose: () => void;
  initialData?: StrategyNote;
}> = ({ onSubmit, onClose, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [linkedAirdropIds, setLinkedAirdropIds] = useState<string[]>(initialData?.linkedAirdropIds || []);
  const [subTasks, setSubTasks] = useState<LearningSubTask[]>(initialData?.subTasks || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<LearningSubTask | null>(null);
  const { addToast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      addToast('Title and content are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const noteData: Omit<StrategyNote, 'id' | 'lastModified'> = {
        title: title.trim(),
        content: content.trim(),
        linkedAirdropIds: linkedAirdropIds.filter(id => id.trim()),
        subTasks: subTasks,
      };

      await onSubmit(noteData);
      addToast(initialData ? 'Note updated successfully' : 'Note added successfully', 'success');
      onClose();
    } catch (error) {
      addToast((error as Error).message || 'Failed to save note', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLinkedAirdrop = () => {
    setLinkedAirdropIds([...linkedAirdropIds, '']);
  };

  const handleRemoveLinkedAirdrop = (index: number) => {
    setLinkedAirdropIds(linkedAirdropIds.filter((_, i) => i !== index));
  };

  const handleLinkedAirdropChange = (index: number, value: string) => {
    const newLinkedAirdropIds = [...linkedAirdropIds];
    newLinkedAirdropIds[index] = value;
    setLinkedAirdropIds(newLinkedAirdropIds);
  };

  const handleAddSubtask = (subtaskData: Omit<LearningSubTask, 'id'>) => {
    const newSubtask: LearningSubTask = {
      ...subtaskData,
      id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setSubTasks([...subTasks, newSubtask]);
    setShowSubtaskForm(false);
  };

  const handleUpdateSubtask = (subtaskData: Omit<LearningSubTask, 'id'>) => {
    if (editingSubtask) {
      const updatedSubtask: LearningSubTask = {
        ...editingSubtask,
        ...subtaskData,
      };
      setSubTasks(subTasks.map(st => st.id === editingSubtask.id ? updatedSubtask : st));
      setEditingSubtask(null);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (window.confirm('Are you sure you want to delete this subtask?')) {
      setSubTasks(subTasks.filter(st => st.id !== subtaskId));
      addToast('Subtask deleted successfully', 'success');
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setSubTasks(subTasks.map(st => 
      st.id === subtaskId 
        ? { 
            ...st, 
            completed: !st.completed,
            completionDate: !st.completed ? new Date().toISOString() : undefined
          }
        : st
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <Input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title"
          required
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content *
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your strategy notes"
          required
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Linked Airdrops
        </label>
        <div className="space-y-2">
          {linkedAirdropIds.map((airdropId, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={airdropId}
                onChange={(e) => handleLinkedAirdropChange(index, e.target.value)}
                placeholder="Enter airdrop ID or name"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemoveLinkedAirdrop(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLinkedAirdrop}
            leftIcon={<Plus size={16} />}
          >
            Add Linked Airdrop
          </Button>
        </div>
      </div>

      {/* Subtasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subtasks ({subTasks.length})
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSubtaskForm(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Subtask
          </Button>
        </div>
        
        {subTasks.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3">
            {subTasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleSubtask(subtask.id)}
                  className={`p-1 ${subtask.completed ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {subtask.completed ? <CheckCheck size={16} /> : <Check size={16} />}
                </Button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                    {subtask.title}
                  </div>
                  <div className={`text-sm ${subtask.completed ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {subtask.description}
                  </div>
                  {subtask.dueDate && (
                    <div className="text-xs text-gray-500">
                      Due: {formatDate(subtask.dueDate)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSubtask(subtask)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            initialData ? 'Update Note' : 'Add Note'
          )}
        </Button>
      </div>

      {/* Subtask Form Modal */}
      <Modal 
        isOpen={showSubtaskForm} 
        onClose={() => setShowSubtaskForm(false)} 
        title="Add Subtask"
      >
        <LearningSubTaskForm
          onSubmit={handleAddSubtask}
          onClose={() => setShowSubtaskForm(false)}
        />
      </Modal>

      <Modal 
        isOpen={!!editingSubtask} 
        onClose={() => setEditingSubtask(null)} 
        title="Edit Subtask"
      >
        {editingSubtask && (
          <LearningSubTaskForm
            onSubmit={handleUpdateSubtask}
            onClose={() => setEditingSubtask(null)}
            initialData={editingSubtask}
          />
        )}
      </Modal>
    </form>
  );
};

export default LearningPage;
