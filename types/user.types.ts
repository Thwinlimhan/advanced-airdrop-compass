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
  theme: string; // Using string instead of Theme enum to avoid circular dependency
  defaultGasNetworks: string[];
  notificationsEnabled: boolean;
  dashboardWidgetVisibility?: Record<string, boolean>;
  dashboardWidgetOrder?: string[];
  dashboardWidgetConfigs?: Record<string, any>; 
  language?: string; 
  tutorialsCompleted?: Record<string, boolean>;
  userPoints?: number;
  airdropCardLayout: any; // Will be imported from dashboard.types.ts
  customTransactionCategories?: string[]; 
  defaultAirdropNotificationSettings: any; // Will be imported from airdrop.types.ts
  taskKeywordNotificationSettings?: Record<string, boolean>; 
  accentColor?: string; 
  currentStreak?: number; 
  lastTaskCompletionDate?: string | null; 
  fontFamily?: string; 
  userPreferences?: UserFarmingPreferences; 
  isProUser?: boolean; // Added for Pro tier management
  aiProvider?: 'ollama' | 'gemini' | 'deepseek';
  aiApiKey?: string;
  aiModel?: string; // Added for model selection
  emailNotifications?: boolean;
}

export enum SubscriptionStatus {
    FREE = 'free',
    PRO = 'pro',
}

export interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus;
  isPro: boolean;
  showUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  toggleProStatus: () => void; // For demo purposes
} 