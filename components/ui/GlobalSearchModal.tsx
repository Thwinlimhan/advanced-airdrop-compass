import React, { useMemo, useState, ElementType } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { AppData, SearchResultItem, SearchResultType, Airdrop, Wallet, RecurringTask, LearningResource, StrategyNote, WatchlistItem, AirdropStatus } from '../../types';
import { Droplets, ListChecks, WalletCards, GraduationCap, NotebookText, Search, FileText, ArrowRight, CalendarDays, Eye, Layers, CheckSquare, PlaySquare, Square } from 'lucide-react';
import { MY_AIRDROP_STATUS_OPTIONS } from '../../constants';

const BookOpenIcon = FileText;
const BookMarkedIcon = FileText;
const NewsSummaryIcon = FileText;

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onResultClick: (item: SearchResultItem) => void;
  appData: AppData;
}

const TypeIcons: Record<SearchResultType, ElementType> = {
  airdrop: Droplets,
  airdropTask: ListChecks,
  wallet: WalletCards,
  recurringTask: CalendarDays,
  learningGuide: BookOpenIcon,
  learningGlossary: BookMarkedIcon,
  learningNewsSummary: NewsSummaryIcon,
  strategyNote: NotebookText,
  watchlistItem: Eye,
};

const typeDisplayNames: Record<SearchResultType, string> = {
  airdrop: "Airdrops",
  airdropTask: "Airdrop Tasks",
  watchlistItem: "Watchlist",
  wallet: "Wallets",
  recurringTask: "Recurring Tasks",
  learningGuide: "Guides",
  learningGlossary: "Glossary",
  learningNewsSummary: "News Summaries",
  strategyNote: "Strategy Notes",
};

const ALL_FILTER_TYPES: SearchResultType[] = [
    'airdrop', 'airdropTask', 'watchlistItem', 'wallet',
    'recurringTask', 'learningGuide', 'learningGlossary', 'learningNewsSummary', 'strategyNote'
];

const AirdropStatusIcons: Record<AirdropStatus, ElementType> = {
  [AirdropStatus.NOT_STARTED]: Square,
  [AirdropStatus.IN_PROGRESS]: PlaySquare,
  [AirdropStatus.COMPLETED]: CheckSquare,
  [AirdropStatus.RUMORED]: Square,
  [AirdropStatus.CONFIRMED]: Square,
  [AirdropStatus.LIVE]: Square,
  [AirdropStatus.ENDED]: Square,
};


export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onResultClick,
  appData,
}) => {
  const [activeFilters, setActiveFilters] = useState<SearchResultType[]>([]);
  const [activeAirdropStatusFilter, setActiveAirdropStatusFilter] = useState<AirdropStatus | null>(null);


  const searchResults = useMemo((): SearchResultItem[] => {
    if (!searchTerm.trim() || !appData) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();
    let results: SearchResultItem[] = [];

    const parsedSearchTerms: string[] = [];
    const termRegex = /"([^"]+)"|\S+/g; 
    let match;
    while ((match = termRegex.exec(lowerSearchTerm)) !== null) {
      if (match[1]) { 
        parsedSearchTerms.push(match[1]);
      } else { 
        parsedSearchTerms.push(match[0]);
      }
    }

    if (parsedSearchTerms.length === 0) return []; 


    const checkAllTermsMatch = (textFields: (string | undefined | null | string[])[]): boolean => {
        if (parsedSearchTerms.length === 0) return false;
        return parsedSearchTerms.every(st => 
          textFields.some(field => { 
            if (Array.isArray(field)) {
              return field.some(fItem => fItem?.toLowerCase().includes(st));
            }
            return field?.toLowerCase().includes(st);
          })
        );
    };


    appData.airdrops.forEach((airdrop: Airdrop) => {
      if (checkAllTermsMatch([airdrop.projectName, airdrop.description, airdrop.eligibilityCriteria, airdrop.notes, airdrop.blockchain, airdrop.tags])) {
        results.push({
          id: airdrop.id, type: 'airdrop', title: airdrop.projectName,
          description: airdrop.description?.substring(0, 100) || airdrop.blockchain,
          path: `/airdrops/${airdrop.id}`,
          airdropStatus: airdrop.myStatus,
        });
      }
      airdrop.tasks.forEach(task => {
        if (checkAllTermsMatch([task.description, task.notes])) {
            results.push({
                id: task.id, type: 'airdropTask', title: task.description,
                description: `Task for: ${airdrop.projectName}`,
                path: `/airdrops/${airdrop.id}?highlightTaskId=${task.id}`,
                parentId: airdrop.id, highlightTaskId: task.id,
                airdropStatus: airdrop.myStatus, 
            });
        }
        if (task.subTasks) {
            task.subTasks.forEach(subTask => {
                 if (checkAllTermsMatch([subTask.description, subTask.notes])) {
                    results.push({
                        id: subTask.id, type: 'airdropTask', title: subTask.description,
                        description: `Sub-task for: ${airdrop.projectName} > ${task.description.substring(0,30)}...`,
                        path: `/airdrops/${airdrop.id}?highlightTaskId=${subTask.id}`,
                        parentId: airdrop.id, highlightTaskId: subTask.id,
                        airdropStatus: airdrop.myStatus,
                    });
                }
            });
        }
      });
    });

    (appData.watchlist || []).forEach((item: WatchlistItem) => {
        if (checkAllTermsMatch([item.projectName, item.notes, item.confidence])) {
            results.push({
                id: item.id, type: 'watchlistItem', title: item.projectName,
                description: `Watchlist: ${item.confidence} confidence`,
                path: `/watchlist?highlightItemId=${item.id}`,
            });
        }
    });

    appData.wallets.forEach((wallet: Wallet) => {
      if (checkAllTermsMatch([wallet.name, wallet.address, wallet.blockchain, wallet.group])) {
        results.push({
          id: wallet.id, type: 'wallet', title: wallet.name,
          description: `${wallet.blockchain}: ${wallet.address}`, path: '/wallets',
        });
      }
    });

    appData.recurringTasks.forEach((task: RecurringTask) => {
      if (checkAllTermsMatch([task.name, task.description, task.notes, task.tags])) {
        results.push({
          id: task.id, type: 'recurringTask', title: task.name,
          description: `Due: ${new Date(task.nextDueDate).toLocaleDateString()}`, path: '/tasks',
        });
      }
    });

    appData.learningResources.forEach((resource: LearningResource) => {
        if (checkAllTermsMatch([resource.title, resource.content, resource.category, resource.author])) {
            if (resource.type === 'guide') {
                 results.push({
                    id: resource.id, type: 'learningGuide', title: resource.title,
                    description: `Guide: ${resource.category || ''}`, path: `/learning/guides/${resource.id}`,
                });
            } else if (resource.type === 'glossary') {
                results.push({
                    id: resource.id, type: 'learningGlossary', title: resource.title,
                    description: `Glossary: ${resource.content.substring(0,100)}...`, path: `/learning/glossary/${resource.id}`,
                });
            } else if (resource.type === 'news_summary') {
                 results.push({
                    id: resource.id, type: 'learningNewsSummary', title: resource.title,
                    description: `News Summary: ${resource.content.substring(0,100)}...`, path: `/learning/newsAnalysis/${resource.id}`,
                });
            }
        }
    });

    appData.strategyNotes.forEach((note: StrategyNote) => {
        if (checkAllTermsMatch([note.title, note.content])) {
            results.push({
                id: note.id, type: 'strategyNote', title: note.title,
                description: `Note: ${note.content.substring(0,100)}...`, path: `/learning/notebook/${note.id}`,
            });
        }
    });

    if (activeFilters.length > 0) {
        results = results.filter(item => activeFilters.includes(item.type));
    }

    if ((activeFilters.includes('airdrop') || activeFilters.includes('airdropTask')) && activeAirdropStatusFilter) {
      results = results.filter(item => {
        if (item.type === 'airdrop' || item.type === 'airdropTask') {
          return item.airdropStatus === activeAirdropStatusFilter;
        }
        return true; 
      });
    }


    return results.slice(0, 50);
  }, [searchTerm, appData, activeFilters, activeAirdropStatusFilter]);

  const groupedResults = useMemo(() => {
    const groups: Partial<Record<SearchResultType, SearchResultItem[]>> = {};
    searchResults.forEach(item => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type]!.push(item);
    });
    const orderedGroups: Partial<Record<SearchResultType, SearchResultItem[]>> = {};
    ALL_FILTER_TYPES.forEach(typeKey => {
        if (groups[typeKey as SearchResultType]) {
            orderedGroups[typeKey as SearchResultType] = groups[typeKey as SearchResultType];
        }
    });
    return orderedGroups;
  }, [searchResults]);

  const toggleFilter = (type: SearchResultType) => {
    setActiveFilters(prev =>
        prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]
    );
    if ((type === 'airdrop' || type === 'airdropTask') && activeFilters.includes(type)) {
        if (!activeFilters.filter(f => f !== type).some(f => f === 'airdrop' || f === 'airdropTask')) {
           setActiveAirdropStatusFilter(null);
        }
    }
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setActiveAirdropStatusFilter(null);
  }

  const toggleAirdropStatusFilter = (status: AirdropStatus) => {
    if (!activeFilters.includes('airdrop') && !activeFilters.includes('airdropTask')) {
        setActiveFilters(prev => [...prev, 'airdrop']); 
    }
    setActiveAirdropStatusFilter(prev => prev === status ? null : status);
  };


  const filterButtonConfig: {label: string, type?: SearchResultType, icon: React.ElementType}[] = [
    { label: "All", icon: Layers },
    ...ALL_FILTER_TYPES.map(type => ({
        label: typeDisplayNames[type],
        type: type,
        icon: TypeIcons[type]
    }))
  ];


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search Results" size="xl">
      <div className="mb-3 pb-3 border-b border-gray-300 dark:border-gray-600">
        <p className="text-xs text-muted-light dark:text-muted-dark mb-1.5">Filter by type:</p>
        <div className="flex flex-wrap gap-1">
            {filterButtonConfig.map(btn => (
                <Button
                    key={btn.label}
                    size="sm"
                    variant={ (btn.type && activeFilters.includes(btn.type)) || (!btn.type && activeFilters.length === 0) ? "primary" : "outline"}
                    onClick={() => btn.type ? toggleFilter(btn.type) : clearFilters()}
                    leftIcon={<btn.icon size={14} />}
                    className="text-xs px-2 py-1" 
                >
                    {btn.label}
                </Button>
            ))}
        </div>
        {(activeFilters.includes('airdrop') || activeFilters.includes('airdropTask')) && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                 <p className="text-xs text-muted-light dark:text-muted-dark mb-1.5">Filter Airdrops/Tasks by My Status:</p>
                 <div className="flex flex-wrap gap-1">
                    {MY_AIRDROP_STATUS_OPTIONS.map(status => {
                        const Icon = AirdropStatusIcons[status] || Square;
                        return (
                            <Button
                                key={status}
                                size="sm"
                                variant={activeAirdropStatusFilter === status ? "secondary" : "outline"}
                                onClick={() => toggleAirdropStatusFilter(status)}
                                leftIcon={<Icon size={14} />}
                                className="text-xs px-2 py-1"
                            >
                                {status}
                            </Button>
                        );
                    })}
                 </div>
            </div>
        )}
      </div>
      <div className="max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-1">
        {searchTerm.trim() && searchResults.length === 0 && (
          <p className="text-center text-muted-light dark:text-muted-dark py-6">
            No results found for "{searchTerm}" with current filters.
          </p>
        )}
        {Object.entries(groupedResults).map(([type, items]) => (
          items.length > 0 && (
            <div key={type} className="mb-4">
              <h3 className="text-sm font-semibold uppercase text-muted-light dark:text-muted-dark mb-2 border-b pb-1 dark:border-gray-600 font-bold">
                {typeDisplayNames[type as SearchResultType]}
              </h3>
              <ul className="space-y-1">
                {items.map(item => {
                  const Icon = TypeIcons[item.type as SearchResultType] || FileText;
                  return (
                    <li key={`${item.type}-${item.id}-${item.highlightTaskId || ''}`}>
                      <button
                        onClick={() => onResultClick(item)}
                        className="w-full text-left p-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center min-w-0">
                           <Icon size={18} className="mr-3 text-primary-light dark:text-primary-dark flex-shrink-0" />
                           <div className="min-w-0">
                                <p className="text-md font-medium text-text-light dark:text-text-dark truncate">{item.title}</p>
                                {item.description && <p className="text-xs text-muted-light dark:text-muted-dark truncate">{item.description}</p>}
                           </div>
                        </div>
                        <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        ))}
      </div>
       {!searchTerm.trim() && (
         <p className="text-center text-muted-light dark:text-muted-dark py-10">
            Start typing in the search bar above to find airdrops, tasks, wallets, and more.
          </p>
       )}
    </Modal>
  );
};