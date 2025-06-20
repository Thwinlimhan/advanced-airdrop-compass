const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

// --- Helper for simulated async DB calls ---
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 120)); // Simulate some processing
  return data;
};

// GET /api/v1/analytics/trending-contracts
router.get('/trending-contracts', async (req, res) => {
  console.log(`User ${req.user.id} requesting trending contracts.`);
  const chains = ['Arbitrum', 'Ethereum', 'Optimism', 'zkSync Era', 'Solana', 'Base'];
  const prefixes = ['Hyper', 'Quantum', 'Nova', 'Zeta', 'Lunar', 'Aura'];
  const suffixes = ['Router', 'NFT Mint', 'Governance', 'LP Token', 'Bridge'];
  
  const mockTrendingContracts = Array.from({ length: 5 }, (_, i) => ({
      id: `contract_sim_${i}_${Date.now()}`,
      name: `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
      chain: chains[Math.floor(Math.random() * chains.length)],
      interactionCount: Math.floor(Math.random() * 20000) + 1000,
      explorerUrl: '#', // Placeholder
      isSimulated: true
  })).sort((a,b) => b.interactionCount - a.interactionCount);
  
  res.json(await simulateDBRead(mockTrendingContracts));
});

// GET /api/v1/analytics/whale-transactions
router.get('/whale-transactions', async (req, res) => {
  console.log(`User ${req.user.id} requesting whale transactions.`);
  const tokens = ['WETH', 'PEPE', 'USDC', 'ARB', 'SOL'];
  const chains = ['Ethereum', 'Arbitrum', 'Solana'];
  
  const mockWhaleTransactions = Array.from({length: 4}, (_,i) => {
    const token = tokens[Math.floor(Math.random()*tokens.length)];
    const usdValue = Math.floor(Math.random() * 5000000) + 100000; // $100k to $5M
    return {
        id: `whale_tx_sim_${i}_${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2,10)}...`,
        tokenSymbol: token,
        amount: parseFloat((usdValue / (token === 'USDC' ? 1 : (Math.random()*2000+50))).toFixed(4)),
        usdValue: usdValue,
        fromAddress: `0xWhaleFund${Math.floor(Math.random()*10)}`,
        toAddress: `0xHotWallet${Math.floor(Math.random()*10)}`,
        timestamp: new Date(Date.now() - Math.floor(Math.random()*24)*60*60*1000).toISOString(), // Within last 24h
        chain: chains[Math.floor(Math.random()*chains.length)],
        explorerUrl: '#', // Placeholder
        isSimulated: true,
    };
  }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  res.json(await simulateDBRead(mockWhaleTransactions));
});

// GET /api/v1/analytics/airdrop-activity-feed (Conceptual)
router.get('/airdrop-activity-feed', async (req, res) => {
  console.log(`User ${req.user.id} requesting airdrop activity feed.`);
  const mockFeed = [
    { id: 'feed1', type: 'NewAirdropRumor', projectName: 'CosmicSwap', details: 'Strong rumors of an upcoming airdrop for CosmicSwap on Celestia.', timestamp: new Date(Date.now() - 1*60*60*1000).toISOString() },
    { id: 'feed2', type: 'SnapshotConfirmed', projectName: 'NovaLend', details: 'NovaLend has officially announced a snapshot taken yesterday for early users.', timestamp: new Date(Date.now() - 3*60*60*1000).toISOString() },
    { id: 'feed3', type: 'EligibilityCheckerAvailable', projectName: 'StarkNetBridge', details: 'An unofficial eligibility checker for a potential StarkNetBridge airdrop is circulating.', timestamp: new Date(Date.now() - 5*60*60*1000).toISOString() },
  ];
  res.json(await simulateDBRead(mockFeed));
});

module.exports = router;