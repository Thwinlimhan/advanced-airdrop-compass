import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { useAirdropStore } from '../../stores/airdropStore';
import { useWalletStore } from '../../stores/walletStore';
import { useYieldPositionStore } from '../../stores/yieldPositionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { Airdrop, Wallet, YieldPosition } from '../../types';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Users, 
  Target,
  Search,
  Filter,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Tag,
  Calendar,
  Send,
  Loader2,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useTranslation } from '../../hooks/useTranslation';
import { aiService, isAIServiceAvailable, testOllamaConnection } from '../../utils/aiService';
import { useNavigate } from 'react-router-dom';

export const AIAnalystPage: React.FC = () => {
  const { airdrops } = useAirdropStore();
  const { wallets } = useWalletStore();
  const { yieldPositions } = useYieldPositionStore();
  const { settings } = useSettingsStore();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(true);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedAirdrop, setSelectedAirdrop] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<'portfolio' | 'airdrop' | 'wallet' | 'general'>('portfolio');

  // Check AI service availability on component mount
  useEffect(() => {
    checkAIAvailability();
  }, [settings.aiProvider, settings.aiApiKey]);

  const checkAIAvailability = async () => {
    setIsCheckingAvailability(true);
    setAiError(null);
    
    try {
      if (!settings.aiProvider) {
        setAiError('No AI provider configured. Please configure AI settings.');
        setAiAvailable(false);
        return;
      }

      if (settings.aiProvider === 'gemini' && !settings.aiApiKey) {
        setAiError('Gemini API key not configured. Please add your API key in settings.');
        setAiAvailable(false);
        return;
      }

      if (settings.aiProvider === 'ollama') {
        const testResult = await testOllamaConnection();
        if (!testResult.success) {
          setAiError(`Ollama not available: ${testResult.error || 'Please ensure Ollama is running locally.'}`);
          setAiAvailable(false);
          return;
        }
      }

      const available = await isAIServiceAvailable();
      setAiAvailable(available);
      
      if (!available) {
        setAiError('AI service is not available. Please check your configuration.');
      }
    } catch (error) {
      setAiError(`Failed to check AI availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAiAvailable(false);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) {
      addToast('Please enter a query for analysis.', 'warning');
      return;
    }

    if (!aiAvailable) {
      addToast('AI service is not available. Please check your configuration.', 'error');
      return;
    }

    setIsLoading(true);
    setAnalysis('');
    
    try {
      let context = '';
      
      switch (analysisType) {
        case 'portfolio':
          context = getPortfolioContext();
          break;
        case 'airdrop':
          if (selectedAirdrop) {
            const airdrop = airdrops.find(a => a.id === selectedAirdrop);
            context = airdrop ? getAirdropContext(airdrop) : '';
          }
          break;
        case 'wallet':
          if (selectedWallet) {
            const wallet = wallets.find(w => w.id === selectedWallet);
            context = wallet ? getWalletContext(wallet) : '';
          }
          break;
        case 'general':
          context = getGeneralContext();
          break;
      }

      const response = await aiService.analyze({
        query,
        context,
        type: 'portfolio_analysis'
      });

      setAnalysis(response);
      addToast('Analysis completed successfully.', 'success');
    } catch (error) {
      console.error('AI Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addToast(`Analysis failed: ${errorMessage}`, 'error');
      setAnalysis(`❌ Analysis failed: ${errorMessage}\n\nPlease check your AI configuration or try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (quickQuery: string) => {
    setQuery(quickQuery);
  };

  const navigateToSettings = () => {
    navigate('/settings');
  };

  const getPortfolioContext = (): string => {
    const totalAirdrops = airdrops.length;
    const activeAirdrops = airdrops.filter(a => a.myStatus === 'In Progress').length;
    const completedAirdrops = airdrops.filter(a => a.myStatus === 'Completed').length;
    const totalWallets = wallets.length;
    const totalYieldPositions = yieldPositions.length;
    
    const airdropSummary = airdrops.map(a => 
      `${a.projectName} (${a.blockchain}) - Status: ${a.myStatus}, Potential: ${a.potential}`
    ).join('\n');

    const walletSummary = wallets.map(w => 
      `${w.name} (${w.blockchain}) - ${w.address}`
    ).join('\n');

    const yieldSummary = yieldPositions.map(y => 
      `${y.platformName} - ${y.assetSymbol} - APY: ${y.currentApy || 0}%`
    ).join('\n');

    return `
Portfolio Summary:
- Total Airdrops: ${totalAirdrops} (${activeAirdrops} active, ${completedAirdrops} completed)
- Total Wallets: ${totalWallets}
- Total Yield Positions: ${totalYieldPositions}

Airdrops:
${airdropSummary}

Wallets:
${walletSummary}

Yield Positions:
${yieldSummary}
    `;
  };

  const getAirdropContext = (airdrop: Airdrop): string => {
    const completedTasks = airdrop.tasks.filter(t => t.completed).length;
    const totalTasks = airdrop.tasks.length;
    const timeSpent = airdrop.timeSpentHours || 0;
    const transactions = airdrop.transactions.length;
    const claimedTokens = airdrop.claimedTokens.length;

    return `
Airdrop Details:
- Project: ${airdrop.projectName}
- Blockchain: ${airdrop.blockchain}
- Status: ${airdrop.status}
- My Status: ${airdrop.myStatus}
- Potential: ${airdrop.potential}
- Progress: ${completedTasks}/${totalTasks} tasks completed
- Time Spent: ${timeSpent} hours
- Transactions: ${transactions}
- Claimed Tokens: ${claimedTokens}

Tasks:
${airdrop.tasks.map(t => `- ${t.description} (${t.completed ? 'Completed' : 'Pending'})`).join('\n')}

Notes: ${airdrop.notes || 'No notes'}
    `;
  };

  const getWalletContext = (wallet: Wallet): string => {
    const balanceSnapshots = wallet.balanceSnapshots?.length || 0;
    const gasLogs = wallet.gasLogs?.length || 0;
    const interactionLogs = wallet.interactionLogs?.length || 0;
    const nftPortfolio = wallet.nftPortfolio?.length || 0;

    return `
Wallet Details:
- Name: ${wallet.name}
- Address: ${wallet.address}
- Blockchain: ${wallet.blockchain}
- Group: ${wallet.group || 'None'}
- Balance Snapshots: ${balanceSnapshots}
- Gas Logs: ${gasLogs}
- Interaction Logs: ${interactionLogs}
- NFT Portfolio: ${nftPortfolio}

Recent Gas Logs:
${wallet.gasLogs?.slice(-5).map(g => `- ${g.date}: ${g.amount} ${g.currency} (${g.description || 'Gas'})`).join('\n') || 'No gas logs'}

Recent Interactions:
${wallet.interactionLogs?.slice(-5).map(i => `- ${i.date}: ${i.type} - ${i.description}`).join('\n') || 'No interactions'}
    `;
  };

  const getGeneralContext = (): string => {
    return `
General Portfolio Context:
- Total Airdrops: ${airdrops.length}
- Total Wallets: ${wallets.length}
- Total Yield Positions: ${yieldPositions.length}
- User Preferences: ${JSON.stringify(settings.userPreferences || {})}
    `;
  };

  const quickQueries = [
    'What are my most promising airdrops?',
    'How can I optimize my yield farming strategy?',
    'Which wallets need attention?',
    'What are the best practices for avoiding sybil detection?',
    'How can I improve my airdrop farming efficiency?',
    'What are the risks in my current portfolio?'
  ];

  return (
    <PageWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={24} className="text-accent" />
                AI Portfolio Analyst
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkAIAvailability}
                  leftIcon={isCheckingAvailability ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  disabled={isCheckingAvailability}
                >
                  {isCheckingAvailability ? 'Checking...' : 'Refresh'}
                </Button>
              </div>
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-secondary">
              Get AI-powered insights about your crypto portfolio, airdrops, and farming strategies.
            </p>
          </CardContent>
        </Card>

        {/* AI Status */}
        {!isCheckingAvailability && (
          <Card variant={aiAvailable ? "default" : "outlined"} padding="md" className={aiAvailable ? "" : "border-red-200 dark:border-red-800"}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {aiAvailable ? (
                    <>
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-300">
                        AI Service Available ({settings.aiProvider || 'Not configured'})
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} className="text-red-600" />
                      <span className="font-medium text-red-700 dark:text-red-300">
                        AI Service Unavailable
                      </span>
                    </>
                  )}
                </div>
                {!aiAvailable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateToSettings}
                    leftIcon={<Settings size={16} />}
                  >
                    Configure AI
                  </Button>
                )}
              </div>
              {aiError && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {aiError}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis Controls */}
        <Card variant="default" padding="md">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Select
                value={analysisType}
                onValueChange={(value) => setAnalysisType(value as 'portfolio' | 'airdrop' | 'wallet' | 'general')}
                options={[
                  { value: 'portfolio', label: 'Portfolio Analysis' },
                  { value: 'airdrop', label: 'Airdrop Analysis' },
                  { value: 'wallet', label: 'Wallet Analysis' },
                  { value: 'general', label: 'General Advice' }
                ]}
              />
              
              {analysisType === 'airdrop' && (
                <Select
                  value={selectedAirdrop}
                  onValueChange={(value) => setSelectedAirdrop(value as string)}
                  options={[
                    { value: '', label: 'Select Airdrop' },
                    ...airdrops.map(a => ({ value: a.id, label: a.projectName }))
                  ]}
                />
              )}
              
              {analysisType === 'wallet' && (
                <Select
                  value={selectedWallet}
                  onValueChange={(value) => setSelectedWallet(value as string)}
                  options={[
                    { value: '', label: 'Select Wallet' },
                    ...wallets.map(w => ({ value: w.id, label: w.name }))
                  ]}
                />
              )}
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder="Ask me anything about your portfolio, airdrops, or farming strategies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                disabled={isLoading || !aiAvailable}
              />
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !query.trim() || !aiAvailable}
                  leftIcon={isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setQuery('')}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Queries */}
        <Card variant="default" padding="md">
          <CardHeader>
            <h4 className="text-md font-semibold flex items-center gap-2">
              <Lightbulb size={16} />
              Quick Queries
            </h4>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickQueries.map((quickQuery, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuery(quickQuery)}
                  disabled={isLoading || !aiAvailable}
                  className="justify-start text-left h-auto p-3"
                >
                  {quickQuery}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <Card variant="default" padding="md">
            <CardHeader>
              <h4 className="text-md font-semibold flex items-center gap-2">
                <Brain size={16} />
                AI Analysis Results
              </h4>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {analysis}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Airdrops</p>
                  <p className="text-2xl font-bold">{airdrops.length}</p>
                </div>
                <Target size={24} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Airdrops</p>
                  <p className="text-2xl font-bold">
                    {airdrops.filter(a => a.myStatus === 'In Progress').length}
                  </p>
                </div>
                <TrendingUp size={24} className="text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Wallets</p>
                  <p className="text-2xl font-bold">{wallets.length}</p>
                </div>
                <Users size={24} className="text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="default" padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Yield Positions</p>
                  <p className="text-2xl font-bold">{yieldPositions.length}</p>
                </div>
                <DollarSign size={24} className="text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};
