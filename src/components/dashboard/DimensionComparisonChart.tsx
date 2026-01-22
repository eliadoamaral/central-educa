import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DimensionRating } from "@/types/satisfaction";

interface DimensionComparisonChartProps {
  title: string;
  data: DimensionRating[];
}

export const DimensionComparisonChart = ({ title, data }: DimensionComparisonChartProps) => {
  const maxRating = 5;
  const sortedData = [...data].sort((a, b) => b.average - a.average);

  // Generate colors based on value intensity using green palette (action color hue 160)
  const getColorIntensity = (average: number) => {
    const intensity = average / maxRating;
    const hue = Math.round(160 - (intensity * 10)); // 160 to 150 (green range)
    const saturation = Math.round(35 + (intensity * 15)); // 35% to 50%
    const lightness = Math.round(75 - (intensity * 45)); // 75% to 30%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <Card className="shadow-soft animate-fade-in bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {sortedData.map((item, index) => {
            const percentage = (item.average / maxRating) * 100;
            const color = getColorIntensity(item.average);

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {item.dimension}
                  </span>
                  <span className="text-base font-bold text-primary shrink-0">
                    {item.average.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-7 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
