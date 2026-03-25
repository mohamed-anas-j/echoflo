
export enum Priority {
  P1 = 1, // Critical
  P2 = 2, // High
  P3 = 3, // Medium
  P4 = 4  // Low
}

export type ItemType = 'TASK' | 'NOTE' | 'HABIT';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface FlowItem {
  id: string;
  type: ItemType;
  content: string;
  description?: string; // Additional context or AI summary
  
  // Task specific
  isCompleted?: boolean;
  priority?: Priority;
  dueDate?: string; // ISO Date string
  projectId?: string; // Linked Project ID
  
  // Habit specific
  streak?: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  frequency?: HabitFrequency;
  history?: string[]; // Array of YYYY-MM-DD completion dates for graph
  
  // Metadata
  tags?: string[];
  createdAt: string;
  mood?: 'neutral' | 'positive' | 'negative' | 'focused' | 'anxious'; // AI inferred mood
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface ParsedTask {
  content: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  projectName?: string;
}

export interface ProcessedItem {
  type: ItemType;
  content: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  streak?: number;
  frequency?: HabitFrequency;
  tags?: string[];
  mood?: string;
  projectName?: string;
}

export interface ProcessedInput {
  items: ProcessedItem[];
  summary?: string;
}

export type Task = FlowItem;

export type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'alphabetical';

export interface ViewState {
  type: 'HOME' | 'TASKS' | 'HABITS' | 'JOURNAL' | 'PROJECT' | 'TAG' | 'CALENDAR' | 'SETTINGS';
  id?: string; // projectId or tagName
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  isGuest?: boolean;
}
