import { ConfidenceLevel } from './common.types';

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