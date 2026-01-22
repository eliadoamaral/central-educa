export interface RevenueSource {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface CostCategory {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  costs: number;
  result: number;
}

export interface PerformanceIndicator {
  label: string;
  value: number;
  format: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'neutral';
  comparison?: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalCosts: number;
  netResult: number;
  roi: number;
  averageTicket: number;
  defaultRate: number;
  totalParticipants: number;
  revenueBreakdown: RevenueSource[];
  costBreakdown: CostCategory[];
  monthlyTrends: MonthlyTrend[];
  performanceIndicators: PerformanceIndicator[];
}
