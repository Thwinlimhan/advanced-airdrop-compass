const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let walletsStore = {}; // Store wallets per user: { userId: [wallet1, wallet2] }

const ensureUserWalletStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (!walletsStore[req.user.id]) {
    walletsStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserWalletStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/wallets/logs/recent
router.get('/logs/recent', async (req, res) => {
  const userWallets = await simulateDBRead(walletsStore[req.user.id] || []);
  let allGasLogs = [];
  let allInteractionLogs = [];

  userWallets.forEach(wallet => {
    if (wallet.gasLogs) {
      allGasLogs.push(...wallet.gasLogs.map(log => ({ ...log, walletName: wallet.name, walletId: wallet.id })));
    }
    if (wallet.interactionLogs) {
      allInteractionLogs.push(...wallet.interactionLogs.map(log => ({ ...log, walletName: wallet.name, walletId: wallet.id })));
    }
  });

  allGasLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  allInteractionLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const limit = parseInt(req.query.limit) || 5;
  res.json({
    gasLogs: allGasLogs.slice(0, limit),
    interactionLogs: allInteractionLogs.slice(0, limit)
  });
});

// GET /api/v1/wallets
router.get('/', async (req, res) => {
  const userWallets = await simulateDBRead(walletsStore[req.user.id]);
  res.json(userWallets);
});

// POST /api/v1/wallets
router.post('/', async (req, res) => {
  const { name, address, blockchain, group } = req.body;
  if (!name || !address || !blockchain) {
    return res.status(400).json({ message: 'Name, address, and blockchain are required' });
  }
  const newWallet = {
    id: `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: req.user.id, // Associate with user
    name, address, blockchain,
    group: group || '',
    balanceSnapshots: [], gasLogs: [], interactionLogs: [], nftPortfolio: [],
    isArchived: false, transactionHistory: [], autoBalanceFetchEnabled: false,
    lastSynced: null
  };
  walletsStore[req.user.id].push(newWallet);
  await simulateDBWrite();
  res.status(201).json(newWallet);
});

// GET /api/v1/wallets/:walletId
router.get('/:walletId', async (req, res) => {
  const userWallets = await simulateDBRead(walletsStore[req.user.id]);
  const wallet = userWallets.find(w => w.id === req.params.walletId);
  if (wallet) res.json(wallet);
  else res.status(404).json({ message: 'Wallet not found' });
});

// PUT /api/v1/wallets/:walletId
router.put('/:walletId', async (req, res) => {
  const userWallets = walletsStore[req.user.id];
  const walletIndex = userWallets.findIndex(w => w.id === req.params.walletId);
  if (walletIndex > -1) {
    // Preserve existing nested arrays if not provided in req.body
    const updatedWallet = { 
        ...userWallets[walletIndex], 
        ...req.body, 
        id: userWallets[walletIndex].id, 
        userId: userWallets[walletIndex].userId,
        // Explicitly carry over arrays if they are not part of req.body
        balanceSnapshots: req.body.balanceSnapshots !== undefined ? req.body.balanceSnapshots : userWallets[walletIndex].balanceSnapshots,
        gasLogs: req.body.gasLogs !== undefined ? req.body.gasLogs : userWallets[walletIndex].gasLogs,
        interactionLogs: req.body.interactionLogs !== undefined ? req.body.interactionLogs : userWallets[walletIndex].interactionLogs,
        nftPortfolio: req.body.nftPortfolio !== undefined ? req.body.nftPortfolio : userWallets[walletIndex].nftPortfolio,
        transactionHistory: req.body.transactionHistory !== undefined ? req.body.transactionHistory : userWallets[walletIndex].transactionHistory,
    };
    userWallets[walletIndex] = updatedWallet;
    await simulateDBWrite();
    res.json(userWallets[walletIndex]);
  } else {
    res.status(404).json({ message: 'Wallet not found' });
  }
});

// DELETE /api/v1/wallets/:walletId
router.delete('/:walletId', async (req, res) => {
  const userWallets = walletsStore[req.user.id];
  const initialLength = userWallets.length;
  walletsStore[req.user.id] = userWallets.filter(w => w.id !== req.params.walletId);
  if (walletsStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Wallet deleted successfully' });
  } else {
    res.status(404).json({ message: 'Wallet not found' });
  }
});

// POST /api/v1/wallets/batch-update
router.post('/batch-update', async (req, res) => {
  const { walletIds, updates } = req.body;
  if (!Array.isArray(walletIds) || !updates || typeof updates !== 'object') {
    return res.status(400).json({ message: 'Invalid request for batch update. Expecting walletIds array and updates object.' });
  }
  let updatedCount = 0;
  const userWallets = walletsStore[req.user.id];
  walletIds.forEach(id => {
    const walletIndex = userWallets.findIndex(w => w.id === id);
    if (walletIndex > -1) {
      // Only allow specific fields to be batch updated for safety
      const allowedUpdates = ['isArchived', 'group', 'autoBalanceFetchEnabled'];
      const validUpdates = {};
      allowedUpdates.forEach(key => {
        if (updates.hasOwnProperty(key)) {
          // @ts-ignore
          validUpdates[key] = updates[key];
        }
      });
      userWallets[walletIndex] = { ...userWallets[walletIndex], ...validUpdates };
      updatedCount++;
    }
  });
  if (updatedCount > 0) await simulateDBWrite();
  res.json({ message: `Successfully updated ${updatedCount} wallets.` });
});

// GET /api/v1/wallets/:walletId/summary - Conceptual
router.get('/:walletId/summary', async (req, res) => {
  const userWallets = await simulateDBRead(walletsStore[req.user.id]);
  const wallet = userWallets.find(w => w.id === req.params.walletId);
  if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
  const summary = {
    id: wallet.id, name: wallet.name, address: wallet.address, blockchain: wallet.blockchain,
    nftCount: (wallet.nftPortfolio || []).length,
    interactionCount: (wallet.interactionLogs || []).length,
    gasLogCount: (wallet.gasLogs || []).length,
    balanceSnapshotCount: (wallet.balanceSnapshots || []).length,
    lastActivity: (wallet.interactionLogs || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || 'N/A',
    isArchived: wallet.isArchived,
    group: wallet.group
  };
  res.json(summary);
});

// --- Nested Routes Helper Function ---
function createNestedCRUDRoutes(router, parentStoreAccessor, nestedArrayKey, itemName, requiredFields = []) {
  const nestedRouter = express.Router({ mergeParams: true });

  nestedRouter.get('/', async (req, res) => {
    const parentItem = (await simulateDBRead(parentStoreAccessor(req)))?.find(p => p.id === req.params.walletId); // Assuming walletId param
    if (!parentItem) return res.status(404).json({ message: 'Parent item not found' });
    res.json(await simulateDBRead(parentItem[nestedArrayKey] || []));
  });

  nestedRouter.get(`/:${itemName}Id`, async (req, res) => {
    const parentItem = (await simulateDBRead(parentStoreAccessor(req)))?.find(p => p.id === req.params.walletId);
    if (!parentItem) return res.status(404).json({ message: 'Parent item not found' });
    const item = (await simulateDBRead(parentItem[nestedArrayKey] || [])).find(i => i.id === req.params[`${itemName}Id`]);
    if (item) res.json(item);
    else res.status(404).json({ message: `${itemName} not found` });
  });

  nestedRouter.post('/', async (req, res) => {
    const parentItems = parentStoreAccessor(req); // Direct access for write
    const parentIndex = parentItems.findIndex(p => p.id === req.params.walletId);
    if (parentIndex === -1) return res.status(404).json({ message: 'Parent item not found' });

    for (const field of requiredFields) {
      // @ts-ignore
      if (req.body[field] === undefined) {
        return res.status(400).json({ message: `${field} is required for ${itemName}.` });
      }
    }
    const newItem = { id: `${itemName}_${Date.now()}_${Math.random().toString(36).substring(2,5)}`, ...req.body };
    if (!parentItems[parentIndex][nestedArrayKey]) parentItems[parentIndex][nestedArrayKey] = [];
    parentItems[parentIndex][nestedArrayKey].push(newItem);
    await simulateDBWrite();
    res.status(201).json(newItem);
  });

  nestedRouter.put(`/:${itemName}Id`, async (req, res) => {
    const parentItems = parentStoreAccessor(req);
    const parentIndex = parentItems.findIndex(p => p.id === req.params.walletId);
    if (parentIndex === -1) return res.status(404).json({ message: 'Parent item not found' });

    const items = parentItems[parentIndex][nestedArrayKey] || [];
    const itemIndex = items.findIndex(i => i.id === req.params[`${itemName}Id`]);
    if (itemIndex === -1) return res.status(404).json({ message: `${itemName} not found` });
    
    items[itemIndex] = { ...items[itemIndex], ...req.body, id: items[itemIndex].id }; // Preserve ID
    await simulateDBWrite();
    res.json(items[itemIndex]);
  });

  nestedRouter.delete(`/:${itemName}Id`, async (req, res) => {
    const parentItems = parentStoreAccessor(req);
    const parentIndex = parentItems.findIndex(p => p.id === req.params.walletId);
    if (parentIndex === -1) return res.status(404).json({ message: 'Parent item not found' });

    const items = parentItems[parentIndex][nestedArrayKey] || [];
    const initialLength = items.length;
    parentItems[parentIndex][nestedArrayKey] = items.filter(i => i.id !== req.params[`${itemName}Id`]);
    
    if (parentItems[parentIndex][nestedArrayKey].length < initialLength) {
      await simulateDBWrite();
      res.status(200).json({ message: `${itemName} deleted` });
    } else res.status(404).json({ message: `${itemName} not found` });
  });
  return nestedRouter;
}

const getWalletsForUser = (req) => walletsStore[req.user.id];

// Use the helper for Gas Logs, Interaction Logs, NFTs, Balance Snapshots, Transaction History
router.use('/:walletId/gas-logs', createNestedCRUDRoutes(router, getWalletsForUser, 'gasLogs', 'gasLog', ['date', 'amount', 'currency']));
router.use('/:walletId/interaction-logs', createNestedCRUDRoutes(router, getWalletsForUser, 'interactionLogs', 'interactionLog', ['date', 'type', 'description']));
router.use('/:walletId/nfts', createNestedCRUDRoutes(router, getWalletsForUser, 'nftPortfolio', 'nft', ['name', 'collectionName', 'contractAddress']));
router.use('/:walletId/balance-snapshots', createNestedCRUDRoutes(router, getWalletsForUser, 'balanceSnapshots', 'balanceSnapshot', ['date', 'tokenSymbol', 'amount']));
router.use('/:walletId/transaction-history', createNestedCRUDRoutes(router, getWalletsForUser, 'transactionHistory', 'txHistoryEntry', ['hash', 'date', 'status']));

// --- Sync Wallet Data --- Conceptual still
router.post('/:walletId/sync-data', async (req, res) => {
  const userWallets = walletsStore[req.user.id];
  const walletIndex = userWallets.findIndex(w => w.id === req.params.walletId);
  if (walletIndex === -1) return res.status(404).json({ message: 'Wallet not found' });
  
  const wallet = userWallets[walletIndex];
  wallet.autoBalanceFetchEnabled = true; 
  wallet.lastSynced = new Date().toISOString();
  
  const newSnapshot = { 
      id: `snap_sync_${Date.now()}_${Math.random().toString(36).substring(2,5)}`, 
      date: new Date().toISOString().split('T')[0], 
      tokenSymbol: wallet.blockchain === 'Solana' ? 'SOL' : 'ETH', 
      amount: parseFloat((Math.random() * 5 + 0.1).toFixed(3)), 
      notes: 'Fetched via API sync (conceptual)' 
  };
  if(!wallet.balanceSnapshots) wallet.balanceSnapshots = [];
  wallet.balanceSnapshots.push(newSnapshot);
  
  await simulateDBWrite();
  res.json({ message: 'Wallet data sync triggered (conceptual)', wallet });
});

module.exports = router;