import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from "@/types/dashboard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

interface VerticalBarChartProps {
  title: string;
  data: ChartData[];
  onBarClick?: (name: string) => void;
  maxItems?: number;
}

export const VerticalBarChart = ({ 
  title, 
  data, 
  onBarClick,
  maxItems = 10 
}: VerticalBarChartProps) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, maxItems);
  const maxValue = Math.max(...sortedData.map(d => d.value));
  
  // Generate colors based on value intensity using new blue palette
  const getColorByValue = (value: number) => {
    const intensity = value / maxValue;
    const hue = Math.round(210 + (intensity * 14)); // 210 to 224 (blue range)
    const saturation = Math.round(60 + (intensity * 35)); // 60% to 95%
    const lightness = Math.round(85 - (intensity * 55)); // 85% to 30%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  
  const colors = sortedData.map(item => getColorByValue(item.value));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-semibold text-foreground">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} participantes ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, payload } = props;
    
    // Verificação de segurança para evitar erros
    if (!payload || !payload.percentage) {
      return null;
    }
    
    return (
      <text 
        x={x + width / 2} 
        y={y - 10} 
        fill="hsl(var(--foreground))" 
        textAnchor="middle"
        className="text-base font-bold"
      >
        {payload.percentage}%
      </text>
    );
  };

  return (
    <Card className="shadow-lg border-border/40 bg-card animate-fade-in hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3 space-y-1">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={sortedData}
            margin={{ top: 40, right: 20, left: 20, bottom: 60 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 500 }}
              angle={0}
              textAnchor="middle"
              height={60}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
              onClick={(data) => onBarClick?.(data.name)}
              className="cursor-pointer"
              maxBarSize={120}
            >
              <LabelList content={renderCustomLabel} />
              {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
