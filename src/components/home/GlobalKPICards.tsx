import { Card, CardContent } from "@/components/ui/card";
import { useHomeKPIs } from "@/hooks/useHomeKPIs";
export const GlobalKPICards = () => {
  const {
    kpis,
    loading
  } = useHomeKPIs();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1).replace('.', ',')}%`;
  };
  const kpiCards = [{
    title: "Total de Alunos",
    value: kpis.totalStudents
  }, {
    title: "Leads no Funil",
    value: kpis.leadsInFunnel
  }, {
    title: "Taxa de Conversão",
    value: formatPercentage(kpis.conversionRate)
  }, {
    title: "Receita Total",
    value: formatCurrency(kpis.totalRevenue)
  }];
  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Card key={i} className="animate-pulse border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="h-14 bg-muted rounded" />
            </CardContent>
          </Card>)}
      </div>;
  }
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpiCards.map((kpi, index) => <Card key={index} className="border border-transparent shadow-soft hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30 transition-all duration-[2000ms] ease-in-out cursor-default group">
          <CardContent className="p-4">
            <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-[2000ms] text-sm">{kpi.title}</p>
            <span className="text-2xl font-bold font-outfit text-foreground group-hover:text-primary transition-colors duration-[2000ms]">
              {kpi.value}
            </span>
          </CardContent>
        </Card>)}
    </div>;
};