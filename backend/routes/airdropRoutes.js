const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const storage = require('../utils/storage');

let airdropsStore = {}; // { userId: [airdrop1, airdrop2] }

const ensureUserAirdropStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly.' });
  }
  if (!airdropsStore[req.user.id]) {
    airdropsStore[req.user.id] = [];
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserAirdropStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// --- Main Airdrop Routes ---
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const airdrops = await storage.getUserData(userId, 'airdrops');
    res.json(airdrops);
  } catch (error) {
    console.error('Error fetching airdrops:', error);
    res.status(500).json({ message: 'Error fetching airdrops' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const airdropData = req.body;
    
    // Generate unique ID
    airdropData.id = `airdrop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    airdropData.userId = userId;
    airdropData.createdAt = new Date().toISOString();
    airdropData.updatedAt = new Date().toISOString();
    
    // Get existing airdrops and add new one
    const airdrops = await storage.getUserData(userId, 'airdrops');
    airdrops.push(airdropData);
    
    await storage.saveUserData(userId, 'airdrops', airdrops);
    
    res.status(201).json(airdropData);
  } catch (error) {
    console.error('Error creating airdrop:', error);
    res.status(500).json({ message: 'Error creating airdrop' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const airdropId = req.params.id;
    const airdrops = await storage.getUserData(userId, 'airdrops');
    const airdrop = airdrops.find(a => a.id === airdropId);
    
    if (!airdrop) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }
    
    res.json(airdrop);
  } catch (error) {
    console.error('Error fetching airdrop:', error);
    res.status(500).json({ message: 'Error fetching airdrop' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const airdropId = req.params.id;
    const updateData = req.body;
    
    const airdrops = await storage.getUserData(userId, 'airdrops');
    const airdropIndex = airdrops.findIndex(a => a.id === airdropId);
    
    if (airdropIndex === -1) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }
    
    // Update airdrop
    airdrops[airdropIndex] = {
      ...airdrops[airdropIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await storage.saveUserData(userId, 'airdrops', airdrops);
    
    res.json(airdrops[airdropIndex]);
  } catch (error) {
    console.error('Error updating airdrop:', error);
    res.status(500).json({ message: 'Error updating airdrop' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const airdropId = req.params.id;
    
    const airdrops = await storage.getUserData(userId, 'airdrops');
    const filteredAirdrops = airdrops.filter(a => a.id !== airdropId);
    
    if (filteredAirdrops.length === airdrops.length) {
      return res.status(404).json({ message: 'Airdrop not found' });
    }
    
    await storage.saveUserData(userId, 'airdrops', filteredAirdrops);
    
    res.json({ message: 'Airdrop deleted successfully' });
  } catch (error) {
    console.error('Error deleting airdrop:', error);
    res.status(500).json({ message: 'Error deleting airdrop' });
  }
});

router.post('/batch-update', async (req, res) => {
  const { airdropIds, updates } = req.body;
  if (!Array.isArray(airdropIds) || !updates || typeof updates !== 'object') {
    return res.status(400).json({ message: 'Invalid request. Expecting airdropIds array and updates object.' });
  }
  let count = 0;
  const userAirdrops = airdropsStore[req.user.id];
  airdropIds.forEach(id => {
    const idx = userAirdrops.findIndex(a => a.id === id);
    if (idx > -1) { 
        const allowedUpdates = ['status', 'myStatus', 'priority', 'blockchain', 'isArchived'];
        const validUpdates = {};
        allowedUpdates.forEach(key => {
            if (updates.hasOwnProperty(key)) {
                 // @ts-ignore
                validUpdates[key] = updates[key];
            }
        });
        userAirdrops[idx] = { ...userAirdrops[idx], ...validUpdates }; 
        count++; 
    }
  });
  if (count > 0) await simulateDBWrite();
  res.json({ message: `Updated ${count} airdrops.` });
});

router.post('/batch-add-notes', async (req, res) => {
  const { airdropIds, notesToAppend } = req.body;
  if (!Array.isArray(airdropIds) || typeof notesToAppend !== 'string') return res.status(400).json({ message: 'Invalid request' });
  let count = 0;
  const userAirdrops = airdropsStore[req.user.id];
  airdropIds.forEach(id => {
    const idx = userAirdrops.findIndex(a => a.id === id);
    if (idx > -1) {
      const currentNotes = userAirdrops[idx].notes || '';
      userAirdrops[idx].notes = `${currentNotes}\n\n--- Appended Note (${new Date().toLocaleDateString()}) ---\n${notesToAppend}`.trim();
      count++;
    }
  });
  if (count > 0) await simulateDBWrite();
  res.json({ message: `Added notes to ${count} airdrops.` });
});

router.delete('/archived/all', async (req, res) => {
  const userAirdrops = airdropsStore[req.user.id];
  const initialLength = userAirdrops.length;
  airdropsStore[req.user.id] = userAirdrops.filter(a => !a.isArchived);
  const clearedCount = initialLength - airdropsStore[req.user.id].length;
  if (clearedCount > 0) await simulateDBWrite();
  res.json({ message: `Cleared ${clearedCount} archived airdrops.` });
});


// --- Nested Routes Helper ---
function createNestedCRUDRoutes(router, parentStoreAccessor, nestedArrayKey, itemName, requiredFields = []) {
  const nestedRouter = express.Router({ mergeParams: true });

  nestedRouter.get('/', async (req, res) => {
    const parentItem = (await simulateDBRead(parentStoreAccessor(req)))?.find(p => p.id === req.params.airdropId);
    if (!parentItem) return res.status(404).json({ message: 'Airdrop not found' });
    res.json(await simulateDBRead(parentItem[nestedArrayKey] || []));
  });

  nestedRouter.get(`/:${itemName}Id`, async (req, res) => {
    const parentItem = (await simulateDBRead(parentStoreAccessor(req)))?.find(p => p.id === req.params.airdropId);
    if (!parentItem) return res.status(404).json({ message: 'Airdrop not found' });
    const item = (await simulateDBRead(parentItem[nestedArrayKey] || [])).find(i => i.id === req.params[`${itemName}Id`]);
    if (item) res.json(item);
    else res.status(404).json({ message: `${itemName} not found` });
  });

  nestedRouter.post('/', async (req, res) => {
    const parentItems = parentStoreAccessor(req); // Direct access for write
    const parentIndex = parentItems.findIndex(p => p.id === req.params.airdropId);
    if (parentIndex === -1) return res.status(404).json({ message: 'Airdrop not found' });
    
    for (const field of requiredFields) {
      // @ts-ignore
      if (req.body[field] === undefined) {
        return res.status(400).json({ message: `${field} is required for ${itemName}.` });
      }
    }
    // For tasks, handle parentId for subtasks correctly
    const { parentId, ...itemData } = req.body;
    const newItem = { id: `${itemName}_${Date.now()}_${Math.random().toString(36).substring(2,5)}`, ...itemData };

    if (itemName === 'task' && parentId) { // Special handling for tasks with parentId
        const findAndAddTaskRecursive = (tasks) => {
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].id === parentId) {
                    if (!tasks[i].subTasks) tasks[i].subTasks = [];
                    tasks[i].subTasks.push(newItem);
                    return true;
                }
                if (tasks[i].subTasks && findAndAddTaskRecursive(tasks[i].subTasks)) return true;
            } return false;
        };
        if (!findAndAddTaskRecursive(parentItems[parentIndex][nestedArrayKey])) {
          return res.status(404).json({message: 'Parent task not found for sub-task.'});
        }
    } else {
        if (!parentItems[parentIndex][nestedArrayKey]) parentItems[parentIndex][nestedArrayKey] = [];
        parentItems[parentIndex][nestedArrayKey].push(newItem);
    }
    await simulateDBWrite();
    res.status(201).json(newItem);
  });

  nestedRouter.put(`/:${itemName}Id`, async (req, res) => {
    const parentItems = parentStoreAccessor(req);
    const parentIndex = parentItems.findIndex(p => p.id === req.params.airdropId);
    if (parentIndex === -1) return res.status(404).json({ message: 'Airdrop not found' });
    
    let updatedItemResult = null;
    const findAndUpdateRecursive = (items, itemId, updates) => {
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === itemId) { 
                items[i] = { ...items[i], ...updates, id: items[i].id }; // Preserve ID
                updatedItemResult = items[i]; 
                return true; 
            }
            if (itemName === 'task' && items[i].subTasks && findAndUpdateRecursive(items[i].subTasks, itemId, updates)) return true;
        } return false;
    };

    if (findAndUpdateRecursive(parentItems[parentIndex][nestedArrayKey], req.params[`${itemName}Id`], req.body)) {
        await simulateDBWrite();
        res.json(updatedItemResult);
    } else res.status(404).json({ message: `${itemName} not found` });
  });

  nestedRouter.delete(`/:${itemName}Id`, async (req, res) => {
    const parentItems = parentStoreAccessor(req);
    const parentIndex = parentItems.findIndex(p => p.id === req.params.airdropId);
    if (parentIndex === -1) return res.status(404).json({ message: 'Airdrop not found' });

    let itemFoundAndRemoved = false;
    const removeItemRecursive = (items, itemId) => {
        const initialLength = items.length;
        const filteredItems = items.filter(item => item.id !== itemId);
        if (filteredItems.length < initialLength) { itemFoundAndRemoved = true; return filteredItems; }
        if (itemName === 'task') {
            return items.map(item => {
                if (item.subTasks) { return {...item, subTasks: removeItemRecursive(item.subTasks, itemId)};}
                return item;
            });
        }
        return items;
    };
    parentItems[parentIndex][nestedArrayKey] = removeItemRecursive(parentItems[parentIndex][nestedArrayKey] || [], req.params[`${itemName}Id`]);

    if (itemFoundAndRemoved) {
      await simulateDBWrite();
      res.status(200).json({ message: `${itemName} deleted` });
    } else res.status(404).json({ message: `${itemName} not found` });
  });
  return nestedRouter;
}

const getAirdropsForUser = (req) => airdropsStore[req.user.id];

router.use('/:airdropId/tasks', createNestedCRUDRoutes(router, getAirdropsForUser, 'tasks', 'task', ['description']));
router.use('/:airdropId/transactions', createNestedCRUDRoutes(router, getAirdropsForUser, 'transactions', 'transaction', ['hash', 'date']));
router.use('/:airdropId/claimed-tokens', createNestedCRUDRoutes(router, getAirdropsForUser, 'claimedTokens', 'claimedTokenLog', ['symbol', 'quantity']));
router.use('/:airdropId/sybil-checklist', createNestedCRUDRoutes(router, getAirdropsForUser, 'sybilChecklist', 'sybilChecklistItem', ['text']));
router.use('/:airdropId/roadmap-events', createNestedCRUDRoutes(router, getAirdropsForUser, 'roadmapEvents', 'roadmapEvent', ['description', 'dateEstimate', 'status']));
router.use('/:airdropId/custom-fields', createNestedCRUDRoutes(router, getAirdropsForUser, 'customFields', 'customField', ['key', 'value']));

// Task Batch Update (specific handling due to nested nature if taskIds can be from subtasks)
router.post('/:airdropId/tasks/batch-update', async (req, res) => {
    const userAirdrops = airdropsStore[req.user.id];
    const airdropIndex = userAirdrops.findIndex(a => a.id === req.params.airdropId);
    if (airdropIndex === -1) return res.status(404).json({ message: 'Airdrop not found' });
    const { taskIds, updates } = req.body;
    if (!Array.isArray(taskIds) || !updates) return res.status(400).json({ message: 'Invalid request' });
    let updatedCount = 0;
    const updateTasksRecursive = (tasks) => { 
        tasks.forEach(task => { 
            if (taskIds.includes(task.id)) { 
                // Apply only allowed updates
                const allowedTaskUpdates = ['completed', 'associatedWalletId', 'dueDate', 'timeSpentMinutes', 'linkedGasLogId', 'completionDate', 'notes', 'cost'];
                const validTaskUpdates = {};
                allowedTaskUpdates.forEach(key => {
                    if(updates.hasOwnProperty(key)) {
                        // @ts-ignore
                        validTaskUpdates[key] = updates[key];
                    }
                });
                Object.assign(task, validTaskUpdates); 
                updatedCount++; 
            } 
            if (task.subTasks) updateTasksRecursive(task.subTasks); 
        }); 
    };
    updateTasksRecursive(userAirdrops[airdropIndex].tasks);
    if(updatedCount > 0) await simulateDBWrite();
    res.json({ message: `Batch updated ${updatedCount} tasks.` });
});


// --- Nested Airdrop Specific Notification Settings ---
const notificationSettingsRouter = express.Router({ mergeParams: true });
notificationSettingsRouter.get('/', async (req, res) => {
    const userAirdrops = await simulateDBRead(airdropsStore[req.user.id]);
    const airdrop = userAirdrops.find(a => a.id === req.params.airdropId);
    if (!airdrop) return res.status(404).json({ message: 'Airdrop not found' });
    res.json(await simulateDBRead(airdrop.notificationOverrides || {})); 
});
notificationSettingsRouter.put('/', async (req, res) => {
    const userAirdrops = airdropsStore[req.user.id];
    const airdropIndex = userAirdrops.findIndex(a => a.id === req.params.airdropId);
    if (airdropIndex === -1) return res.status(404).json({ message: 'Airdrop not found' });
    const { taskDueDate, statusChange } = req.body; // Only accept specific keys
    let overrides = userAirdrops[airdropIndex].notificationOverrides || {};
    if (taskDueDate !== undefined) overrides.taskDueDate = taskDueDate;
    if (statusChange !== undefined) overrides.statusChange = statusChange;
    userAirdrops[airdropIndex].notificationOverrides = overrides;
    await simulateDBWrite();
    res.json(overrides);
});
router.use('/:airdropId/notification-settings', notificationSettingsRouter);


module.exports = router;