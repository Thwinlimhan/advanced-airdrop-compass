import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Eye, ExternalLink, MoveRight, Info } from 'lucide-react';
import { WhaleTransaction } from '../../types';
import { formatCurrency } from '../../utils/formatting';

const generateMockWhaleTransactions = (): WhaleTransaction[] => {
  const tokens = ['WETH', 'PEPE', 'BONK', 'USDC', 'SHIB', 'LINK', 'ARB', 'OP', 'TIA', 'RNDR'];
  const chains = ['Ethereum', 'Arbitrum', 'Solana', 'Optimism', 'Base', 'BNB Chain'];
  const fromPrefixes = ['0xWhaleFund', 'Binance Hot', 'Kraken Cold', '0xAlphaTrader', 'Jump Crypto', 'Wintermute'];
  const toPrefixes = ['0xNewGiantWallet', 'CEX Deposit Wallet', 'LP Staking Contract', '0xSigmaChadFund', 'DAO Treasury Vault', 'Bridge In'];

  return Array.from({length: 4 + Math.floor(Math.random()*4)}, (_, i) => { // More variety in count
    const token = tokens[Math.floor(Math.random()*tokens.length)];
    const usdValue = Math.floor(Math.random() * 8000000) + 200000; // $200k to $8M
    const amount = token === 'USDC' || token === 'USDT' ? usdValue : parseFloat((usdValue / (MOCK_TOKEN_PRICES_FOR_SIMULATION[token] || (Math.random()*2000+10))).toFixed(token === 'BONK' || token === 'SHIB' ? 0 : 4));
    
    return {
      id: `w_sim_${crypto.randomUUID()}`,
      hash: `0x${Math.random().toString(16).substring(2,12)}...${Math.random().toString(16).substring(2,7)}`,
      tokenSymbol: token,
      amount: amount,
      usdValue: usdValue,
      fromAddress: `${fromPrefixes[Math.floor(Math.random()*fromPrefixes.length)]}${Math.floor(Math.random()*100)}`,
      toAddress: `${toPrefixes[Math.floor(Math.random()*toPrefixes.length)]}${Math.floor(Math.random()*100)}`,
      timestamp: new Date(Date.now() - (Math.floor(Math.random()*18)+1) * 60 * 60 * 1000).toISOString(), // Within last 18 hours
      chain: chains[Math.floor(Math.random()*chains.length)],
      explorerUrl: '#', // Placeholder
      isSimulated: true,
    };
  }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const MOCK_TOKEN_PRICES_FOR_SIMULATION: Record<string, number> = {
    'WETH': 3000, 'PEPE': 0.000008, 'BONK': 0.000025, 'USDC': 1, 'SHIB': 0.000018,
    'LINK': 15, 'ARB': 1.1, 'OP': 2.0, 'TIA': 10, 'RNDR': 8,
};


export const WhaleWatcherWidget: React.FC = () => {
  const mockWhaleTransactions = generateMockWhaleTransactions();

  return (
    <Card>
      <div className="flex items-center">
        <Eye size={20} className="mr-2 text-blue-500"/>
        Whale Watcher Activity
      </div>
      <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md mb-3">
        <Info size={14} className="mr-1.5 flex-shrink-0" />
        <span>Simulated Data: Transactions shown are fictional and for demonstration purposes only.</span>
      </div>
      <p className="text-xs text-muted-light dark:text-muted-dark mb-3">
        Tracks notable large or interesting transactions (mock data).
      </p>
      {mockWhaleTransactions.length === 0 ? (
        <p className="text-sm text-muted-light dark:text-muted-dark">No significant transactions detected recently.</p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto">
          {mockWhaleTransactions.map(tx => (
            <li key={tx.id} className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-text-light dark:text-text-dark">
                        {tx.amount.toLocaleString(undefined, {maximumFractionDigits: tx.tokenSymbol === 'BONK' || tx.tokenSymbol === 'SHIB' ? 0 : 4})} {tx.tokenSymbol} 
                        <span className="text-xs text-muted-light dark:text-muted-dark"> ({formatCurrency(tx.usdValue)})</span>
                    </span>
                    {tx.explorerUrl && (
                        <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-500 hover:text-blue-700" title="View Transaction">
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
                <div className="text-xs text-muted-light dark:text-muted-dark flex items-center flex-wrap gap-x-1">
                    <span className="truncate max-w-[80px] sm:max-w-[100px]" title={tx.fromAddress}>From: {tx.fromAddress}</span>
                    <MoveRight size={12} className="text-gray-400 flex-shrink-0"/>
                    <span className="truncate max-w-[80px] sm:max-w-[100px]" title={tx.toAddress}>To: {tx.toAddress}</span>
                </div>
                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {tx.chain} - {new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} ({new Date(tx.timestamp).toLocaleDateString(undefined, {month:'short', day:'numeric'})})
                </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
