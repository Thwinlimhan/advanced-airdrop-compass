export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  TASK_DUE = 'task_due', 
  STATUS_CHANGE = 'status_change', 
}

export interface BaseUserAlert { 
  id: string;
  type: NotificationType;
  title?: string;
  body: string; 
  date: string;
  relatedAirdropId?: string;
  isRead: boolean;
  isProactive?: false; // Optional to explicitly state it's not proactive
}

export interface ProactiveAlert {
  id: string;
  type: NotificationType;
  title: string;
  body: string; 
  date: string;
  isRead: boolean;
  isProactive: true; // Differentiator
  projectName: string;
  aiConfidence?: 'Low' | 'Medium' | 'High';
  relatedLink?: string; // e.g., to a tweet or blog post
}

export type UserAlert = BaseUserAlert | ProactiveAlert; 