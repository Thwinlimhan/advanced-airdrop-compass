import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Modal } from '../../design-system/components/Modal';
import { Zap, RefreshCcw, Brain, Loader2, Info } from 'lucide-react'; 
import { GasPrice } from '../../types';
import { MOCK_GAS_PRICES, NETWORK_COLORS } from '../../constants'; 
import { useAppContext } from '../../contexts/AppContext';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useToast } from '../../hooks/useToast';
import { AlertMessage } from '../../components/ui/AlertMessage';
import { EnhancedLineChart as LineChart } from '../../components/charts/LineChart';
import { ChartData } from 'chart.js';

const generateHistoricalGasDataForNetwork = (networkName: string, accentColor: string): ChartData<'line'> => {
  const labels: string[] = [];
  const data: number[] = [];
  const daysToTrack = 7;

  let basePrice = 20; 
  let priceDecimals = 2;
  const lowerNetworkName = networkName.toLowerCase();

  if (lowerNetworkName.includes('solana')) { basePrice = 0.000015; priceDecimals = 6; }
  else if (lowerNetworkName.includes('arbitrum') || lowerNetworkName.includes('optimism') || lowerNetworkName.includes('base')) { basePrice = 0.1; priceDecimals = 3; }
  else if (lowerNetworkName.includes('polygon')) { basePrice = 30; priceDecimals = 2; }

  for (let i = 0; i < daysToTrack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (daysToTrack - 1 - i));
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const fluctuation = (Math.random() - 0.3) * (basePrice * 0.5); 
    data.push(Math.max(0.000001, parseFloat((basePrice + fluctuation).toFixed(priceDecimals))));
  }
  return {
    labels,
    datasets: [{
      label: `${networkName} Gas Price (Simulated History)`,
      data,
      fill: true, 
      tension: 0.1,
      borderColor: accentColor, 
      backgroundColor: (context) => { 
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
            gradient.addColorStop(0, `${accentColor}66`); 
            gradient.addColorStop(1, `${accentColor}00`); 
            return gradient;
        },
      pointBackgroundColor: accentColor,
      pointBorderColor: accentColor,
    }]
  };
};


export const GasTrackerWidget: React.FC = () => {
  const { appData } = useAppContext(); 
  const { addToast } = useToast();
  const [gasPrices, setGasPrices] = useState<GasPrice[]>(MOCK_GAS_PRICES); 
  const [loading, setLoading] = useState(false); 
  const [isAiTipsModalOpen, setIsAiTipsModalOpen] = useState(false);
  const [aiGasTips, setAiGasTips] = useState<string | null>(null);
  const [isAiGasTipsLoading, setIsAiGasTipsLoading] = useState(false); // Specific loading for AI Gas Tips
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false); 

  const displayedNetworks = appData.settings.defaultGasNetworks;
  const primaryAccentColor = appData.settings.accentColor || '#885AF8';
  
  const primaryNetworkForChart = displayedNetworks.find(dn => gasPrices.some(gp => gp.network === dn && (gp.source === 'live' || gp.source === 'simulated'))) || displayedNetworks[0];
  const historicalGasChartData = primaryNetworkForChart ? generateHistoricalGasDataForNetwork(primaryNetworkForChart, primaryAccentColor) : null;


  useEffect(() => {
    // Check for general API key for Gemini (used for AI tips)
    if (!process.env.API_KEY) { 
      setIsApiKeyMissing(true); 
    }
  }, []);


  const localFetchGasPrices = async () => { 
    setLoading(true);
    let newGasPrices = MOCK_GAS_PRICES.map(p => ({...p, lastUpdated: new Date().toLocaleTimeString(), source: p.source || 'estimate' as GasPrice['source']}));
    
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY; 
    const etherscanUrl = `https://api.etherscan.io/api?module=gastracker&action=gasoracle${etherscanApiKey ? `&apikey=${etherscanApiKey}` : ''}`;

    try {
      const response = await fetch(etherscanUrl);
      const data = await response.json();
      if (data.status === "1" && data.result && data.result.ProposeGasPrice) {
        const ethPrice = data.result.ProposeGasPrice;
        const ethIndex = newGasPrices.findIndex(p => p.network === 'Ethereum');
        if (ethIndex !== -1) {
          newGasPrices[ethIndex] = { network: 'Ethereum', price: `${ethPrice} Gwei`, lastUpdated: new Date().toLocaleTimeString(), source: 'live' };
        }
      } else {
        addToast("Could not fetch live Ethereum gas price. Using estimate.", "warning");
        const ethIndex = newGasPrices.findIndex(p => p.network === 'Ethereum');
        if (ethIndex !== -1) newGasPrices[ethIndex].source = 'estimate';
      }
    } catch (error) {
        addToast("Error fetching Ethereum gas price. Using estimate.", "error");
        const ethIndex = newGasPrices.findIndex(p => p.network === 'Ethereum');
        if (ethIndex !== -1) newGasPrices[ethIndex].source = 'estimate';
    }

    const solIndex = newGasPrices.findIndex(p => p.network === 'Solana');
    if (solIndex !== -1) {
        newGasPrices[solIndex] = { network: 'Solana', price: `${(Math.random() * 0.00002 + 0.000005).toFixed(6)} SOL`, lastUpdated: new Date().toLocaleTimeString(), source: 'simulated' };
    }
    const polyIndex = newGasPrices.findIndex(p => p.network === 'Polygon');
    if (polyIndex !== -1) {
        newGasPrices[polyIndex] = { network: 'Polygon', price: `${(Math.random() * 20 + 20).toFixed(1)} Gwei`, lastUpdated: new Date().toLocaleTimeString(), source: 'simulated' };
    }
    const arbIndex = newGasPrices.findIndex(p => p.network === 'Arbitrum');
    if(arbIndex !== -1) {
      newGasPrices[arbIndex] = {...newGasPrices[arbIndex], price: `${(Math.random() * 0.1 + 0.05).toFixed(2)} Gwei`, source: 'simulated', lastUpdated: new Date().toLocaleTimeString()};
    }

    setGasPrices(newGasPrices);
    setLoading(false);
    addToast("Gas prices refreshed.", "success");
  };

  useEffect(() => { localFetchGasPrices(); // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); 

  const handleGetAiGasTips = async () => {
    if (isApiKeyMissing) {
      addToast("AI Gas Tips unavailable: API Key not configured.", "warning");
      setIsAiTipsModalOpen(true); 
      setAiGasTips("AI Gas Tips are unavailable because the API_KEY for Gemini is not configured in the application environment.");
      return;
    }
    setIsAiTipsModalOpen(true);
    if (aiGasTips && !aiGasTips.includes("API_KEY is not configured") && !aiGasTips.includes("Error fetching AI gas tips")) return; 

    setIsAiGasTipsLoading(true);
    setAiGasTips(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const prompt = "Provide general tips for optimizing gas fees on Ethereum and common L2 solutions like Arbitrum or Polygon. Mention factors like network congestion, transaction timing, setting appropriate gas limits/priority fees, and using L2s. Keep tips concise and actionable for a crypto user. Provide a few bullet points.";
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-preview-04-17', contents: prompt });
        setAiGasTips(response.text);
    } catch (error) {
        setAiGasTips("Error fetching AI gas tips. Please try again later.");
        addToast(`AI Gas Tips Error: ${(error as Error).message}`, 'error');
    } finally {
        setIsAiGasTipsLoading(false);
    }
  };

  const filteredGasPrices = gasPrices.filter(gp => displayedNetworks.includes(gp.network));

  const getNetworkIconColor = (networkName: string): string => {
    const lowerName = networkName.toLowerCase();
    if (lowerName.includes('ethereum')) return NETWORK_COLORS['Ethereum'] || 'bg-accent_yellow';
    if (lowerName.includes('arbitrum')) return NETWORK_COLORS['Arbitrum'] || 'bg-accent_blue';
    if (lowerName.includes('solana')) return NETWORK_COLORS['Solana'] || 'bg-primary'; // Purple
    if (lowerName.includes('polygon')) return NETWORK_COLORS['Polygon'] || 'bg-purple-500';
    return 'bg-gray-500'; // Default
  };

  const getPriceTextColor = (source: GasPrice['source']) => {
    if (source === 'live') return 'text-green-400';
    if (source === 'simulated') return 'text-blue-400';
    return 'text-yellow-400'; // estimate
  };


  return (
    <>
    <Card title="Multi-Chain Gas Fees" actions={
        <div className="flex items-center space-x-2">
            <Button onClick={handleGetAiGasTips} size="sm" variant="ghost" title="Get AI Gas Optimization Tips" leftIcon={<Brain size={16} className="text-muted-dark"/>} disabled={isApiKeyMissing || isAiGasTipsLoading} isLoading={isAiGasTipsLoading}/>
            <Button onClick={localFetchGasPrices} disabled={loading} className="p-1 text-muted-dark hover:text-white" title="Refresh Gas Prices"><RefreshCcw size={18} className={loading ? 'animate-spin' : ''} /></Button>
        </div>
    }>
      {loading && filteredGasPrices.length === 0 ? ( <p className="text-muted-dark">Loading gas prices...</p> ) : 
      filteredGasPrices.length === 0 ? ( <p className="text-muted-dark">No gas networks selected or data available. Check settings.</p> ) : (
        <div className="space-y-2.5"> 
          {filteredGasPrices.map((gas) => (
            <div key={gas.network} className="flex justify-between items-center p-2.5 bg-background-dark/50 dark:bg-card-dark/60 rounded-lg"> 
                <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2.5 ${getNetworkIconColor(gas.network)}`}>
                        <Zap size={14} className="text-white" /> 
                    </span>
                    <span className="font-medium text-white">{gas.network}</span>
                </div>
                <div className="text-right">
                    <span className={`text-sm font-semibold text-white`}>{gas.price}</span> 
                    <p className="text-xs text-muted-dark"> 
                      Updated: {gas.lastUpdated} <span className={`capitalize ${getPriceTextColor(gas.source)}`}>({gas.source})</span>
                    </p>
                </div>
            </div>
          ))}
        </div>
      )}
      {isApiKeyMissing && (
          <AlertMessage type="info" title="Live Data / AI Tip" message="Live Ethereum gas price updates (via Etherscan) or AI Gas Optimization Tips (via Gemini) requires respective API_KEY(s) set in environment variables." className="mt-3 text-xs bg-card-dark/50 border-muted-dark/30 text-muted-dark" />
      )}
      {primaryNetworkForChart && historicalGasChartData && filteredGasPrices.some(gp => gp.network === primaryNetworkForChart) && ( 
         <div className="mt-4 h-40">
            <LineChart 
                data={historicalGasChartData} 
                settings={appData.settings} 
                options={{
                     maintainAspectRatio: false,
                     plugins: { legend: { display: false } },
                     scales: { 
                        x: { grid: { color: 'rgba(167, 167, 167, 0.1)'}, ticks: { color: '#A7A7A7' } }, 
                        y: { grid: { color: 'rgba(167, 167, 167, 0.1)'}, ticks: { color: '#A7A7A7' }, title: { display: true, text: `Gas (${primaryNetworkForChart.toLowerCase().includes('solana') ? 'SOL' : 'Gwei'})`, color: '#A7A7A7'} }  
                    }
                }}
                titleText={undefined} 
            />
        </div>
      )}
    </Card>

    <Modal isOpen={isAiTipsModalOpen} onClose={() => setIsAiTipsModalOpen(false)} title={
        <div className="flex items-center"><Brain size={20} className="mr-2 text-primary" /> AI Gas Optimization Tips</div>
    } size="lg">
        {isApiKeyMissing && ( 
             <AlertMessage type="warning" title="API Key Missing" message="AI Gas Tips are unavailable because the API_KEY for Gemini is not configured." />
        )}
        {isAiGasTipsLoading && <div className="flex items-center justify-center py-6"><Loader2 size={28} className="animate-spin text-primary" /><p className="ml-3 text-muted-dark">Loading AI Tips...</p></div>}
        {aiGasTips && !isAiGasTipsLoading && (
            <div className="prose dark:prose-invert max-w-none p-1 text-sm text-white dark:text-muted-dark whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {aiGasTips}
            </div>
        )}
        <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setIsAiTipsModalOpen(false)}>Close</Button>
        </div>
    </Modal>
    </>
  );
};
