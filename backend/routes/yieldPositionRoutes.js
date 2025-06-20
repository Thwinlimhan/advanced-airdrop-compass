const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let yieldPositionsStore = {}; // { userId: [position1, position2] }

const ensureUserYieldStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (!yieldPositionsStore[req.user.id]) {
    yieldPositionsStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserYieldStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/yield-positions
router.get('/', async (req, res) => {
  const userPositions = await simulateDBRead(yieldPositionsStore[req.user.id]);
  res.json(userPositions);
});

// POST /api/v1/yield-positions
router.post('/', async (req, res) => {
  const { platformName, assetSymbol, amountStaked, walletId, entryDate } = req.body;
  if (!platformName || !assetSymbol || amountStaked === undefined || !walletId || !entryDate) {
    return res.status(400).json({ message: 'Platform name, asset symbol, amount staked, wallet ID, and entry date are required' });
  }
  if (typeof amountStaked !== 'number' || amountStaked <= 0) {
      return res.status(400).json({ message: 'Amount staked must be a positive number.'});
  }
  try {
    new Date(entryDate).toISOString(); // Validate date format
  } catch (e) {
    return res.status(400).json({message: 'Invalid entryDate format.'});
  }

  const newPosition = {
    id: `yield_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
    userId: req.user.id,
    platformName: platformName.trim(),
    assetSymbol: assetSymbol.trim(),
    amountStaked: parseFloat(amountStaked),
    walletId,
    entryDate,
    currentApy: req.body.currentApy !== undefined ? parseFloat(req.body.currentApy) : undefined,
    notes: req.body.notes || '',
    poolUrl: req.body.poolUrl || '',
    currentValue: req.body.currentValue !== undefined ? parseFloat(req.body.currentValue) : undefined,
  };
  yieldPositionsStore[req.user.id].push(newPosition);
  await simulateDBWrite();
  res.status(201).json(newPosition);
});

// GET /api/v1/yield-positions/:positionId
router.get('/:positionId', async (req, res) => {
  const userPositions = await simulateDBRead(yieldPositionsStore[req.user.id]);
  const position = userPositions.find(p => p.id === req.params.positionId);
  if (position) res.json(position); else res.status(404).json({ message: 'Yield position not found' });
});

// PUT /api/v1/yield-positions/:positionId
router.put('/:positionId', async (req, res) => {
  const userPositions = yieldPositionsStore[req.user.id];
  const positionIndex = userPositions.findIndex(p => p.id === req.params.positionId);
  if (positionIndex > -1) {
    const { id, userId, ...updateData } = req.body; // Exclude non-updatable fields
    if (updateData.platformName !== undefined && !updateData.platformName.trim()){
        return res.status(400).json({ message: 'Platform name cannot be empty when updating.' });
    }
    if (updateData.amountStaked !== undefined && (typeof updateData.amountStaked !== 'number' || updateData.amountStaked <= 0)) {
        return res.status(400).json({ message: 'Amount staked must be a positive number when updating.'});
    }
    userPositions[positionIndex] = { 
        ...userPositions[positionIndex], 
        ...updateData,
    };
    await simulateDBWrite();
    res.json(userPositions[positionIndex]);
  } else {
    res.status(404).json({ message: 'Yield position not found' });
  }
});

// DELETE /api/v1/yield-positions/:positionId
router.delete('/:positionId', async (req, res) => {
  const userPositions = yieldPositionsStore[req.user.id];
  const initialLength = userPositions.length;
  yieldPositionsStore[req.user.id] = userPositions.filter(p => p.id !== req.params.positionId);
  if (yieldPositionsStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Yield position deleted' });
  } else {
    res.status(404).json({ message: 'Yield position not found' });
  }
});

module.exports = router;