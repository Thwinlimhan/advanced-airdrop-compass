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
  category?: string;
  currentStreak?: number;
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

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'; 