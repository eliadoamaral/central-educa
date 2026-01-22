import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
interface StandardKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
  highlight?: boolean;
}
export const StandardKPICard = ({
  title,
  value,
  subtitle,
  className,
  highlight = false
}: StandardKPICardProps) => {
  return (
    <Card className={cn("border shadow-soft transition-all duration-500 ease-out hover:border-primary hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)] cursor-default group", highlight && "ring-1 ring-primary/20", className)}>
      <CardContent className="p-4">
        <p className="text-muted-foreground font-medium mb-2 group-hover:text-primary/70 transition-colors duration-500 text-sm">
          {title}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};
interface StandardKPICardsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}
export const StandardKPICardsGrid = ({
  children,
  columns = 4,
  className
}: StandardKPICardsGridProps) => {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
  };
  return <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>;
};