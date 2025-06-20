import React, { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { FarmingStrategyModal } from './FarmingStrategyModal';
import { Lightbulb, Trash2, Eye } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../contexts/AppContext';
import { SavedAiFarmingStrategy } from '../../types';
import { useToast } from '../../hooks/useToast';
import { AIStrategyAdvisor } from '../learning/AIStrategyAdvisor'; // Assuming it's moved here

export const AIStrategyPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // For generating NEW strategy
  const [viewingStrategy, setViewingStrategy] = useState<SavedAiFarmingStrategy | null>(null); // For viewing existing
  const { t } = useTranslation();
  const { appData, deleteSavedAiStrategy } = useAppContext();
  const { addToast } = useToast();

  const savedStrategies = appData.savedAiStrategies || [];

  const handleViewStrategy = (strategy: SavedAiFarmingStrategy) => {
    setViewingStrategy(strategy);
    setIsModalOpen(true); 
  };
  
  const handleDelete = async (strategyId: string, strategyName: string) => {
      if(window.confirm(t('ai_strategist_strategy_delete_confirm', { strategyName, defaultValue: `Are you sure you want to delete the strategy "${strategyName}"?`}))){
          await deleteSavedAiStrategy(strategyId);
          addToast(`Strategy "${strategyName}" deleted.`, 'success');
      }
  }

  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <Lightbulb size={28} className="mr-3 text-primary-light dark:text-primary-dark" />
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">
          {t('ai_strategist_title')}
        </h2>
      </div>
      
      {/* The AIStrategyAdvisor component now handles the form and display of a single generated strategy */}
      <AIStrategyAdvisor />


      {/* Displaying saved strategies below the main advisor component */}
      {savedStrategies.length > 0 && (
        <Card className="mt-6">
          <h3 className="text-lg font-semibold mb-3">{t('ai_strategist_saved_strategies_title')}</h3>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {savedStrategies.map(strategy => (
              <div key={strategy.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-text-light dark:text-text-dark truncate" title={strategy.strategyTitle}>{strategy.strategyTitle}</h4>
                  <p className="text-xs text-muted-light dark:text-muted-dark">Saved: {new Date(strategy.savedDate).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-light dark:text-muted-dark truncate">
                    Prefs: {strategy.preferences.riskTolerance}, {strategy.preferences.capital}, {strategy.preferences.preferredChains.slice(0,2).join('/')}{strategy.preferences.preferredChains.length > 2 ? '...' : ''}
                  </p>
                </div>
                <div className="flex space-x-1 self-start sm:self-center flex-shrink-0">
                   <Button variant="ghost" size="sm" onClick={() => handleViewStrategy(strategy)} title={t('ai_strategist_view_strategy_button')}><Eye size={16}/></Button>
                   <Button variant="ghost" size="sm" onClick={() => handleDelete(strategy.id, strategy.strategyTitle)} className="text-red-500 hover:text-red-700" title={t('ai_strategist_delete_strategy_button')}><Trash2 size={16}/></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {savedStrategies.length === 0 && (
          <Card className="mt-6">
            <p className="text-center text-muted-light dark:text-muted-dark py-4">{t('ai_strategist_no_saved_strategies')}</p>
          </Card>
      )}

      {/* Modal for viewing/generating a specific strategy - now primarily for viewing existing ones */}
      <FarmingStrategyModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setViewingStrategy(null);}}
        existingStrategy={viewingStrategy} // Pass the strategy to view
      />
    </PageWrapper>
  );
};