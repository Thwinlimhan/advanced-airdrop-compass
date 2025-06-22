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
  subTasks?: LearningSubTask[]; // Added for subtask support
}

export interface LearningSubTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  notes?: string;
  parentId?: string;
  subTasks?: LearningSubTask[]; // Nested subtasks
  completionDate?: string;
  tempId?: string;
}

export interface StrategyNote {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  linkedAirdropIds?: string[];
  userId?: string; // Added for backend store
  subTasks?: LearningSubTask[]; // Added for subtask support
}

export type LearningTab = 'guides' | 'glossary' | 'sybilPrevention' | 'notebook' | 'aiStrategy' | 'aiAnalyst' | 'newsAnalysis' | 'tutorials'; 