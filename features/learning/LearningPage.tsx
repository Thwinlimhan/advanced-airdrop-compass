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
  Tag
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
import { useAppContext } from '../../contexts/AppContext';
import { LearningResource, LearningTab } from '../../types';
import { useToast } from '../../hooks/useToast';
import { LEARNING_HUB_SUB_NAV } from '../../constants';
import { AddAirdropTutorial } from '../tutorials/AddAirdropTutorial';

interface LearningPageProps {
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
  const { appData, addLearningResource, updateLearningResource, deleteLearningResource } = useAppContext();
  const { addToast } = useToast();
  const { subPage, itemId } = useParams<{ subPage?: LearningTab, itemId?: string }>();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();

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

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<LearningResource | null>(null);

  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [editingGlossaryTerm, setEditingGlossaryTerm] = useState<LearningResource | null>(null);
  
  const [initialNotebookId, setInitialNotebookId] = useState<string | undefined>(undefined);
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
    let filtered = learningResources.filter(resource => {
      if (activeTab === 'guides' && resource.type !== 'guide') return false;
      if (activeTab === 'glossary' && resource.type !== 'glossary') return false;
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          resource.title.toLowerCase().includes(searchLower) ||
          resource.content?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
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
        default:
          comparison = 0;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    return filtered;
  }, [learningResources, activeTab, searchTerm, selectedFilter, sortBy, sortOrder]);

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
            {/* No difficulty property */}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-primary-light dark:text-primary-dark mb-1 hover:underline cursor-pointer">
          {resource.title}
        </h3>
        <div className="flex items-center text-xs mb-2">
          {resource.author && <span className="text-muted-light dark:text-muted-dark">By: {resource.author}</span>}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {resource.content?.substring(0, 150) || 'No description available'}
        </p>
      </CardContent>
    </Card>
  );

  const guides = useMemo(() => {
    let allGuides = learningResources.filter(r => r.type === 'guide').sort((a,b) => a.title.localeCompare(b.title));
    if (showUserSubmittedOnly) {
        allGuides = allGuides.filter(g => g.author === "User Submission");
    }
    return allGuides;
  }, [learningResources, showUserSubmittedOnly]);
  
  const glossaryTerms = learningResources.filter(r => r.type === 'glossary').sort((a,b) => a.title.localeCompare(b.title));

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
            setInitialNotebookId(undefined);
            setSelectedResource(null);
            navigate(`/learning/${tabId}`);
        }}
        leftIcon={<Icon size={16}/>}
        className="flex-1 sm:flex-none whitespace-nowrap"
    >
        {label}
    </Button>
  );

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">Crypto Learning Hub</h2>
         {activeTab === 'guides' && !selectedResource && (
            <div className="flex gap-2">
                <Button onClick={() => setIsGuideSubmissionModalOpen(true)} variant="outline" leftIcon={<User size={18}/>}>Submit Your Guide</Button>
                <Button onClick={openGuideModalForCreate} leftIcon={<PlusCircle size={18}/>}>Add New Guide</Button>
            </div>
        )}
        {activeTab === 'glossary' && (
             <Button onClick={openGlossaryModalForCreate} leftIcon={<PlusCircle size={18}/>}>Add New Term</Button>
        )}
      </div>

      <div className="mb-6 flex space-x-1 sm:space-x-2 border-b border-gray-300 dark:border-gray-600 pb-px overflow-x-auto">
        {LEARNING_HUB_SUB_NAV.map(navItem => (
           <TabButton key={navItem.id} tabId={navItem.id as LearningTab} label={navItem.label} icon={navItem.icon} />
        ))}
      </div>

      {activeTab === 'guides' && (
        selectedResource ? (
          <div>
            <div className="flex justify-between items-center mb-4">
                <Button onClick={handleBackToGuidesList} variant="outline">
                &larr; Back to Guides List
                </Button>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openGuideModalForEdit(selectedResource)} leftIcon={<Edit3 size={16}/>}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={async () => await handleDeleteGuide(selectedResource.id, selectedResource.title)} leftIcon={<Trash2 size={16}/>}>Delete</Button>
                </div>
            </div>
            <GuideReader guide={selectedResource} />
          </div>
        ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setShowUserSubmittedOnly(!showUserSubmittedOnly)} variant="ghost" size="sm" leftIcon={<FilterIcon size={14}/>}>
              {showUserSubmittedOnly ? 'Show All Guides' : 'Show Only User Submitted'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.length === 0 ? (
                <p className="col-span-full text-center text-muted-light dark:text-muted-dark py-8">
                  {showUserSubmittedOnly ? "No user submitted guides found." : "No guides available. Click 'Add New Guide' or 'Submit Your Guide' to create one."}
                </p>
            ) : (
                guides.map(guide => (
                <Card key={guide.id} className="flex flex-col justify-between">
                    <div>
                        <h3 
                            className="text-lg font-semibold text-primary-light dark:text-primary-dark mb-1 hover:underline cursor-pointer"
                            onClick={() => handleSelectGuide(guide)}
                        >
                            {guide.title}
                        </h3>
                        <div className="flex items-center text-xs mb-2">
                            {guide.author && <span className="text-muted-light dark:text-muted-dark">By: {guide.author}</span>}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {guide.content?.substring(0, 150) || 'No description available'}
                        </p>
                    </div>
                    <div className="mt-4 flex space-x-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openGuideModalForEdit(guide)} title="Edit Guide"><Edit3 size={16}/></Button>
                        <Button variant="ghost" size="sm" onClick={async () => await handleDeleteGuide(guide.id, guide.title)} className="text-red-500 hover:text-red-700" title="Delete Guide"><Trash2 size={16}/></Button>
                    </div>
                </Card>
                ))
            )}
          </div>
        </>
        )
      )}

      {activeTab === 'glossary' && (
        <GlossaryList 
            terms={glossaryTerms} 
            onEdit={openGlossaryModalForEdit}
            onDelete={handleDeleteGlossaryTerm}
        />
      )}
      
      {activeTab === 'sybilPrevention' && (
        <SybilPreventionGuidePage />
      )}

      {activeTab === 'notebook' && (
        <StrategyNotebook initialSelectedNoteId={initialNotebookId} />
      )}

      {activeTab === 'aiStrategy' && (
        <Card title="AI Farming Strategist">
            <AIStrategyAdvisor />
        </Card>
      )}
      
      {activeTab === 'aiAnalyst' && (
         <AIAnalystPage />
      )}

      {activeTab === 'newsAnalysis' && ( 
        <NewsSummarizer />
      )}

      {activeTab === 'tutorials' && (
        <AddAirdropTutorial isOpen={true} onClose={() => {}} />
      )}

      <Modal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} title={editingGuide ? 'Edit Guide' : 'Add New Guide'} size="lg">
        <GuideForm 
            onSubmit={handleGuideFormSubmit} 
            initialData={editingGuide || undefined} 
            onClose={() => setIsGuideModalOpen(false)} 
        />
      </Modal>
       <Modal isOpen={isGuideSubmissionModalOpen} onClose={() => setIsGuideSubmissionModalOpen(false)} title="Submit Your Crypto Guide" size="lg">
        <GuideSubmissionForm
            onSubmit={handleGuideSubmissionFormSubmit}
            onClose={() => setIsGuideSubmissionModalOpen(false)}
        />
      </Modal>

       <Modal isOpen={isGlossaryModalOpen} onClose={() => setIsGlossaryModalOpen(false)} title={editingGlossaryTerm ? 'Edit Glossary Term' : 'Add New Glossary Term'} size="md">
        <GlossaryForm
            onSubmit={handleGlossaryFormSubmit} 
            initialData={editingGlossaryTerm || undefined} 
            onClose={() => setIsGlossaryModalOpen(false)} 
        />
      </Modal>
    </PageWrapper>
  );
};
