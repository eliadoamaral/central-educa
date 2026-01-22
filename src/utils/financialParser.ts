import { FinancialMetrics, RevenueSource, CostCategory, MonthlyTrend, PerformanceIndicator } from '@/types/financial';

// Dados representativos do curso Sucessores do Agro
const TOTAL_PARTICIPANTS = 58;
const ENROLLMENT_PRICE = 3683.92;

export const getFinancialMetrics = (): FinancialMetrics => {
  const revenueBreakdown = getRevenueBreakdown();
  const costBreakdown = getCostBreakdown();
  
  const totalRevenue = revenueBreakdown.reduce((sum, item) => sum + item.value, 0);
  const totalCosts = costBreakdown.reduce((sum, item) => sum + item.value, 0);
  const netResult = totalRevenue - totalCosts;
  const roi = 40.46;
  const averageTicket = totalRevenue / TOTAL_PARTICIPANTS;
  const defaultRate = 5;

  return {
    totalRevenue,
    totalCosts,
    netResult,
    roi,
    averageTicket,
    defaultRate,
    totalParticipants: TOTAL_PARTICIPANTS,
    revenueBreakdown,
    costBreakdown,
    monthlyTrends: getMonthlyTrends(),
    performanceIndicators: getPerformanceIndicators(totalRevenue, netResult, roi, averageTicket),
  };
};

export const getRevenueBreakdown = (): RevenueSource[] => {
  const enrollments = 213667.40;
  const sponsorships = 0;
  const materials = 0;
  const total = enrollments;

  return [
    {
      category: 'Inscrições',
      value: enrollments,
      percentage: (enrollments / total) * 100,
      color: 'hsl(var(--chart-1))',
    },
    {
      category: 'Patrocínios',
      value: sponsorships,
      percentage: (sponsorships / total) * 100,
      color: 'hsl(var(--chart-2))',
    },
    {
      category: 'Materiais',
      value: materials,
      percentage: (materials / total) * 100,
      color: 'hsl(var(--chart-3))',
    },
  ];
};

export const getCostBreakdown = (): CostCategory[] => {
  const costs = [
    { category: 'Marketing', value: 28710.28 },
    { category: 'Estrutura', value: 30467.17 },
    { category: 'Honorários', value: 10000.00 },
    { category: 'Viagem', value: 15814.79 },
    { category: 'Imposto', value: 39528.47 },
  ];

  const total = costs.reduce((sum, item) => sum + item.value, 0);

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--muted))',
  ];

  return costs.map((cost, index) => ({
    ...cost,
    percentage: (cost.value / total) * 100,
    color: colors[index],
  }));
};

export const getMonthlyTrends = (): MonthlyTrend[] => {
  return [
    { month: 'Jan', revenue: 0, costs: 5000, result: -5000 },
    { month: 'Fev', revenue: 45000, costs: 15000, result: 30000 },
    { month: 'Mar', revenue: 90000, costs: 35000, result: 55000 },
    { month: 'Abr', revenue: 80000, costs: 45000, result: 35000 },
    { month: 'Mai', revenue: 50000, costs: 38000, result: 12000 },
    { month: 'Jun', revenue: 30000, costs: 40000, result: -10000 },
  ];
};

export const getPerformanceIndicators = (
  totalRevenue: number,
  netResult: number,
  roi: number,
  averageTicket: number
): PerformanceIndicator[] => {
  return [
    {
      label: 'Margem Líquida',
      value: 40.46,
      format: 'percentage',
      trend: 'up',
      comparison: 'vs. meta de 35%',
    },
    {
      label: 'Custo por Participante',
      value: 127222.29 / TOTAL_PARTICIPANTS,
      format: 'currency',
      trend: 'down',
      comparison: 'vs. R$ 3.200 previsto',
    },
    {
      label: 'Break-even Point',
      value: 40,
      format: 'number',
      trend: 'neutral',
      comparison: 'participantes necessários',
    },
  ];
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2).replace('.', ',')}%`;
};
