import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { LearningResource } from '../../types';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Brain, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface GlossaryTermExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: LearningResource | null;
}

export const GlossaryTermExplanationModal: React.FC<GlossaryTermExplanationModalProps> = ({
  isOpen,
  onClose,
  term,
}) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (isOpen && term) {
      if (!process.env.API_KEY) {
        setIsApiKeyMissing(true);
        setError("API_KEY for AI features is not configured. Explanation feature is unavailable.");
        setIsLoading(false); // Ensure loading is false if API key is missing
        return;
      }
      setIsApiKeyMissing(false); // API key is present
      fetchExplanation(term);
    } else {
      setExplanation(null);
      setError(null);
      setIsLoading(false);
      setIsApiKeyMissing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, term]);

  const fetchExplanation = async (currentTerm: LearningResource) => {
    setIsLoading(true);
    setExplanation(null);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const systemInstruction = "You are an expert lexicographer specializing in cryptocurrency and blockchain technology. For the given glossary term, provide a clear, detailed, and easy-to-understand explanation. Include examples if they help clarify the concept. Assume the user has some basic crypto knowledge but might not be familiar with this specific term. Focus on accuracy and educational value.";
      
      const prompt = `Explain the glossary term "${currentTerm.title}" which is defined as: "${currentTerm.content}". Provide a more detailed explanation or examples.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      let textResponse = response.text;
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = textResponse.match(fenceRegex);
      if (match && match[2]) {
        textResponse = match[2].trim();
      }
      
      setExplanation(textResponse);

    } catch (err) {
      console.error("Error calling Gemini API for glossary explanation:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get explanation: ${errorMessage}`);
      addToast(`Error fetching explanation: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !term) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center">
        <Brain size={20} className="mr-2 text-indigo-500" />
        AI Explanation for: {term.title}
      </div>
    } size="lg">
      <div className="py-2">
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">Original Definition:</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4 p-2 bg-gray-50 dark:bg-gray-750 rounded-md">{term.content}</p>
        
        {isApiKeyMissing && (
            <AlertMessage type="warning" title="API Key Missing" message="AI Explanation feature requires an API_KEY to be configured. This feature is currently disabled." className="mb-4" />
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={32} className="animate-spin text-primary-light dark:text-primary-dark" />
            <p className="ml-3 text-muted-light dark:text-muted-dark">AI is generating a detailed explanation...</p>
          </div>
        )}
        {error && !isLoading && !isApiKeyMissing && (
          <AlertMessage type="error" message={error} title="Error Fetching Explanation" onDismiss={() => setError(null)} />
        )}
        {explanation && !isLoading && !error && !isApiKeyMissing && (
          <div>
            <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">AI Generated Explanation:</h4>
            <div className="prose dark:prose-invert max-w-none text-sm text-text-light dark:text-text-dark whitespace-pre-wrap p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-indigo-50 dark:bg-indigo-900/30">
              {explanation}
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};