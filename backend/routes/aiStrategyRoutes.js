
const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let savedAiStrategiesStore = {}; // { userId: [strategy1, strategy2] }

const ensureUserStrategyStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (!savedAiStrategiesStore[req.user.id]) {
    savedAiStrategiesStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserStrategyStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/ai-strategies
router.get('/', async (req, res) => {
  const userStrategies = await simulateDBRead(savedAiStrategiesStore[req.user.id]);
  res.json(userStrategies);
});

// POST /api/v1/ai-strategies
router.post('/', async (req, res) => {
  const { strategyTitle, overallApproach, steps, preferences } = req.body;
  if (!strategyTitle || !overallApproach || !Array.isArray(steps) || !preferences) {
    return res.status(400).json({ message: 'Missing required fields for AI strategy (strategyTitle, overallApproach, steps, preferences)' });
  }
  const newSavedStrategy = {
    id: `ai_strat_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
    userId: req.user.id,
    savedDate: new Date().toISOString(),
    strategyTitle,
    overallApproach,
    steps,
    sybilTips: req.body.sybilTips || [],
    disclaimers: req.body.disclaimers || [],
    preferences 
  };
  savedAiStrategiesStore[req.user.id].push(newSavedStrategy);
  await simulateDBWrite();
  res.status(201).json(newSavedStrategy);
});

// GET /api/v1/ai-strategies/:strategyId
router.get('/:strategyId', async (req, res) => {
  const userStrategies = await simulateDBRead(savedAiStrategiesStore[req.user.id]);
  const strategy = userStrategies.find(s => s.id === req.params.strategyId);
  if (strategy) res.json(strategy); else res.status(404).json({ message: 'Saved AI strategy not found' });
});

// PUT /api/v1/ai-strategies/:strategyId
router.put('/:strategyId', async (req, res) => {
  const userStrategies = savedAiStrategiesStore[req.user.id];
  const strategyIndex = userStrategies.findIndex(s => s.id === req.params.strategyId);
  if (strategyIndex > -1) {
    // Exclude non-updatable fields, ensure savedDate is updated
    const { id, userId, savedDate, ...updateData } = req.body;
    if (updateData.strategyTitle !== undefined && !updateData.strategyTitle.trim()){
        return res.status(400).json({message: 'Strategy title cannot be empty when updating.'});
    }
    userStrategies[strategyIndex] = { 
        ...userStrategies[strategyIndex], 
        ...updateData, 
        savedDate: new Date().toISOString() // Update savedDate on any modification
    };
    await simulateDBWrite();
    res.json(userStrategies[strategyIndex]);
  } else {
    res.status(404).json({ message: 'Saved AI strategy not found' });
  }
});


// DELETE /api/v1/ai-strategies/:strategyId
router.delete('/:strategyId', async (req, res) => {
  const userStrategies = savedAiStrategiesStore[req.user.id];
  const initialLength = userStrategies.length;
  savedAiStrategiesStore[req.user.id] = userStrategies.filter(s => s.id !== req.params.strategyId);
  if (savedAiStrategiesStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Saved AI strategy deleted' });
  } else {
    res.status(404).json({ message: 'Saved AI strategy not found' });
  }
});

module.exports = router;