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
  preferences: any; // Will be imported from user.types.ts
  userId?: string; // Added for backend store
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