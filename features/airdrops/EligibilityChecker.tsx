import React, { useState, useEffect } from 'react'; 
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Textarea } from '../../design-system/components/Textarea';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Brain, Loader2, Info, SearchCheck } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useToast } from '../../hooks/useToast';
import { EligibilityCheckResult } from '../../types';

interface EligibilityCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  airdropName: string;
  eligibilityCriteria: string;
  walletActivityContext?: string;
}

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({
  isOpen,
  onClose,
  airdropName,
  eligibilityCriteria,
  walletActivityContext: initialWalletActivityContext = "User has varied on-chain interactions: swaps, bridging, NFT mints on EVM/Solana. Active >1 year."
}) => {
  const [walletActivity, setWalletActivity] = useState(initialWalletActivityContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EligibilityCheckResult | null>(null);
  const { addToast } = useToast();
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (!process.env.API_KEY) {
            setIsApiKeyMissing(true);
            setError("API_KEY for AI Pre-Checker is not configured. This feature is unavailable.");
        } else {
            setIsApiKeyMissing(false);
            setError(null); 
        }
        setWalletActivity(initialWalletActivityContext); 
        setResult(null); 
    }
  }, [isOpen, initialWalletActivityContext]);


  const handleCheckEligibility = async () => {
    if (isApiKeyMissing) {
      setError("API_KEY for AI Pre-Checker is not configured. This feature is unavailable.");
      addToast("AI Pre-Checker disabled: API Key missing.", "warning");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (!eligibilityCriteria.trim()) {
      setError("No eligibility criteria provided for this airdrop to check against.");
      setIsLoading(false);
      return;
    }
     if (!walletActivity.trim()) {
      setError("Please provide some context about your typical wallet activity or profile.");
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

      const systemInstruction = `You are an AI assistant that performs conceptual airdrop eligibility pre-checks.
      You will be given:
      1. Airdrop Name
      2. Eligibility Criteria (as text provided by the user for the airdrop)
      3. User's Wallet Activity Context (a general description of their typical on-chain behavior)

      Your task is to:
      - Analyze the provided eligibility criteria. Identify key requirements (e.g., transaction volume, specific interactions, date ranges if mentioned).
      - Compare these key requirements conceptually against the user's described wallet activity.
      - Provide a 'likelihood' assessment: "Likely", "Unlikely", "Needs More Info", or "Error".
      - Provide brief 'reasoning' for your assessment, highlighting which criteria seem met or missed based on the user's context.
      - Include a 'checkedCriteria' field in your response, which should be a string summarizing the specific criteria points you focused on for your assessment (e.g., "Focused on transaction volume over $1000 and activity before Jan 2023."). If the original criteria is short and clear, you can repeat it here.
      - EMPHASIZE THAT THIS IS A CONCEPTUAL, AI-BASED EDUCATIONAL TOOL AND NOT A GUARANTEE. Real eligibility depends on official project snapshots and rules.
      - Do NOT ask for wallet addresses or specific transaction data.
      - If criteria are too vague or complex for a conceptual check, state "Needs More Info" and explain why.
      - Output your response as a JSON object with keys: "likelihood", "reasoning", "checkedCriteria".
      - ABSOLUTELY DO NOT use markdown code fences (e.g., \`\`\`json ... \`\`\`) in the JSON response. The response must be a raw JSON string.
      `;
      
      const prompt = `Airdrop Name: "${airdropName}"
      Eligibility Criteria (User-Provided): """${eligibilityCriteria}"""
      User's Wallet Activity Context: """${walletActivity}"""
      
      Perform a conceptual pre-check and return a JSON object.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { systemInstruction, responseMimeType: "application/json" }
      });

      let jsonStr = response.text.trim();
      // It's better to rely on the model following the no-markdown instruction.
      // This regex is a fallback.
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      try {
        const parsedResult: EligibilityCheckResult = JSON.parse(jsonStr);
        setResult(parsedResult);
      } catch (parseErr) {
        console.error("AI Eligibility JSON Parse Error:", parseErr, "Raw:", jsonStr);
        throw new Error("AI response was not valid JSON. Please try again or rephrase your request. Raw: " + jsonStr.substring(0,150) + "...");
      }


    } catch (err) {
      console.error("AI Eligibility Check Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to perform AI pre-check: ${errorMessage}`);
      addToast(`AI Pre-check Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    onClose();
  };


  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={
        <div className="flex items-center"><SearchCheck size={20} className="mr-2 text-teal-500"/>AI Eligibility Pre-Checker (Conceptual)</div>
    } size="lg">
      <div className="space-y-4">
        <AlertMessage 
            type="info" 
            title="Important Disclaimer"
            message="This is an AI-powered conceptual tool. It provides an estimated likelihood based on the information you provide and general patterns. It is NOT a guarantee of airdrop eligibility. Always refer to official project announcements and criteria."
        />
        {isApiKeyMissing && (
             <AlertMessage type="warning" title="API Key Missing" message="AI Pre-Checker requires an API_KEY to be configured. This feature is currently disabled." />
        )}
        <div>
          <h4 className="font-semibold text-text-light dark:text-text-dark">Airdrop: {airdropName}</h4>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">Reviewing eligibility criteria:</p>
          <div className="mt-1 p-2 text-xs bg-gray-100 dark:bg-gray-700 rounded max-h-24 overflow-y-auto border dark:border-gray-600 whitespace-pre-wrap">
            {eligibilityCriteria || "No criteria text available."}
          </div>
        </div>
        
        <Textarea
          id="walletActivityContext"
          label="Describe Your General Wallet Activity / Profile:"
          value={walletActivity}
          onChange={(e) => setWalletActivity(e.target.value)}
          placeholder="e.g., Active on EVM chains, regular DEX user, NFT trader, participated in testnets..."
          rows={3}
          disabled={isLoading || isApiKeyMissing}
        />

        <Button onClick={handleCheckEligibility} disabled={isLoading || !eligibilityCriteria.trim() || !walletActivity.trim() || isApiKeyMissing} isLoading={isLoading} leftIcon={isLoading ? undefined : <Brain size={16}/>}>
          {isLoading ? 'AI Analyzing...' : 'Run AI Pre-Check'}
        </Button>

        {error && !isApiKeyMissing && ( 
          <AlertMessage type="error" title="Pre-Check Error" message={error} onDismiss={() => setError(null)} />
        )}

        {result && !isLoading && (
          <div className="mt-4 p-3 border rounded-md bg-indigo-50 dark:bg-indigo-900/50">
            <h5 className="text-md font-semibold text-indigo-700 dark:text-indigo-200 mb-2">AI Pre-Check Result:</h5>
            <p>
              <span className="font-medium">Likelihood: </span> 
              <span className={`font-bold ${
                result.likelihood === 'Likely' ? 'text-green-500' :
                result.likelihood === 'Unlikely' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {result.likelihood}
              </span>
            </p>
            <p className="mt-1"><span className="font-medium">Reasoning:</span> {result.reasoning}</p>
            {result.checkedCriteria && (
                 <div className="mt-2 text-xs">
                    <p className="font-medium">AI focused on this part of criteria:</p>
                    <p className="italic bg-gray-200 dark:bg-gray-700 p-1 rounded whitespace-pre-wrap">{result.checkedCriteria}</p>
                </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={handleClose}>Close</Button>
      </div>
    </Modal>
  );
};
