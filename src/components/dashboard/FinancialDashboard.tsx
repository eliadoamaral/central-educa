import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import educasafrasLogo from "@/assets/educasafras-sem-fundo.png";
import { FinancialOverviewCards } from "./FinancialOverviewCards";
import { ChartCard } from "./ChartCard";
import { DonutChart } from "./DonutChart";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { AIInsightsDrawer } from "./AIInsightsDrawer";
import { getFinancialMetrics, formatCurrency, formatPercentage } from "@/utils/financialParser";
import { usePageView } from "@/hooks/usePageView";
import type { AIInsightsContext } from "@/types/ai-insights";
export const FinancialDashboard = () => {
  const navigate = useNavigate();
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  usePageView("/sucessores-do-agro/resultado-financeiro");
  const metrics = getFinancialMetrics();
  const aiContext: AIInsightsContext = {
    dashboardType: 'profile',
    totalParticipants: metrics.totalParticipants,
    metrics: {
      totalRevenue: metrics.totalRevenue,
      totalCosts: metrics.totalCosts,
      netResult: metrics.netResult,
      roi: metrics.roi,
      averageTicket: metrics.averageTicket,
      revenueBreakdown: metrics.revenueBreakdown,
      costBreakdown: metrics.costBreakdown
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-primary shadow-soft border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-primary/95">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <Button variant="ghost" size="sm" onClick={() => navigate("/sucessores-do-agro")} className="text-white hover:bg-white/10 p-2 transition-colors" aria-label="Voltar">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              
              
              <div className="space-y-0.5">
                <h1 className="text-lg md:text-2xl font-bold leading-tight text-white">
                  Resultado Financeiro - Sucessores do Agro 2025
                </h1>
                <p className="text-xs md:text-sm text-white/80 mt-1">
                  Análise completa de receitas, custos e indicadores financeiros da 8ª Edição.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8">
        {/* Overview Cards */}
        <section className="animate-fade-in">
          <FinancialOverviewCards totalRevenue={metrics.totalRevenue} netResult={metrics.netResult} roi={metrics.roi} averageTicket={metrics.averageTicket} />
        </section>

        {/* Análise Detalhada de Custos */}
        <section className="animate-fade-in" style={{
        animationDelay: "300ms"
      }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">Detalhamento de Custos</h2>
          <div className="grid grid-cols-1 gap-6">
            <HorizontalBarChart title="Custos por Categoria" data={metrics.costBreakdown.map(item => ({
            name: item.category,
            value: item.value,
            percentage: Number(item.percentage.toFixed(2))
          }))} useCurrencyFormat={true} />
          </div>
        </section>

        {/* Indicadores de Performance */}
        <section className="animate-fade-in" style={{
        animationDelay: "400ms"
      }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">Indicadores de Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.performanceIndicators.map((indicator) => <Card key={indicator.label} className="border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group">
                <CardContent className="p-4">
                  <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">{indicator.label}</p>
                  <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                    {indicator.format === 'currency' ? formatCurrency(indicator.value) : indicator.format === 'percentage' ? formatPercentage(indicator.value) : indicator.value}
                  </span>
                </CardContent>
              </Card>)}
          </div>
        </section>
      </div>

      {/* AI Insights Button */}
      <Button onClick={() => setAiDrawerOpen(true)} size="lg" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all z-50" aria-label="Abrir Assistente de IA">
        <Sparkles className="w-6 h-6" />
      </Button>

      {/* AI Insights Drawer */}
      <AIInsightsDrawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen} context={aiContext} />
    </div>;
};