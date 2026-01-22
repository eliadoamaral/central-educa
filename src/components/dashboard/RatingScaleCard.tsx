import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DimensionRating } from "@/types/satisfaction";
import { cn } from "@/lib/utils";
interface RatingScaleCardProps {
  data: DimensionRating;
  title: string;
  className?: string;
}
export const RatingScaleCard = ({
  data,
  title,
  className
}: RatingScaleCardProps) => {
  // Find the rating with highest count for highlighting
  const maxCount = Math.max(...data.distribution.map(d => d.count));
  const maxPercentage = Math.max(...data.distribution.map(d => d.percentage));

  // Green color from system (#3D7A6A)
  const actionGreen = "#3D7A6A";
  return <Card className={cn("w-full transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <CardTitle className="text-lg font-semibold text-foreground leading-tight max-w-3xl">
            {title}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-center px-4 py-2 rounded-xl border" style={{
            backgroundColor: `${actionGreen}10`,
            borderColor: `${actionGreen}30`
          }}>
              <span className="text-3xl font-bold" style={{
              color: actionGreen
            }}>{data.average.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground ml-2">média</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {data.distribution.map(item => {
          const isHighest = item.count === maxCount;
          const barWidth = item.percentage / maxPercentage * 100;
          return <div key={item.rating} className={`
                  relative p-5 rounded-xl border transition-all duration-300 cursor-pointer
                  hover:scale-105 hover:-translate-y-1
                  ${isHighest ? "ring-2 shadow-lg hover:shadow-xl" : "bg-card border-border hover:shadow-md hover:border-primary/30"}
                `} style={isHighest ? {
            backgroundColor: `${actionGreen}08`,
            borderColor: `${actionGreen}60`,
            boxShadow: `0 0 0 2px ${actionGreen}20`
          } : undefined}>
                {/* Stars representation - all using green color */}
                <div className="flex justify-center gap-0.5 mb-4">
                  {Array.from({
                length: 5
              }).map((_, i) => <svg key={i} className="w-4 h-4" style={{
                color: i < item.rating ? actionGreen : "rgba(156, 163, 175, 0.2)"
              }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>)}
                </div>

                {/* Count */}
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{
                color: isHighest ? actionGreen : undefined
              }}>
                    {item.count}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    respostas
                  </div>
                </div>

                {/* Highest badge */}
                {isHighest && <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md" style={{
              backgroundColor: actionGreen
            }}>
                    Maior
                  </div>}
              </div>;
        })}
        </div>

        {/* Total responses info */}
        
      </CardContent>
    </Card>;
};