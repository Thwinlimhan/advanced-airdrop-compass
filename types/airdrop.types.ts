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
  webLink?: string;
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
  customFields: AirdropCustomField[];
  dateAdded: string;
  notificationOverrides?: Partial<AirdropNotificationSettings>; 
  projectCategory?: AirdropProjectCategory; // For smarter task suggestions
  userId?: string; // Added for backend airdrop store
}

export interface AirdropTemplate {
  id: string;
  name: string;
  tasks: (Omit<AirdropTask, 'completed' | 'subTasks' | 'timeSpentMinutes' | 'notes' | 'cost' | 'linkedGasLogId' | 'id' | 'completionDate' | 'dependsOnTaskIds' | 'dependsOnAirdropMyStatusCompleted'> & { id?: string })[];
  description?: string;
  blockchain?: string;
  userId?: string; // Added for backend store
}

export type AirdropTaskFilterPreset = 'all' | 'overdue' | 'dueNext7Days' | 'dueNext30Days';

export type TaskSortOption = 'default' | 'dueDateAsc' | 'dueDateDesc' | 'completedFirst' | 'incompleteFirst' | 'descriptionAsc';

export interface TaskCompletionSuggestion {
  matchFound: boolean;
  matchingLog?: any; // Will be imported from wallet.types.ts
  confidence: 'High' | 'Medium' | 'Low' | 'None';
  reasoning?: string;
}

export interface AiTaskAnalysis {
  summary: string;
  prioritySuggestions: Array<{ category: string; tasks: string[] }>;
  generalTips: string[];
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