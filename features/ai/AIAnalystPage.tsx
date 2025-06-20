import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../design-system/components/Card';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Bot, Send, Loader2, User, Download, AlertTriangle } from 'lucide-react'; // Added User, Download, AlertTriangle
import { useTranslation } from '../../hooks/useTranslation';
import { useAppContext } from '../../contexts/AppContext'; // Corrected import
import { GoogleGenAI, GenerateContentResponse } from "@google/genai"; // Added
import { Airdrop, Wallet, AirdropTask } from '../../types'; // Added

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error' | 'loading';
  content: React.ReactNode;
  textForExport: string;
}

export const AIAnalystPage: React.FC = () => {
  const { t } = useTranslation();
  const { appData } = useAppContext(); // Added
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationEndRef = useRef<null | HTMLDivElement>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
      setError("API_KEY for AI features is not configured. AI Analyst is unavailable.");
    }
  }, []);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversation]);

  const handleSubmitQuery = async (e: FormEvent) => {
    e.preventDefault();
    if (isApiKeyMissing) {
      setError("API_KEY for AI features is not configured. AI Analyst is unavailable.");
      return;
    }
    if (!query.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: <div className="flex items-start gap-2"><User size={18} className="text-indigo-300 flex-shrink-0 mt-0.5"/><span>{query}</span></div>,
      textForExport: `User: ${query}`
    };
    const loadingMessage: Message = {
      id: crypto.randomUUID(),
      type: 'loading',
      content: <div className="flex items-center"><Loader2 size={16} className="animate-spin mr-2" /><span>AI is analyzing your query...</span></div>,
      textForExport: "AI is analyzing..."
    };
    setConversation(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);
    setError(null);
    const currentQuery = query;
    setQuery('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      let systemInstruction = "You are a helpful AI assistant knowledgeable about cryptocurrency and airdrops. Answer the user's question concisely. If you are provided with user data context, prioritize answering based on that. If not, or if the question is general, answer based on your general knowledge. Do not make up information if it's not in the provided context or your general knowledge.";
      let promptForAI = currentQuery;
      
      // Simple intent detection for queries related to user's data
      const portfolioKeywords = ["my airdrops", "my wallets", "my tasks", "portfolio summary", "total cost", "time spent", "active airdrops", "archived airdrops"];
      const isPortfolioQuery = portfolioKeywords.some(keyword => currentQuery.toLowerCase().includes(keyword));

      if (isPortfolioQuery) {
        systemInstruction = "You are an AI Data Analyst for a crypto airdrop tracking application. The user is asking about their portfolio data. You will be provided with a JSON summary of their relevant application data. Analyze this data to answer the user's question. If the data doesn't directly answer, explain what you can infer or what data might be missing. Be factual and concise. Do not make up data.";
        
        // Construct a summarized context (keep it brief to manage token limits)
        const airdropSummary = appData.airdrops.map(ad => ({
            name: ad.projectName, 
            status: ad.myStatus, 
            blockchain: ad.blockchain,
            tasksCount: ad.tasks.length,
            tasksCompleted: ad.tasks.filter(t => t.completed).length,
            potential: ad.potential
        })).slice(0, 10); // Limit for brevity

        const walletSummary = appData.wallets.map(w => ({
            name: w.name,
            blockchain: w.blockchain,
            // Add more relevant wallet fields if needed, e.g., number of interactions logged
        })).slice(0, 5);

        const taskSummary = {
            totalRecurring: appData.recurringTasks.length,
            activeRecurring: appData.recurringTasks.filter(t => t.isActive).length,
        };
        
        const dataContext = {
            airdrops: airdropSummary,
            wallets: walletSummary,
            recurringTasks: taskSummary,
            // Potentially add high-level P&L summary if easily calculable & relevant
        };
        promptForAI = `User Query: "${currentQuery}"\n\nUser's Application Data Summary (use this to answer):\n${JSON.stringify(dataContext, null, 2)}`;
      } else {
        // Fallback for general crypto questions or specific airdrop info (as before)
        const airdropQueryMatch = currentQuery.toLowerCase().match(/(?:tell me about|summarize|details for|status of|tasks for)\s+(.+)/i);
        let targetAirdropName = airdropQueryMatch?.[1]?.trim();
        if (!targetAirdropName) {
            const queryParts = currentQuery.toLowerCase().split(" ");
            const potentialNameIndex = queryParts.findIndex(part => appData.airdrops.some(ad => ad.projectName.toLowerCase().includes(part)))
            if (potentialNameIndex !== -1) {
                let possibleName = queryParts.slice(potentialNameIndex).join(" "); 
                const matchedAirdrop = appData.airdrops.find(ad => ad.projectName.toLowerCase().includes(possibleName.toLowerCase()));
                if (matchedAirdrop) targetAirdropName = matchedAirdrop.projectName;
            }
        }

        let foundAirdrop: Airdrop | undefined = undefined;
        if (targetAirdropName) {
            foundAirdrop = appData.airdrops.find(ad => ad.projectName.toLowerCase() === targetAirdropName!.toLowerCase());
        }

        if (foundAirdrop) {
            systemInstruction = "You are an AI assistant. Summarize the provided airdrop data for the user. Focus on key details like status, tasks completed, and any notes. Be concise and helpful.";
            const taskSummary = `${foundAirdrop.tasks.filter(t => t.completed).length}/${foundAirdrop.tasks.length} tasks completed.`;
            promptForAI = `Please summarize the following information for the "${foundAirdrop.projectName}" airdrop:
            - Current Official Status: ${foundAirdrop.status}
            - My Participation Status: ${foundAirdrop.myStatus}
            - Description: ${foundAirdrop.description || "Not provided."}
            - Task Summary: ${taskSummary}
            - My Notes: ${foundAirdrop.notes || "No personal notes."}
            
            Respond directly to the user based on this data.`;
        } else if (targetAirdropName) { 
            promptForAI = `The user asked about an airdrop named "${targetAirdropName}", but I couldn't find it in their tracked data. Please inform them and offer to answer general questions about it if it's a known public project. Original query was: "${currentQuery}"`;
        }
      }
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: promptForAI,
        config: { systemInstruction }
      });

      const aiResponseText = response.text;
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: <div className="flex items-start gap-2"><Bot size={18} className="text-purple-400 flex-shrink-0 mt-0.5"/><span>{aiResponseText}</span></div>,
        textForExport: `AI: ${aiResponseText}`
      };
      setConversation(prev => prev.filter(m => m.type !== 'loading').concat(aiMessage));

    } catch (err) {
      console.error("AI Analyst Error:", err);
      const errorMessageText = err instanceof Error ? err.message : "An unknown error occurred while contacting the AI.";
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'error',
        content: <div className="flex items-start gap-2"><AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5"/><span>Error: {errorMessageText}</span></div>,
        textForExport: `Error: ${errorMessageText}`
      };
      setConversation(prev => prev.filter(m => m.type !== 'loading').concat(errorMessage));
      setError(errorMessageText); 
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportConversation = () => {
    if (conversation.length === 0) return;
    const plainTextConversation = conversation.map(msg => msg.textForExport).join('\n\n');
    const blob = new Blob([plainTextConversation], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ai_analyst_conversation_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <PageWrapper>
      <div className="flex items-center mb-6">
        <Bot size={28} className="mr-3 text-primary-light dark:text-primary-dark" />
        <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark">
          {t('ai_analyst_title')}
        </h2>
      </div>
      <Card className="mb-6">
        <p className="text-sm text-muted-light dark:text-muted-dark mb-4">
          Ask about your tracked airdrops (e.g., "Summarize LayerZero", "What are my most time-consuming airdrops?") or general crypto questions.
        </p>
        {isApiKeyMissing && !error && ( 
             <AlertMessage type="warning" title="API Key Missing" message="AI Analyst requires an API_KEY. This feature is currently disabled." className="mb-4" />
        )}
        {error && ( 
             <AlertMessage type="error" title="Analyst Error" message={error} className="mb-4" onDismiss={()=>setError(null)} />
        )}
        <form onSubmit={handleSubmitQuery} className="flex gap-2">
          <Input
            id="ai-analyst-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ai_analyst_input_placeholder')}
            disabled={isLoading || isApiKeyMissing}
          />
          <Button type="submit" disabled={isLoading || !query.trim() || isApiKeyMissing} leftIcon={isLoading ? <Loader2 className="animate-spin"/> : <Send />}>
            {isLoading ? "Thinking..." : t('ai_analyst_submit_button')}
          </Button>
        </form>
      </Card>

      <Card className="min-h-[300px] flex flex-col">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Conversation</h3>
            {conversation.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExportConversation} leftIcon={<Download size={14}/>}>
                    {t('ai_analyst_export_conversation_button')}
                </Button>
            )}
        </div>
        <div className="flex-grow space-y-3 overflow-y-auto max-h-[60vh] p-1 pr-2">
          {conversation.length === 0 && !isLoading && (
            <p className="text-center text-muted-light dark:text-muted-dark py-10">Ask a question to start the conversation.</p>
          )}
          {conversation.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-2.5 rounded-xl shadow-sm ${
                msg.type === 'user' ? 'bg-indigo-500 text-white rounded-br-none' :
                msg.type === 'ai' ? 'bg-gray-100 dark:bg-gray-700 text-text-light dark:text-text-dark rounded-bl-none' :
                msg.type === 'loading' ? 'bg-gray-200 dark:bg-gray-600 text-muted-light dark:text-muted-dark italic rounded-bl-none' :
                'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-bl-none' // error
              }`}>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
           <div ref={conversationEndRef} />
        </div>
      </Card>
       <p className="text-xs text-muted-light dark:text-muted-dark mt-4 text-center">
          AI Analyst provides information based on provided context or general knowledge. It does not have live access to external data or perform real-time blockchain analysis.
        </p>
    </PageWrapper>
  );
};
