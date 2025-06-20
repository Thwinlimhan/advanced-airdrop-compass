const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

// Global store for predefined resources (like MOCK_GUIDES from frontend)
let globalLearningResources = [
    { id: 'g_sys_1', type: 'guide', title: 'Sybil Attack Prevention 101 (System)', content: 'Detailed guide on how to avoid being flagged as a sybil attacker. Covers wallet hygiene, IP diversity, and interaction patterns.', category: 'Security', author: 'Compass System', submissionDate: '2023-01-01T00:00:00.000Z' },
    { id: 'gl_sys_1', type: 'glossary', title: 'Airdrop (System)', content: 'A distribution of a cryptocurrency token or coin, usually for free, to numerous wallet addresses.', submissionDate: '2023-01-01T00:00:00.000Z', author: 'Compass System'},
];

// User-specific resources store
let userLearningResourcesStore = {}; // { userId: [resource1, resource2] }

const ensureUserLearningStore = (req, res, next) => {
  // This middleware is only needed for routes that *modify* user-specific resources
  if (req.method !== 'GET' && (!req.user || !req.user.id)) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (req.user && req.user.id && !userLearningResourcesStore[req.user.id]) {
    userLearningResourcesStore[req.user.id] = [];
  }
  next();
};

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};


// GET /api/v1/learning-resources - Fetch all resources (global + user's)
router.get('/', authMiddleware, ensureUserLearningStore, async (req, res) => { // ensureUserLearningStore to initialize if user store is empty
  const userResources = await simulateDBRead(userLearningResourcesStore[req.user.id] || []);
  const allResources = [...globalLearningResources, ...userResources];
  res.json(allResources);
});

// GET /api/v1/learning-resources/:resourceId - Fetch a specific resource
router.get('/:resourceId', async (req, res) => {
  const resourceId = req.params.resourceId;
  let resource = globalLearningResources.find(r => r.id === resourceId);
  if (!resource) {
    // Check user-specific stores if authenticated and not found in global
    if (req.user && req.user.id && userLearningResourcesStore[req.user.id]) {
      const userResources = await simulateDBRead(userLearningResourcesStore[req.user.id]);
      resource = userResources.find(r => r.id === resourceId);
    }
  }
  
  if (resource) {
    res.json(await simulateDBRead(resource));
  } else {
    res.status(404).json({ message: 'Resource not found' });
  }
});


// POST /api/v1/learning-resources - Add a new user-submitted resource
router.post('/', authMiddleware, ensureUserLearningStore, async (req, res) => {
  const { type, title, content } = req.body;
  if (!type || !title || !content) {
    return res.status(400).json({ message: 'Type, title, and content are required' });
  }
  const newResource = {
    id: `lr_user_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
    userId: req.user.id, 
    author: req.body.author || req.user.email.split('@')[0], // Default author to username/email part
    submissionDate: req.body.submissionDate || new Date().toISOString(),
    ...req.body 
  };
  userLearningResourcesStore[req.user.id].push(newResource);
  await simulateDBWrite();
  res.status(201).json(newResource);
});

// PUT /api/v1/learning-resources/:resourceId - Update a user-submitted resource
router.put('/:resourceId', authMiddleware, ensureUserLearningStore, async (req, res) => {
  const resourceId = req.params.resourceId;
  const userResources = userLearningResourcesStore[req.user.id];
  const resourceIndex = userResources.findIndex(r => r.id === resourceId);

  if (resourceIndex > -1) {
    // User can only edit their own submissions. Global resources are not editable via this.
    if (userResources[resourceIndex].userId !== req.user.id) {
        return res.status(403).json({message: 'Forbidden: You can only edit your own submitted resources.'});
    }
    const { id, userId, author, submissionDate, ...updateData } = req.body; // Exclude non-updatable fields
    userResources[resourceIndex] = { 
        ...userResources[resourceIndex], 
        ...updateData,
    };
    await simulateDBWrite();
    res.json(userResources[resourceIndex]);
  } else {
    res.status(404).json({ message: 'User-submitted resource not found or you do not have permission to edit system resources.' });
  }
});

// DELETE /api/v1/learning-resources/:resourceId - Delete a user-submitted resource
router.delete('/:resourceId', authMiddleware, ensureUserLearningStore, async (req, res) => {
  const resourceId = req.params.resourceId;
  const userResources = userLearningResourcesStore[req.user.id];
  const initialLength = userResources.length;
  const resourceToDelete = userResources.find(r => r.id === resourceId);

  if (!resourceToDelete) {
    return res.status(404).json({ message: 'User-submitted resource not found or you do not have permission to delete system resources.' });
  }
  if (resourceToDelete.userId !== req.user.id) {
      return res.status(403).json({message: 'Forbidden: You can only delete your own submitted resources.'});
  }

  userLearningResourcesStore[req.user.id] = userResources.filter(r => r.id !== resourceId);
  if (userLearningResourcesStore[req.user.id].length < initialLength) {
    await simulateDBWrite();
    res.status(200).json({ message: 'Resource deleted' });
  } else {
    // This case should not be reached if resourceToDelete was found and userId matched
    res.status(404).json({ message: 'Resource not found or delete failed' });
  }
});

module.exports = router;