import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { DiscoveredAirdropSuggestion, ConfidenceLevel } from '../../types';
import { Search, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { useToast } from '../../hooks/useToast';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { DiscoveredAirdropDetailModal } from "./AirdropDiscoveryDetailModal";
import { aiService } from '../../utils/aiService';

export const AirdropDiscoveryWidget: React.FC = () => {
  const [suggestions, setSuggestions] = useState<DiscoveredAirdropSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addWatchlistItem } = useWatchlistStore();
  const { addToast } = useToast();
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<DiscoveredAirdropSuggestion | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!aiService.isAvailable()) {
      setIsApiKeyMissing(true);
      setError(`AI-powered discovery is unavailable because ${aiService.getProviderName()} is not configured.`);
    }
  }, []);

  const mapAiConfidenceToEnum = (aiConfidence?: 'Low' | 'Medium' | 'High'): ConfidenceLevel | undefined => {
    if (!aiConfidence) return undefined;
    switch (aiConfidence.toLowerCase()) {
      case 'high': return ConfidenceLevel.HIGH;
      case 'medium': return ConfidenceLevel.MEDIUM;
      case 'low': return ConfidenceLevel.LOW;
      default: return undefined;
    }
  }

  const fetchSuggestions = async () => {
    if (isApiKeyMissing) {
      setError(`AI-powered discovery is unavailable because ${aiService.getProviderName()} is not configured.`);
      addToast("AI Discovery disabled: API Key missing.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const prompt = `You are an AI that discovers potential crypto airdrop opportunities by analyzing hypothetical crypto news, social media trends, and project announcements. Generate a list of 3 to 5 fictional but plausible upcoming crypto airdrop opportunities.
For each, provide:
1.  projectName: A creative and catchy project name (e.g., "QuantumLeap Finance", "NovaNet Bridge", "PixelPaws NFT", "Celestial L2", "DeFiOrbital").
2.  description: A brief, 1-2 sentence description of what the fictional project does. Make them sound unique and innovative.
3.  ecosystem: A common blockchain ecosystem (e.g., Solana, Cosmos, EVM, Polygon, Arbitrum, Aptos, Sui, Base, Celestia).
4.  potentialReason: A short reason why an airdrop might be expected from this type of project (e.g., "Decentralizing governance via DAO token", "Incentivizing early testnet users and mainnet adoption", "Following successful seed round and product launch", "To bootstrap liquidity and community ownership").
5.  aiConfidence: Your fictional confidence level ("Low", "Medium", or "High") that this *type* of project *might* do an airdrop based on the simulated data you 'analyzed'.
6.  sourceHints: An array of 1-2 fictional hints about where information for this type of opportunity might typically be 'gleaned' from (e.g., ["Rumors on Twitter from influential accounts", "Project docs imply token launch and community treasury"], ["Discord alpha chat discussing potential snapshot date"], ["Testnet participation rewards were hinted at in an AMA"], ["Ambiguous roadmap item: 'Community Growth Initiative'"]).
7.  aiRationale: A very brief (1 sentence) fictional rationale for why this is a notable opportunity type (e.g., "Strong community engagement and upcoming mainnet V2 suggest token launch.", "Unique tech in a popular narrative (e.g., RWA, DePIN, AI-crypto) could lead to a significant airdrop.", "Following a similar pattern to other successful airdrops in its ecosystem.").

Return the response as a JSON array of objects. Ensure valid JSON format. ABSOLUTELY DO NOT use markdown code fences (e.g., \`\`\`json ... \`\`\`). The response must be a raw JSON string.`;

      let jsonStr = await aiService.generateContent(prompt);
      jsonStr = jsonStr.trim();
      
      // It's better to rely on the model following the no-markdown instruction.
      // This regex is a fallback.
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      let parsedSuggestions: any[];
      try {
        parsedSuggestions = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error("AI Discovery JSON Parse Error:", parseError, "Raw string:", jsonStr);
        throw new Error("AI response was not valid JSON. Please try again or rephrase your request. Raw: " + jsonStr.substring(0, 100) + "...");
      }

      if (Array.isArray(parsedSuggestions) && parsedSuggestions.every(s => typeof s === 'object' && s !== null && 'projectName' in s && 'description' in s)) {
        setSuggestions(parsedSuggestions.map(s => ({ 
            ...s, 
            id: crypto.randomUUID(),
            aiConfidence: s.aiConfidence 
        } as DiscoveredAirdropSuggestion)));
      } else {
        console.warn("AI Discovery: Parsed data structure mismatch", parsedSuggestions);
        throw new Error("AI response did not match the expected array of suggestion objects structure.");
      }

    } catch (err) {
      console.error("AI Discovery Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to fetch suggestions: ${errorMessage}. Ensure the AI is configured to return valid JSON as per the prompt.`);
      addToast(`AI Discovery Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (suggestion: DiscoveredAirdropSuggestion) => {
    setSelectedSuggestion(suggestion);
    setIsDetailModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSuggestion(null);
  };

  const handleAddToWatchlistFromModal = (suggestion: DiscoveredAirdropSuggestion) => {
    addWatchlistItem({
      projectName: suggestion.projectName,
      notes: `${suggestion.description}\n\nEcosystem: ${suggestion.ecosystem || 'N/A'}\nPotential Reason: ${suggestion.potentialReason || 'N/A'}\nAI Confidence: ${suggestion.aiConfidence || 'N/A'}\nSource Hints: ${(suggestion.sourceHints || []).join(', ')}\nAI Rationale: ${suggestion.aiRationale || 'N/A'}`,
      confidence: mapAiConfidenceToEnum(suggestion.aiConfidence) || ConfidenceLevel.MEDIUM,
      // Include aiConfidence and sourceHints directly if type allows or map them
      aiConfidence: suggestion.aiConfidence,
      sourceHints: suggestion.sourceHints,
      aiRationale: suggestion.aiRationale,
    });
    addToast(`${suggestion.projectName} added to watchlist!`, 'success');
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    handleCloseModal();
  };

  return (
    <>
    <Card title="AI-Powered Airdrop Discovery">
      <div className="flex items-center mb-3">
        <Search size={20} className="mr-2 text-accent_yellow" />
        <span className="text-lg font-semibold">AI-Powered Airdrop Discovery</span>
      </div>
      
      <div className="flex justify-end mb-3">
        <Button 
            onClick={fetchSuggestions} 
            size="sm" 
            disabled={isLoading || isApiKeyMissing}
            isLoading={isLoading} 
            className="bg-secondary-light text-secondary-dark hover:bg-purple-100 dark:text-primary dark:hover:bg-primary/20" 
        >
            {isLoading ? undefined : <Search size={16} className="mr-1.5"/>}
            {isLoading ? 'Discovering...' : 'Find New Airdrops'}
        </Button>
      </div>
      <p className="text-xs text-muted-dark mb-3"> {/* Light gray text */}
        Let AI scan for potential (fictional, for demo) airdrop opportunities based on common patterns. Add promising ones to your watchlist.
      </p>
      {isApiKeyMissing && ( 
          <AlertMessage type="warning" title="API Key Missing" message="AI features require an API_KEY. This feature is currently disabled." className="mb-4" />
      )}
      {error && !isApiKeyMissing && ( 
        <AlertMessage type="error" title="Discovery Failed" message={error} onDismiss={() => setError(null)} />
      )}
      {suggestions.length > 0 && !isLoading && !error && !isApiKeyMissing && (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2"> {/* Adjusted spacing */}
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="p-3 rounded-lg bg-background-dark/50 dark:bg-card-dark/70 border border-gray-700/50 hover:shadow-md transition-shadow"> {/* Darker item background */}
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-primary">{suggestion.projectName}</h5> {/* Primary accent for name */}
                  <p className="text-xs text-muted-light dark:text-muted-dark">{suggestion.ecosystem} - AI Confidence: {suggestion.aiConfidence || 'N/A'}</p>
                </div>
                 <Button size="sm" variant="ghost" onClick={() => handleViewDetails(suggestion)} leftIcon={<ExternalLink size={14} className="text-muted-dark"/>} className="text-muted-dark hover:text-white">
                  View Details
                </Button>
              </div>
              <p className="text-sm mt-1 text-white line-clamp-2">{suggestion.description}</p> {/* Text white */}
            </div>
          ))}
        </div>
      )}
      {suggestions.length === 0 && !isLoading && !error && !isApiKeyMissing && (
         <p className="text-sm text-center text-muted-dark py-4"> {/* Light gray */}
            Click "Find New Airdrops" to let the AI search for potential opportunities.
          </p>
      )}
    </Card>
    
    <DiscoveredAirdropDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        suggestion={selectedSuggestion}
        onAddToWatchlist={handleAddToWatchlistFromModal}
    />
    </>
  );
};
