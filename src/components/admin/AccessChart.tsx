import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyStats {
  access_date: string;
  logins: number;
  page_views: number;
  unique_users: number;
}

interface AccessChartProps {
  data: DailyStats[];
}

export const AccessChart = ({ data }: AccessChartProps) => {
  const chartData = data
    .map(stat => ({
      date: format(new Date(stat.access_date), "dd/MM", { locale: ptBR }),
      logins: stat.logins,
      views: stat.page_views
    }))
    .reverse();

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg font-outfit">Acessos nos Últimos 30 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="logins"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorLogins)"
              name="Logins"
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="hsl(var(--secondary))"
              fillOpacity={1}
              fill="url(#colorViews)"
              name="Visualizações"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
