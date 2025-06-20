import React, { useState, useEffect } from 'react';
import { Airdrop, AirdropRiskAssessmentResult } from '../../types';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Brain, Loader2, AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useToast } from '../../hooks/useToast';

interface AirdropRiskAnalysisTabProps {
  airdrop: Airdrop;
}

export const AirdropRiskAnalysisTab: React.FC<AirdropRiskAnalysisTabProps> = ({ airdrop }) => {
  const [riskAssessment, setRiskAssessment] = useState<AirdropRiskAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
    } else {
      setIsApiKeyMissing(false);
    }
  }, []);

  const handleAnalyzeRisk = async () => {
    if (isApiKeyMissing) {
        addToast("AI Risk Analysis unavailable: API Key not configured.", "warning");
        setError("API_KEY for AI features is not configured. This feature is unavailable.");
        return;
    }
    if (airdrop.isArchived) {
        addToast("Cannot analyze risk for an archived airdrop.", "info");
        return;
    }
    setIsLoading(true);
    setError(null);
    setRiskAssessment(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const systemInstruction = `You are an AI risk analyst specializing in crypto airdrops. Analyze the provided project information for potential red flags or positive indicators regarding its legitimacy and airdrop likelihood. Consider factors like team anonymity (if mentioned or inferable), tokenomics transparency (if described), audit status (if mentioned), project maturity, community sentiment (if described), and clarity of purpose. Focus on common patterns and general project assessment. Do NOT give financial advice or predict specific airdrop success.
      Output a JSON object with the following structure:
      {
        "riskLevel": "Low" | "Medium" | "High" | "Unknown" | "NeedsMoreInfo",
        "positiveSigns": string[], 
        "redFlags": string[],
        "summary": string, 
        "confidenceScore": number 
      }
      Positive signs and red flags should be concise bullet points. The summary should be a brief overview.
      The confidenceScore (0-1, e.g., 0.75 for 75%) should reflect your confidence in THIS risk assessment based on the provided info.
      If information is insufficient for a meaningful assessment, set riskLevel to "NeedsMoreInfo" or "Unknown".
      ABSOLUTELY DO NOT use markdown code fences (e.g., \`\`\`json ... \`\`\`) in the JSON response. The response must be a raw JSON string.`;
      
      const prompt = `Analyze this project for general risk and airdrop legitimacy patterns:
      Project Name: ${airdrop.projectName}
      Description: ${airdrop.description || "Not provided"}
      Blockchain: ${airdrop.blockchain}
      Website: ${airdrop.officialLinks?.website || "Not provided"}
      Twitter: ${airdrop.officialLinks?.twitter || "Not provided"}
      Eligibility Criteria (if provided by user): ${airdrop.eligibilityCriteria || "Not specified"}
      User Notes (may contain relevant info): ${airdrop.notes || "None"}
      Current Airdrop Status (user's view): ${airdrop.myStatus}, Official Status: ${airdrop.status}
      `;
      
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
        const parsedResult: AirdropRiskAssessmentResult = JSON.parse(jsonStr);
        setRiskAssessment(parsedResult);
        addToast('AI Risk Analysis complete.', 'success');
      } catch (parseErr) {
        console.error("AI Risk Analysis JSON Parse Error:", parseErr, "Raw:", jsonStr);
        throw new Error("AI response was not valid JSON. Please try again. Raw: " + jsonStr.substring(0,150) + "...");
      }


    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to perform AI Risk Analysis: ${errorMessage}`);
      addToast(`AI Risk Analysis Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const RiskIcon: React.FC<{level?: AirdropRiskAssessmentResult['riskLevel']}> = ({level}) => {
    switch(level) {
        case 'Low': return <ShieldCheck size={24} className="text-green-500" />;
        case 'Medium': return <AlertTriangle size={24} className="text-yellow-500" />;
        case 'High': return <ShieldAlert size={24} className="text-red-500" />;
        default: return <HelpCircle size={24} className="text-gray-500" />;
    }
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
        <h4 className="text-lg font-semibold text-text-light dark:text-text-dark mb-2 sm:mb-0">
            AI-Powered Airdrop Risk & Legitimacy Check (Conceptual)
        </h4>
        <Button 
            onClick={handleAnalyzeRisk} 
            disabled={isLoading || isApiKeyMissing || airdrop.isArchived} 
            isLoading={isLoading}
            leftIcon={isLoading ? undefined : <Brain />}
        >
          {isLoading ? 'Analyzing...' : (riskAssessment ? 'Re-Analyze Risk (AI)' : 'Analyze Airdrop Risk (AI)')}
        </Button>
      </div>
       <p className="text-xs text-muted-light dark:text-muted-dark mb-3">
        This tool provides a conceptual analysis based on general patterns and the information provided for this airdrop. It's not financial advice and does not guarantee airdrop outcomes or project safety. Always DYOR.
      </p>

      {isApiKeyMissing && (
        <AlertMessage type="warning" title="API Key Missing" message="AI Risk Analysis requires an API_KEY to be configured. This feature is currently disabled." className="mb-4" />
      )}
      {error && !isApiKeyMissing && (
        <AlertMessage type="error" title="Analysis Error" message={error} onDismiss={() => setError(null)} className="mb-4" />
      )}

      {isLoading && <div className="flex items-center justify-center py-6 text-muted-light dark:text-muted-dark"><Loader2 size={28} className="animate-spin mr-2" /> Processing analysis...</div>}

      {riskAssessment && !isLoading && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg border-2 ${
            riskAssessment.riskLevel === 'Low' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' :
            riskAssessment.riskLevel === 'Medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' :
            riskAssessment.riskLevel === 'High' ? 'border-red-500 bg-red-50 dark:bg-red-900/30' :
            'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' // For Unknown/NeedsMoreInfo
          }`}>
            <div className="flex items-center mb-2">
              <RiskIcon level={riskAssessment.riskLevel} />
              <h5 className="text-xl font-semibold ml-2 text-text-light dark:text-text-dark">
                Risk Level: {riskAssessment.riskLevel || 'Unknown'}
              </h5>
            </div>
            <p className="text-sm text-muted-light dark:text-muted-dark whitespace-pre-wrap">{riskAssessment.summary}</p>
            {riskAssessment.confidenceScore !== undefined && (
                <p className="text-xs mt-1 text-muted-light dark:text-muted-dark">AI Confidence in this Assessment: {(riskAssessment.confidenceScore * 100).toFixed(0)}%</p>
            )}
          </div>

          {riskAssessment.positiveSigns && riskAssessment.positiveSigns.length > 0 && (
            <div>
              <h6 className="font-semibold text-green-600 dark:text-green-400 flex items-center"><CheckCircle size={16} className="mr-1.5"/>Positive Signs:</h6>
              <ul className="list-disc list-inside text-sm text-muted-light dark:text-muted-dark pl-4 space-y-0.5 mt-1">
                {riskAssessment.positiveSigns.map((sign, i) => <li key={`pos-${i}`}>{sign}</li>)}
              </ul>
            </div>
          )}

          {riskAssessment.redFlags && riskAssessment.redFlags.length > 0 && (
            <div>
              <h6 className="font-semibold text-red-600 dark:text-red-400 flex items-center"><AlertTriangle size={16} className="mr-1.5"/>Potential Red Flags:</h6>
              <ul className="list-disc list-inside text-sm text-muted-light dark:text-muted-dark pl-4 space-y-0.5 mt-1">
                {riskAssessment.redFlags.map((flag, i) => <li key={`flag-${i}`}>{flag}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
