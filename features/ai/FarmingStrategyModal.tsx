import React, { useState, FormEvent, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Brain, Send, Loader2, AlertTriangle, Save } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { aiService } from '../../utils/aiService';
import { UserFarmingPreferences, AiFarmingStrategy, AiFarmingStrategyStep, SavedAiFarmingStrategy } from '../../types';
import { TagInput } from '../../components/ui/TagInput';
import { BLOCKCHAIN_OPTIONS } from '../../constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useAiStrategyStore } from '../../stores/aiStrategyStore';

interface FarmingStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStrategy?: SavedAiFarmingStrategy | null; 
}

const riskOptions = [
  { value: 'Low', label: 'Low - Cautious, prioritize established projects' },
  { value: 'Medium', label: 'Medium - Balanced, explore newer but vetted projects' },
  { value: 'High', label: 'High - Aggressive, willing to explore degen plays' },
];
const capitalOptions = [
  { value: '$0-$100', label: '$0 - $100 (Micro-capital)' },
  { value: '$100-$500', label: '$100 - $500 (Small)' },
  { value: '$500-$2000', label: '$500 - $2000 (Medium)' },
  { value: '$2000-$10000', label: '$2000 - $10000 (Large)' },
  { value: '$10000+', label: '$10000+ (Whale)' },
];
const timeCommitmentOptions = [
  { value: '<5 hrs/wk', label: '<5 hours per week (Casual)' },
  { value: '5-10 hrs/wk', label: '5-10 hours per week (Dedicated)' },
  { value: '>10 hrs/wk', label: '>10 hours per week (Full-time farmer)' },
];

const StrategyStepDisplay: React.FC<{step: AiFarmingStrategyStep}> = ({step}) => (
    <div className="p-2.5 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
        <h5 className="font-semibold text-sm text-indigo-600 dark:text-indigo-300">{step.title}</h5>
        <p className="text-xs text-text-light dark:text-text-dark mt-0.5 whitespace-pre-wrap">{step.description}</p>
        <div className="flex justify-between text-xs mt-1 text-muted-light dark:text-muted-dark">
            <span>Effort: {step.effort}</span>
            <span>Impact: {step.potentialImpact}</span>
        </div>
        {step.notes && <p className="text-xs italic mt-0.5 text-gray-500 dark:text-gray-400">Note: {step.notes}</p>}
    </div>
);


export const FarmingStrategyModal: React.FC<FarmingStrategyModalProps> = ({ isOpen, onClose, existingStrategy }) => {
  const { addToast } = useToast();
  const { addSavedAiStrategy } = useAiStrategyStore();
  const [preferences, setPreferences] = useState<UserFarmingPreferences>({
    riskTolerance: 'Medium',
    capital: '$100-$500',
    preferredChains: ['Ethereum', 'Solana'],
    timeCommitment: '5-10 hrs/wk',
    automations: { autoClaim: false, autoCompound: false },
    preferredStrategies: [],
  });
  const [strategy, setStrategy] = useState<AiFarmingStrategy | SavedAiFarmingStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const { t } = useTranslation();
  const [isViewingMode, setIsViewingMode] = useState(false);


  useEffect(() => {
    if (!aiService.isAvailable()) {
      setIsApiKeyMissing(true);
    }
    if (isOpen) {
      setIsLoading(false);
      if (existingStrategy) {
        setPreferences(existingStrategy.preferences);
        setStrategy(existingStrategy); 
        setIsViewingMode(true); // Set to view mode
        setError(null);
      } else {
        setPreferences({ 
          riskTolerance: 'Medium',
          capital: '$100-$500',
          preferredChains: ['Ethereum', 'Solana'],
          timeCommitment: '5-10 hrs/wk',
          automations: { autoClaim: false, autoCompound: false },
          preferredStrategies: [],
        });
        setStrategy(null);
        setIsViewingMode(false); // Set to creation mode
        setError(null);
      }
      if (!aiService.isAvailable()) {
        setError(`AI Farming Strategist is unavailable because ${aiService.getProviderName()} is not configured.`);
      }
    }
  }, [isOpen, existingStrategy]);

  const handleChange = (field: keyof UserFarmingPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
    setStrategy(null); 
    setIsViewingMode(false); // Switch to creation mode if prefs change
  };

  const handleSubmit = async () => {
    if (isApiKeyMissing) {
      setError(`AI Farming Strategist is unavailable because ${aiService.getProviderName()} is not configured.`);
      addToast("AI Strategy disabled: API Key missing.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setStrategy(null);
    setIsViewingMode(false);

    try {
      const systemInstruction = `You are an expert crypto airdrop farming strategist. Based on the user's preferences (risk, capital, chains, time), generate a personalized, conceptual airdrop farming strategy.
      The strategy should include:
      1. 'strategyTitle': A catchy title for the strategy.
      2. 'overallApproach': A brief (1-2 sentences) overview of the strategy's philosophy.
      3. 'steps': An array of 3-5 actionable 'AiFarmingStrategyStep' objects, each with:
          - 'title': Short title for the step.
          - 'description': Detailed explanation of the step (2-4 sentences).
          - 'effort': "Low", "Medium", or "High".
          - 'potentialImpact': "Low", "Medium", or "High".
          - 'notes' (optional): A brief additional tip or consideration for this step.
      4. 'sybilTips': An array of 2-3 general Sybil resistance tips relevant to this strategy.
      5. 'disclaimers': An array including standard disclaimers like "This is not financial advice. DYOR." and "Airdrops are not guaranteed."
      Return the response as a valid JSON object matching this structure. Do NOT use markdown code fences.`;

      const prompt = `User Preferences:
      - Risk Tolerance: ${preferences.riskTolerance}
      - Capital Available: ${preferences.capital}
      - Preferred Chains/Ecosystems: ${preferences.preferredChains.join(', ') || 'Any'}
      - Time Commitment: ${preferences.timeCommitment}

      Generate a personalized farming strategy based on these preferences.`;

      const fullPrompt = `${systemInstruction}\n\n${prompt}`;
      let jsonStr = await aiService.generateContent(fullPrompt);
      jsonStr = jsonStr.trim();
      
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const parsedStrategy: AiFarmingStrategy = JSON.parse(jsonStr);
      setStrategy(parsedStrategy);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate strategy: ${errorMessage}`);
      addToast(`AI Strategy Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStrategy = () => {
    if (strategy && !('id' in strategy)) { 
        const strategyToSave: SavedAiFarmingStrategy = {
            ...(strategy as AiFarmingStrategy), 
            id: crypto.randomUUID(),
            savedDate: new Date().toISOString(),
            preferences: preferences,
        };
        addSavedAiStrategy(strategyToSave); 
        addToast(t('ai_strategist_strategy_saved_toast'), 'success');
        onClose();
    } else if (strategy && 'id' in strategy) {
        addToast("This strategy is already saved. To update, generate a new one with modified preferences and save.", "info");
    }
  };

  const handleGenerateNewWithSamePrefs = () => {
    setStrategy(null); 
    setIsViewingMode(false); 
    handleSubmit(); 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isViewingMode && existingStrategy ? t('ai_strategist_view_strategy_button') : t('ai_strategist_title')} size="xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
        <div className="flex items-center mb-2">
          <Brain size={20} className="mr-2 text-purple-500" />
          <span className="text-xl font-semibold text-primary">
            {isViewingMode && existingStrategy ? t('ai_strategist_view_strategy_button') : t('ai_strategist_title')}
          </span>
        </div>
        {isApiKeyMissing && (
            <AlertMessage type="warning" title="API Key Missing" message="AI Farming Strategist requires an API_KEY. This feature is currently disabled." />
        )}
        {!strategy && !isLoading && !isViewingMode && ( 
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3">
            <p className="text-sm text-muted-light dark:text-muted-dark">
              Tell the AI about your preferences to get a conceptual farming strategy.
            </p>
            <Select label={t('ai_strategist_risk_label')} value={preferences.riskTolerance} onChange={e => handleChange('riskTolerance', e.target.value)} options={riskOptions} disabled={isApiKeyMissing}/>
            <Select label={t('ai_strategist_capital_label')} value={preferences.capital} onChange={e => handleChange('capital', e.target.value)} options={capitalOptions} disabled={isApiKeyMissing}/>
            <TagInput id="preferredChains" label={t('ai_strategist_chains_label')} tags={preferences.preferredChains} onTagsChange={tags => handleChange('preferredChains', tags)} suggestions={BLOCKCHAIN_OPTIONS} placeholder="Type or select chains" disabled={isApiKeyMissing || isLoading}/>
            <Select label={t('ai_strategist_time_label')} value={preferences.timeCommitment} onChange={e => handleChange('timeCommitment', e.target.value)} options={timeCommitmentOptions} disabled={isApiKeyMissing}/>
            <Button type="submit" disabled={isLoading || isApiKeyMissing} leftIcon={isLoading ? <Loader2 className="animate-spin"/> : <Send/>}>
              {isLoading ? 'Generating Strategy...' : t('ai_strategist_get_button')}
            </Button>
          </form>
        )}

        {isLoading && <div className="flex items-center justify-center py-10"><Loader2 size={32} className="animate-spin text-primary-light dark:text-primary-dark" /><p className="ml-3 text-muted-light dark:text-muted-dark">AI is crafting your strategy...</p></div>}
        
        {error && !isLoading && !isApiKeyMissing && (
          <AlertMessage type="error" title="Strategy Generation Error" message={error} onDismiss={() => setError(null)} />
        )}

        {strategy && !isLoading && !error && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-primary-light dark:text-primary-dark">{strategy.strategyTitle}</h3>
            <p className="text-sm italic text-muted-light dark:text-muted-dark">{strategy.overallApproach}</p>
            
            <h4 className="text-md font-semibold mt-2">Actionable Steps:</h4>
            <div className="space-y-2">
                {strategy.steps.map((step, i) => <StrategyStepDisplay key={i} step={step} />)}
            </div>

            {strategy.sybilTips && strategy.sybilTips.length > 0 && (
                <>
                    <h4 className="text-md font-semibold mt-2">Sybil Resistance Tips:</h4>
                    <ul className="list-disc list-inside text-xs text-muted-light dark:text-muted-dark space-y-0.5 pl-4">
                        {strategy.sybilTips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                </>
            )}
             {strategy.disclaimers && strategy.disclaimers.length > 0 && (
                <div className="mt-3 p-2 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-xs text-yellow-700 dark:text-yellow-200">
                    {strategy.disclaimers.map((disc, i) => <p key={i} className="flex items-start"><AlertTriangle size={14} className="mr-1.5 mt-0.5 flex-shrink-0"/>{disc}</p>)}
                </div>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
                {!('id' in strategy) && 
                    <Button onClick={handleSaveStrategy} leftIcon={<Save size={16}/>}>
                    {String(t('ai_strategist_save_strategy_button'))}
                    </Button>
                }
                {isViewingMode && existingStrategy && 
                    <Button onClick={handleGenerateNewWithSamePrefs} variant="outline">Generate New With These Preferences</Button>
                }
                {!isViewingMode && strategy && 
                    <Button onClick={() => {setStrategy(null); setError(null); setIsViewingMode(false);}} variant="outline">Start Over / New Preferences</Button>
                }
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="primary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
