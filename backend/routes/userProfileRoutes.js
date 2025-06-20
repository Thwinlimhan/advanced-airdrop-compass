const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

let userProfileStore = {}; // { userId: { badges: [], userPoints: 0, currentStreak: 0, lastTaskCompletionDate: null, preferences: {} } }

const DEFAULT_USER_BADGES_FROM_CONSTANTS_FILE = [ 
  { id: 'welcome_farmer', name: 'Welcome Farmer!', description: 'Successfully set up and started using the Airdrop Compass.', iconName: 'Sparkles' },
  { id: 'first_airdrop_logged', name: 'Airdrop Initiate', description: 'Logged your first airdrop.', iconName: 'Droplets' },
  { id: 'ten_tasks_completed', name: 'Task Explorer', description: 'Completed 10 tasks across all airdrops.', iconName: 'ListChecks' },
  { id: 'wallet_master', name: 'Wallet Master', description: 'Added 3 or more wallets.', iconName: 'WalletCards' },
  { id: 'strategy_guru', name: 'Strategy Guru', description: 'Created 5 strategy notes.', iconName: 'NotebookPen' },
  { id: 'points_milestone_1000', name: 'Point Collector', description: 'Earned 1000 points.', iconName: 'Star' },
  { id: 'points_milestone_5000', name: 'Point Hoarder', description: 'Earned 5000 points.', iconName: 'Award' },
  { id: 'daily_streak_3', name: '3-Day Task Streak', description: 'Completed tasks on 3 different days in a row.', iconName: 'CalendarCheck' },
  { id: 'daily_streak_7', name: '7-Day Task Streak', description: 'Completed tasks on 7 different days in a row.', iconName: 'Award' },
  { id: 'daily_streak_30', name: '30-Day Task Master', description: 'Completed tasks on 30 different days in a row.', iconName: 'Star' },
  { id: 'yield_pioneer', name: 'Yield Pioneer', description: 'Logged your first yield farming position.', iconName: 'DatabaseIcon' }, 
  { id: 'portfolio_pro', name: 'Portfolio Pro', description: 'Achieved a simulated portfolio value of $10,000.', iconName: 'BarChart3' }, 
];

const DEFAULT_USER_PREFERENCES = {
  riskTolerance: 'Medium',
  capital: '$100-$500',
  preferredChains: [], // Default to empty, user can add
  timeCommitment: '<5 hrs/wk',
};

const ensureUserProfileStore = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated properly for profile store.' });
  }
  if (!userProfileStore[req.user.id]) {
    userProfileStore[req.user.id] = {
      userId: req.user.id,
      badges: DEFAULT_USER_BADGES_FROM_CONSTANTS_FILE.map(b => ({ ...b, achieved: false, achievedDate: undefined })),
      userPoints: 0,
      currentStreak: 0,
      lastTaskCompletionDate: null,
      preferences: JSON.parse(JSON.stringify(DEFAULT_USER_PREFERENCES)),
    };
  } else {
    // Ensure all sub-objects/keys exist if profile was partially initialized before
    if (!userProfileStore[req.user.id].preferences) {
        userProfileStore[req.user.id].preferences = JSON.parse(JSON.stringify(DEFAULT_USER_PREFERENCES));
    }
    if (userProfileStore[req.user.id].userPoints === undefined) userProfileStore[req.user.id].userPoints = 0;
    if (userProfileStore[req.user.id].currentStreak === undefined) userProfileStore[req.user.id].currentStreak = 0;
    if (userProfileStore[req.user.id].lastTaskCompletionDate === undefined) userProfileStore[req.user.id].lastTaskCompletionDate = null;
    if (!userProfileStore[req.user.id].badges) {
        userProfileStore[req.user.id].badges = DEFAULT_USER_BADGES_FROM_CONSTANTS_FILE.map(b => ({ ...b, achieved: false, achievedDate: undefined }));
    } else {
        // Ensure all default badges definitions are present in user's badge list
        DEFAULT_USER_BADGES_FROM_CONSTANTS_FILE.forEach(defaultBadge => {
            if (!userProfileStore[req.user.id].badges.find(ub => ub.id === defaultBadge.id)) {
                userProfileStore[req.user.id].badges.push({ ...defaultBadge, achieved: false, achievedDate: undefined });
            }
        });
    }
  }
  next();
};

router.use(authMiddleware);
router.use(ensureUserProfileStore);

// --- Helper for simulated async DB calls ---
const simulateDBWrite = () => new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
const simulateDBRead = async (data) => {
  await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
  return data;
};

// GET /api/v1/user-profile/badges
router.get('/badges', async (req, res) => {
  const profile = await simulateDBRead(userProfileStore[req.user.id]);
  res.json(profile.badges || []);
});

// GET /api/v1/user-profile/badges/:badgeId
router.get('/badges/:badgeId', async (req, res) => {
    const badgeId = req.params.badgeId;
    const badgeDefinition = DEFAULT_USER_BADGES_FROM_CONSTANTS_FILE.find(b => b.id === badgeId);
    if (badgeDefinition) {
        const profile = await simulateDBRead(userProfileStore[req.user.id]);
        const userBadge = profile.badges.find(b => b.id === badgeId);
        res.json({ ...badgeDefinition, achieved: userBadge?.achieved || false, achievedDate: userBadge?.achievedDate });
    } else {
        res.status(404).json({ message: 'Badge definition not found.' });
    }
});

// POST /api/v1/user-profile/badges/:badgeId/achieve
router.post('/badges/:badgeId/achieve', async (req, res) => {
    const badgeId = req.params.badgeId;
    const profile = userProfileStore[req.user.id];
    const badgeIndex = profile.badges.findIndex(b => b.id === badgeId);

    if (badgeIndex > -1) {
        if (!profile.badges[badgeIndex].achieved) {
            profile.badges[badgeIndex].achieved = true;
            profile.badges[badgeIndex].achievedDate = new Date().toISOString();
            await simulateDBWrite();
            res.json({ message: `Badge ${badgeId} marked as achieved.`, badge: profile.badges[badgeIndex] });
        } else {
            res.json({ message: `Badge ${badgeId} was already achieved.`, badge: profile.badges[badgeIndex] });
        }
    } else {
        // If badge wasn't in profile.badges but is a default one, add it as achieved.
        const defaultBadgeDef = DEFAULT_USER_BADGES_FROM_CONSTANTS_FILE.find(b => b.id === badgeId);
        if (defaultBadgeDef) {
            const newAchievedBadge = { ...defaultBadgeDef, achieved: true, achievedDate: new Date().toISOString() };
            profile.badges.push(newAchievedBadge);
            await simulateDBWrite();
            return res.json({ message: `Badge ${badgeId} newly achieved and added.`, badge: newAchievedBadge });
        }
        res.status(404).json({ message: 'Badge ID not found.' });
    }
});

// POST /api/v1/user-profile/check-badges (Conceptual: server-side logic for complex badges)
router.post('/check-badges', async (req, res) => {
  const profile = userProfileStore[req.user.id];
  // Example: Check for 'first_airdrop_logged' badge if not achieved
  const firstAirdropBadge = profile.badges.find(b => b.id === 'first_airdrop_logged');
  const userAirdrops = require('./airdropRoutes').airdropsStore?.[req.user.id] || []; // Accessing another store (conceptual)

  if (firstAirdropBadge && !firstAirdropBadge.achieved && userAirdrops.length > 0) {
    firstAirdropBadge.achieved = true;
    firstAirdropBadge.achievedDate = new Date().toISOString();
    await simulateDBWrite();
    console.log(`Server awarded 'first_airdrop_logged' badge to user ${req.user.id}`);
  }
  // Add more server-side badge logic here if needed
  res.json({ message: 'Server-side badge check process complete (conceptual)', badges: profile.badges });
});

// GET /api/v1/user-profile/points
router.get('/points', async (req, res) => {
    const profile = await simulateDBRead(userProfileStore[req.user.id]);
    res.json({ userPoints: profile.userPoints });
});

// PUT /api/v1/user-profile/points
router.put('/points', async (req, res) => {
    const { pointsToAdd } = req.body;
    if (typeof pointsToAdd === 'number') {
        userProfileStore[req.user.id].userPoints = (userProfileStore[req.user.id].userPoints || 0) + pointsToAdd;
        await simulateDBWrite();
        res.json({ userPoints: userProfileStore[req.user.id].userPoints });
    } else {
        res.status(400).json({ message: 'Invalid points value. Must be a number.' });
    }
});

// GET /api/v1/user-profile/streak
router.get('/streak', async (req, res) => {
    const profile = await simulateDBRead(userProfileStore[req.user.id]);
    res.json({ 
        currentStreak: profile.currentStreak,
        lastTaskCompletionDate: profile.lastTaskCompletionDate
    });
});

// PUT /api/v1/user-profile/streak
router.put('/streak', async (req, res) => {
    const { taskCompletedOnDate } = req.body; 
    const dateRegex = /^\\d{4}-\\d{2}-\\d{2}$/; // YYYY-MM-DD
    if (!taskCompletedOnDate || typeof taskCompletedOnDate !== 'string' || !dateRegex.test(taskCompletedOnDate)) {
        return res.status(400).json({ message: 'Valid taskCompletedOnDate (YYYY-MM-DD string) is required.' });
    }
    const profile = userProfileStore[req.user.id];
    
    if (profile.lastTaskCompletionDate !== taskCompletedOnDate) { 
        const today = new Date(taskCompletedOnDate); // Use provided date for comparison logic
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        if (profile.lastTaskCompletionDate === yesterdayString) {
            profile.currentStreak = (profile.currentStreak || 0) + 1;
        } else { 
            profile.currentStreak = 1; // Reset or start streak
        }
        profile.lastTaskCompletionDate = taskCompletedOnDate;
        await simulateDBWrite();
    }
    res.json({
        currentStreak: profile.currentStreak,
        lastTaskCompletionDate: profile.lastTaskCompletionDate
    });
});

// GET /api/v1/user-profile/preferences
router.get('/preferences', async (req, res) => {
    const profile = await simulateDBRead(userProfileStore[req.user.id]);
    res.json(profile.preferences || DEFAULT_USER_PREFERENCES);
});

// PUT /api/v1/user-profile/preferences
router.put('/preferences', async (req, res) => {
    const profile = userProfileStore[req.user.id];
    const { riskTolerance, capital, preferredChains, timeCommitment } = req.body;
    
    const updatedPreferences = { ...profile.preferences }; // Start with existing or default
    if (riskTolerance !== undefined) updatedPreferences.riskTolerance = riskTolerance;
    if (capital !== undefined) updatedPreferences.capital = capital;
    if (preferredChains !== undefined && Array.isArray(preferredChains)) updatedPreferences.preferredChains = preferredChains;
    if (timeCommitment !== undefined) updatedPreferences.timeCommitment = timeCommitment;

    profile.preferences = updatedPreferences;
    await simulateDBWrite();
    res.json(profile.preferences);
});

module.exports = router;