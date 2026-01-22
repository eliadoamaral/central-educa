import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartData } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
interface ChartCardProps {
  title: string;
  data: ChartData[];
  type?: "pie" | "bar";
  height?: number;
}
const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))"];
export const ChartCard = ({
  title,
  data,
  type = "pie",
  height = 300
}: ChartCardProps) => {
  const isMobile = useIsMobile();
  const chartHeight = isMobile ? 250 : height;
  // Chart type emojis
  const chartEmojis: {
    [key: string]: string;
  } = {
    "Região": "🌎",
    "Idade": "📅",
    "Gênero": "⚖️",
    "Cliente S&C": "🤝",
    "Experiência no Agro": "⭐",
    "Nível de Sucessão": "📈"
  };
  const chartData = data.slice(0, 6); // Limit to 6 items for better visualization

  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <p className="text-sm font-medium text-foreground">{`${label || payload[0].payload.name}`}</p>
          <p className="text-sm text-muted-foreground">
            {`Quantidade: ${payload[0].value}`}
          </p>
          {payload[0].payload.percentage && <p className="text-sm text-muted-foreground">
              {`Percentual: ${payload[0].payload.percentage}%`}
            </p>}
        </div>;
    }
    return null;
  };
  const renderPieChart = () => <ResponsiveContainer width="100%" height={chartHeight}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({
        name,
        percentage
      }) => `${name}: ${percentage}%`} outerRadius={isMobile ? 60 : 80} fill="#8884d8" dataKey="value" style={{
        fontSize: isMobile ? '6px' : '8px'
      }}>
          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>;
  const renderBarChart = () => <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={chartData} margin={{
      top: 5,
      right: isMobile ? 10 : 30,
      left: isMobile ? 10 : 20,
      bottom: 5
    }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" tick={{
        fontSize: isMobile ? 6 : 8,
        fill: "hsl(var(--muted-foreground))"
      }} angle={-45} textAnchor="end" height={isMobile ? 60 : 80} className="hover:!text-xs transition-all duration-200" />
        <YAxis tick={{
        fontSize: isMobile ? 6 : 8,
        fill: "hsl(var(--muted-foreground))"
      }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>;
  return <Card className="shadow-soft bg-card animate-fade-in transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]">
      <CardHeader className="pb-4 space-y-2">
        <CardTitle className="text-[18px] font-bold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {type === "pie" ? renderPieChart() : renderBarChart()}
      </CardContent>
    </Card>;
};