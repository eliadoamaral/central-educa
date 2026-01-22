import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DimensionRating } from "@/types/satisfaction";

interface RatingDistributionChartProps {
  data: DimensionRating;
  customTitle?: string;
}

export const RatingDistributionChart = ({ data, customTitle }: RatingDistributionChartProps) => {
  const chartData = data.distribution.map((item) => ({
    rating: `${item.rating} ⭐`,
    count: item.count,
    percentage: item.percentage,
  })).reverse();

  const getColorByRating = (rating: string) => {
    const num = parseInt(rating);
    if (num === 5) return "hsl(var(--chart-7))";  // Verde mais intenso
    if (num === 4) return "hsl(var(--chart-5))";  // Verde médio
    if (num === 3) return "hsl(var(--chart-3))";  // Verde claro
    if (num === 2) return "hsl(var(--chart-2))";  // Verde bem claro
    return "hsl(var(--chart-1))";                  // Verde mais claro
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <p className="text-sm font-medium text-foreground">{payload[0].payload.rating}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} respostas ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-soft animate-fade-in bg-card">
      <CardHeader className="pb-4 space-y-3">
        <CardTitle className="text-lg font-bold text-foreground">{customTitle || data.dimension}</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-primary">{data.average.toFixed(2)}</span>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">média de avaliação</span>
            <span className="text-xs font-medium text-muted-foreground">de 5.00 pontos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis dataKey="rating" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColorByRating(entry.rating)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
