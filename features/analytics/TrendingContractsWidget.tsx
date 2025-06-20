import React from 'react';
import { Card } from '../../design-system/components/Card';
import { TrendingUp, ExternalLink, Info } from 'lucide-react';
import { TrendingContract } from '../../types'; 

const generateMockTrendingContracts = (): TrendingContract[] => {
  const chains = ['Arbitrum', 'Ethereum', 'Optimism', 'zkSync Era', 'Solana', 'Base'];
  const prefixes = ['Hyper', 'Quantum', 'Nova', 'Zeta', 'Lunar', 'Aura', 'Cipher', 'Echo', 'Stellar', 'Vector'];
  const suffixes = ['Router', 'NFT Mint', 'Governance', 'LP Token', 'Bridge', 'Oracle', 'Vault', 'Swap', 'StakePool', 'LendingMarket'];
  
  return Array.from({ length: 5 + Math.floor(Math.random() * 3) }, (_, i) => {
    const chain = chains[Math.floor(Math.random() * chains.length)];
    return {
      id: crypto.randomUUID(),
      name: `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]} ${chain === 'Solana' ? 'SPL' : 'V'+(Math.floor(Math.random()*3)+1)}`,
      address: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 5)}`,
      chain: chain,
      interactionCount: Math.floor(Math.random() * 25000) + 1500, // Increased interaction counts
      explorerUrl: '#', // Placeholder, real would be dynamic
      isSimulated: true,
    };
  }).sort((a,b) => b.interactionCount - a.interactionCount);
};


export const TrendingContractsWidget: React.FC = () => {
  const mockTrendingContracts = generateMockTrendingContracts(); 

  return (
    <Card>
      <div className="flex items-center">
        <TrendingUp size={20} className="mr-2 text-green-500"/>
        Trending Smart Contracts
      </div>
      <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md mb-3">
        <Info size={14} className="mr-1.5 flex-shrink-0" />
        <span>Simulated Data: Information shown is for demonstration purposes only.</span>
      </div>
      <p className="text-xs text-muted-light dark:text-muted-dark mb-3">
        Highlights contracts with significant recent activity (mock data).
      </p>
      {mockTrendingContracts.length === 0 ? (
        <p className="text-sm text-muted-light dark:text-muted-dark">No trending contracts data available.</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {mockTrendingContracts.map(contract => (
            <li key={contract.id} className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-text-light dark:text-text-dark truncate" title={contract.name}>{contract.name}</p>
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Chain: {contract.chain} | Interactions (24h): {contract.interactionCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 break-all truncate" title={contract.address}>{contract.address}</p>
                </div>
                {contract.explorerUrl && (
                  <a href={contract.explorerUrl} target="_blank" rel="noopener noreferrer" className="ml-2 flex-shrink-0 p-1 text-blue-500 hover:text-blue-700" title="View on Explorer">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
