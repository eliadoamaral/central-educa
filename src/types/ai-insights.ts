export type DashboardType = 'profile' | 'satisfaction';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIInsightsContext {
  dashboardType: DashboardType;
  totalParticipants?: number;
  totalResponses?: number;
  averageRating?: number;
  recommendationRate?: number;
  filters?: any;
  aggregatedData?: any;
  metrics?: any;
}

export interface QuickPrompt {
  icon: string;
  label: string;
  prompt: string;
}
