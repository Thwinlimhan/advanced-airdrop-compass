const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let watchlistStore = {}; // { userId: [item1, item2] }

const ensureUserWatchlistStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (!watchlistStore[req.user.id]) {
    watchlistStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserWatchlistStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/watchlist
router.get('/', async (req, res) => {
  const userWatchlist = await simulateDBRead(watchlistStore[req.user.id]);
  res.json(userWatchlist);
});

// POST /api/v1/watchlist
router.post('/', async (req, res) => {
  const { projectName, confidence } = req.body;
  if (!projectName || !confidence) {
    return res.status(400).json({ message: 'Project name and confidence are required' });
  }
  const newItem = {
    id: `watchlist_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
    userId: req.user.id,
    addedDate: new Date().toISOString(),
    ...req.body
  };
  watchlistStore[req.user.id].push(newItem);
  await simulateDBWrite();
  res.status(201).json(newItem);
});

// GET /api/v1/watchlist/:itemId
router.get('/:itemId', async (req, res) => {
  const userWatchlist = await simulateDBRead(watchlistStore[req.user.id]);
  const item = userWatchlist.find(i => i.id === req.params.itemId);
  if (item) res.json(item); else res.status(404).json({ message: 'Watchlist item not found' });
});

// PUT /api/v1/watchlist/:itemId
router.put('/:itemId', async (req, res) => {
  const userWatchlist = watchlistStore[req.user.id];
  const itemIndex = userWatchlist.findIndex(i => i.id === req.params.itemId);
  if (itemIndex > -1) {
    const { id, userId, addedDate, ...updateData } = req.body; // Prevent client from updating these
    userWatchlist[itemIndex] = { 
        ...userWatchlist[itemIndex], 
        ...updateData,
    };
    await simulateDBWrite();
    res.json(userWatchlist[itemIndex]);
  } else {
    res.status(404).json({ message: 'Watchlist item not found' });
  }
});

// DELETE /api/v1/watchlist/:itemId
router.delete('/:itemId', async (req, res) => {
  const userWatchlist = watchlistStore[req.user.id];
  const initialLength = userWatchlist.length;
  watchlistStore[req.user.id] = userWatchlist.filter(i => i.id !== req.params.itemId);
  if (watchlistStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Watchlist item deleted' });
  } else {
    res.status(404).json({ message: 'Watchlist item not found' });
  }
});

// POST /api/v1/watchlist/:itemId/promote
router.post('/:itemId/promote', async (req, res) => {
  const userWatchlist = watchlistStore[req.user.id];
  const itemIndex = userWatchlist.findIndex(i => i.id === req.params.itemId);
  if (itemIndex > -1) {
    const itemToPromote = userWatchlist[itemIndex];
    // Remove from watchlist
    watchlistStore[req.user.id].splice(itemIndex, 1);
    await simulateDBWrite(); 

    // Create a conceptual airdrop object based on watchlist item
    // Ensure all required Airdrop fields are present, with defaults if necessary
    const promotedAirdropData = { 
        projectName: itemToPromote.projectName,
        blockchain: itemToPromote.ecosystem || 'Unknown',
        status: 'Rumored', // Default status for promoted items
        potential: itemToPromote.potential || 'Unknown',
        myStatus: 'Not Started', // Default participation status
        description: itemToPromote.notes || `Promoted from watchlist. Original AI Confidence: ${itemToPromote.aiConfidence || itemToPromote.confidence}.`,
        officialLinks: { website: itemToPromote.websiteLink || '', twitter: itemToPromote.twitterLink || '', discord: '' },
        eligibilityCriteria: '',
        notes: `Original watchlist notes:\n${itemToPromote.notes || ''}\n\nAI Details (if any):\nEcosystem: ${itemToPromote.ecosystem || 'N/A'}\nPotential Reason for Airdrop: ${itemToPromote.potentialReason || 'N/A'}\nSource Hints: ${(itemToPromote.sourceHints || []).join(', ')}\nAI Rationale: ${itemToPromote.aiRationale || 'N/A'}`,
        tags: ['promoted', itemToPromote.confidence?.toLowerCase()],
        priority: itemToPromote.confidence === 'High' ? 'High' : (itemToPromote.confidence === 'Medium' ? 'Medium' : 'Low'),
        // Other Airdrop fields with defaults
        tasks: [],
        transactions: [],
        claimedTokens: [],
        sybilChecklist: [], 
        isArchived: false,
        timeSpentHours: 0,
        roadmapEvents: [],
        dependentOnAirdropIds: [],
        leadsToAirdropIds: [],
        logoBase64: undefined,
        customFields: [],
        // dateAdded: new Date().toISOString(), // Set by POST /airdrops
        notificationOverrides: undefined,
        projectCategory: undefined,
        // userId: req.user.id, // Set by POST /airdrops
    };
    
    res.status(200).json({ 
        message: 'Item data prepared for promotion. Please create a new Airdrop with this data.', 
        airdrop: promotedAirdropData // Send data for frontend to use in a new Airdrop creation call
    });
  } else {
    res.status(404).json({ message: 'Watchlist item not found for promotion' });
  }
});

module.exports = router;