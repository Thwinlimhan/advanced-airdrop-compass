import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Select } from '../../design-system/components/Select';
import { Input } from '../../design-system/components/Input'; 
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Wallet } from '../../types';
import { Heart, Loader2, AlertTriangle, CheckCircle, XCircle, Brain, UserCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { aiService } from '../../utils/aiService';

interface WalletHealthCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet?: Wallet; 
}

export const WalletHealthCheckModal: React.FC<WalletHealthCheckModalProps> = ({ isOpen, onClose, wallet }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  
  const [userWalletContext, setUserWalletContext] = useState({
    age: '<3 months',
    typicalInteractions: 'Few small swaps',
    fundingSource: 'New Wallet',
    interactionDiversity: '1-2 protocols',
    primaryBlockchain: wallet?.blockchain || 'Unknown',
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
      setAnalysisResult(null);
      if (!aiService.isAvailable()) {
        setIsApiKeyMissing(true);
        setError(`AI Wallet Health Check is unavailable because ${aiService.getProviderName()} is not configured.`);
      } else {
        setIsApiKeyMissing(false);
        setError(null); 
      }
      if (wallet) {
        setUserWalletContext(prev => ({ ...prev, primaryBlockchain: wallet.blockchain }));
      } else {
        setUserWalletContext(prev => ({ ...prev, primaryBlockchain: 'Unknown' }));
      }
    }
  }, [isOpen, wallet]);

  const handleAnalyze = async () => {
    if (isApiKeyMissing) {
      setError(`AI Wallet Health Check is unavailable because ${aiService.getProviderName()} is not configured.`);
      addToast("AI Health Check disabled: API Key missing.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const profileDescription = `
        Wallet Name (for context, not for on-chain lookup): ${wallet?.name || 'N/A'}
        Primary Blockchain: ${userWalletContext.primaryBlockchain}
        Estimated Wallet Age: ${userWalletContext.age}
        Typical On-chain Interactions: ${userWalletContext.typicalInteractions}
        Primary Funding Source Type: ${userWalletContext.fundingSource}
        Diversity of Protocols Interacted With: ${userWalletContext.interactionDiversity}
      `.trim();
      
      const systemInstruction = `You are an AI assistant providing conceptual feedback on crypto wallet profiles for Sybil resistance education.
      Based on the user-provided context (wallet age, interaction types, funding, diversity, primary chain, wallet name for context), give general advice and point out common patterns that might be flagged as Sybil activity.
      Also mention good practices for maintaining a healthy, organic-looking wallet profile. This is for educational purposes ONLY and not a definitive Sybil check.
      Do NOT ask for wallet addresses or specific transaction data. Do NOT give financial advice.
      Focus on general patterns applicable to the described profile. Structure your response with clear, actionable bullet points.
      For example, if funding is 'New Wallet', you might discuss the importance of funding from reputable sources like CEXs. If 'Few small swaps', you might discuss transaction diversity and volume.
      Keep the advice practical and educational for someone looking to participate in airdrops legitimately.`;
      
      const prompt = `Analyze this general wallet profile for potential Sybil attack red flags and suggest educational good practices for airdrop farming. This is for general information only, not a definitive Sybil assessment.
      Wallet Profile Details:
      ${profileDescription}`;
      
      const fullPrompt = `${systemInstruction}\n\n${prompt}`;
      let textResponse = await aiService.generateContent(fullPrompt);
      textResponse = textResponse.trim();
      
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = textResponse.match(fenceRegex);
      if (match && match[2]) {
        textResponse = match[2].trim();
      }
      setAnalysisResult(textResponse);
      addToast("AI Wallet Health analysis complete.", "success");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Analysis Error: ${errorMessage}`);
      addToast(`AI Health Check Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={wallet ? `Wallet Health Check: ${wallet.name}` : 'Wallet Health Check'} size="lg">
      <div className="space-y-4">
        <AlertMessage type="info" title="Educational Tool" message="This AI provides general feedback based on the profile you describe. It's for educational purposes to understand Sybil risk factors and is NOT a definitive check." />
        {isApiKeyMissing && (
          <AlertMessage type="warning" title="API Key Missing" message="AI Wallet Health Check requires an API_KEY. This feature is currently disabled." />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Wallet Age" value={userWalletContext.age} onChange={e => setUserWalletContext(s=>({...s, age: e.target.value}))} options={["<3 months", "3-6 months", "6-12 months", ">1 year"].map(o=>({value:o, label:o}))} disabled={isLoading || isApiKeyMissing}/>
            <Select label="Typical Interactions" value={userWalletContext.typicalInteractions} onChange={e => setUserWalletContext(s=>({...s, typicalInteractions: e.target.value}))} options={["Few small swaps", "Many small swaps/txns", "Few large txs (bridge/LP)", "Mix of small/large txs", "Mainly holding"].map(o=>({value:o, label:o}))} disabled={isLoading || isApiKeyMissing}/>
            <Select label="Funding Source" value={userWalletContext.fundingSource} onChange={e => setUserWalletContext(s=>({...s, fundingSource: e.target.value}))} options={["CEX (Centralized Exchange)", "Bridge from Mainnet/L1", "New Wallet (self-funded from fresh source)", "Another personal wallet (farming)", "P2P"].map(o=>({value:o, label:o}))} disabled={isLoading || isApiKeyMissing}/>
            <Select label="Protocol Interaction Diversity" value={userWalletContext.interactionDiversity} onChange={e => setUserWalletContext(s=>({...s, interactionDiversity: e.target.value}))} options={["1-2 protocols", "3-5 protocols", "5-10 protocols", "10+ protocols"].map(o=>({value:o, label:o}))} disabled={isLoading || isApiKeyMissing}/>
             <Input label="Primary Blockchain (auto-filled)" value={userWalletContext.primaryBlockchain} onChange={e => setUserWalletContext(s=>({...s, primaryBlockchain: e.target.value}))} disabled={isLoading || isApiKeyMissing}/>
        </div>
        
        <Button onClick={handleAnalyze} disabled={isLoading || isApiKeyMissing} isLoading={isLoading} leftIcon={isLoading ? undefined : <Brain size={16}/>}>
          {isLoading ? 'Analyzing Profile...' : 'Run AI Wallet Health Analysis'}
        </Button>

        {error && !isApiKeyMissing && (
          <AlertMessage type="error" title="Analysis Error" message={error} onDismiss={() => setError(null)} />
        )}
        {analysisResult && !isLoading && (
          <div className="mt-3 p-3 border rounded-md bg-indigo-50 max-w-none overflow-y-auto">
            <h5 className="text-md font-semibold text-indigo-700 mb-1.5 flex items-center"><UserCircle size={16} className="mr-1.5"/>AI Feedback:</h5>
            <div className="prose prose-sm max-w-none text-text-light whitespace-pre-wrap">
              {analysisResult}
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
