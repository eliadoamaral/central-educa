import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from "@/types/dashboard";

interface HorizontalBarChartProps {
  title: string;
  data: ChartData[];
  onBarClick?: (name: string) => void;
  maxItems?: number;
  customOrder?: string[];
  useGreenGradient?: boolean;
  useCurrencyFormat?: boolean;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const HorizontalBarChart = ({ 
  title, 
  data, 
  onBarClick,
  maxItems = 10,
  customOrder,
  useGreenGradient = false,
  useCurrencyFormat = false
}: HorizontalBarChartProps) => {
  // Apply custom order if provided, otherwise sort by value
  let sortedData = customOrder
    ? customOrder
        .map(name => data.find(item => item.name === name))
        .filter((item): item is ChartData => item !== undefined)
    : [...data].sort((a, b) => b.value - a.value);
  
  sortedData = sortedData.slice(0, maxItems);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...sortedData.map(item => item.value), 1);

  // Generate colors based on value intensity using green palette (action color hue 160)
  const getColorByValue = (value: number) => {
    const intensity = value / maxValue;
    const hue = Math.round(160 - (intensity * 10)); // 160 to 150 (green range)
    const saturation = Math.round(35 + (intensity * 15)); // 35% to 50%
    const lightness = Math.round(85 - (intensity * 55)); // 85% to 30%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const colors = sortedData.map(item => getColorByValue(item.value));

  return (
    <Card className="shadow-soft animate-fade-in bg-card transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]">
      <CardHeader className="pb-4 space-y-2">
        <CardTitle className="text-lg font-bold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {sortedData.map((item, index) => {
            const barWidth = (item.value / maxValue) * 100;
            
            return (
              <div
                key={item.name}
                className={`animate-fade-in ${onBarClick ? 'cursor-pointer group' : ''}`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onBarClick?.(item.name)}
              >
                <div className="flex items-start justify-between mb-2 gap-3">
                  <span className={`text-sm text-foreground font-medium leading-tight flex-1 ${onBarClick ? 'group-hover:text-primary' : ''} transition-colors`}>
                    {item.name}
                  </span>
                  <span className="text-base font-bold text-primary shrink-0">
                    {useCurrencyFormat ? formatCurrency(item.value) : item.value}
                  </span>
                </div>
                <div className="w-full h-7 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out animate-grow-in ${onBarClick ? 'group-hover:brightness-110' : ''}`}
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: colors[index],
                      animationDelay: `${index * 0.05}s`
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {item.percentage}% do total
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
