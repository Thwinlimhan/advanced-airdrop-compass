import React, { useState, useEffect } from 'react'; 
import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; 
import { Card } from '../../design-system/components/Card';
import { Textarea } from '../../design-system/components/Textarea';
import { Button } from '../../design-system/components/Button';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Brain, Send, Save, AlertTriangle } from 'lucide-react'; // Removed Loader2
import { useToast } from '../../hooks/useToast';
import { useAppContext } from '../../contexts/AppContext'; 
import { UserFarmingPreferences, AiFarmingStrategy, SavedAiFarmingStrategy, AiFarmingStrategyStep } from '../../types';

export const AIStrategyAdvisor: React.FC = () => {
  const [userStrategyInput, setUserStrategyInput] = useState<string>('');
  const [aiStrategyResponse, setAiStrategyResponse] = useState<AiFarmingStrategy | null>(null); // Changed to AiFarmingStrategy
  const [isStrategyLoading, setIsStrategyLoading] = useState<boolean>(false);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const [preferences] = useState<UserFarmingPreferences>({
    riskTolerance: 'Medium',
    capital: '$100-$500',
    preferredChains: ['Ethereum', 'Solana'],
    timeCommitment: '5-10 hrs/wk',
    automations: { autoClaim: false, autoCompound: false },
    preferredStrategies: [],
  });

  const { addToast } = useToast();
  const { addSavedAiStrategy } = useAppContext();
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
      setStrategyError("API_KEY for AI features is not configured. AI-powered advice is unavailable.");
    }
  }, []);
  
  const handleStrategySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApiKeyMissing) {
      setStrategyError("API_KEY for AI features is not configured. AI-powered advice is unavailable.");
      addToast("AI Strategy disabled: API Key missing.", "warning");
      return;
    }
    
    setIsStrategyLoading(true);
    setAiStrategyResponse(null);
    setStrategyError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! }); 
      
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
      User Question (optional context): ${userStrategyInput || 'Generate a general strategy based on preferences.'}

      Generate a personalized farming strategy based on these preferences.`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17', 
        contents: prompt,
        config: { systemInstruction, responseMimeType: "application/json" }
      });
      
      let jsonStr = response.text?.trim() || '';
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) { jsonStr = match[2].trim(); }

      try {
        const parsedStrategy: AiFarmingStrategy = JSON.parse(jsonStr);
        setAiStrategyResponse(parsedStrategy);
      } catch (parseErr) {
        console.error("AI Strategy JSON Parse Error:", parseErr, "Raw:", jsonStr);
        throw new Error("AI response was not valid JSON. Please try again or rephrase your request.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setStrategyError(`Failed to get advice: ${errorMessage}.`);
      addToast(`Strategy Advice Error: ${errorMessage}`, 'error');
    } finally {
      setIsStrategyLoading(false);
    }
  };

  const handleSaveStrategy = () => {
    if (aiStrategyResponse) {
        const strategyToSave: SavedAiFarmingStrategy = {
            ...(aiStrategyResponse as AiFarmingStrategy), 
            id: crypto.randomUUID(),
            savedDate: new Date().toISOString(),
            preferences: preferences, 
        };
        addSavedAiStrategy(strategyToSave); 
        addToast('AI Strategy saved!', 'success');
    }
  };
  
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


  return (
    <Card>
      <div className="flex items-center mb-4">
        <Brain size={24} className="mr-2 text-primary-light dark:text-primary-dark" />
        <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">AI Airdrop Strategy Advisor</h3>
      </div>
      <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
        Describe your ideal airdrop or ask about strategies. The AI will provide conceptual advice.
      </p>
      {isApiKeyMissing && <AlertMessage type="warning" title="API Key Missing" message="AI features require an API_KEY. This feature is currently disabled." className="mb-4" />}

      <form onSubmit={handleStrategySubmit} className="space-y-4">
        {/* Preference inputs can be added here as in FarmingStrategyModal if desired */}
        <Textarea
          id="ai-strategy-input"
          label="Your Question, Focus, or Topic for the AI Strategist:"
          value={userStrategyInput}
          onChange={(e) => setUserStrategyInput(e.target.value)}
          placeholder="e.g., Strategies for low-capital farming on Solana, or how to find airdrops for NFT projects."
          rows={3}
          disabled={isStrategyLoading || isApiKeyMissing}
        />
        <Button type="submit" disabled={isStrategyLoading || isApiKeyMissing || !userStrategyInput.trim()} isLoading={isStrategyLoading} leftIcon={isStrategyLoading ? undefined : <Send size={18}/>}>
          {isStrategyLoading ? 'Getting Advice...' : 'Get Strategy Advice'}
        </Button>
      </form>

      {strategyError && ( 
        <AlertMessage type="error" message={strategyError} title="Strategy Error" className="mt-4" onDismiss={() => setStrategyError(null)} />
      )}

      {aiStrategyResponse && !strategyError && (
        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-primary-light dark:text-primary-dark">{aiStrategyResponse.strategyTitle}</h3>
              <p className="text-sm italic text-muted-light dark:text-muted-dark">{aiStrategyResponse.overallApproach}</p>
            </div>
            <Button onClick={handleSaveStrategy} size="sm" variant="outline" leftIcon={<Save size={14}/>} disabled={isApiKeyMissing}>
                Save Strategy
            </Button>
          </div>
            
          <h4 className="text-md font-semibold mt-2">Actionable Steps:</h4>
          <div className="space-y-2">
              {aiStrategyResponse.steps.map((step, i) => <StrategyStepDisplay key={i} step={step} />)}
          </div>

          {aiStrategyResponse.sybilTips && aiStrategyResponse.sybilTips.length > 0 && (
              <>
                  <h4 className="text-md font-semibold mt-2">Sybil Resistance Tips:</h4>
                  <ul className="list-disc list-inside text-xs text-muted-light dark:text-muted-dark space-y-0.5 pl-4">
                      {aiStrategyResponse.sybilTips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
              </>
          )}
           {aiStrategyResponse.disclaimers && aiStrategyResponse.disclaimers.length > 0 && (
              <div className="mt-3 p-2 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-xs text-yellow-700 dark:text-yellow-200">
                  {aiStrategyResponse.disclaimers.map((disc, i) => <p key={i} className="flex items-start"><AlertTriangle size={14} className="mr-1.5 mt-0.5 flex-shrink-0"/>{disc}</p>)}
              </div>
          )}
        </div>
      )}
      <p className="text-xs text-muted-light dark:text-muted-dark mt-8 text-center">
        AI-generated advice is for informational purposes only and not financial advice. Always do your own research (DYOR).
      </p>
    </Card>
  );
};
