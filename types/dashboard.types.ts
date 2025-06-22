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