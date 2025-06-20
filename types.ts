export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface GasLogEntry {
  id: string;
  date: string;
  amount: number; 
  currency: string; 
  description?: string;
  network?: string; 
  walletName?: string; // Added for getRecentWalletLogs
  walletId?: string; // Added for getRecentWalletLogs
}

export interface InteractionLogEntry {
  id: string;
  date: string;
  type: string; 
  description: string;
  network?: string;
  cost?: string; 
  relatedTxHash?: string;
  labels?: string[];
  category?: string;
  walletName?: string; // Added for getRecentWalletLogs
  walletId?: string; // Added for getRecentWalletLogs
}

export interface NftLogEntry {
  id: string; 
  name: string;
  collectionName: string; 
  tokenId?: string;
  contractAddress: string; 
  imageUrl?: string; 
  purchaseDate?: string; 
  purchasePrice?: string; 
  estimatedFloorPrice?: string; 
  notes?: string;
  purchaseLotId?: string; // For cost basis tracking
}

export interface BalanceSnapshot { 
  id: string;
  date: string;
  tokenSymbol: string;
  amount: number;
  notes?: string;
}

export interface TransactionHistoryEntry {
  id: string;
  hash: string;
  date: string;
  from: string;
  to: string;
  value: string; // e.g., "0.1 ETH"
  description?: string; // e.g., "Swap ETH for USDC"
  status: 'Success' | 'Failed' | 'Pending';
  gasUsed?: string;
  gasPrice?: string;
  fee?: string; // Total fee
  blockNumber?: number;
  isSimulated?: boolean;
}


export interface Wallet {
  id: string;
  name: string;
  address: string;
  blockchain: string;
  group?: string;
  balanceSnapshots?: BalanceSnapshot[]; 
  gasLogs?: GasLogEntry[];
  autoBalanceFetchEnabled?: boolean; 
  interactionLogs?: InteractionLogEntry[]; 
  nftPortfolio?: NftLogEntry[]; 
  isArchived?: boolean; 
  transactionHistory?: TransactionHistoryEntry[];
  lastSynced?: string; // Added for walletRoutes
}

export enum AirdropStatus {
  RUMORED = 'Rumored',
  CONFIRMED = 'Confirmed',
  LIVE = 'Live',
  ENDED = 'Ended',
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum AirdropPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface AirdropTask {
  id: string;
  description: string;
  completed: boolean;
  associatedWalletId?: string;
  dueDate?: string;
  timeSpentMinutes?: number;
  notes?: string;
  parentId?: string;
  subTasks?: AirdropTask[];
  cost?: string;
  linkedGasLogId?: string; 
  completionDate?: string; 
  dependsOnTaskIds?: string[]; 
  dependsOnAirdropMyStatusCompleted?: string; 
  tempId?: string; 
}

export interface ManualTransaction {
  id: string;
  hash: string;
  date: string;
  cost: string;
  notes?: string;
  airdropsId: string;
  labels?: string[]; 
  category?: string; 
  linkedGasLogId?: string; 
  linkedWalletId?: string; 
}

export interface ClaimedTokenLog {
  id: string;
  symbol: string;
  quantity: number;
  acquisitionCostPerToken?: number;
  salePricePerToken?: number;
  saleDate?: string;
  notes?: string;
  currentMarketPricePerToken?: number; 
  acquisitionLotId?: string; // For cost basis tracking
}

export interface SybilChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  notes?: string;
}

export interface RoadmapEvent {
  id: string;
  description: string;
  dateEstimate: string;
  status: 'Rumored' | 'Confirmed' | 'Completed' | 'Delayed' | 'Speculation';
  notes?: string;
}

export interface AirdropCustomField {
  id: string;
  key: string;
  value: string;
}

export interface AirdropNotificationSettings {
  taskDueDate?: boolean;    
  statusChange?: boolean;   
}

export type AirdropProjectCategory = 'DEX' | 'Lending' | 'NFT Marketplace' | 'Bridge' | 'L1' | 'L2' | 'Gaming' | 'Infrastructure' | 'SocialFi' | 'DePIN' | 'Oracle' | 'Other';


export interface Airdrop {
  id: string;
  projectName: string;
  blockchain: string;
  status: AirdropStatus;
  potential: string;
  myStatus: AirdropStatus;
  description?: string;
  officialLinks?: {
    website?: string;
    twitter?: string;
    discord?: string;
  };
  eligibilityCriteria?: string;
  tasks: AirdropTask[];
  notes?: string;
  transactions: ManualTransaction[];
  claimedTokens: ClaimedTokenLog[];
  sybilChecklist: SybilChecklistItem[];
  tags?: string[];
  isArchived?: boolean;
  timeSpentHours?: number;
  roadmapEvents?: RoadmapEvent[];
  priority?: AirdropPriority;
  dependentOnAirdropIds?: string[];
  leadsToAirdropIds?: string[];
  logoBase64?: string;
  customFields?: AirdropCustomField[];
  dateAdded: string;
  notificationOverrides?: Partial<AirdropNotificationSettings>; 
  projectCategory?: AirdropProjectCategory; // For smarter task suggestions
  userId?: string; // Added for backend airdrop store
}

export enum TaskFrequency {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  SPECIFIC_DAY = 'Specific Day', 
  EVERY_X_DAYS = 'Every X Days',
  SPECIFIC_DAYS_OF_WEEK = 'Specific Days of Week',
  ONE_TIME = 'One Time',
  EVERY_X_WEEKS_ON_DAY = 'Every X Weeks on Specific Day', 
  SPECIFIC_DATES = 'Specific Dates', 
  NTH_WEEKDAY_OF_MONTH = 'Nth Weekday of Month', 
}

export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface RecurringTask {
  id: string;
  name: string;
  associatedAirdropId?: string;
  frequency: TaskFrequency;
  everyXDaysValue?: number;
  specificDaysOfWeekValue?: DayOfWeek[];
  description: string;
  nextDueDate: string;
  lastCompletedDate?: string;
  isActive: boolean;
  completionHistory: string[];
  notes?: string;
  tags?: string[];
  // For EVERY_X_WEEKS_ON_DAY
  everyXWeeksValue?: number; 
  specificDayOfWeekForXWeeksValue?: DayOfWeek; 
  // For SPECIFIC_DATES
  specificDatesValue?: string[]; 
  // For NTH_WEEKDAY_OF_MONTH
  nthValue?: number; 
  dayOfWeekForNth?: DayOfWeek;
  userId?: string; // Added for backend store
}

export interface LearningResource {
  id: string;
  type: 'guide' | 'glossary' | 'news_summary';
  title: string;
  content: string;
  category?: string;
  sourceUrl?: string;
  explanation?: string; 
  author?: string; 
  submissionDate?: string; 
  userId?: string; // Added for backend store
}

export interface StrategyNote {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  linkedAirdropIds?: string[];
  userId?: string; // Added for backend store
}

export enum ConfidenceLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
}

export interface WatchlistItem {
    id: string;
    projectName: string;
    twitterLink?: string;
    websiteLink?: string;
    confidence: ConfidenceLevel;
    notes?: string;
    addedDate: string;
    reminderDate?: string; 
    userId?: string; // Added for backend store
    ecosystem?: string; // Added from watchlist promotion logic
    potential?: string; // Added from watchlist promotion logic
    aiConfidence?: 'Low' | 'Medium' | 'High'; // Added for AI Discovery
    sourceHints?: string[]; // Added for AI Discovery
    aiRationale?: string; // Added for AI Discovery
}

export type WidgetType = 
  | 'summary-standard' 
  | 'summary-compact' 
  | 'gas-chart' 
  | 'gas-list' 
  | 'tasks-detailed' 
  | 'tasks-compact'
  | 'alerts'        
  | 'userStats'     
  | 'aiDiscovery';  

export type WidgetSize = '1x1' | '1x2' | '2x1' | '2x2';

export interface DashboardWidgetConfig {
  type: WidgetType;
  size: WidgetSize;
}
export type WidgetKey = 'summary' | 'gas' | 'priorityTasks' | 'alerts' | 'userStats' | 'aiDiscovery';

export interface AirdropCardLayoutSettings {
  showTags: boolean;
  showDescriptionSnippet: boolean;
  showPriority: boolean;
  showMyStatus: boolean;
  showOfficialStatus: boolean;
  showPotential: boolean;
  showProgressBar: boolean;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  iconName: string; 
  achieved: boolean;
  achievedDate?: string;
}

export interface UserFarmingPreferences {
  riskTolerance: 'Low' | 'Medium' | 'High';
  capital: '$0-$100' | '$100-$500' | '$500-$2000' | '$2000-$10000' | '$10000+';
  preferredChains: string[];
  timeCommitment: '<5 hrs/wk' | '5-10 hrs/wk' | '>10 hrs/wk';
  automations: {
    autoClaim: boolean;
    autoCompound: boolean;
  };
  preferredStrategies: string[];
}

export interface AppSettings {
  theme: Theme;
  defaultGasNetworks: string[];
  notificationsEnabled: boolean;
  dashboardWidgetVisibility?: Record<WidgetKey, boolean>;
  dashboardWidgetOrder?: WidgetKey[];
  dashboardWidgetConfigs?: Record<WidgetKey, DashboardWidgetConfig>; 
  language?: string; 
  tutorialsCompleted?: Record<string, boolean>;
  userPoints?: number;
  airdropCardLayout: AirdropCardLayoutSettings;
  customTransactionCategories?: string[]; 
  defaultAirdropNotificationSettings: Required<AirdropNotificationSettings>; 
  taskKeywordNotificationSettings?: Record<string, boolean>; 
  accentColor?: string; 
  currentStreak?: number; 
  lastTaskCompletionDate?: string | null; 
  fontFamily?: string; 
  userPreferences?: UserFarmingPreferences; 
}

export interface AirdropTemplate {
  id: string;
  name: string;
  tasks: (Omit<AirdropTask, 'completed' | 'subTasks' | 'timeSpentMinutes' | 'notes' | 'cost' | 'linkedGasLogId' | 'id' | 'completionDate' | 'dependsOnTaskIds' | 'dependsOnAirdropMyStatusCompleted'> & { id?: string })[];
  description?: string;
  blockchain?: string;
  userId?: string; // Added for backend store
}


export interface GasPrice {
  network: string;
  price: string;
  lastUpdated: string;
  source: 'live' | 'simulated' | 'estimate'; 
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  TASK_DUE = 'task_due', 
  STATUS_CHANGE = 'status_change', 
}

export interface UserAlert { 
  id: string;
  type: NotificationType;
  title?: string;
  body: string; 
  date: string;
  relatedAirdropId?: string;
  isRead: boolean;
  userId?: string; // Added for backend store
}

export interface DiscoveredAirdropSuggestion {
  id: string; 
  projectName: string;
  description: string;
  ecosystem?: string;
  potentialReason?: string;
  aiConfidence?: 'Low' | 'Medium' | 'High'; 
  sourceHints?: string[];
  aiRationale?: string; 
}

export interface YieldPosition { 
  id: string;
  platformName: string;
  assetSymbol: string; 
  amountStaked: number;
  walletId: string; 
  entryDate: string;
  currentApy?: number; 
  notes?: string;
  poolUrl?: string; 
  currentValue?: number; 
  userId?: string; // Added for backend store
}

export interface ReportTimeAnalysisItem {
  airdropId: string;
  airdropName: string;
  totalTimeMinutes: number;
}

export interface ReportCostAnalysisItem {
  airdropId: string;
  airdropName: string;
  totalCost: number; 
  gasCost: number; 
  transactionCost: number; 
  taskCost: number; 
  potentialRewardValue: number;
  netPotential: number;
}

export interface CostByCategoryItem {
  category: string;
  totalCost: number;
  count: number;
}

export interface CostByNetworkItem {
  network: string;
  totalCost: number;
  count: number;
}

export interface CostByWalletItem {
  walletId: string;
  walletName: string;
  totalCost: number;
  count: number;
}


export interface AiFarmingStrategyStep {
  title: string;
  description: string;
  effort: 'Low' | 'Medium' | 'High';
  potentialImpact: 'Low' | 'Medium' | 'High';
  notes?: string;
}
export interface AiFarmingStrategy {
  strategyTitle: string;
  overallApproach: string;
  steps: AiFarmingStrategyStep[];
  sybilTips: string[];
  disclaimers: string[];
}

export interface SavedAiFarmingStrategy extends AiFarmingStrategy {
  id: string;
  savedDate: string;
  preferences: UserFarmingPreferences; 
  userId?: string; // Added for backend store
}

export interface TrendingContract {
  id: string;
  name: string;
  address: string;
  chain: string;
  interactionCount: number; 
  explorerUrl?: string;
  isSimulated?: boolean; 
}

export interface WhaleTransaction {
  id: string;
  hash: string;
  tokenSymbol: string;
  amount: number;
  usdValue: number;
  fromAddress: string;
  toAddress: string;
  timestamp: string;
  chain: string;
  explorerUrl?: string;
  isSimulated?: boolean; 
}

export interface AggregatorRouteStep {
  type: 'Swap' | 'Bridge' | 'Gas Top-up' | 'Other'; 
  protocol: string; 
  inputTokenSymbol?: string;
  inputAmount?: number;
  outputTokenSymbol?: string;
  outputAmount?: number;
  fromChain?: string;
  toChain?: string;
  details: string; 
  estimatedTimeMinutes?: number; 
  iconName?: string; 
}

export interface AggregatorRoute {
  id: string;
  providerName: string; 
  outputAmount: number;
  outputTokenSymbol: string;
  estimatedCostUSD: number;
  estimatedGasCostUSD?: number; 
  providerFeeUSD?: number; 
  estimatedTimeMinutes: number;
  steps?: AggregatorRouteStep[]; 
  isSimulated?: boolean; 
  tags?: ('Cheapest' | 'Fastest' | 'Most Secure (Conceptual)' | 'Recommended')[]; 
}

export interface ContractAnalysisRequest {
  contractAddress: string;
  blockchain: string;
  userContext?: string; 
}

export interface ContractAnalysisResult {
  contractName?: string;
  isVerified?: boolean;
  commonFunctions?: { name: string, signature: string, description: string }[];
  potentialRisks?: string[];
  aiSummary?: string;
  isSimulated?: boolean;
}

export interface AIPortfolioQueryResponse {
  query: string;
  aiResponse: string; 
  dataUsedSummary?: string; 
  isSimulated: boolean;
}

export interface CurrentUser {
  id: string;
  email: string;
  username: string;
}

export interface UserCredentials {
  email?: string; 
  username?: string; 
  password?: string; 
}

export interface UserRegistrationInfo {
  email: string;
  password?: string; 
  username?: string; 
}

export interface AuthResponse {
  message: string;
  token?: string;
  userId?: string;
  email?: string;
  username?: string;
}

export interface AppData {
  wallets: Wallet[];
  airdrops: Airdrop[];
  recurringTasks: RecurringTask[];
  learningResources: LearningResource[];
  strategyNotes: StrategyNote[];
  userAlerts: UserAlert[]; 
  settings: AppSettings;
  watchlist?: WatchlistItem[];
  airdropTemplates?: AirdropTemplate[];
  yieldPositions?: YieldPosition[]; 
  userBadges?: UserBadge[]; 
  savedAiStrategies?: SavedAiFarmingStrategy[];
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface DataLoadingStates {
  wallets: boolean;
  airdrops: boolean;
  recurringTasks: boolean;
}

export interface AppContextType {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  isAuthenticated: boolean;
  currentUser: CurrentUser | null;
  token: string | null;
  isLoadingAuth: boolean; 
  isDataLoading: DataLoadingStates; // Added to track loading for different data types
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  login: (credentials: Pick<UserRegistrationInfo, 'email' | 'password'>) => Promise<boolean>;
  register: (userInfo: UserRegistrationInfo) => Promise<boolean>;
  logout: () => void;
  addWallet: (wallet: Omit<Wallet, 'id' | 'balanceSnapshots' | 'gasLogs' | 'interactionLogs' | 'nftPortfolio' | 'isArchived' | 'transactionHistory'>) => Promise<void>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  deleteWallet: (walletId: string) => Promise<void>;
  batchUpdateWallets: (walletIds: string[], updates: Partial<Pick<Wallet, 'isArchived' | 'group'>>) => Promise<void>; 
  getRecentWalletLogs: (limitPerWalletType?: number) => { gasLogs: GasLogEntry[], interactionLogs: InteractionLogEntry[] }; 
  addGasLogToWallet: (walletId: string, logEntry: Omit<GasLogEntry, 'id'>) => Promise<void>;
  deleteGasLogFromWallet: (walletId: string, logId: string) => Promise<void>;
  addInteractionLogToWallet: (walletId: string, logEntry: Omit<InteractionLogEntry, 'id'>) => Promise<void>;
  deleteInteractionLogFromWallet: (walletId: string, logId: string) => Promise<void>;
  addNftToWalletPortfolio: (walletId: string, nftEntry: Omit<NftLogEntry, 'id'>) => Promise<void>;
  deleteNftFromWalletPortfolio: (walletId: string, nftId: string) => Promise<void>;
  updateNftInWalletPortfolio: (walletId: string, nftEntry: NftLogEntry) => Promise<void>;
  addAirdrop: (airdrop: Omit<Airdrop, 'id' | 'tasks' | 'transactions' | 'claimedTokens' | 'sybilChecklist' | 'tags' | 'isArchived' | 'timeSpentHours' | 'roadmapEvents' | 'dependentOnAirdropIds' | 'leadsToAirdropIds' | 'logoBase64' | 'customFields' | 'dateAdded' | 'notificationOverrides'>) => Promise<Airdrop | null>;
  updateAirdrop: (airdrop: Airdrop) => Promise<void>;
  deleteAirdrop: (airdropId: string) => Promise<void>;
  batchUpdateAirdrops: (airdropIds: string[], updates: Partial<Pick<Airdrop, 'status' | 'myStatus' | 'priority' | 'blockchain' | 'isArchived'>>) => Promise<void>; 
  batchAddNotesToAirdrops: (airdropIds: string[], notesToAppend: string) => Promise<void>;
  addAirdropTask: (airdropId: string, task: Omit<AirdropTask, 'id' | 'subTasks' | 'completionDate'>) => Promise<void>; 
  updateAirdropTask: (airdropId: string, task: AirdropTask) => Promise<void>;
  updateMultipleAirdropTasks: (airdropId: string, taskIds: string[], updates: Partial<Pick<AirdropTask, 'completed' | 'associatedWalletId' | 'dueDate' | 'timeSpentMinutes' | 'linkedGasLogId' | 'completionDate'>>) => Promise<void>;
  deleteAirdropTask: (airdropId: string, taskId: string, parentId?: string) => Promise<void>;
  completeNextAirdropTask: (airdropId: string) => Promise<void>;
  completeAllSubTasks: (airdropId: string, parentTaskId: string) => Promise<void>;
  addTransactionToAirdrop: (airdropId: string, transaction: Omit<ManualTransaction, 'id' | 'airdropsId'>) => Promise<void>;
  deleteTransactionFromAirdrop: (airdropId: string, transactionId: string) => Promise<void>;
  addRecurringTask: (task: Omit<RecurringTask, 'id' | 'completionHistory' | 'notes' | 'tags'>) => Promise<void>;
  updateRecurringTask: (task: RecurringTask) => Promise<void>;
  deleteRecurringTask: (taskId: string) => Promise<void>;
  completeRecurringTask: (taskId: string) => Promise<void>;
  snoozeRecurringTask: (taskId: string, daysToSnooze: number) => Promise<void>;
  addLearningResource: (resource: Omit<LearningResource, 'id'>) => Promise<LearningResource | null>;
  updateLearningResource: (resource: LearningResource) => Promise<void>;
  deleteLearningResource: (resourceId: string) => Promise<void>;
  addStrategyNote: (note: Omit<StrategyNote, 'id' | 'lastModified'>) => Promise<void>;
  updateStrategyNote: (note: StrategyNote) => Promise<void>;
  deleteStrategyNote: (noteId: string) => Promise<void>;
  addUserAlert: (alertData: Omit<UserAlert, 'id' | 'date' | 'isRead'>) => Promise<void>;
  markUserAlertAsRead: (alertId: string) => Promise<void>;
  deleteUserAlert: (alertId: string) => Promise<void>;
  markAllAlertsAsRead: () => Promise<void>;
  clearReadAlerts: () => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  addClaimedTokenLog: (airdropId: string, log: Omit<ClaimedTokenLog, 'id' | 'currentMarketPricePerToken'>) => Promise<void>;
  updateClaimedTokenLog: (airdropId: string, log: ClaimedTokenLog) => Promise<void>;
  deleteClaimedTokenLog: (airdropId: string, logId: string) => Promise<void>;
  updateAirdropSybilItem: (airdropId: string, item: SybilChecklistItem) => Promise<void>;
  addWatchlistItem: (item: Omit<WatchlistItem, 'id' | 'addedDate'>) => Promise<void>;
  updateWatchlistItem: (item: WatchlistItem) => Promise<void>;
  deleteWatchlistItem: (itemId: string) => Promise<void>;
  promoteWatchlistItemToAirdrop: (itemId: string) => Promise<Airdrop | null>;
  addRoadmapEvent: (airdropId: string, event: Omit<RoadmapEvent, 'id'>) => Promise<void>;
  updateRoadmapEvent: (airdropId: string, event: RoadmapEvent) => Promise<void>;
  deleteRoadmapEvent: (airdropId: string, eventId: string) => Promise<void>;
  markTutorialAsCompleted: (tutorialKey: string) => void;
  addAirdropTemplate: (template: Omit<AirdropTemplate, 'id'>) => Promise<void>;
  updateAirdropTemplate: (template: AirdropTemplate) => Promise<void>;
  deleteAirdropTemplate: (templateId: string) => Promise<void>;
  addYieldPosition: (position: Omit<YieldPosition, 'id'>) => Promise<void>;
  updateYieldPosition: (position: YieldPosition) => Promise<void>;
  deleteYieldPosition: (positionId: string) => Promise<void>;
  addCustomTransactionCategory: (category: string) => Promise<void>;
  deleteCustomTransactionCategory: (category: string) => Promise<void>;
  fetchTokenPricesAndUpdateLogs: (airdrops: Airdrop[]) => Promise<void>;
  fetchWalletBalances: (walletId: string) => Promise<void>; 
  checkAndAwardBadges: () => void; 
  addSavedAiStrategy: (strategy: AiFarmingStrategy) => Promise<void>; 
  deleteSavedAiStrategy: (strategyId: string) => Promise<void>; 
  clearArchivedAirdrops: () => Promise<void>;
  fetchTransactionHistory: (walletId: string) => Promise<void>; 
  getPortfolioSummaryForAI: () => Record<string, any>; 

  exportAirdropsToCSV: () => void;
  exportWalletsToCSV: () => void;
  exportRecurringTasksToCSV: () => void;
  exportSoldTokenLogsToCSV: () => void;

  internalFetchWalletsFromApi: () => Promise<void>;
  internalFetchAirdropsFromApi: () => Promise<void>;
  internalFetchRecurringTasksFromApi: () => Promise<void>;
}

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  authRequired?: boolean; 
  publicOnly?: boolean; 
};

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface PublicToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
}


export type BLOCKCHAIN_EXPLORERS_TYPE = Record<string, { name: string; urlPattern: string, txUrlPattern: string }>;

export type AirdropTaskFilterPreset = 'all' | 'overdue' | 'dueNext7Days' | 'dueNext30Days';

export type TaskSortOption = 'default' | 'dueDateAsc' | 'dueDateDesc' | 'completedFirst' | 'incompleteFirst' | 'descriptionAsc';

export interface TaskCompletionSuggestion {
  matchFound: boolean;
  matchingLog?: InteractionLogEntry | GasLogEntry | ManualTransaction;
  confidence: 'High' | 'Medium' | 'Low' | 'None';
  reasoning?: string;
}

export interface AiTaskAnalysis {
  summary: string;
  prioritySuggestions: Array<{ category: string; tasks: string[] }>;
  generalTips: string[];
}

export type LearningTab = 'guides' | 'glossary' | 'sybilPrevention' | 'notebook' | 'aiStrategy' | 'aiAnalyst' | 'newsAnalysis' | 'tutorials';

export type SearchResultType = 'airdrop' | 'airdropTask' | 'wallet' | 'recurringTask' | 'learningGuide' | 'learningGlossary' | 'learningNewsSummary' | 'strategyNote' | 'watchlistItem';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  path: string;
  parentId?: string; // For tasks, to link back to airdrop
  highlightTaskId?: string; // For linking directly to a task in detail view
  airdropStatus?: AirdropStatus; // For filtering airdrops/tasks by myStatus
}

export interface Command {
  id: string;
  name: string;
  category?: string;
  icon?: React.ElementType;
  keywords?: string[];
  action: () => void;
}

export interface PortfolioAirdropPerformance {
  id: string;
  name: string;
  netPL: number;
}

export interface PortfolioOverviewData {
  totalCosts: number;
  totalSales: number;
  netProfitLoss: number;
  totalUnrealizedValue: number;
  topProfitableAirdrops: PortfolioAirdropPerformance[];
  topLossAirdrops: PortfolioAirdropPerformance[];
  potentialDistribution: Array<{ name: string, count: number }>;
  historicalValue: Array<{date: string, value: number}>;
  tokenAllocation: Array<{symbol: string, value: number, count: number}>;
}

export interface EligibilityCheckResult {
  likelihood: "Likely" | "Unlikely" | "Needs More Info" | "Error";
  reasoning: string;
  checkedCriteria?: string;
}

export interface AirdropRiskAssessmentResult {
    riskLevel: "Low" | "Medium" | "High" | "Unknown" | "NeedsMoreInfo";
    positiveSigns: string[];
    redFlags: string[];
    summary: string;
    confidenceScore?: number; // 0 to 1
}

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';
