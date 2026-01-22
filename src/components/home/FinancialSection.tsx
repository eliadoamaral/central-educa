import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { getFinancialMetrics, getMonthlyTrends, formatCurrency } from "@/utils/financialParser";
export const FinancialSection = () => {
  // Get real data from Sucessores do Agro
  const metrics = getFinancialMetrics();
  const monthlyTrends = getMonthlyTrends();

  // Transform monthly data for chart
  const monthlyData = monthlyTrends.map(item => ({
    month: item.month,
    receita: item.revenue,
    custo: item.costs
  }));
  const financialCards = [{
    title: "Receita Total",
    value: metrics.totalRevenue
  }, {
    title: "Custos Totais",
    value: metrics.totalCosts
  }, {
    title: "Resultado Líquido",
    value: metrics.netResult
  }, {
    title: "Margem",
    value: metrics.roi,
    isPercentage: true
  }];
  return <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {financialCards.map((card, index) => <Card key={index} className="border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group">
            <CardContent className="p-4">
              <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">{card.title}</p>
              <p className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
                {card.isPercentage ? `${card.value.toFixed(2).replace('.', ',')}%` : formatCurrency(card.value as number)}
              </p>
            </CardContent>
          </Card>)}
      </div>

      {/* Revenue Trend Chart */}
      <Card className="border-0 shadow-soft">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Evolução Financeira - Sucessores do Agro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0
            }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{
                fontSize: 12,
                fill: 'hsl(var(--muted-foreground))'
              }} />
                <YAxis hide />
                <Tooltip contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                color: 'hsl(var(--foreground))'
              }} labelStyle={{
                color: 'hsl(var(--foreground))'
              }} formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="receita" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                <Area type="monotone" dataKey="custo" stroke="hsl(var(--chart-5))" strokeWidth={2} fillOpacity={1} fill="url(#colorCusto)" name="Custos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Receita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-5" />
              <span className="text-xs text-muted-foreground">Custos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};