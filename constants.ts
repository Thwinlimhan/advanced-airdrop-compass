import { AppSettings, NavItem, Theme, AirdropStatus, GasPrice, LearningResource, SybilChecklistItem, BLOCKCHAIN_EXPLORERS_TYPE, RoadmapEvent, ConfidenceLevel, AirdropPriority, WidgetKey, TaskFrequency, AirdropCardLayoutSettings, AirdropNotificationSettings, UserBadge, DayOfWeek, AirdropProjectCategory, UserFarmingPreferences } from './types';
import { LayoutDashboard, Droplets, ListChecks, GraduationCap, Settings, WalletCards, BarChart3, Eye, FileText, UserCircle, BookOpen, BookMarked, NotebookPen, Brain, Newspaper, Sparkles, DatabaseIcon, Briefcase, Award, Star, ShieldCheck, Lightbulb, Bot, Route as RouteIconLucide, TestTube2, Languages, Cog as AutomationIcon, Settings as PageCogIcon, PieChart, Activity, Share2, CalendarCheck, Lock, Coins, ImageUp as ImageIconLucide, Users, Percent, DollarSign as DollarSignIcon, AlertTriangle, CheckCircle as CheckCircleIcon, GitFork, Link2, MapPin, ShieldAlert, HelpCircle, Power as PowerIcon, ListPlus, Download as DownloadIcon, Timer as TimerIcon, Repeat as RepeatIcon, ArrowRightLeft, Bell as BellIcon, History as HistoryIcon, Play, LogIn, UserPlus } from 'lucide-react'; // Added Play, LogIn, UserPlus icons

export const APP_NAME = "Advanced Crypto Airdrop Compass";
export const LOCAL_STORAGE_KEY = 'cryptoAirdropCompassData';
export const AUTH_TOKEN_KEY = 'cryptoAirdropCompassAuthToken'; // New
export const CURRENT_USER_KEY = 'cryptoAirdropCompassCurrentUser'; // New
export const API_BASE_URL = 'http://localhost:3001/api/v1'; // Backend API URL


export const DEFAULT_AIRDROP_CARD_LAYOUT: AirdropCardLayoutSettings = {
  showTags: true,
  showDescriptionSnippet: true,
  showPriority: true,
  showMyStatus: true,
  showOfficialStatus: true,
  showPotential: true,
  showProgressBar: true,
};

export const DEFAULT_TRANSACTION_CATEGORIES: string[] = ['Gas Fee', 'Swap', 'Bridge', 'Mint', 'NFT Purchase', 'NFT Sale', 'Staking', 'Unstaking', 'Claim Rewards', 'Other'];
export const DEFAULT_TASK_NOTIFICATION_KEYWORDS: Record<string,boolean> = {
    "urgent": true,
    "snapshot": true,
    "final reminder": true,
    "testnet phase end": true,
};

export const DEFAULT_AIRDROP_NOTIFICATION_SETTINGS: Required<AirdropNotificationSettings> = {
  taskDueDate: true,
  statusChange: true,
};

export const DEFAULT_USER_FARMING_PREFERENCES: UserFarmingPreferences = {
  riskTolerance: 'Medium',
  capital: '$100-$500',
  preferredChains: ['Ethereum', 'Solana'],
  timeCommitment: '5-10 hrs/wk',
  automations: {
    autoClaim: false,
    autoCompound: false,
  },
  preferredStrategies: ['DEX Trading', 'Lending', 'Yield Farming'],
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: Theme.LIGHT,
  defaultGasNetworks: ['Ethereum', 'Solana', 'Arbitrum', 'Polygon'],
  notificationsEnabled: true,
  dashboardWidgetVisibility: {
    summary: true,
    gas: true,
    priorityTasks: true,
    alerts: true,
    userStats: true,
    aiDiscovery: true,
  } as Record<WidgetKey, boolean>,
  dashboardWidgetOrder: ['summary', 'userStats', 'aiDiscovery', 'gas', 'priorityTasks', 'alerts'] as WidgetKey[],
  dashboardWidgetConfigs: { 
    summary: { type: 'summary-standard', size: '2x1'},
    gas: { type: 'gas-list', size: '1x1' },
    priorityTasks: { type: 'tasks-detailed', size: '2x2'},
    alerts: { type: 'alerts', size: '1x1'},
    userStats: {type: 'userStats', size: '1x1'},
    aiDiscovery: {type: 'aiDiscovery', size: '1x1'},
  },
  language: 'en', 
  fontFamily: "System Default", 
  tutorialsCompleted: {
      dashboardTourCompleted: false,
      addAirdropTutorialCompleted: false,
  },
  userPoints: 0,
  airdropCardLayout: DEFAULT_AIRDROP_CARD_LAYOUT,
  customTransactionCategories: [...DEFAULT_TRANSACTION_CATEGORIES], 
  defaultAirdropNotificationSettings: DEFAULT_AIRDROP_NOTIFICATION_SETTINGS,
  taskKeywordNotificationSettings: DEFAULT_TASK_NOTIFICATION_KEYWORDS, 
  accentColor: '#4f46e5',
  currentStreak: 0,
  lastTaskCompletionDate: null,
  userPreferences: DEFAULT_USER_FARMING_PREFERENCES,
  aiProvider: 'ollama',
  aiApiKey: '',
  aiModel: 'auto',
  emailNotifications: false,
};

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'nav_dashboard', path: '/', icon: LayoutDashboard, authRequired: true },
  { id: 'watchlist', label: 'nav_watchlist', path: '/watchlist', icon: Eye, authRequired: true },
  { id: 'airdrop_tracker', label: 'nav_airdrop_tracker', path: '/airdrops', icon: Droplets, authRequired: true },
  { id: 'recurring_tasks', label: 'nav_recurring_tasks', path: '/tasks', icon: ListChecks, authRequired: true },
  { id: 'portfolio', label: 'nav_portfolio_overview', path: '/portfolio', icon: BarChart3, authRequired: true },
  { id: 'yield_tracker', label: 'nav_yield_tracker', path: '/yield-tracker', icon: DatabaseIcon, authRequired: true },
  { id: 'reports', label: 'nav_reports', path: '/reports', icon: Briefcase, authRequired: true },
  { id: 'learning_platform', label: 'nav_learning_hub', path: '/learning', icon: GraduationCap, authRequired: true },
  { id: 'analytics_hub', label: 'nav_analytics_hub', path: '/analytics', icon: TestTube2, authRequired: true }, 
  { id: 'tools_aggregator', label: 'nav_aggregator_tools', path: '/tools/aggregator', icon: RouteIconLucide, authRequired: true },
  { id: 'wallet_manager', label: 'nav_wallet_manager', path: '/wallets', icon: WalletCards, authRequired: true },
  { id: 'achievements', label: 'nav_achievements', path: '/achievements', icon: Award, authRequired: true }, 
  { id: 'notification_center', label: 'notification_center', path: '/notifications', icon: BellIcon, authRequired: true }, 
  { id: 'user_profile', label: 'nav_user_profile', path: '/profile', icon: UserCircle, authRequired: true }, // Added
  { id: 'settings', label: 'nav_settings', path: '/settings', icon: Settings, authRequired: true },
  { id: 'login', label: 'login_title', path: '/login', icon: LogIn, publicOnly: true },
  { id: 'register', label: 'register_title', path: '/register', icon: UserPlus, publicOnly: true },
];

export const LEARNING_HUB_SUB_NAV: NavItem[] = [
    { id: 'guides', label: 'Guides', path: '/learning/guides', icon: BookOpen, authRequired: true },
    { id: 'glossary', label: 'Glossary', path: '/learning/glossary', icon: BookMarked, authRequired: true },
    { id: 'sybilPrevention', label: 'Sybil Prevention', path: '/learning/sybilPrevention', icon: ShieldCheck, authRequired: true },
    { id: 'notebook', label: 'Strategy Notebook', path: '/learning/notebook', icon: NotebookPen, authRequired: true },
    { id: 'aiStrategy', label: 'AI Farming Strategist', path: '/learning/aiStrategy', icon: Lightbulb, authRequired: true }, 
    { id: 'aiAnalyst', label: 'AI Data Analyst', path: '/learning/aiAnalyst', icon: Bot, authRequired: true }, 
    { id: 'newsAnalysis', label: 'AI News Summarizer', path: '/learning/newsAnalysis', icon: Newspaper, authRequired: true }, 
    { id: 'tutorials', label: 'Interactive Tutorials', path: '/learning/tutorials', icon: Play, authRequired: true }, 
];


export const BLOCKCHAIN_OPTIONS = ['Ethereum', 'Solana', 'Arbitrum', 'Polygon', 'BNB Chain', 'Avalanche', 'Optimism', 'Base', 'zkSync', 'StarkNet', 'Sui', 'Aptos', 'Cosmos Hub', 'Celestia', 'EigenLayer', 'Other'];
export const AIRDROP_STATUS_OPTIONS: AirdropStatus[] = Object.values(AirdropStatus);
export const MY_AIRDROP_STATUS_OPTIONS: AirdropStatus[] = [AirdropStatus.NOT_STARTED, AirdropStatus.IN_PROGRESS, AirdropStatus.COMPLETED];
export const AIRDROP_POTENTIAL_OPTIONS = ['Low', 'Medium', 'High', 'Very High', 'Unknown'];
export const AIRDROP_PRIORITY_OPTIONS: AirdropPriority[] = Object.values(AirdropPriority);

export const AIRDROP_PROJECT_CATEGORIES: AirdropProjectCategory[] = ['DEX', 'Lending', 'NFT Marketplace', 'Bridge', 'L1', 'L2', 'Gaming', 'Infrastructure', 'SocialFi', 'DePIN', 'Oracle', 'Other'];


export const TASK_FREQUENCY_OPTIONS: {value: TaskFrequency, label: string}[] = [
    {value: TaskFrequency.DAILY, label: "Daily"},
    {value: TaskFrequency.WEEKLY, label: "Weekly"},
    {value: TaskFrequency.MONTHLY, label: "Monthly"},
    {value: TaskFrequency.EVERY_X_DAYS, label: "Every X Days"},
    {value: TaskFrequency.SPECIFIC_DAYS_OF_WEEK, label: "Specific Days of Week"},
    {value: TaskFrequency.EVERY_X_WEEKS_ON_DAY, label: "Every X Weeks on Specific Day"},
    {value: TaskFrequency.NTH_WEEKDAY_OF_MONTH, label: "Nth Weekday of Month"}, 
    {value: TaskFrequency.SPECIFIC_DATES, label: "On Specific Dates"},
    {value: TaskFrequency.ONE_TIME, label: "One Time"},
];

export const DAYS_OF_WEEK: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


export const CONFIDENCE_LEVELS: ConfidenceLevel[] = Object.values(ConfidenceLevel);
export const ROADMAP_EVENT_STATUSES: RoadmapEvent['status'][] = ['Rumored', 'Confirmed', 'Completed', 'Delayed', 'Speculation'];


export const MOCK_GAS_PRICES: GasPrice[] = [ 
    { network: 'Ethereum', price: '20 Gwei', lastUpdated: new Date().toLocaleTimeString(), source: 'estimate' },
    { network: 'Arbitrum', price: '0.1 Gwei', lastUpdated: new Date().toLocaleTimeString(), source: 'estimate' },
    { network: 'Solana', price: '0.00001 SOL', lastUpdated: new Date().toLocaleTimeString(), source: 'estimate' },
    { network: 'Polygon', price: '30 Gwei', lastUpdated: new Date().toLocaleTimeString(), source: 'estimate' },
];

export const MOCK_ALERTS: string[] = [
    "LayerZero snapshot might be soon! Complete weekly tasks.",
    "New airdrop 'ZetaChain' confirmed. Check eligibility.",
    "Reminder: Ethereum gas fees are low, good time for mainnet transactions.",
];

export const MOCK_GUIDES: LearningResource[] = [
  { id: 'g1', type: 'guide', title: 'Sybil Attack Prevention 101', content: 'Detailed guide on how to avoid being flagged as a sybil attacker. Covers wallet hygiene, IP diversity, and interaction patterns.', category: 'Security', author: 'Compass Team' },
  { id: 'g2', type: 'guide', title: 'Optimizing Gas Fees on Ethereum', content: 'Strategies to save on gas fees, including timing transactions, using L2s, and understanding EIP-1559.', category: 'Transactions', author: 'Compass Team' },
  { id: 'g3', type: 'guide', title: 'LayerZero Explained', content: 'A deep dive into LayerZero protocol, its potential airdrop, and common interaction strategies.', category: 'Protocols', author: 'Compass Team' },
];

export const MOCK_GLOSSARY_TERMS: LearningResource[] = [
  { id: 'gl1', type: 'glossary', title: 'Airdrop', content: 'A distribution of a cryptocurrency token or coin, usually for free, to numerous wallet addresses. Airdrops are primarily implemented as a way of gaining attention and new followers, resulting in a larger user base and a wider disbursement of coins.' },
  { id: 'gl2', type: 'glossary', title: 'Gas Fees', content: 'Fees paid to network validators to process transactions on a blockchain. Prices vary based on network congestion.' },
  { id: 'gl3', type: 'glossary', title: 'Sybil Attack', content: 'An attack wherein a reputation system is subverted by creating a large number of pseudonymous identities and using them to gain a disproportionately large influence.' },
  { id: 'gl4', type: 'glossary', title: 'Snapshot', content: 'The act of recording the state of a blockchain at a specific block height. This is often used to determine eligibility for airdrops based on past activity or holdings.' },
];

export const DEFAULT_SYBIL_CHECKLIST_ITEMS: Omit<SybilChecklistItem, 'id' | 'completed' | 'notes'>[] = [
  { text: "Used a unique wallet address (not linked to other airdrop farming wallets)?" },
  { text: "Wallet has a history of organic/diverse transactions (not just for this airdrop)?" },
  { text: "Interacted with the protocol using varied amounts and at different times?" },
  { text: "Used a VPN or unique IP address for critical interactions (if concerned about IP tracking)?" },
  { text: "Avoided transferring funds directly between multiple participating wallets?" },
  { text: "Interaction patterns appear human-like (e.g., not executing tasks too quickly or robotically)?" },
  { text: "Met minimum transaction volume/count requirements if specified or rumored?" },
  { text: "Held required tokens/NFTs for the necessary duration if applicable?" },
  { text: "Active in community (Discord/Telegram) if it's a soft requirement?" },
  { text: "Funded wallet from a reputable source (e.g., major exchange, not another farming wallet)?" }
];

export const BLOCKCHAIN_EXPLORERS: BLOCKCHAIN_EXPLORERS_TYPE = {
    'Ethereum': { name: 'Etherscan', urlPattern: 'https://etherscan.io/address/{address}', txUrlPattern: 'https://etherscan.io/tx/{txHash}' },
    'Solana': { name: 'Solscan', urlPattern: 'https://solscan.io/account/{address}', txUrlPattern: 'https://solscan.io/tx/{txHash}' },
    'Arbitrum': { name: 'Arbiscan', urlPattern: 'https://arbiscan.io/address/{address}', txUrlPattern: 'https://arbiscan.io/tx/{txHash}' },
    'Polygon': { name: 'Polygonscan', urlPattern: 'https://polygonscan.com/address/{address}', txUrlPattern: 'https://polygonscan.com/tx/{txHash}' },
    'BNB Chain': { name: 'BSCScan', urlPattern: 'https://bscscan.com/address/{address}', txUrlPattern: 'https://bscscan.com/tx/{txHash}' },
    'Avalanche': { name: 'Snowtrace', urlPattern: 'https://snowtrace.io/address/{address}', txUrlPattern: 'https://snowtrace.io/tx/{txHash}' },
    'Optimism': { name: 'Optimistic Etherscan', urlPattern: 'https://optimistic.etherscan.io/address/{address}', txUrlPattern: 'https://optimistic.etherscan.io/tx/{txHash}' },
    'Base': { name: 'Basescan', urlPattern: 'https://basescan.org/address/{address}', txUrlPattern: 'https://basescan.org/tx/{txHash}' },
    'zkSync': { name: 'zkSync Explorer', urlPattern: 'https://explorer.zksync.io/address/{address}', txUrlPattern: 'https://explorer.zksync.io/tx/{txHash}' }, 
    'StarkNet': { name: 'StarkScan', urlPattern: 'https://starkscan.co/contract/{address}', txUrlPattern: 'https://starkscan.co/tx/{txHash}' },
    'Sui': { name: 'Sui Explorer', urlPattern: 'https://suiscan.xyz/mainnet/account/{address}', txUrlPattern: 'https://suiscan.xyz/mainnet/tx/{txHash}'},
    'Aptos': { name: 'Aptos Explorer', urlPattern: 'https://explorer.aptoslabs.com/account/{address}', txUrlPattern: 'https://explorer.aptoslabs.com/txn/{txHash}'},
    'Cosmos Hub': { name: 'Mintscan', urlPattern: 'https://www.mintscan.io/cosmos/account/{address}', txUrlPattern: 'https://www.mintscan.io/cosmos/txs/{txHash}'},
    'Celestia': { name: 'Mintscan', urlPattern: 'https://www.mintscan.io/celestia/account/{address}', txUrlPattern: 'https://www.mintscan.io/celestia/txs/{txHash}'},
    'EigenLayer': { name: 'Etherscan (EigenLayer Contract)', urlPattern: 'https://etherscan.io/address/{address}', txUrlPattern: 'https://etherscan.io/tx/{txHash}'}, 
};

export const COMMON_TASK_TEMPLATES: { name: string, tasks: { description: string }[] }[] = [
    {
        name: "Standard Social Tasks",
        tasks: [
            { description: "Follow project on Twitter/X" },
            { description: "Join project Discord server" },
            { description: "Join project Telegram group (if any)" },
            { description: "Like and Retweet key project announcements" }
        ]
    },
    {
        name: "Basic Testnet Interaction",
        tasks: [
            { description: "Request testnet tokens from faucet" },
            { description: "Perform a swap on the testnet DEX" },
            { description: "Bridge assets on the testnet (if applicable)" },
            { description: "Provide feedback if a form is available" }
        ]
    },
    {
        name: "NFT Project Engagement",
        tasks: [
            { description: "Mint an NFT from the official collection (if applicable)" },
            { description: "Join holder-specific channels in Discord" },
            { description: "Participate in community events for NFT holders" }
        ]
    }
];

export const MOCK_TOKEN_PRICES: Record<string, number> = { 
    "ETH": 3000, "WETH": 3000,
    "BTC": 60000, "WBTC": 60000,
    "SOL": 150,
    "ARB": 1.0,
    "OP": 1.8,
    "MATIC": 0.7,
    "USDC": 1, "USDT": 1, "DAI": 1, "USDC.E": 1,
    "PYTH": 0.5, "JUP": 1.2, "JTO": 3.0, "WIF": 2.5, "BONK": 0.00002,
    "STRK": 1.5, "ZK": 0.8, 
    "TIA": 10, 
    "EIGEN": 10, 
    "DEFAULT_UNPRICED_TOKEN": 0.01, 
};

export const COINGECKO_TOKEN_ID_MAP: Record<string, string> = {
  "ETH": "ethereum", "WETH": "weth",
  "BTC": "bitcoin", "WBTC": "wrapped-bitcoin",
  "SOL": "solana",
  "ARB": "arbitrum",
  "OP": "optimism",
  "MATIC": "matic-network", 
  "USDC": "usd-coin", "USDC.E": "usd-coin", 
  "USDT": "tether",
  "DAI": "dai",
  "PYTH": "pyth-network",
  "JUP": "jupiter-aggregator",
  "JTO": "jito-governance-token",
  "WIF": "dogwifcoin", 
  "BONK": "bonk",
  "STRK": "starknet",
  "ZK": "zkswap-finance", 
  "TIA": "celestia",
  "EIGEN": "eigenlayer", 
  "USDB": "usdb", 
  "BLAST": "blast", 
};

export const ETH_TOKEN_CONTRACT_MAP: Record<string, { contractAddress: string, decimals: number, name: string, coingeckoId?: string }> = {
  "USDC": { contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, name: "USD Coin", coingeckoId: "usd-coin" },
  "USDT": { contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, name: "Tether USD", coingeckoId: "tether" },
  "DAI": { contractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18, name: "Dai Stablecoin", coingeckoId: "dai" },
  "WETH": { contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18, name: "Wrapped Ether", coingeckoId: "weth"},
  "ARB": { contractAddress: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", decimals: 18, name: "Arbitrum", coingeckoId: "arbitrum" }, 
  "OP": { contractAddress: "0x4200000000000000000000000000000000000042", decimals: 18, name: "Optimism", coingeckoId: "optimism" }, 
  "LINK": { contractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18, name: "ChainLink Token", coingeckoId: "chainlink" },
  "UNI": { contractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18, name: "Uniswap", coingeckoId: "uniswap" },
  "SHIB": { contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18, name: "Shiba Inu", coingeckoId: "shiba-inu" },
  "PEPE": { contractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18, name: "Pepe", coingeckoId: "pepe" },
  "CRV": { contractAddress: "0xD533a949740bb3306d119CC777fa900bA034cd52", decimals: 18, name: "Curve DAO Token", coingeckoId: "curve-dao-token" },
};

export const SOL_SPL_TOKEN_INFO_MAP: Record<string, { mintAddress: string, decimals: number, name: string, coingeckoId?: string }> = {
    "USDC": { mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, name: "USD Coin (Solana)", coingeckoId: "usd-coin"},
    "BONK": { mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5, name: "Bonk", coingeckoId: "bonk"},
    "JUP": { mintAddress: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6, name: "Jupiter", coingeckoId: "jupiter-aggregator"},
    "mSOL": { mintAddress: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", decimals: 9, name: "Marinade Staked SOL", coingeckoId: "msol"},
    "JitoSOL": { mintAddress: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", decimals: 9, name: "Jito Staked SOL", coingeckoId: "jito-staked-sol"},
    "PYTH": { mintAddress: "HZ1JovNiVvGrGNiiYvEozEVgZ58AComD7qJYYzJ1h2nJ", decimals: 6, name: "Pyth Network", coingeckoId: "pyth-network" },
    "WIF": { mintAddress: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", decimals: 6, name: "dogwifhat", coingeckoId: "dogwifcoin" },
};

export const POLYGON_TOKEN_CONTRACT_MAP: Record<string, { contractAddress: string, decimals: number, name: string, coingeckoId?: string }> = {
  "USDC": { contractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6, name: "USD Coin (PoS)", coingeckoId: "usd-coin" }, 
  "WETH": { contractAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, name: "Wrapped Ether (PoS)", coingeckoId: "weth" },
  "WMATIC": { contractAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", decimals: 18, name: "Wrapped MATIC", coingeckoId: "wmatic"}, 
  "DAI": { contractAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18, name: "Dai Stablecoin (PoS)", coingeckoId: "dai" },
};


export const DEFAULT_USER_BADGES: Omit<UserBadge, 'achieved' | 'achievedDate'>[] = [
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

export const DISTINCT_COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5",
  "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"
];

export const CATEGORY_COLORS: Record<string, string> = {
    'Gas Fee': '#ff9999', 
    'Swap': '#66b3ff', 
    'Bridge': '#99ff99', 
    'Mint': '#ffcc99', 
    'NFT Purchase': '#f7b6d2', 
    'NFT Sale': '#c7c7c7', 
    'Staking': '#c5b0d5', 
    'Unstaking': '#dbdb8d', 
    'Claim Rewards': '#98df8a', 
    'Other': '#c49c94', 
    'Uncategorized': '#aec7e8', 
};

export const NETWORK_COLORS: Record<string, string> = {
    'Ethereum': '#627eea', 
    'Solana': '#9945ff', 
    'Arbitrum': '#28a0f0', 
    'Polygon': '#8247e5', 
    'BNB Chain': '#f0b90b', 
    'Avalanche': '#e84142', 
    'Optimism': '#ff0420', 
    'Base': '#0052ff', 
    'zkSync': '#1f1f1f', 
    'StarkNet': '#ff934f', 
    'Sui': '#20b2aa', 
    'Aptos': '#0075ff', 
    'Unknown/Other': '#a0a0a0', 
};
