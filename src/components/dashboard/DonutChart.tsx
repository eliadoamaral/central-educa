import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartData } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";

interface DonutChartProps {
  title: string;
  data: ChartData[];
  colors?: string[];
  centerLabel?: string;
}

export const DonutChart = ({ title, data, colors, centerLabel }: DonutChartProps) => {
  const isMobile = useIsMobile();

  const defaultColors = [
    "hsl(var(--client-yes))",
    "hsl(var(--client-no))"
  ];

  // Generate colors based on value intensity using new blue palette
  const getColorByValue = (value: number, maxValue: number) => {
    const intensity = value / maxValue;
    const hue = Math.round(210 + (intensity * 14)); // 210 to 224 (blue range)
    const saturation = Math.round(60 + (intensity * 35)); // 60% to 95%
    const lightness = Math.round(85 - (intensity * 55)); // 85% to 30%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const maxValue = Math.max(...data.map(d => d.value));
  const chartColors = colors || data.map(item => getColorByValue(item.value, maxValue));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <p className="text-sm font-medium text-foreground">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-soft animate-fade-in bg-card transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]">
      <CardHeader className="pb-4 space-y-2">
        <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={isMobile ? 50 : 70}
              outerRadius={isMobile ? 80 : 100}
              fill="#8884d8"
              dataKey="value"
            >
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-sm font-semibold">
                {centerLabel}
              </text>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-6 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors duration-200">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
              <span className="font-medium text-xs text-muted-foreground">
                {item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
