import React, { useState, FormEvent, useEffect } from 'react';
import { Card } from '../../design-system/components/Card';
import { Input } from '../../design-system/components/Input';
import { Button } from '../../design-system/components/Button';
import { Textarea } from '../../design-system/components/Textarea';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { Newspaper, Send, Loader2, FileText, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useLearningResourceStore } from '../../stores/learningResourceStore';
import { aiService, isAIServiceAvailable } from '../../utils/aiService';

export const NewsSummarizer: React.FC = () => {
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [articleUrl, setArticleUrl] = useState<string>('');
  const [articleText, setArticleText] = useState<string>('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { addLearningResource } = useLearningResourceStore();
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    const checkAIAvailability = async () => {
      try {
        const isAvailable = await aiService.isAvailable();
        if (!isAvailable) {
          setIsApiKeyMissing(true);
          setError(`AI News Summarizer is unavailable because ${aiService.getProviderName()} is not configured or not available.`);
        }
      } catch (error) {
        setIsApiKeyMissing(true);
        setError(`AI News Summarizer is unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    checkAIAvailability();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApiKeyMissing) {
        setError(`AI News Summarizer is unavailable because ${aiService.getProviderName()} is not configured.`);
        addToast("AI Summarizer disabled: API Key missing.", "warning");
        return;
    }
    if (inputMode === 'url' && !articleUrl.trim()) {
      setError('Please enter an article URL.');
      return;
    }
    if (inputMode === 'text' && !articleText.trim()) {
      setError('Please paste the article text.');
      return;
    }

    setIsLoading(true);
    setSummary(null);
    setError(null);

    try {
      let promptContent = '';
      if (inputMode === 'url') {
        promptContent = `Summarize the key points from the article at ${articleUrl} and specifically highlight any information related to crypto airdrops, token launches, or potential Sybil farming activities. If you cannot access the URL, please state so clearly.`;
        addToast("Note: Direct URL fetching by AI is limited. Pasting text is more reliable.", "info");
      } else {
        promptContent = `Summarize the key points from the following article text and specifically highlight any information related to crypto airdrops, token launches, or potential Sybil farming activities:\n\n${articleText}`;
      }

      const systemInstruction = "You are an AI assistant specialized in analyzing cryptocurrency news articles. Your goal is to provide a concise summary focusing on airdrop-related information. Be factual and extract key details. If no airdrop info, state that. Start with a brief overall summary, then a section for 'Airdrop Insights' if any are found.";

      const fullPrompt = `${systemInstruction}\n\n${promptContent}`;
      let textResponse = await aiService.generateContent(fullPrompt);
      
      // It's generally better to ask the model NOT to use markdown fences in JSON prompts.
      // For text, it's less critical but good to be aware if it starts wrapping.
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; 
      const match = textResponse.match(fenceRegex);
      if (match && match[2]) {
        textResponse = match[2].trim();
      }
      setSummary(textResponse ?? '');
      addToast('Article analysis complete!', 'success');

      const summaryTitle = inputMode === 'url' && articleUrl && articleUrl.includes('://') ? `Summary for ${new URL(articleUrl).hostname}` : `Summary for Pasted Text (${new Date().toLocaleDateString()})`;
      addLearningResource({
        type: 'news_summary',
        title: summaryTitle,
        content: textResponse ?? '',
        sourceUrl: inputMode === 'url' ? articleUrl : undefined,
        category: "News Analysis"
      });
      addToast('Summary saved to Learning Hub.', 'info');

    } catch (err) {
      console.error("Error calling AI service for news summarizer:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to summarize: ${errorMessage}. If using URL, try pasting text instead.`);
      addToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center mb-4">
        <Newspaper size={24} className="mr-2 text-primary-light" />
        <h3 className="text-xl font-semibold text-text-light">AI News Analyzer & Summarizer</h3>
      </div>
      <p className="text-sm text-muted-light mb-4">
        Paste an article URL (experimental, may not always work due to access restrictions) or article text to get a summary focusing on airdrop-related news.
      </p>
      {isApiKeyMissing && ( 
          <AlertMessage type="warning" title="Feature Unavailable" message={`AI News Summarizer requires ${aiService.getProviderName()} to be properly configured and available. This feature is currently disabled.`} className="mb-4" />
      )}

      <div className="mb-4 flex space-x-2">
        <Button variant={inputMode === 'url' ? 'primary' : 'outline'} onClick={() => setInputMode('url')} leftIcon={<LinkIcon size={16}/>}>Analyze by URL</Button>
        <Button variant={inputMode === 'text' ? 'primary' : 'outline'} onClick={() => setInputMode('text')} leftIcon={<FileText size={16}/>}>Analyze by Text</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {inputMode === 'url' && (
          <Input
            id="ai-news-url"
            label="Article URL:"
            type="url"
            value={articleUrl}
            onChange={(e) => setArticleUrl(e.target.value)}
            placeholder="https://example.com/crypto-news-article"
            disabled={isLoading || isApiKeyMissing}
          />
        )}
         {inputMode === 'text' && (
          <Textarea
            id="ai-news-text"
            label="Paste Article Text Here:"
            value={articleText}
            onChange={(e) => setArticleText(e.target.value)}
            placeholder="Paste the full text of the news article..."
            rows={10}
            disabled={isLoading || isApiKeyMissing}
          />
        )}
        <Button type="submit" disabled={isLoading || isApiKeyMissing} leftIcon={isLoading ? undefined : <Send size={18}/>}>
          {isLoading ? 'Summarizing...' : (inputMode === 'url' ? 'Summarize URL' : 'Summarize Text')}
        </Button>
      </form>

      {error && !isApiKeyMissing && ( 
        <AlertMessage type="error" message={error} title="Error" className="mt-4" onDismiss={() => setError(null)} />
      )}

      {summary && !isLoading && !error && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h4 className="text-lg font-semibold text-text-light mb-2">AI Summary:</h4>
          <div className="prose max-w-none text-text-light whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      )}
       <p className="text-xs text-muted-light mt-6 text-center">
        Note: AI summaries are for informational purposes. Always verify critical information. Direct URL fetching is experimental.
      </p>
    </Card>
  );
};
