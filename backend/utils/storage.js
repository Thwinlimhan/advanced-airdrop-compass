const fs = require('fs').promises;
const path = require('path');

// Storage file paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AIRDROPS_FILE = path.join(DATA_DIR, 'airdrops.json');
const WALLETS_FILE = path.join(DATA_DIR, 'wallets.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic storage functions
async function readFile(filePath, defaultValue = []) {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return default value
      await writeFile(filePath, defaultValue);
      return defaultValue;
    }
    console.error(`Error reading file ${filePath}:`, error);
    return defaultValue;
  }
}

async function writeFile(filePath, data) {
  try {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

// User storage functions
async function getUsers() {
  return await readFile(USERS_FILE, []);
}

async function saveUsers(users) {
  return await writeFile(USERS_FILE, users);
}

async function addUser(user) {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
  return user;
}

async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find(user => user.email === email);
}

async function findUserById(id) {
  const users = await getUsers();
  return users.find(user => user.id === id);
}

async function updateUser(userId, updates) {
  const users = await getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    await saveUsers(users);
    return users[userIndex];
  }
  return null;
}

// Data storage functions (for airdrops, wallets, etc.)
async function getUserData(userId, dataType) {
  const fileMap = {
    airdrops: AIRDROPS_FILE,
    wallets: WALLETS_FILE,
    tasks: TASKS_FILE,
    settings: SETTINGS_FILE
  };
  
  const filePath = fileMap[dataType];
  if (!filePath) {
    throw new Error(`Unknown data type: ${dataType}`);
  }
  
  const allData = await readFile(filePath, {});
  return allData[userId] || getDefaultData(dataType);
}

async function saveUserData(userId, dataType, data) {
  const fileMap = {
    airdrops: AIRDROPS_FILE,
    wallets: WALLETS_FILE,
    tasks: TASKS_FILE,
    settings: SETTINGS_FILE
  };
  
  const filePath = fileMap[dataType];
  if (!filePath) {
    throw new Error(`Unknown data type: ${dataType}`);
  }
  
  const allData = await readFile(filePath, {});
  allData[userId] = data;
  await writeFile(filePath, allData);
}

// Default data structures
function getDefaultData(dataType) {
  switch (dataType) {
    case 'airdrops':
      return [];
    case 'wallets':
      return [];
    case 'tasks':
      return [];
    case 'settings':
      return {
        theme: 'light',
        defaultGasNetworks: ['Ethereum', 'Solana', 'Arbitrum', 'Polygon'],
        notificationsEnabled: true,
        language: 'en',
        userPoints: 0,
        currentStreak: 0,
        lastTaskCompletionDate: null
      };
    default:
      return [];
  }
}

// Backup and restore functions
async function backupData() {
  const backupDir = path.join(DATA_DIR, 'backup', new Date().toISOString().split('T')[0]);
  await fs.mkdir(backupDir, { recursive: true });
  
  const files = [USERS_FILE, AIRDROPS_FILE, WALLETS_FILE, TASKS_FILE, SETTINGS_FILE];
  
  for (const file of files) {
    try {
      const data = await fs.readFile(file, 'utf8');
      const fileName = path.basename(file);
      await fs.writeFile(path.join(backupDir, fileName), data);
    } catch (error) {
      console.log(`No backup needed for ${file}: ${error.message}`);
    }
  }
  
  console.log(`Backup created at: ${backupDir}`);
}

// Initialize storage
async function initializeStorage() {
  await ensureDataDir();
  console.log('📁 Storage initialized at:', DATA_DIR);
}

module.exports = {
  // User functions
  getUsers,
  saveUsers,
  addUser,
  findUserByEmail,
  findUserById,
  updateUser,
  
  // Data functions
  getUserData,
  saveUserData,
  
  // Utility functions
  initializeStorage,
  backupData,
  
  // File paths (for debugging)
  DATA_DIR,
  USERS_FILE
}; 