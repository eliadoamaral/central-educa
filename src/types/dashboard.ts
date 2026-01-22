export interface ParticipantData {
  id: number;
  name: string;
  age?: string;
  gender?: string;
  city?: string;
  state?: string;
  region?: string;
  profession?: string;
  experience?: string;
  activities?: string;
  objectives?: string;
  successionLevel?: string;
  interests?: string;
  isClient?: string;
  additionalTopics?: string;
  expectations?: string;
  challenges?: string;
  hasResponded?: boolean;
}

export interface DashboardFilters {
  region: string[];
  gender: string[];
  age: string[];
  isClient: string[];
  successionLevel: string[];
  experience: string[];
}

export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface OverviewStats {
  totalParticipants: number;
  predominantGender: {
    gender: string;
    percentage: number;
  };
  averageAge: string;
  clientCount: number;
}