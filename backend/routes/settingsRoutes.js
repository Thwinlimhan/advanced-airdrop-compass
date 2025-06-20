const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let userSettingsStore = {}; // { userId: { theme: 'light', ..., customTransactionCategories: [], taskKeywordNotificationSettings: {} } }

const DEFAULT_SETTINGS_BACKEND = {
  theme: 'dark', 
  defaultGasNetworks: ['Ethereum', 'Solana', 'Arbitrum', 'Polygon'],
  notificationsEnabled: true,
  customTransactionCategories: ['Gas Fee', 'Swap', 'Bridge', 'Mint', 'NFT Purchase', 'NFT Sale', 'Staking', 'Unstaking', 'Claim Rewards', 'Other'],
  taskKeywordNotificationSettings: { "urgent": true, "snapshot": true },
  accentColor: '#885AF8', 
  fontFamily: "Inter",    
  dashboardWidgetVisibility: { summary: true, gas: true, priorityTasks: true, alerts: true, userStats: true, aiDiscovery: true },
  dashboardWidgetOrder: ['summary', 'userStats', 'aiDiscovery', 'gas', 'priorityTasks', 'alerts'],
  dashboardWidgetConfigs: { 
    summary: {type:'summary-standard', size:'2x1'}, 
    gas: {type:'gas-list', size:'1x1'}, 
    priorityTasks: {type:'tasks-detailed', size:'2x2'}, 
    alerts: {type:'alerts',size:'1x1'}, 
    userStats:{type:'userStats',size:'1x1'}, 
    aiDiscovery:{type:'aiDiscovery', size:'1x1'}
  },
  language: 'en',
  tutorialsCompleted: {},
  airdropCardLayout: { showTags: true, showDescriptionSnippet: true, showPriority: true, showMyStatus: true, showOfficialStatus: true, showPotential: true, showProgressBar: true },
  defaultAirdropNotificationSettings: { taskDueDate: true, statusChange: true },
  userPreferences: { riskTolerance: 'Medium', capital: '$100-$500', preferredChains: [], timeCommitment: '<5 hrs/wk' },
  // Note: userPoints, currentStreak, lastTaskCompletionDate are managed in userProfileRoutes
};

const deepMerge = (target, source) => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) Object.assign(output, { [key]: source[key] });
                else output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
};
const isObject = (item) => item && typeof item === 'object' && !Array.isArray(item);


const ensureUserSettingsStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly for settings store.'});
  }
  if (!userSettingsStore[req.user.id]) {
    userSettingsStore[req.user.id] = JSON.parse(JSON.stringify(DEFAULT_SETTINGS_BACKEND));
  } else {
    // Ensure all keys from default exist, for users with older settings objects (deep merge for nested)
    userSettingsStore[req.user.id] = deepMerge(JSON.parse(JSON.stringify(DEFAULT_SETTINGS_BACKEND)), userSettingsStore[req.user.id]);
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserSettingsStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/settings
router.get('/', async (req, res) => {
  const settings = await simulateDBRead(userSettingsStore[req.user.id]);
  res.json(settings);
});

// PUT /api/v1/settings
router.put('/', async (req, res) => {
  const currentUserSettings = userSettingsStore[req.user.id];
  const newSettingsUpdate = req.body;
  
  userSettingsStore[req.user.id] = deepMerge(currentUserSettings, newSettingsUpdate);
  
  await simulateDBWrite();
  res.json(userSettingsStore[req.user.id]);
});


// --- Custom Transaction Categories ---
router.get('/transaction-categories', async (req, res) => {
    const settings = await simulateDBRead(userSettingsStore[req.user.id]);
    res.json(settings.customTransactionCategories || []);
});

router.post('/transaction-categories', async (req, res) => {
    const { category } = req.body;
    if (!category || typeof category !== 'string' || category.trim() === '') {
        return res.status(400).json({ message: 'Category name is required and must be a non-empty string.' });
    }
    const settings = userSettingsStore[req.user.id];
    const categoryTrimmed = category.trim();
    const categoryTrimmedLower = categoryTrimmed.toLowerCase();

    if (!settings.customTransactionCategories.map(c => c.toLowerCase()).includes(categoryTrimmedLower)) {
        settings.customTransactionCategories.push(categoryTrimmed);
        await simulateDBWrite();
        res.status(201).json({ message: 'Category added', categories: settings.customTransactionCategories });
    } else {
        res.status(409).json({ message: 'Category already exists' });
    }
});

router.delete('/transaction-categories/:categoryName', async (req, res) => {
    const { categoryName } = req.params;
    const settings = userSettingsStore[req.user.id];
    const initialLength = settings.customTransactionCategories.length;
    const categoryNameLower = categoryName.toLowerCase();
    settings.customTransactionCategories = settings.customTransactionCategories.filter(c => c.toLowerCase() !== categoryNameLower);

    if (settings.customTransactionCategories.length < initialLength) {
        await simulateDBWrite();
        res.status(200).json({ message: 'Category deleted', categories: settings.customTransactionCategories });
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

// --- Task Keyword Notification Settings ---
router.get('/task-keyword-notifications', async (req, res) => {
    const settings = await simulateDBRead(userSettingsStore[req.user.id]);
    res.json(settings.taskKeywordNotificationSettings || {});
});

router.put('/task-keyword-notifications', async (req, res) => {
    const newKeywordSettings = req.body;
    if (typeof newKeywordSettings !== 'object' || newKeywordSettings === null) {
        return res.status(400).json({ message: 'Invalid format for task keyword notifications. Expected an object.' });
    }
    // Basic validation for keywords and boolean values
    for (const key in newKeywordSettings) {
        if (typeof newKeywordSettings[key] !== 'boolean') {
             return res.status(400).json({ message: `Invalid value for keyword '${key}'. Must be boolean.` });
        }
    }
    const settings = userSettingsStore[req.user.id];
    settings.taskKeywordNotificationSettings = { ...settings.taskKeywordNotificationSettings, ...newKeywordSettings };
    await simulateDBWrite();
    res.status(200).json(settings.taskKeywordNotificationSettings);
});


router.post('/task-keyword-notifications', async (req, res) => {
    const { keyword, enabled } = req.body;
    if (typeof keyword !== 'string' || keyword.trim() === '' || typeof enabled !== 'boolean') {
        return res.status(400).json({ message: 'Keyword (string) and enabled (boolean) are required.' });
    }
    const settings = userSettingsStore[req.user.id];
    if (!settings.taskKeywordNotificationSettings) settings.taskKeywordNotificationSettings = {};
    settings.taskKeywordNotificationSettings[keyword.trim().toLowerCase()] = enabled;
    await simulateDBWrite();
    res.status(201).json(settings.taskKeywordNotificationSettings); // Changed to 201 for creation
});

router.delete('/task-keyword-notifications/:keyword', async (req, res) => {
    const { keyword } = req.params;
    const settings = userSettingsStore[req.user.id];
    if (settings.taskKeywordNotificationSettings && settings.taskKeywordNotificationSettings.hasOwnProperty(keyword.toLowerCase())) {
        delete settings.taskKeywordNotificationSettings[keyword.toLowerCase()];
        await simulateDBWrite();
        res.status(200).json(settings.taskKeywordNotificationSettings);
    } else {
        res.status(404).json({ message: 'Keyword notification setting not found.' });
    }
});

module.exports = router;